// Lightweight analytics helper.
//
// Fires custom events to:
//   1. window.dataLayer (Google Tag Manager) — pushed unconditionally so the
//      queue captures events even before GTM finishes loading.
//   2. window.gtag (GA4 / Google Ads) — called when available.
//
// Both integrations are optional — if neither script is installed the calls
// are effectively no-ops. This lets us instrument the app now and turn on
// GTM/GA4 later without touching component code.

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track a custom analytics event. Params are shallow-copied; `undefined`
 * values are dropped so downstream tools don't index empty properties.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") clean[k] = v;
  }

  // GTM dataLayer — always push (queue tolerates a missing GTM script).
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...clean });

  // GA4 direct — fires only when the gtag shim is present.
  if (typeof window.gtag === "function") {
    window.gtag("event", name, clean);
  }
}

export const BLOG_EVENTS = {
  search: "blog_search",
  filterCity: "blog_filter_city",
  filterCategory: "blog_filter_category",
  clearFilters: "blog_clear_filters",
  changePage: "blog_change_page",
} as const;