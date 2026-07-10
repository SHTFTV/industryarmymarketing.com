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
  | "pdf_download"
  | "order_click"
  | "order_submitted"
  | "order_failed";

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