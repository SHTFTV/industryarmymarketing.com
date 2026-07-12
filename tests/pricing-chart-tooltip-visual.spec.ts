import { test, expect, type Page } from "@playwright/test";

// Visual regression for the pricing chart tooltip content in both layouts.
// Baselines are engine + viewport scoped. Seed with
// `npx playwright test tests/pricing-chart-tooltip-visual.spec.ts --update-snapshots`.

const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
}

test.describe("Pricing chart tooltip — visual regression", () => {
  test.skip(LIVE, "Local dev only");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      `;
      const attach = () => document.head?.appendChild(style);
      if (document.head) attach();
      else document.addEventListener("DOMContentLoaded", attach, { once: true });
    });
  });

  test("desktop tooltip renders with correct positioning + $10/100K text", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const btn = page.getByTestId("pricing-callout-button-250001");
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const tip = page.getByTestId("pricing-tooltip-250001");
    await expect(tip).toBeVisible();
    await settle(page);
    // Snapshot the cell that contains trigger + tooltip so we lock both
    // the tooltip text and its positioning relative to the trigger.
    const cell = btn.locator("xpath=ancestor::td[1]");
    await expect(cell).toHaveScreenshot("pricing-tooltip-desktop.png");
  });

  test("mobile tooltip renders with correct positioning + $10/100K text", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    const btn = page.getByTestId("pricing-callout-mobile-250001");
    await btn.scrollIntoViewIfNeeded();
    await btn.tap();
    const tip = page.getByTestId("pricing-tooltip-mobile-250001");
    await expect(tip).toBeVisible();
    await settle(page);
    const card = btn.locator("xpath=ancestor::li[1]");
    await expect(card).toHaveScreenshot("pricing-tooltip-mobile.png");
  });
});
