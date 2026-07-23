// Runs before `react-snap` in the postbuild hook.
// Writes an explicit list of prerender targets into package.json's
// `reactSnap.include` field so every public route — including ones
// react-snap's link crawler might miss — is rendered to static HTML.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fetchPublishedBlogPosts } from "./lib/blog-source";

const cities = ["vancouver", "surrey", "calgary", "edmonton", "toronto", "kelowna"];
const localCities = ["vancouver", "surrey", "langley"];
const niches = ["steel-stud", "mining-logistics"];
const trades = ["plumbing", "roofing", "electrical", "hvac", "framing", "demolition", "excavation", "painting"];

// Regex-parse slugs from blogPosts.ts (same approach as generate-sitemap.ts)
const blogPostsSource = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");
// Parse slug + publishedAt pairs by scanning post objects so we can order
// prerender targets newest-first. React-snap processes `include` in order,
// so the latest posts (and the `/blog` listing) render before older posts.
const slugRe = /["']?slug["']?\s*:\s*["']([a-z0-9-]+)["']/g;
const dateRe = /["']?publishedAt["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g;

type PostMeta = { slug: string; publishedAt: string };
const blogPosts: PostMeta[] = [];
// Walk in tandem by finding the nearest publishedAt within 4KB after each slug match.
for (const m of blogPostsSource.matchAll(slugRe)) {
  const slug = m[1];
  const windowStart = m.index ?? 0;
  const windowEnd = windowStart + 4000;
  const window = blogPostsSource.slice(windowStart, windowEnd);
  const d = window.match(/["']?publishedAt["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/);
  blogPosts.push({ slug, publishedAt: d ? d[1] : "1970-01-01" });
}
// De-dupe by slug (blogPosts.ts may reference the same slug in exports)
const seen = new Set<string>();
const uniquePosts = blogPosts.filter((p) => {
  if (seen.has(p.slug)) return false;
  seen.add(p.slug);
  return true;
});
uniquePosts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
let blogSlugs = uniquePosts.map((p) => p.slug);

// DB overlay: filter to live posts and append any DB-only slugs so
// react-snap prerenders every published route from /admin/blog too.
const dbRows = await fetchPublishedBlogPosts();
if (dbRows) {
  const dbSlugSet = new Set(dbRows.map((r) => r.slug));
  const staticSet = new Set(blogSlugs);
  blogSlugs = blogSlugs.filter((s) => dbSlugSet.has(s));
  for (const row of dbRows) {
    if (!staticSet.has(row.slug)) blogSlugs.push(row.slug);
  }
  console.log(`[prerender-routes] DB overlay applied: ${blogSlugs.length} blog routes`);
}
if (blogSlugs.length === 0) {
  throw new Error("generate-prerender-routes: no blog slugs parsed from blogPosts.ts");
}

// Re-slice priority window after overlay so latest DB-driven order wins.
const _priorityBlogSlugs = blogSlugs.slice(0, LATEST_PRIORITY_COUNT);
const _remainingBlogSlugs = blogSlugs.slice(LATEST_PRIORITY_COUNT);

// Latest N posts get top priority so their static HTML is warm before the
// rest of the crawl completes. Keep this small so the priority window
// stays useful when react-snap is bounded by concurrency.
const LATEST_PRIORITY_COUNT = 10;
const priorityBlogSlugs = blogSlugs.slice(0, LATEST_PRIORITY_COUNT);
const remainingBlogSlugs = blogSlugs.slice(LATEST_PRIORITY_COUNT);

// Prerender-safe public routes only. Admin/dashboard/dynamic auth pages
// are excluded so react-snap does not stall on runtime-only surfaces.
const routes: string[] = [
  // Highest priority: home + blog listing + latest posts render first.
  "/",
  "/blog",
  ...priorityBlogSlugs.map((s) => `/blog/${s}`),
  "/how-it-works",
  "/pricing",
  "/seo-packages",
  "/seo-packages/bullets",
  "/seo-packages/boom",
  "/seo-packages/bombs",
  "/contractors",
  "/service-professionals",
  "/backlinks",
  "/dofollow-backlinks",
  "/guest-post",
  "/services/lead-generation",
  "/services/web-development",
  "/services/social-media",
  "/services/affordable-seo",
  "/services/dofollow-backlinks",
  "/industries",
  "/contact",
  "/network",
  "/eyespyr",
  "/investors",
  "/legal",
  "/weddings-ecosystem",
  "/sitemap",
  ...niches.map((n) => `/niches/${n}`),
  ...localCities.map((c) => `/local/${c}`),
  ...cities.map((c) => `/cities/${c}`),
  ...trades.map((t) => `/contractors/${t}`),
  ...remainingBlogSlugs.map((s) => `/blog/${s}`),
];

const uniqueRoutes = Array.from(new Set(routes));

const pkgPath = resolve("package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.reactSnap = pkg.reactSnap ?? {};
pkg.reactSnap.include = uniqueRoutes;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`prerender-routes: wrote ${uniqueRoutes.length} routes to package.json reactSnap.include`);