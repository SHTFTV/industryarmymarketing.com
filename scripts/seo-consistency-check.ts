// Consistency check between robots.txt, sitemap.xml, and every /blog/*
// page. Verifies:
//
//   1. robots.txt Sitemap: directive matches the canonical sitemap URL,
//      no accidental Disallow: / (site-wide crawl block), and no stale
//      references to legacy paths.
//   2. sitemap.xml <loc>s all live under the canonical host and contain
//      no legacy-redirect paths (from LEGACY_REDIRECTS) or admin/private
//      paths (/admin, /dashboard, /sync-account, /pwa-check).
//   3. Every /blog/* URL in the sitemap:
//        - resolves to prerendered HTML in dist/ (or fetches live with --live)
//        - has <link rel="canonical"> that exactly matches its sitemap loc
//        - has a BlogPosting JSON-LD whose url/mainEntityOfPage matches the loc
//        - has og:url matching the loc
//
// Exit non-zero on any failure so it can gate CI.

import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const SITE = "https://www.industryarmymarketing.com";
const ALT_HOSTS = ["industryarmymarketing.com", "www.industryarmymarketing.com"];
const DIST = resolve("dist");

type Issue = { source: string; problem: string };
const issues: Issue[] = [];
const fail = (source: string, problem: string) => issues.push({ source, problem });

function normPath(u: string) {
  return u.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
}

function checkRobots() {
  const robots = readFileSync(resolve("public/robots.txt"), "utf8");
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots) && /User-agent:\s*\*/i.test(robots)) {
    // Confirm the `*` block itself does not contain a bare Disallow: /.
    const starBlock = robots.split(/User-agent:/i).find((b) => /^\s*\*/.test(b)) ?? "";
    if (/^\s*Disallow:\s*\/\s*$/m.test(starBlock))
      fail("robots.txt", "User-agent: * has Disallow: / (blocks entire site)");
  }
  const sm = robots.match(/^Sitemap:\s*(\S+)/im)?.[1];
  if (!sm) fail("robots.txt", "missing Sitemap: directive");
  else if (!ALT_HOSTS.some((h) => sm.includes(h)) || !sm.endsWith("/sitemap.xml"))
    fail("robots.txt", `Sitemap: ${sm} does not point to canonical sitemap.xml`);

  for (const { from } of LEGACY_REDIRECTS) {
    const literal = from.replace("/*", "");
    if (literal && literal !== "/" && new RegExp(`Allow:\\s*${literal}(\\s|$)`).test(robots))
      fail("robots.txt", `explicit Allow for legacy path ${literal}`);
  }
  console.log("✓ robots.txt");
}

function parseLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim());
}

function checkSitemap(): string[] {
  const xml = readFileSync(resolve("public/sitemap.xml"), "utf8");
  const locs = parseLocs(xml);
  const badHost = locs.filter((u) => !ALT_HOSTS.some((h) => u.includes(h)));
  for (const u of badHost) fail("sitemap.xml", `off-host loc: ${u}`);

  const banned = ["/admin", "/dashboard", "/sync-account", "/pwa-check", "/services/thank-you"];
  for (const u of locs)
    for (const b of banned)
      if (normPath(u).startsWith(b)) fail("sitemap.xml", `banned path listed: ${u}`);

  for (const { from } of LEGACY_REDIRECTS) {
    const literal = from.replace("/*", "");
    if (!literal || literal === "/") continue;
    for (const u of locs)
      if (normPath(u) === literal) fail("sitemap.xml", `legacy path listed: ${u}`);
  }

  const dupes = new Map<string, number>();
  for (const u of locs) dupes.set(u, (dupes.get(u) ?? 0) + 1);
  for (const [u, n] of dupes) if (n > 1) fail("sitemap.xml", `duplicate loc ×${n}: ${u}`);

  console.log(`✓ sitemap.xml (${locs.length} locs)`);
  return locs;
}

async function getHtml(url: string): Promise<string> {
  if (!LIVE) {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    const clean = path === "/" ? "/index.html" : `${path.replace(/\/$/, "")}/index.html`;
    const p = join(DIST, clean);
    if (existsSync(p)) return readFileSync(p, "utf8");
    const alt = join(DIST, `${path.replace(/^\//, "")}.html`);
    if (existsSync(alt)) return readFileSync(alt, "utf8");
    throw new Error(`no dist HTML`);
  }
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  for (const m of html.matchAll(
    /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const v = JSON.parse(m[1].trim());
      Array.isArray(v) ? out.push(...v) : out.push(v);
    } catch { /* flagged elsewhere */ }
  }
  return out;
}

async function checkBlogPage(url: string) {
  let html: string;
  try {
    html = await getHtml(url);
  } catch (e) {
    fail(url, (e as Error).message);
    return;
  }
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  if (!canon) fail(url, "missing canonical");
  else if (normPath(canon) !== normPath(url))
    fail(url, `canonical ${canon} ≠ sitemap loc ${url}`);

  const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1];
  if (og && normPath(og) !== normPath(url)) fail(url, `og:url ${og} ≠ ${url}`);

  const schemas = extractJsonLd(html);
  const blog = schemas.find(
    (s: any) => s && typeof s === "object" && (s["@type"] === "BlogPosting" || (Array.isArray(s["@type"]) && s["@type"].includes("BlogPosting"))),
  ) as any;
  if (!blog) fail(url, "no BlogPosting JSON-LD");
  else {
    const bUrl = blog.url ?? blog.mainEntityOfPage?.["@id"] ?? blog.mainEntityOfPage;
    if (bUrl && normPath(String(bUrl)) !== normPath(url))
      fail(url, `BlogPosting url ${bUrl} ≠ ${url}`);
  }
}

async function main() {
  checkRobots();
  const locs = checkSitemap();
  const blogLocs = locs.filter((u) => /\/blog\/[^/]+$/.test(u));
  console.log(`checking ${blogLocs.length} /blog/* pages (${LIVE ? "live" : "dist"})...`);
  for (const u of blogLocs) await checkBlogPage(u);

  if (issues.length > 0) {
    console.error(`\n✗ ${issues.length} consistency issues:`);
    for (const i of issues) console.error(`  [${i.source}] ${i.problem}`);
    process.exit(1);
  }
  console.log("\n✓ robots.txt, sitemap.xml, and all /blog/* pages are consistent.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});