// PPP factors for country-based pricing accessibility.
// Factor = multiplier applied to USD list price for display.
// 1.00 = flat USD (established markets). <1 = emerging market discount.
// Source: World Bank ICP 2020 price-level ratios, per IAM Network SOT.
// Reviewed annually. Stripe card-country enforcement is the source of
// truth at checkout — this table drives DISPLAY on the site only.

export type PppCountry = {
  code: string;        // ISO 3166-1 alpha-2
  name: string;
  factor: number;      // multiply USD by this
  currency: string;    // display label only
  tier: "established" | "emerging";
};

export const PPP_COUNTRIES: readonly PppCountry[] = [
  // Established markets — flat USD
  { code: "US", name: "United States",   factor: 1.00, currency: "USD", tier: "established" },
  { code: "CA", name: "Canada",          factor: 1.00, currency: "USD", tier: "established" },
  { code: "GB", name: "United Kingdom",  factor: 1.00, currency: "USD", tier: "established" },
  { code: "AU", name: "Australia",       factor: 1.00, currency: "USD", tier: "established" },
  { code: "EU", name: "European Union",  factor: 1.00, currency: "USD", tier: "established" },
  { code: "SG", name: "Singapore",       factor: 1.00, currency: "USD", tier: "established" },
  { code: "AE", name: "United Arab Emirates", factor: 1.00, currency: "USD", tier: "established" },
  { code: "JP", name: "Japan",           factor: 1.00, currency: "USD", tier: "established" },
  { code: "KR", name: "South Korea",     factor: 1.00, currency: "USD", tier: "established" },

  // Emerging markets — PPP-adjusted for accessibility
  { code: "IN", name: "India",           factor: 0.30, currency: "USD", tier: "emerging" },
  { code: "PK", name: "Pakistan",        factor: 0.28, currency: "USD", tier: "emerging" },
  { code: "BD", name: "Bangladesh",      factor: 0.30, currency: "USD", tier: "emerging" },
  { code: "NG", name: "Nigeria",         factor: 0.30, currency: "USD", tier: "emerging" },
  { code: "KE", name: "Kenya",           factor: 0.35, currency: "USD", tier: "emerging" },
  { code: "PH", name: "Philippines",     factor: 0.35, currency: "USD", tier: "emerging" },
  { code: "EG", name: "Egypt",           factor: 0.30, currency: "USD", tier: "emerging" },
  { code: "TR", name: "Turkey",          factor: 0.35, currency: "USD", tier: "emerging" },
  { code: "ID", name: "Indonesia",       factor: 0.35, currency: "USD", tier: "emerging" },
  { code: "VN", name: "Vietnam",         factor: 0.35, currency: "USD", tier: "emerging" },
  { code: "BR", name: "Brazil",          factor: 0.45, currency: "USD", tier: "emerging" },
  { code: "MX", name: "Mexico",          factor: 0.55, currency: "USD", tier: "emerging" },
] as const;

export const DEFAULT_PPP_CODE = "US";

export function getPppFactor(code: string | undefined | null): number {
  if (!code) return 1;
  const hit = PPP_COUNTRIES.find((c) => c.code === code.toUpperCase());
  return hit ? hit.factor : 1;
}

export function pppAdjust(usd: number, code: string | undefined | null): number {
  const adjusted = usd * getPppFactor(code);
  // Round to whole dollars for readability; never below $1.
  return Math.max(1, Math.round(adjusted));
}