// Visual regression snapshots for the AIIndexing dropdown + aria-live region
// across success and failure outcomes. Guards against layout/content drift in
// the panel (headers, prompt copy, buttons) and in the announced status text.
//
// Snapshots are taken as element screenshots — not full-page — so unrelated
// blog content changes never invalidate them. The aria-live region is normally
// visually-hidden, so we un-hide it for the snapshot pass only.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — visual regression snapshots", () => {
  test.beforeEach(async ({ page }) => {
    // Deterministic viewport so snapshots don't shift by device pixel ratio.
    await page.setViewportSize({ width: 1280, height: 1600 });
  });

  test("dropdown open + success announcement matches snapshot", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "snapshots pinned to chromium");

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

    // Un-hide the aria-live region for visual capture only.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="ai-indexing-live-region"]');
      if (el) (el as HTMLElement).classList.remove("sr-only");
    });

    // Snapshot the collapsed/expanded panel layout BEFORE the copy fires so
    // the button label reads "Copy prompt" deterministically.
    await expect(section).toHaveScreenshot("ai-indexing-open.png", {
      maxDiffPixelRatio: 0.02,
    });

    await page.getByRole("button", { name: /Copy prompt/i }).first().click();

    const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });
    await expect(live).toHaveScreenshot("ai-indexing-live-success.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("failure state + failure announcement matches snapshot", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "snapshots pinned to chromium");

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
      const el = document.querySelector('[data-testid="ai-indexing-live-region"]');
      if (el) (el as HTMLElement).classList.remove("sr-only");
    });

    await page.getByRole("button", { name: /Copy prompt/i }).first().click();

    const errBtn = page.getByRole("button", { name: /Copy failed/i }).first();
    await expect(errBtn).toBeVisible();
    await expect(section).toHaveScreenshot("ai-indexing-error.png", {
      maxDiffPixelRatio: 0.02,
    });

    const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
    await expect(live).toHaveText(/Copy failed/i, { timeout: 3000 });
    await expect(live).toHaveScreenshot("ai-indexing-live-failure.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});