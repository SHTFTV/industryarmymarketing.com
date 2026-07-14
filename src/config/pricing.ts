// Central pricing rules for the CITY COMMANDER / territory product.
// Any UI that shows territory pricing MUST import from here — do not
// hardcode $10, 100_000, or per-slot labels in components.
//
// SEO Packages (Bullets / Boom / Bombs) is a SEPARATE product line with
// its own pricing in src/data/seoPackages.ts. It intentionally does NOT
// follow the $10/slot flat rule. The FORBIDDEN_ON_TERRITORY_SURFACES
// list below is what the Playwright guard uses to make sure the SEO
// packages block never leaks back onto pages that are supposed to only
// show territory ($10/slot) pricing.

import { PRICING_MATRIX, ADDONS } from "@/data/pricingMatrix";

/** Flat USD price per active slot, per month. Never change without an ADR. */
export const FLAT_PRICE_PER_SLOT_USD = 10 as const;

/** Population that grants one additional slot ("$10 per 100K" rule). */
export const POPULATION_PER_SLOT = 100_000 as const;

/** Human-readable rule strings — reuse in copy so they can't drift. */
export const RULE_LABEL = `$${FLAT_PRICE_PER_SLOT_USD}/slot/mo` as const;
export const RULE_FORMULA =
  `1 × ${POPULATION_PER_SLOT / 1000}K × $${FLAT_PRICE_PER_SLOT_USD} = ${RULE_LABEL}` as const;
export const RULE_LONG =
  `$${FLAT_PRICE_PER_SLOT_USD} per ${POPULATION_PER_SLOT / 1000}K = ${RULE_LABEL}` as const;

/**
 * Substrings that MUST NOT appear on territory-pricing surfaces
 * (`/`, `/pricing` chart area, contractor city pages).
 * If the SEO Packages block ever re-mounts on these pages, the
 * Playwright guard `tests/no-forbidden-pricing.spec.ts` fails.
 */
export const FORBIDDEN_ON_TERRITORY_SURFACES = [
  "$85 one-time",
  "$285 one-time",
  "$585 one-time",
  "Bullets. Boom. Bombs.",
] as const;

/** Runtime self-check: matrix rows must obey the flat rule. */
function verifyTerritoryPricingRule(): void {
  for (const row of PRICING_MATRIX) {
    if (row.pricePerSlot !== FLAT_PRICE_PER_SLOT_USD) {
      throw new Error(
        `Territory pricing rule violated: ${row.populationLabel} has pricePerSlot=${row.pricePerSlot}, expected ${FLAT_PRICE_PER_SLOT_USD}`,
      );
    }
  }
}
verifyTerritoryPricingRule();

export { PRICING_MATRIX, ADDONS };