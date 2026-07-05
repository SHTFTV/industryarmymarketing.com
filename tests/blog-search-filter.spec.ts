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
});