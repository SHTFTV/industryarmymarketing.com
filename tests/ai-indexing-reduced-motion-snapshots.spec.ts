// Visual regression snapshots for the AIIndexing dropdown + aria-live region
// with prefers-reduced-motion: reduce forced ON. Confirms that success and
// failure states still render correctly (no transition-dependent visuals,
// no motion-only affordances) when the user opts out of animation.
//
// Pinned to chromium for deterministic snapshot bytes. The playwright config
// already defaults to reducedMotion: "reduce"; we set it here explicitly via
// test.use so intent is obvious even if the global default ever changes.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.use({ reducedMotion: "reduce" });

test.describe("AIIndexing — reduced-motion visual snapshots", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1600 });
  });

  test("success state renders correctly with reduced motion", async ({
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

    // Assert the media query actually resolved to `reduce`.
    const reduced = await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(reduced).toBe(true);

    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="ai-indexing-live-region"]');
      if (el) (el as HTMLElement).classList.remove("sr-only");
    });

    await expect(section).toHaveScreenshot(
      "ai-indexing-open-reduced-motion.png",
      { maxDiffPixelRatio: 0.02 },
    );

    await page.getByRole("button", { name: /Copy prompt/i }).first().click();
    const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });
    await expect(live).toHaveScreenshot(
      "ai-indexing-live-success-reduced-motion.png",
      { maxDiffPixelRatio: 0.02 },
    );
  });

  test("failure state renders correctly with reduced motion", async ({
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
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible();

    await expect(section).toHaveScreenshot(
      "ai-indexing-error-reduced-motion.png",
      { maxDiffPixelRatio: 0.02 },
    );

    const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
    await expect(live).toHaveText(/Copy failed/i, { timeout: 3000 });
    await expect(live).toHaveScreenshot(
      "ai-indexing-live-failure-reduced-motion.png",
      { maxDiffPixelRatio: 0.02 },
    );
  });
});