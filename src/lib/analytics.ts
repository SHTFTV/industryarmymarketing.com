import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const KEY = "iam_session_id";

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