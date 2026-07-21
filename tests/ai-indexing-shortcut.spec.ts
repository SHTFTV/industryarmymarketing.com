// End-to-end: on a real blog post page, opening an AIIndexing dropdown and
// pressing Ctrl/Cmd+K must copy the platform's prompt to the clipboard AND
// surface the "Copied ✓" announcement in the sr-only aria-live region.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

test.describe("AIIndexing — Ctrl/Cmd+K shortcut", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copies the open platform's prompt and announces success", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Clipboard permissions are Chromium-scoped in this suite",
    );

    await page.goto(`/blog/${SLUG}`);

    const section = page.getByText(/IAM AI Indexing Section/i).first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    // Open the ChatGPT dropdown.
    const toggle = page.getByRole("button", { name: /^ChatGPT\b/i }).first();
    await toggle.click();
    await expect(
      page.getByRole("link", { name: /Open in ChatGPT/i }).first(),
    ).toBeVisible();

    // Modifier key differs per OS in headed CI, but Playwright's
    // "ControlOrMeta" resolves to Meta on macOS and Control elsewhere.
    await page.keyboard.press("ControlOrMeta+k");

    // Live region announces success.
    const live = page.locator('[role="status"][aria-live="polite"]').first();
    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

    // Clipboard contents include the canonical URL for this post.
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    // And references the article title as rendered on the page.
    const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
    expect(h1.length).toBeGreaterThan(0);
    expect(copied).toContain(h1);

    // Focus returned to the Copy prompt button (a11y contract).
    const focusedText = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? "",
    );
    expect(focusedText).toMatch(/Copied|Copy prompt/i);
  });
});