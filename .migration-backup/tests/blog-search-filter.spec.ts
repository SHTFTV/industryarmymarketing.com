// End-to-end: /blog search + city + category filters persist to URL query
// params, filter the visible cards correctly, and clicking a filtered card
// routes to the matching /blog/:slug detail page.

import { test, expect } from "../playwright-fixture";

test.describe("Blog search + category filter", () => {
  test("typing in the search box updates ?q and narrows results", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveURL(/\/blog$/);

    // Grab the baseline count from the results header (e.g. "46 guides")
    const countLocator = page.getByText(/\d+\s+guides?/i).first();
    const baseline = parseInt(
      ((await countLocator.textContent()) ?? "0").match(/\d+/)?.[0] ?? "0",
      10,
    );
    expect(baseline).toBeGreaterThan(1);

    await page.getByLabel("Search blog posts").fill("weddings");
    await expect(page).toHaveURL(/[?&]q=weddings\b/);

    // Narrowed count should be strictly less than baseline but > 0
    await expect
      .poll(async () => {
        const t = (await countLocator.textContent()) ?? "";
        return parseInt(t.match(/\d+/)?.[0] ?? "0", 10);
      })
      .toBeGreaterThan(0);
    const filtered = parseInt(
      ((await countLocator.textContent()) ?? "0").match(/\d+/)?.[0] ?? "0",
      10,
    );
    expect(filtered).toBeLessThan(baseline);
  });

  test("deep link with ?q= restores the filtered state on reload", async ({ page }) => {
    await page.goto("/blog?q=weddings");
    const input = page.getByLabel("Search blog posts");
    await expect(input).toHaveValue("weddings");
    // Every visible card in the "All Intel" grid should mention weddings.
    const cards = page.locator("article h4");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("category filter narrows to a single niche and clears cleanly", async ({ page }) => {
    await page.goto("/blog");
    const categorySelect = page.getByLabel("Filter by niche");
    const options = await categorySelect.locator("option").allTextContents();
    const target = options.find((o) => o !== "All niches");
    test.skip(!target, "no non-default categories to test with");

    await categorySelect.selectOption({ label: target! });
    await expect(page).toHaveURL(new RegExp(`[?&]category=${encodeURIComponent(target!)}`));

    // Clear
    await page.getByRole("button", { name: /clear/i }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(categorySelect).toHaveValue("all");
  });

  test("clicking a filtered result routes to /blog/:slug and renders that post", async ({ page }) => {
    await page.goto("/blog?q=weddings");

    // First card link inside the "All Intel" grid.
    const firstCardLink = page.locator("article h4 a").first();
    const href = await firstCardLink.getAttribute("href");
    expect(href).toMatch(/^\/blog\/[a-z0-9-]+$/);

    await firstCardLink.click();
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/\//g, "\\/")}$`));
    // Detail page renders an <h1> from the post
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("blog post page emits a self-referencing canonical + schema.org JSON-LD", async ({ page }) => {
    // Pick a real, stable slug directly (independent of the search test).
    const slug = "record-record-domain-provenance-vs-generative-conflation";
    await page.goto(`/blog/${slug}`);

    // Wait for react-helmet-async to commit the head tags.
    await expect(page.locator(`link[rel="canonical"]`)).toHaveAttribute(
      "href",
      new RegExp(`/blog/${slug}$`),
    );
    await expect(page.locator(`meta[property="og:url"]`)).toHaveAttribute(
      "content",
      new RegExp(`/blog/${slug}$`),
    );
    await expect(page.locator(`meta[property="og:type"]`)).toHaveAttribute(
      "content",
      "article",
    );

    // Collect every JSON-LD block Helmet rendered and parse them.
    const blocks = await page.locator(`script[type="application/ld+json"]`).allTextContents();
    expect(blocks.length).toBeGreaterThan(0);
    const parsed = blocks.map((b) => JSON.parse(b));

    const article = parsed.find(
      (s) => s["@type"] === "BlogPosting" || s["@type"] === "Article",
    );
    expect(article, "BlogPosting/Article schema present").toBeTruthy();
    expect(article["@context"]).toBe("https://schema.org");
    expect(typeof article.headline).toBe("string");
    expect(article.headline.length).toBeGreaterThan(0);
    expect(article.url).toMatch(new RegExp(`/blog/${slug}$`));
    expect(article.mainEntityOfPage?.["@id"]).toMatch(new RegExp(`/blog/${slug}$`));
    expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(article.author).toBeTruthy();
    expect(article.publisher).toBeTruthy();
    // image should be an absolute URL (either http(s):// or a Lovable asset path)
    const imageUrl =
      typeof article.image === "string" ? article.image : article.image?.url;
    expect(imageUrl).toMatch(/^https?:\/\//);

    const breadcrumb = parsed.find((s) => s["@type"] === "BreadcrumbList");
    expect(breadcrumb, "BreadcrumbList schema present").toBeTruthy();
    expect(Array.isArray(breadcrumb.itemListElement)).toBe(true);
    expect(breadcrumb.itemListElement.length).toBeGreaterThanOrEqual(2);
    const last = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];
    expect(last.item).toMatch(new RegExp(`/blog/${slug}$`));

    const faq = parsed.find((s) => s["@type"] === "FAQPage");
    expect(faq, "FAQPage schema present").toBeTruthy();
    expect(Array.isArray(faq.mainEntity)).toBe(true);
    expect(faq.mainEntity.length).toBeGreaterThan(0);
    expect(faq.mainEntity[0]["@type"]).toBe("Question");
    expect(faq.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });

  test("pagination page= param survives reload and preserves filters", async ({ page }) => {
    // Load unfiltered blog list. If pagination isn't needed (< 13 posts) skip.
    await page.goto("/blog");
    const nextButton = page.getByRole("button", { name: /next page/i });
    const hasPagination = await nextButton.count().then((n) => n > 0);
    test.skip(!hasPagination, "not enough posts to require pagination");

    await nextButton.click();
    await expect(page).toHaveURL(/[?&]page=2\b/);

    // Reload — pagination state should restore.
    await page.reload();
    await expect(page).toHaveURL(/[?&]page=2\b/);
    await expect(
      page.getByRole("button", { name: /^Page 2$/ }),
    ).toHaveAttribute("aria-current", "page");

    // Changing a filter should drop the page param back to 1.
    await page.getByLabel("Filter by niche").selectOption({ index: 1 });
    await expect(page).toHaveURL(/[?&]category=/);
    await expect(page).not.toHaveURL(/[?&]page=/);
  });
});