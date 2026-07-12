import { test, expect, type Page, type Locator } from "@playwright/test";

// Visual regression coverage for the homepage Territory Pricing chart:
// the pinned $10/100K banner and per-row $10-per-100K callouts must not
// drift in layout or text. Baselines are engine + viewport scoped by
// Playwright's snapshot naming. First run: generate baselines with
// `npx playwright test tests/pricing-chart-visual.spec.ts --update-snapshots`.

const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

function maskFor(page: Page): Locator[] {
  return [
    // Any live spot-counter widgets that animate between runs.
    page.locator('[data-testid="limited-spots-widget"]'),
  ];
}

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

test.describe("Territory Pricing chart — visual regression", () => {
  test.skip(LIVE, "Local dev only — baselines are engine + viewport scoped");

  test.beforeEach(async ({ page }) => {
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

  test("desktop chart with pinned banner + callouts renders as expected", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1600 });
    await page.goto("/");
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();
    await expect(page.getByTestId("pricing-chart-table")).toBeVisible();
    await settle(page);
    const section = page.locator("section").filter({ has: banner }).first();
    await expect(section).toHaveScreenshot("pricing-chart-desktop.png", {
      mask: maskFor(page),
    });
  });

  test("mobile stacked cards with pinned banner + callouts render as expected", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();
    await expect(page.getByTestId("pricing-chart-mobile")).toBeVisible();
    await settle(page);
    const section = page.locator("section").filter({ has: banner }).first();
    await expect(section).toHaveScreenshot("pricing-chart-mobile.png", {
      mask: maskFor(page),
    });
  });
});
