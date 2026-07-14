import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const KEY = "iam_session_id";

// ---------------------------------------------------------------------------
// GA4 mirror
//   Set `VITE_GA4_MEASUREMENT_ID=G-XXXXXXX` to enable Google Analytics 4.
//   All events tracked via `track` and `trackEvent` are mirrored to GA4.
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_ID =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_GA4_MEASUREMENT_ID) ||
  "";

let ga4Initialized = false;
function ensureGa4() {
  if (ga4Initialized || !GA4_ID || typeof window === "undefined") return;
  ga4Initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
}

function ga4Send(event: string, params: Record<string, unknown> = {}) {
  if (!GA4_ID || typeof window === "undefined") return;
  ensureGa4();
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* noop */
  }
}

function sessionId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export type AnalyticsEvent =
  | "estimator_view"
  | "estimator_input_change"
  | "estimator_submit"
  | "estimator_recommendation"
  | "package_selected"
  | "package_detail_view"
  | "home_package_cta_click"
  | "home_compare_packages_click"
  | "home_compare_faq_cta_click"
  | "home_cta_conversion"
  | "pdf_download"
  | "order_click"
  | "order_submitted"
  | "order_failed"
  | "bid_form_submitted"
  | "bid_form_submit_failed"
  | "bid_form_validation_failed"
  | "bid_success";

export async function track(
  event: AnalyticsEvent,
  payload: {
    packageSlug?: string;
    meta?: Record<string, unknown>;
  } = {},
): Promise<void> {
  ga4Send(event, {
    package_slug: payload.packageSlug,
    ...(payload.meta ?? {}),
  });
  try {
    await supabase.from("seo_events").insert({
      event,
      session_id: sessionId(),
      path: typeof window !== "undefined" ? window.location.pathname : null,
      package_slug: payload.packageSlug ?? null,
      meta: (payload.meta ?? {}) as unknown as Json,
    });
  } catch {
    // Fire-and-forget: never break UX on analytics failure.
  }
}

// ---------------------------------------------------------------------------
// End-to-end CTA attribution.
//
// A CTA click stores a "pending attribution" record in sessionStorage. When
// the next page loads, `flushCtaAttribution` reads it, verifies the current
// path matches the CTA's target, and fires a `home_cta_conversion` event
// tying the click to the resulting page view.
// ---------------------------------------------------------------------------
const CTA_KEY = "iam_pending_cta";
const CTA_TTL_MS = 5 * 60 * 1000; // 5 minutes

export type PendingCta = {
  event: AnalyticsEvent;
  label: string;
  source: string;
  target: string;
  packageSlug?: string;
  price?: number;
  ts: number;
};

export function recordCtaAttribution(cta: Omit<PendingCta, "ts">): void {
  try {
    sessionStorage.setItem(CTA_KEY, JSON.stringify({ ...cta, ts: Date.now() }));
  } catch {
    /* noop */
  }
}

export function flushCtaAttribution(currentPath: string): void {
  try {
    const raw = sessionStorage.getItem(CTA_KEY);
    if (!raw) return;
    const cta = JSON.parse(raw) as PendingCta;
    if (!cta || typeof cta.ts !== "number") {
      sessionStorage.removeItem(CTA_KEY);
      return;
    }
    if (Date.now() - cta.ts > CTA_TTL_MS) {
      sessionStorage.removeItem(CTA_KEY);
      return;
    }
    // Match by prefix so /seo-packages/boom matches target /seo-packages/boom
    // and /contact matches /contact exactly.
    const matches =
      currentPath === cta.target || currentPath.startsWith(cta.target + "/");
    if (!matches) return;
    sessionStorage.removeItem(CTA_KEY);
    void track("home_cta_conversion", {
      packageSlug: cta.packageSlug,
      meta: {
        clickEvent: cta.event,
        label: cta.label,
        source: cta.source,
        target: cta.target,
        price: cta.price,
        landedOn: currentPath,
        latencyMs: Date.now() - cta.ts,
      },
    });
  } catch {
    /* noop */
  }
}

// Debounced tracker for high-frequency inputs.
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function trackDebounced(
  key: string,
  event: AnalyticsEvent,
  payload: Parameters<typeof track>[1] = {},
  delay = 900,
) {
  if (timers[key]) clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    track(event, payload);
    delete timers[key];
  }, delay);
}

// -------------------------------------------------------------------------
// Legacy blog analytics API (retained for existing callers).
// -------------------------------------------------------------------------
export const BLOG_EVENTS = {
  search: "blog_search",
  changePage: "blog_change_page",
  clearFilters: "blog_clear_filters",
  filterCity: "blog_filter_city",
  filterCategory: "blog_filter_category",
} as const;

export function trackEvent(name: string, meta: Record<string, unknown> = {}) {
  ga4Send(name, meta);
  try {
    void supabase.from("seo_events").insert({
      event: name.slice(0, 80),
      session_id: sessionId(),
      path: typeof window !== "undefined" ? window.location.pathname : null,
      meta: meta as unknown as Json,
    });
  } catch {
    /* noop */
  }
}