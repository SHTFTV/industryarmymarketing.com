// Runs before `react-snap` in the postbuild hook.
// Writes an explicit list of prerender targets into package.json's
// `reactSnap.include` field so every public route — including ones
// react-snap's link crawler might miss — is rendered to static HTML.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import contractorSlugs from "./contractor-slugs.json" with { type: "json" };

const cities = ["vancouver", "surrey", "calgary", "edmonton", "toronto", "kelowna"];
const localCities = ["vancouver", "surrey", "langley"];
const niches = ["steel-stud", "mining-logistics"];
const trades = ["plumbing", "roofing", "electrical", "hvac", "framing", "demolition", "excavation", "painting"];

// Regex-parse slugs from blogPosts.ts (same approach as generate-sitemap.ts)
const blogPostsSource = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");
const blogSlugs = Array.from(
  blogPostsSource.matchAll(/^\s*["']?slug["']?\s*:\s*["']([a-z0-9-]+)["']/gm),
  (m) => m[1],
);
if (blogSlugs.length === 0) {
  throw new Error("generate-prerender-routes: no blog slugs parsed from blogPosts.ts");
}

// Prerender-safe public routes only. Admin/dashboard/dynamic auth pages
// are excluded so react-snap does not stall on runtime-only surfaces.
const routes: string[] = [
  "/",
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
  "/industries",
  "/contact",
  "/network",
  "/eyespyr",
  "/blog",
  "/investors",
  "/legal",
  "/weddings-ecosystem",
  "/sitemap",
  ...niches.map((n) => `/niches/${n}`),
  ...localCities.map((c) => `/local/${c}`),
  ...cities.map((c) => `/cities/${c}`),
  ...trades.map((t) => `/contractors/${t}`),
  ...blogSlugs.map((s) => `/blog/${s}`),
  ...(contractorSlugs as string[]).map((s) => `/contractor-marketing/${s}/`),
];

const uniqueRoutes = Array.from(new Set(routes));

const pkgPath = resolve("package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.reactSnap = pkg.reactSnap ?? {};
pkg.reactSnap.include = uniqueRoutes;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`prerender-routes: wrote ${uniqueRoutes.length} routes to package.json reactSnap.include`);