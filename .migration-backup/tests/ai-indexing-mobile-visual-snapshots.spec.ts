// Mobile visual regression snapshots for the AIIndexing dropdown + aria-live
// region at 375px (small phone) and 768px (tablet) breakpoints, covering both
// success and failure outcomes. Snapshots are element-scoped so unrelated
// blog content changes never invalidate them.
//
// Pinned to chromium — cross-engine font AA drift makes visual snapshots
// unreliable on webkit/firefox. Engine-specific behavior is covered by the
// separate denial-retry cross-browser spec.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

const BREAKPOINTS = [
  { label: "375", width: 375, height: 900 },
  { label: "768", width: 768, height: 1200 },
] as const;

test.describe("AIIndexing — mobile visual regression snapshots", () => {
  for (const bp of BREAKPOINTS) {
    test(`[${bp.label}px] dropdown open + success announcement`, async ({
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
        `ai-indexing-open-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );

      await page.getByRole("button", { name: /Copy prompt/i }).first().click();

      const live = page
        .locator('[data-testid="ai-indexing-live-region"]')
        .first();
      await expect(live).toHaveText(/Copied/i, { timeout: 3000 });
      await expect(live).toHaveScreenshot(
        `ai-indexing-live-success-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });

    test(`[${bp.label}px] failure state + failure announcement`, async ({
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
        `ai-indexing-error-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );

      const live = page
        .locator('[data-testid="ai-indexing-live-region"]')
        .first();
      await expect(live).toHaveText(/Copy failed/i, { timeout: 3000 });
      await expect(live).toHaveScreenshot(
        `ai-indexing-live-failure-${bp.label}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });
  }
});