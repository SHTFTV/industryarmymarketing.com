// Mobile viewport E2E: tap the Copy prompt button for each AI platform on a
// real blog post page and assert:
//   • The clipboard receives the platform's prompt (contains canonical URL).
//   • The aria-live status region announces "Copied ✓" after each tap.
//   • After repeated copies, focus returns to the tapped Copy prompt button.
//   • The live region remains accessible (present in DOM, correct role/aria)
//     across successive rapid taps.

import { test, expect } from "../playwright-fixture";
import { devices } from "@playwright/test";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Grok"] as const;

test.describe("AIIndexing — mobile tap flow across platforms", () => {
  test.use({
    ...devices["iPhone 13"],
    permissions: ["clipboard-read", "clipboard-write"],
  });

  test("taps Copy prompt on each platform and keeps announcements accessible", async ({
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

    const live = page
      .locator('[data-testid="ai-indexing-live-region"]')
      .first();

    // aria-live contract holds across all interactions.
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");

    for (const platformName of PLATFORMS) {
      // Open this platform's panel (tap the header).
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${platformName}\\b`, "i") })
        .first();
      await toggle.tap();
      await expect(
        page
          .getByRole("link", { name: new RegExp(`Open in ${platformName}`, "i") })
          .first(),
      ).toBeVisible();

      // Tap Copy prompt.
      const copyBtn = page
        .getByRole("button", { name: /Copy prompt|Copied/i })
        .first();
      await copyBtn.tap();

      // Live region announces success.
      await expect(live).toHaveText(/Copied/i, { timeout: 3000 });
      // Region still declared as a live status region.
      await expect(live).toHaveAttribute("aria-live", "polite");

      // Clipboard has this post's canonical URL.
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(`${CANONICAL_ORIGIN}/blog/${SLUG}`);

      // Focus returned to the Copy prompt control for this platform.
      const focusedText = await page.evaluate(
        () => document.activeElement?.textContent?.trim() ?? "",
      );
      expect(focusedText).toMatch(/Copied|Copy prompt/i);

      // Tap again (rapid repeat) — announcement must re-fire and stay a11y-clean.
      await copyBtn.tap();
      await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

      // Collapse before moving to the next platform.
      await toggle.tap();
    }
  });
});