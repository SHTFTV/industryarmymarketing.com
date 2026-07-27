import { test, expect } from "@playwright/test";

// Live-site smoke test: hits the deployed URL (defaults to production)
// and asserts the pricing chart tooltip text is exactly "$10/slot/mo"
// at the 100K (first) tier and the 30M+ (last) tier on both desktop
// and mobile. Fails fast if a stale bundle is served after publish.
//
// Override target with: PLAYWRIGHT_BASE_URL=https://... playwright test

const LIVE_URL =
  process.env.LIVE_PRICING_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  "https://www.industryarmymarketing.com/";

const TIERS = [
  { lowerBound: 0,          label: "100K tier"  },
  { lowerBound: 29_000_001, label: "30M+ tier"  },
];

const EXPECTED_SUFFIX = "$10/slot/mo";
const EXPECTED_FULL   = "$10 per 100K = $10/slot/mo";

test.describe("Live pricing tooltips — deployed site shows $10/slot/mo", () => {
  for (const layout of [
    { name: "desktop", width: 1280, height: 900, prefix: "pricing-callout-button" },
    { name: "mobile",  width: 390,  height: 900, prefix: "pricing-callout-mobile" },
  ] as const) {
    test(`${layout.name}: 100K and 30M+ tooltips read "${EXPECTED_SUFFIX}"`, async ({ page }) => {
      await page.setViewportSize({ width: layout.width, height: layout.height });
      await page.goto(LIVE_URL, { waitUntil: "domcontentloaded" });

      for (const tier of TIERS) {
        const btn = page.getByTestId(
          layout.name === "mobile"
            ? `pricing-callout-mobile-${tier.lowerBound}`
            : `pricing-callout-button-${tier.lowerBound}`,
        );
        await btn.scrollIntoViewIfNeeded();

        // Visible label already includes the $10/slot/mo string.
        await expect(btn, `${layout.name} ${tier.label} label`).toContainText(EXPECTED_SUFFIX);

        // Open the tooltip and assert exact copy.
        if (layout.name === "mobile") {
          await btn.tap();
        } else {
          await btn.click();
        }
        const tipId =
          layout.name === "mobile"
            ? `pricing-tooltip-mobile-${tier.lowerBound}`
            : `pricing-tooltip-${tier.lowerBound}`;
        const tip = page.getByTestId(tipId);
        await expect(tip, `${layout.name} ${tier.label} tooltip visible`).toBeVisible();
        await expect(tip, `${layout.name} ${tier.label} tooltip copy`).toContainText(EXPECTED_FULL);

        // aria-label on the trigger must also carry the exact per-slot phrase.
        const aria = await btn.getAttribute("aria-label");
        expect(aria, `${layout.name} ${tier.label} aria-label`).toContain(EXPECTED_SUFFIX);
      }
    });
  }
});