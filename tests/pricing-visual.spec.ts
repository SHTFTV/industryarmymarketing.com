import { test, expect, type Page, type Locator } from "@playwright/test";

// Visual regression coverage for the /pricing page. Baselines are engine-
// and viewport-scoped by Playwright's snapshot naming, so chromium / webkit
// / firefox each maintain their own. First run: generate baselines with
// `npx playwright test tests/pricing-visual.spec.ts --update-snapshots`.
//
// We use element screenshots + a generous maxDiffPixelRatio so noisy
// subpixel/AA differences between engines don't flake the suite, while
// still catching structural UI regressions.

const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

// Per-assertion overrides. Global defaults (threshold, maxDiffPixelRatio,
// animations, caret, scale) live in playwright.config.ts and apply here too.
// Keep the mask list small — masking hides real regressions, so it only
// covers regions with intentionally dynamic content.
function maskFor(page: Page): Locator[] {
  return [
    // Live spot-counter widget — animates and can change between runs.
    page.locator('[data-testid="limited-spots-widget"]'),
  ];
}

/**
 * Wait for fonts + images to be ready so the snapshot is stable regardless
 * of network timing. `document.fonts.ready` covers Bebas Neue + Inter.
 */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const imgs = Array.from(document.images ?? []);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ),
    );
  });
}

test.describe("Pricing — visual regression: mobile stacked cards + FAQ states", () => {
  test.skip(LIVE, "Local dev only — visual baselines are engine + viewport scoped");

  test.beforeEach(async ({ page }) => {
    // Belt-and-suspenders: config sets `reducedMotion: "reduce"`, but Framer
    // Motion still honours some transitions unless we neutralize CSS too.
    // Runs before every page.goto so the rules apply on every navigation.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
      `;
      const attach = () => document.head?.appendChild(style);
      if (document.head) attach();
      else document.addEventListener("DOMContentLoaded", attach, { once: true });
    });
  });

  test("mobile stacked comparison cards render as expected", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/pricing");
    const list = page.getByRole("list", { name: /comparison/i });
    await expect(list).toBeVisible();
    await list.scrollIntoViewIfNeeded();
    await settle(page);
    await expect(list).toHaveScreenshot("pricing-mobile-comparison.png", {
      mask: maskFor(page),
    });
  });

  test("FAQ accordion — closed state (first item)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto("/pricing");

    const firstTrigger = page.getByRole("button", {
      name: /what's included in the \$10\/year/i,
    });
    await firstTrigger.scrollIntoViewIfNeeded();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    await settle(page);

    // Screenshot the FAQ region (parent that contains all triggers).
    // Using a stable ancestor keeps the frame consistent open vs closed.
    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot("pricing-faq-closed.png", {
      mask: maskFor(page),
    });
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
    await settle(page);
    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot("pricing-faq-open.png", {
      mask: maskFor(page),
    });
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
    await settle(page);
    const faqRegion = page.locator("section").filter({ has: firstTrigger }).first();
    await expect(faqRegion).toHaveScreenshot("pricing-faq-open-mobile.png", {
      mask: maskFor(page),
    });
  });
});