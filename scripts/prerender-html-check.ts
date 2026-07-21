// Verify prerendered HTML (dist/) for /blog and the newest /blog/* pages
// contains the SEO signals Googlebot needs BEFORE any JS runs.
//
// Checks per page in raw HTML source:
//   - non-default <title>
//   - <meta name="description" content="...">
//   - <link rel="canonical" href="..."> matching sitemap loc
//   - <meta property="og:title|og:description|og:image|og:url">
//   - <meta name="twitter:card"> and twitter:title
//   - Valid JSON-LD in <script type="application/ld+json"> — BlogPosting
//     for /blog/* posts, ItemList or Blog for /blog.
//
// Runs against local dist/ by default; pass --live to hit the deployed
// origin instead (uses `curl`-style fetch).
//
// Usage:
//   bun run build && bunx tsx scripts/prerender-html-check.ts
//   bunx tsx scripts/prerender-html-check.ts --count 8
//   bunx tsx scripts/prerender-html-check.ts --live --base https://www.industryarmymarketing.com

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const flag = (n: string) => args.includes(n);

const COUNT = Number(arg("--count", "5"));
const LIVE = flag("--live");
const BASE = (arg("--base", "https://www.industryarmymarketing.com") ?? "").replace(/\/$/, "");

type Issue = { url: string; missing: string[] };

function newestBlogSlugsFromSitemap(n: number): { path: string; loc: string }[] {
  const xml = readFileSync(resolve("public/sitemap.xml"), "utf8");
  const rows = Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g), (m) => m[1])
    .map((e) => ({
      loc: e.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "",
      lastmod: e.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "",
    }))
    .filter((r) => /\/blog\/[^/]+$/.test(r.loc))
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
  return rows.slice(0, n).map((r) => ({
    path: r.loc.replace(/^https?:\/\/[^/]+/, ""),
    loc: r.loc,
  }));
}

async function fetchHtml(path: string, loc: string): Promise<string> {
  if (LIVE) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  }
  // dist path — either /blog/slug/index.html or /blog/slug.html
  const candidates = [
    resolve(`dist${path}/index.html`),
    resolve(`dist${path}.html`),
    resolve(`dist${path === "/" ? "/index.html" : `${path}/index.html`}`),
  ];
  for (const c of candidates) if (existsSync(c)) return readFileSync(c, "utf8");
  throw new Error(`no prerendered HTML for ${path} (tried ${candidates.join(", ")})`);
}

function checkPage(url: string, html: string, isPost: boolean): string[] {
  const missing: string[] = [];
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";
  if (!title || /^Lovable (App|Generated Project)$/i.test(title)) missing.push("title");

  const need = [
    { key: "meta:description", re: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i },
    { key: "link:canonical", re: /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/i },
    { key: "og:title", re: /<meta[^>]+property=["']og:title["'][^>]+content=["'][^"']+["']/i },
    { key: "og:description", re: /<meta[^>]+property=["']og:description["'][^>]+content=["'][^"']+["']/i },
    { key: "og:image", re: /<meta[^>]+property=["']og:image["'][^>]+content=["'][^"']+["']/i },
    { key: "og:url", re: /<meta[^>]+property=["']og:url["'][^>]+content=["'][^"']+["']/i },
    { key: "twitter:card", re: /<meta[^>]+name=["']twitter:card["'][^>]+content=["'][^"']+["']/i },
    { key: "twitter:title", re: /<meta[^>]+name=["']twitter:title["'][^>]+content=["'][^"']+["']/i },
  ];
  for (const { key, re } of need) if (!re.test(html)) missing.push(key);

  // JSON-LD
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (m) => m[1],
  );
  let matchedSchema = false;
  const wanted = isPost ? ["BlogPosting", "Article", "NewsArticle"] : ["ItemList", "Blog", "CollectionPage"];
  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw.trim());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const t = node?.["@type"];
        const types = Array.isArray(t) ? t : [t];
        if (types.some((x) => wanted.includes(String(x)))) matchedSchema = true;
      }
    } catch {
      missing.push("jsonld:invalid-json");
    }
  }
  if (blocks.length === 0) missing.push("jsonld:missing");
  else if (!matchedSchema) missing.push(`jsonld:no-${wanted.join("|")}`);

  // Canonical should reference the same URL family as the loc (path match).
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonMatch) {
    const canonPath = new URL(canonMatch[1], "https://x").pathname.replace(/\/$/, "");
    const expectPath = new URL(url, "https://x").pathname.replace(/\/$/, "");
    if (canonPath !== expectPath) missing.push(`canonical:mismatch(${canonPath}!=${expectPath})`);
  }

  return missing;
}

async function main() {
  const posts = newestBlogSlugsFromSitemap(COUNT);
  const targets: { url: string; path: string; isPost: boolean }[] = [
    { url: `${BASE}/blog`, path: "/blog", isPost: false },
    ...posts.map((p) => ({ url: p.loc, path: p.path, isPost: true })),
  ];

  console.log(`prerender-html-check: ${targets.length} URLs (${LIVE ? "live" : "dist"})`);
  const issues: Issue[] = [];
  for (const t of targets) {
    try {
      const html = await fetchHtml(t.path, t.url);
      const missing = checkPage(t.url, html, t.isPost);
      if (missing.length === 0) {
        console.log(`  PASS  ${t.url}`);
      } else {
        console.log(`  FAIL  ${t.url} — missing: ${missing.join(", ")}`);
        issues.push({ url: t.url, missing });
      }
    } catch (e) {
      console.log(`  FAIL  ${t.url} — ${(e as Error).message}`);
      issues.push({ url: t.url, missing: [`fetch:${(e as Error).message}`] });
    }
  }

  console.log(`\n${issues.length === 0 ? "PASS" : "FAIL"}: ${targets.length - issues.length}/${targets.length}`);
  process.exit(issues.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});