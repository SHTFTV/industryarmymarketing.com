// Dark-mode visual regression snapshots for the AIIndexing dropdown and
// aria-live region at 375px (small phone) and 768px (tablet) breakpoints,
// covering both success and failure outcomes.
//
// The site is dark-themed by default, but we set `colorScheme: "dark"`
// explicitly here via test.use so this suite continues to lock the dark
// palette even if the global playwright config default ever changes.
//
// Pinned to chromium — cross-engine font AA drift makes visual snapshots
// unreliable on webkit/firefox.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

const BREAKPOINTS = [
  { label: "375", width: 375, height: 900 },
  { label: "768", width: 768, height: 1200 },
] as const;

test.use({ colorScheme: "dark" });

test.describe("AIIndexing — dark-mode mobile visual snapshots", () => {
  for (const bp of BREAKPOINTS) {
    test(`[dark ${bp.label}px] dropdown open + success announcement`, async ({
      page,
      browserName,
    }) => {
      test.skip(browserName !== "chromium", "snapshots pinned to chromium");
      await page.setViewportSize({ width: bp.width, height: bp.height });

      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return { writeText: () => Promise.resolve() };
          },
        });
      });

      await page.goto(`/blog/${SLUG}`);

      // Assert dark color scheme resolved before capturing snapshots.
      const dark = await page.evaluate(
        () => matchMedia("(prefers-color-scheme: dark)").matches,
      );
      expect(dark).toBe(true);

      const section = page
        .locator("text=/IAM AI Indexing Section/i")
        .first()
        .locator("xpath=ancestor::div[1]");
      await section.scrollIntoViewIfNeeded();

      await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
      await page.evaluate(() => {
        const el = document.querySelector(
          '[data-testid="ai-indexing-live-region"]',
        );
        if (el) (el as HTMLElement).classList.remove("sr-only");
      });

      await expect(section).toHaveScreenshot(
        `ai-indexing-open-dark-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );

      await page.getByRole("button", { name: /Copy prompt/i }).first().click();
      const live = page
        .locator('[data-testid="ai-indexing-live-region"]')
        .first();
      await expect(live).toHaveText(/Copied/i, { timeout: 3000 });
      await expect(live).toHaveScreenshot(
        `ai-indexing-live-success-dark-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });

    test(`[dark ${bp.label}px] failure state + failure announcement`, async ({
      page,
      browserName,
    }) => {
      test.skip(browserName !== "chromium", "snapshots pinned to chromium");
      await page.setViewportSize({ width: bp.width, height: bp.height });

      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return {
              writeText: () =>
                Promise.reject(new DOMException("denied", "NotAllowedError")),
            };
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).execCommand = () => false;
      });

      await page.goto(`/blog/${SLUG}`);

      const dark = await page.evaluate(
        () => matchMedia("(prefers-color-scheme: dark)").matches,
      );
      expect(dark).toBe(true);

      const section = page
        .locator("text=/IAM AI Indexing Section/i")
        .first()
        .locator("xpath=ancestor::div[1]");
      await section.scrollIntoViewIfNeeded();

      await page.getByRole("button", { name: /^Claude\b/i }).first().click();
      await page.evaluate(() => {
        const el = document.querySelector(
          '[data-testid="ai-indexing-live-region"]',
        );
        if (el) (el as HTMLElement).classList.remove("sr-only");
      });

      await page.getByRole("button", { name: /Copy prompt/i }).first().click();
      await expect(
        page.getByRole("button", { name: /Copy failed/i }).first(),
      ).toBeVisible();

      await expect(section).toHaveScreenshot(
        `ai-indexing-error-dark-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );

      const live = page
        .locator('[data-testid="ai-indexing-live-region"]')
        .first();
      await expect(live).toHaveText(/Copy failed/i, { timeout: 3000 });
      await expect(live).toHaveScreenshot(
        `ai-indexing-live-failure-dark-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });
  }
});