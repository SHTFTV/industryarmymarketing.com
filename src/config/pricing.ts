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

/**
 * Regex patterns for forbidden pricing. These catch variants that plain
 * substring matching would miss (e.g. `$85/one time`, `$ 85 one-time`,
 * `Bullets, Boom, Bombs`). The Playwright guard runs BOTH the substring
 * list above and these patterns against every scanned route.
 *
 * Serialized as `{ source, flags }` so the spec can rebuild them on the
 * Node side without shipping a full RegExp through JSON.
 */
export const FORBIDDEN_PATTERNS: readonly {
  name: string;
  source: string;
  flags: string;
}[] = [
  {
    name: "seo-package-one-time-price",
    // $85 one-time / $285 one-time / $585 one-time, tolerant of spacing
    // and hyphen/space between "one" and "time".
    source: "\\$\\s?(85|285|585)\\s*(?:one[\\s-]?time)",
    flags: "i",
  },
  {
    name: "bullets-boom-bombs-block",
    // The removed marketing block, tolerant of punctuation and casing.
    source: "bullets\\s*[.,·•]?\\s*boom\\s*[.,·•]?\\s*bombs",
    flags: "i",
  },
];

/**
 * Routes that ARE the SEO Packages product and are allowed to render
 * Bullets/Boom/Bombs pricing. Every other public route must be free of
 * the forbidden strings/patterns above.
 *
 * Prefix match: `/seo-packages` also allows `/seo-packages/bullets` etc.
 */
export const SEO_PACKAGES_ALLOWED_ROUTES = [
  "/seo-packages",
  "/pricing", // legacy combined pricing page — still hosts the packages block.
] as const;

/**
 * Every static public route the CI guard should scan. Parametric routes
 * (`/blog/:slug`, `/contractors/:trade/:city`) are covered by dedicated
 * spot-check specs; this list is for the whole-site sweep.
 *
 * Keep in sync with the <Route> table in `src/App.tsx`. When a new
 * public page is added, add its path here.
 */
export const PUBLIC_ROUTES_TO_SCAN = [
  "/",
  "/how-it-works",
  "/pricing",
  "/seo-packages",
  "/contractors",
  "/service-professionals",
  "/backlinks",
  "/dofollow-backlinks",
  "/guest-post",
  "/industries",
  "/contact",
  "/network",
  "/eyespyr",
  "/blog",
  "/investors",
  "/legal",
  "/niches/steel-stud",
  "/niches/mining-logistics",
  "/local/vancouver",
  "/local/surrey",
  "/local/langley",
  "/weddings-ecosystem",
  "/sitemap",
] as const;

/** True when the given route is allowed to show SEO Packages pricing. */
export function isSeoPackagesRoute(pathname: string): boolean {
  return SEO_PACKAGES_ALLOWED_ROUTES.some(
    (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`),
  );
}

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