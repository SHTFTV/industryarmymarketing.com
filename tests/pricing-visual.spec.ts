import { test, expect } from "@playwright/test";

// Visual regression coverage for the /pricing page. Baselines are engine-
// and viewport-scoped by Playwright's snapshot naming, so chromium / webkit
// / firefox each maintain their own. First run: generate baselines with
// `npx playwright test tests/pricing-visual.spec.ts --update-snapshots`.
//
// We use element screenshots + a generous maxDiffPixelRatio so noisy
// subpixel/AA differences between engines don't flake the suite, while
// still catching structural UI regressions.

const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

const SNAPSHOT_OPTS = {
  maxDiffPixelRatio: 0.05,
  animations: "disabled" as const,
  // Mask likely-to-flake dynamic regions (LimitedSpotsWidget, live counters).
  // Empty by default; we mask on a per-assertion basis where needed.
};

test.describe("Pricing — visual regression: mobile stacked cards + FAQ states", () => {
  test.skip(LIVE, "Local dev only — visual baselines are engine + viewport scoped");

  test.beforeEach(async ({ page }) => {
    // Suppress Framer Motion entrance animations for stable pixels.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test("mobile stacked comparison cards render as expected", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/pricing");
    const list = page.getByRole("list", { name: /comparison/i });
    await expect(list).toBeVisible();
    await list.scrollIntoViewIfNeeded();
    // Let images/fonts settle before snapshotting.
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(list).toHaveScreenshot("pricing-mobile-comparison.png", SNAPSHOT_OPTS);
  });

  test("FAQ accordion — closed state (first item)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto("/pricing");

    const firstTrigger = page.getByRole("button", {
      name: /what's included in the \$10\/year/i,
    });
    await firstTrigger.scrollIntoViewIfNeeded();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");

    // Screenshot the FAQ region (parent that contains all triggers).
    // Using a stable ancestor keeps the frame consistent open vs closed.
    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot(
      "pricing-faq-closed.png",
      SNAPSHOT_OPTS,
    );
  });

  test("FAQ accordion — open state (first item expanded)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto("/pricing");

    const firstTrigger = page.getByRole("button", {
      name: /what's included in the \$10\/year/i,
    });
    await firstTrigger.scrollIntoViewIfNeeded();
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    const panelId = await firstTrigger.getAttribute("aria-controls");
    if (panelId) {
      await expect(page.locator(`#${panelId}`)).toBeVisible();
    }

    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot(
      "pricing-faq-open.png",
      SNAPSHOT_OPTS,
    );
  });

  test("FAQ accordion — open state on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/pricing");

    const firstTrigger = page.getByRole("button", {
      name: /what's included in the \$10\/year/i,
    });
    await firstTrigger.scrollIntoViewIfNeeded();
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot(
      "pricing-faq-open-mobile.png",
      SNAPSHOT_OPTS,
    );
  });
});