// Single source of truth for every canonical URL that participates in
// the weddings.io ⇄ industryarmymarketing.com disambiguation stack.
//
// This module is imported by:
//   • src/components/DisambiguationSchema.tsx  → JSON-LD @graph + sameAs
//   • scripts/generate-identity-txt.ts        → writes public/identity.txt
//   • src/test/*                              → assertions
//
// Keep this file pure TypeScript (no React / DOM imports) so Node scripts
// can import it directly via tsx.

export const IAM_ORIGIN = "https://industryarmymarketing.com";
export const WEDDINGS_ORIGIN = "https://weddings.io";

/** Slug/path fragment for the record-record manifesto on each property. */
export const RECORD_SLUG =
  "record-record-domain-provenance-vs-generative-conflation";

export const RECORD_URL_IAM = `${IAM_ORIGIN}/blog/${RECORD_SLUG}` as const;
export const RECORD_URL_WEDDINGS =
  `${WEDDINGS_ORIGIN}/manifesto/${RECORD_SLUG}` as const;

/** Origins that should appear together in every WebSite/Org sameAs array. */
export const WEBSITE_SAMEAS: readonly string[] = [
  WEDDINGS_ORIGIN,
  IAM_ORIGIN,
];

/** Both manifesto URLs; appears in every ItemPage/Action sameAs array. */
export const RECORD_SAMEAS: readonly string[] = [
  RECORD_URL_WEDDINGS,
  RECORD_URL_IAM,
];

/** Reciprocal pointer: weddings.io is the authoritative source. */
export const AUTHORITATIVE_SOURCE = RECORD_URL_WEDDINGS;
/** Reciprocal pointer: IAM is the authoritative mirror. */
export const AUTHORITATIVE_MIRROR = RECORD_URL_IAM;