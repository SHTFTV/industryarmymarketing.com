// Global fake-Stripe / Coming Soon opener.
// Any CTA can call openComingSoon() to intercept a checkout/apply flow
// and show the shared modal instead. The modal listens on window.

export const COMING_SOON_EVENT = "iam:coming-soon";

export type ComingSoonDetail = {
  title?: string;
  message?: string;
};

export function openComingSoon(detail: ComingSoonDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ComingSoonDetail>(COMING_SOON_EVENT, { detail }));
}