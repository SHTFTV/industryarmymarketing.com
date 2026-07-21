import { Navigate, Route } from "react-router-dom";

// Legacy WordPress-era URL redirects. React Router <Navigate replace>
// gives 301-style behavior for the SPA. These paths are intentionally
// omitted from scripts/generate-sitemap.ts and
// scripts/generate-prerender-routes.ts so they are not indexed and do
// not emit static HTML.
export const LEGACY_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/contact-us", to: "/contact" },
  { from: "/contact-us/", to: "/contact" },
  { from: "/packages", to: "/pricing" },
  { from: "/packages/", to: "/pricing" },
  { from: "/seo-vancouver", to: "/seo-packages" },
  { from: "/seo-vancouver/", to: "/seo-packages" },
  { from: "/company", to: "/how-it-works" },
  { from: "/company/", to: "/how-it-works" },
  { from: "/online-marketing", to: "/seo-packages" },
  { from: "/online-marketing/", to: "/seo-packages" },
  { from: "/creation-industry-marketing", to: "/blog" },
  { from: "/creation-industry-marketing/", to: "/blog" },
  { from: "/our-clients-use-these-free-directories", to: "/network" },
  { from: "/our-clients-use-these-free-directories/", to: "/network" },
  { from: "/ai-lol", to: "/blog" },
  { from: "/ai-lol/", to: "/blog" },
  {
    from: "/industry-army-marketing-opens-to-new-clients-after-20-years-of-seo-excellence-in-vancouver",
    to: "/blog",
  },
  {
    from: "/industry-army-marketing-opens-to-new-clients-after-20-years-of-seo-excellence-in-vancouver/",
    to: "/blog",
  },
  { from: "/feed", to: "/rss.xml" },
  { from: "/feed/", to: "/rss.xml" },
  // Catch-alls
  { from: "/contractor-marketing/*", to: "/contractors" },
  { from: "/wp-content/*", to: "/" },
  { from: "/wp-admin/*", to: "/" },
  { from: "/wp-login.php", to: "/" },
];

export const legacyRedirectRoutes = () =>
  LEGACY_REDIRECTS.map(({ from, to }) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));