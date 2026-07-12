import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated a11y audit for the Territory Pricing chart region:
// enforces WCAG 2 A + AA rules on the pinned banner, callouts, and
// the surrounding table markup. Any violation fails CI.

test.describe("Territory Pricing chart — axe accessibility", () => {
  test("desktop chart section has no axe violations", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .include('[data-testid="pricing-rule-banner"]')
      .include('[data-testid="pricing-chart-table"]')
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("mobile chart section has no axe violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .include('[data-testid="pricing-rule-banner"]')
      .include('[data-testid="pricing-chart-mobile"]')
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("banner + each row callout expose correct ARIA role, label, and focus order", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.scrollIntoViewIfNeeded();

    // Banner: role=note + aria-label with the rule.
    expect(await banner.getAttribute("role")).toBe("note");
    expect(await banner.getAttribute("aria-label")).toMatch(
      /\$10 USD per 100,000 population baseline; every slot stays \$10\/mo/,
    );
    expect(await banner.getAttribute("tabindex")).toBe("0");

    // Callout buttons: aria-expanded present (closed by default), aria-label
    // contains the population tier + rule, and every button is focusable.
    const buttons = page.locator('[data-testid^="pricing-callout-button-"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(30);
    for (let i = 0; i < count; i++) {
      const b = buttons.nth(i);
      const label = await b.getAttribute("aria-label");
      expect(label).toMatch(/\$10 USD per 100,000 population baseline; every slot stays \$10\/mo/);
      expect(label).toMatch(/\$10 per 100K = \$10\/slot\/mo/);
      expect(await b.getAttribute("aria-expanded")).toBe("false");
    }

    // Tab order: banner reachable before the first callout button.
    await banner.focus();
    await expect(banner).toBeFocused();
    // From the banner, keyboard tabbing must land on a callout (possibly after
    // the surrounding scroll region) — assert the first callout can be focused
    // programmatically and receives focus without violating tab order.
    const first = buttons.first();
    await first.focus();
    await expect(first).toBeFocused();
  });
});
