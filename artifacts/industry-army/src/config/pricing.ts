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
export type Severity = "warn" | "fail";

export type ForbiddenSubstring = {
  text: string;
  severity: Severity;
};

/**
 * Substrings that MUST NOT appear on territory-pricing surfaces. Each
 * has a severity:
 *   - "fail" → CI fails, spec throws, non-zero exit
 *   - "warn" → recorded in the report but does not fail the build
 */
export const FORBIDDEN_ON_TERRITORY_SURFACES: readonly ForbiddenSubstring[] = [
  { text: "$85 one-time", severity: "fail" },
  { text: "$285 one-time", severity: "fail" },
  { text: "$585 one-time", severity: "fail" },
  { text: "Bullets. Boom. Bombs.", severity: "fail" },
];

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
  severity: Severity;
}[] = [
  {
    name: "seo-package-one-time-price",
    // $85 one-time / $285 one-time / $585 one-time, tolerant of spacing
    // and hyphen/space between "one" and "time".
    source: "\\$\\s?(85|285|585)\\s*(?:one[\\s-]?time)",
    flags: "i",
    severity: "fail",
  },
  {
    name: "bullets-boom-bombs-block",
    // The removed marketing block, tolerant of punctuation and casing.
    source: "bullets\\s*[.,·•]?\\s*boom\\s*[.,·•]?\\s*bombs",
    flags: "i",
    severity: "fail",
  },
  {
    // Lone mentions of the old product names in prose are allowed but
    // worth surfacing so we can review copy drift.
    name: "loose-package-name-mention",
    source: "\\b(bullets|boom|bombs)\\b",
    flags: "i",
    severity: "warn",
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
  "/apply/contractors",
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

// ---------------------------------------------------------------------------
// SEO Packages guard (mirror of the territory guard, run in "packages" mode).
//
// On routes in SEO_PACKAGES_ALLOWED_ROUTES:
//   - REQUIRED strings must be present (product block must render)
//   - Territory-rule strings ($10/slot flat wording) must NOT be present
//     — prevents cross-contamination from the City Commander product
// ---------------------------------------------------------------------------

/** Strings the SEO Packages product surface MUST render. */
export const REQUIRED_ON_SEO_PACKAGES: readonly {
  text: string;
  severity: Severity;
}[] = [
  { text: "$85 one-time", severity: "fail" },
  { text: "$285 one-time", severity: "fail" },
  { text: "$585 one-time", severity: "fail" },
];

/**
 * Territory-pricing rule strings that MUST NOT leak onto SEO Packages
 * routes. If they appear, either the packages page has been repurposed
 * or the territory product's copy has been pasted into it by accident.
 */
export const FORBIDDEN_ON_SEO_PACKAGES: readonly ForbiddenSubstring[] = [
  { text: "$10/slot/mo", severity: "fail" },
  { text: "$10/slot flat", severity: "fail" },
  { text: "$10 per 100K", severity: "fail" },
  { text: "100K baseline", severity: "fail" },
  { text: "Territory Pricing", severity: "warn" },
];

// ---------------------------------------------------------------------------
// Per-route suppressions (audit-tracked false-positive allowlist).
//
// When a legitimate product name or price string collides with a
// forbidden pattern on a specific route, add an entry here instead of
// weakening the pattern globally. The Playwright guard consults this
// list per (route, match) and treats matched suppressions as "skipped"
// in the report — the audit trail is preserved.
// ---------------------------------------------------------------------------

export type RouteSuppression = {
  /** Exact matched text OR the pattern name to suppress. */
  match: string;
  /** Human-readable reason this false-positive is allowed. Required. */
  reason: string;
  /** Who added it — GitHub handle or email. Required for audit trail. */
  addedBy: string;
  /** ISO date when suppression was added. Required. */
  addedOn: string;
  /** Optional expiry (ISO date). Suppression expires and re-fires after. */
  expiresOn?: string;
  /** Optional PR/issue link for context. */
  ref?: string;
};

/**
 * Map of `pathname` → suppressions. Prefix match: `/blog/foo` inherits
 * suppressions defined for `/blog`.
 *
 * Example:
 *   "/blog": [
 *     { match: "loose-package-name-mention", reason: "Historical post citing the old product names", addedBy: "@colin", addedOn: "2026-07-14", ref: "PR#412" }
 *   ]
 */
export const ROUTE_SUPPRESSIONS: Readonly<Record<string, readonly RouteSuppression[]>> = {
  // No active suppressions today. Add entries here (with a full audit
  // record) instead of loosening the global patterns.
  //
  // ── TEMPLATE ────────────────────────────────────────────────────────
  // Copy the block below, uncomment, and fill every field. All fields
  // except `expiresOn` and `ref` are required. Prefer an `expiresOn`
  // within 90 days so suppressions get re-reviewed instead of silently
  // persisting forever.
  //
  // "/blog": [
  //   {
  //     // Either the exact matched text OR the pattern `name` from
  //     // FORBIDDEN_PATTERNS (e.g. "loose-package-name-mention").
  //     match: "loose-package-name-mention",
  //     // Why this false-positive is acceptable on this route. Be
  //     // specific — reviewers should not have to guess.
  //     reason: "Historical post referencing the retired Bullets/Boom/Bombs SKUs by name.",
  //     // GitHub handle or email of the person adding the suppression.
  //     addedBy: "@your-handle",
  //     // ISO date (YYYY-MM-DD) when the suppression was added.
  //     addedOn: "2026-07-14",
  //     // ISO date when the suppression auto-expires. Keep ≤ 90 days
  //     // out unless there's a documented reason for longer.
  //     expiresOn: "2026-10-12",
  //     // Link to the PR / issue / ADR that justifies the entry.
  //     ref: "https://github.com/org/repo/pull/1234",
  //   },
  // ],
  // ────────────────────────────────────────────────────────────────────
};

/** Returns the effective suppressions for a route (with prefix inheritance). */
export function suppressionsForRoute(pathname: string): RouteSuppression[] {
  const now = Date.now();
  const out: RouteSuppression[] = [];
  for (const [prefix, entries] of Object.entries(ROUTE_SUPPRESSIONS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      for (const e of entries) {
        if (e.expiresOn && Date.parse(e.expiresOn) < now) continue;
        out.push(e);
      }
    }
  }
  return out;
}

/**
 * True when a specific (route, matchedText, patternName) tuple is
 * covered by an audited suppression.
 */
export function isSuppressed(
  pathname: string,
  matchedText: string,
  patternName: string,
): RouteSuppression | null {
  for (const s of suppressionsForRoute(pathname)) {
    if (s.match === matchedText || s.match === patternName) return s;
  }
  return null;
}
