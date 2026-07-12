import { test, expect } from "@playwright/test";

// E2E: every row on the Territory Pricing chart exposes the $10-per-100K
// mapping via title tooltip + aria-label, and the pinned banner stays
// visible while scrolling through the (long) matrix.

const RULE = "$10 USD per 100,000 population, per slot";

// Sampled rows across the matrix — covers baseline, mid-tier, and terminal
// so we prove the mapping without paying for every single row.
const SAMPLES = [
  { lowerBound: 0,          pricePerSlot: 10,   population: "0 – 100,000" },
  { lowerBound: 250_001,    pricePerSlot: 35,   population: "250,001 – 350,000" },
  { lowerBound: 850_001,    pricePerSlot: 100,  population: "850,001 – 1,000,000" },
  { lowerBound: 5_000_001,  pricePerSlot: 600,  population: "5,000,001 – 6,000,000" },
  { lowerBound: 29_000_001, pricePerSlot: 3000, population: "29,000,001 – 30,000,000+" },
];

function calloutText(price: number): string {
  const blocks = price / 10;
  return `${blocks} × 100K × $10 = $${price}/slot/mo`;
}

test.describe("Territory Pricing chart — tooltip + pinned banner", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.getByTestId("pricing-rule-banner").scrollIntoViewIfNeeded();
  });

  test("each row shows the correct $10-per-100K explanation on hover and focus", async ({ page }) => {
    for (const row of SAMPLES) {
      const callout = page.getByTestId(`pricing-callout-${row.lowerBound}`);
      await callout.scrollIntoViewIfNeeded();

      // Visible text must match the derived rule.
      await expect(callout).toContainText(calloutText(row.pricePerSlot));

      // Focusable span with aria-label describing the mapping.
      const focusable = callout.locator('[role="note"]');
      await focusable.focus();
      await expect(focusable).toBeFocused();
      const ariaLabel = await focusable.getAttribute("aria-label");
      expect(ariaLabel).toContain(RULE);
      expect(ariaLabel).toContain(calloutText(row.pricePerSlot));
      expect(ariaLabel).toContain(row.population);

      // Title attribute drives the native hover tooltip.
      await focusable.hover();
      const title = await focusable.getAttribute("title");
      expect(title).toContain(RULE);
      expect(title).toContain(calloutText(row.pricePerSlot));
    }
  });

  test("pinned banner stays visible while scrolling the pricing chart", async ({ page }) => {
    const banner = page.getByTestId("pricing-rule-banner");
    await expect(banner).toBeVisible();

    // Scroll a bottom row into view — banner should still be within the viewport.
    const lastRow = page.getByTestId("pricing-callout-29000001");
    await lastRow.scrollIntoViewIfNeeded();

    await expect(banner).toBeVisible();
    const bannerBox = await banner.boundingBox();
    const viewport = page.viewportSize();
    expect(bannerBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    // Sticky element must remain within the viewport bounds after scrolling.
    expect(bannerBox!.y).toBeGreaterThanOrEqual(0);
    expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(viewport!.height);
    // Rule text must still be rendered.
    await expect(banner).toContainText(RULE);
  });

  test("banner is keyboard-focusable and exposes the rule to screen readers", async ({ page }) => {
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.focus();
    await expect(banner).toBeFocused();
    expect(await banner.getAttribute("aria-label")).toBe(RULE);
    expect(await banner.getAttribute("role")).toBe("note");
  });
});
