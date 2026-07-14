import { test, expect } from "@playwright/test";
import { FORBIDDEN_ON_TERRITORY_SURFACES, RULE_LABEL } from "../src/config/pricing";

// Guards against the removed Bullets/Boom/Bombs pricing block coming
// back on any surface that is supposed to reflect the $10/slot flat
// territory pricing rule.
//
// SEO Packages (a separate product) still lives at /packages and
// /packages/[slug]; those routes are intentionally NOT scanned here.

const TERRITORY_SURFACES = [
  "/",
  // Add other territory-pricing surfaces here as they land. Do NOT add
  // /packages or /packages/* — those pages are the SEO Packages product
  // and are allowed to display Bullets/Boom/Bombs pricing.
];

for (const path of TERRITORY_SURFACES) {
  test(`territory surface ${path} has no forbidden SEO-packages pricing`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    const bodyText = await page.locator("body").innerText();

    for (const forbidden of FORBIDDEN_ON_TERRITORY_SURFACES) {
      expect(
        bodyText.includes(forbidden),
        `Forbidden SEO-packages string "${forbidden}" found on ${path} — the removed pricing block appears to have come back.`,
      ).toBe(false);
    }

    // Positive assertion: the flat rule label must be visible on the
    // homepage territory chart so we know we're actually on the right
    // page (guards against a blank/redirect false pass).
    if (path === "/") {
      expect(bodyText, `Expected "${RULE_LABEL}" on ${path}`).toContain(RULE_LABEL);
    }
  });
}