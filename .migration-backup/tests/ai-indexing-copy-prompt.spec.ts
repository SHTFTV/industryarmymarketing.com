// End-to-end: on real blog post pages, each AI platform dropdown in the
// IAM AI Indexing Section must open, and clicking "Copy prompt" must
// write text to the clipboard that contains the current article's title
// and canonical URL verbatim.

import { test, expect } from "../playwright-fixture";

// Sample of stable blog slugs. The AIIndexing section is rendered by
// BlogPost.tsx for every data-driven post, so a small sample is enough
// to catch regressions in the clipboard wiring without ballooning CI.
const SLUGS = [
  "record-record-domain-provenance-vs-generative-conflation",
  "iam-vendors-purchasing-power-parity-pricing",
  "beyond-domain-name-entity-authority-modern-seo",
];

const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Grok"] as const;

const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

test.describe("AIIndexing — Copy prompt clipboard wiring", () => {
  test.use({
    permissions: ["clipboard-read", "clipboard-write"],
  });

  for (const slug of SLUGS) {
    test(`copies title + canonical URL for /blog/${slug}`, async ({
      page,
      browserName,
    }) => {
      // WebKit doesn't grant clipboard perms the same way; keep the
      // suite green on Chromium (primary) and skip elsewhere.
      test.skip(
        browserName !== "chromium",
        "Clipboard permissions are Chromium-scoped in this suite",
      );

      await page.goto(`/blog/${slug}`);

      // AIIndexing lives at the end of the article; scroll it into view.
      const section = page.getByText(/IAM AI Indexing Section/i).first();
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();

      // Capture the article title as rendered on the page — this is the
      // string BlogPost.tsx passes to <AIIndexing articleTitle={...} />.
      const articleTitle = (await page.locator("h1").first().textContent())?.trim() ?? "";
      expect(articleTitle.length, "article H1 must be non-empty").toBeGreaterThan(0);

      const expectedUrl = `${CANONICAL_ORIGIN}/blog/${slug}`;

      for (const platform of PLATFORMS) {
        // Open the platform dropdown by clicking its toggle button.
        const toggle = page.getByRole("button", { name: new RegExp(`^${platform}\\b`, "i") }).first();
        await toggle.scrollIntoViewIfNeeded();
        await toggle.click();

        // The "Open in <platform>" deep link should now be visible —
        // proves the panel actually expanded.
        await expect(
          page.getByRole("link", { name: new RegExp(`Open in ${platform}`, "i") }).first(),
        ).toBeVisible();

        // The "Copy prompt" button in this newly-open panel is the one
        // adjacent to the "Open in <platform>" link. There is only one
        // panel open at a time (openAI state is single-value), so a
        // simple getByRole match works.
        const copyBtn = page.getByRole("button", { name: /^copy prompt$/i }).first();
        await copyBtn.click();

        // Read clipboard and assert both title + canonical URL are present.
        const clip = await page.evaluate(() => navigator.clipboard.readText());
        expect(
          clip,
          `${platform}: clipboard must contain the article title verbatim`,
        ).toContain(articleTitle);
        expect(
          clip,
          `${platform}: clipboard must contain the canonical articleUrl`,
        ).toContain(expectedUrl);

        // Collapse this panel before opening the next one so DOM state
        // stays predictable for the next iteration.
        await toggle.click();
      }
    });
  }

  test("Copy prompt is not present on the /blog listing page", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium-scoped");
    await page.goto("/blog");
    await expect(page.getByText(/IAM AI Indexing Section/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^copy prompt$/i })).toHaveCount(0);
  });
});