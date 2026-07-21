// Crawls sitemap.xml and every /blog/* URL it lists, then verifies each
// page has:
//   1. Exactly one <link rel="canonical"> whose href resolves to the
//      page's own URL (host-agnostic).
//   2. At least one <script type="application/ld+json"> with valid JSON.
//
// Runs against the prerendered dist/ HTML when present (fast local
// check), otherwise fetches the live site. Exits non-zero when any
// page fails so it can gate CI.
//
// Usage:
//   bunx tsx scripts/seo-canonical-jsonld-check.ts
//   bunx tsx scripts/seo-canonical-jsonld-check.ts --live

import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const SITE = "https://www.industryarmymarketing.com";
const DIST = resolve("dist");

function readSitemap(): string {
  if (!LIVE && existsSync(join(DIST, "sitemap.xml"))) {
    return readFileSync(join(DIST, "sitemap.xml"), "utf8");
  }
  return readFileSync(resolve("public/sitemap.xml"), "utf8");
}

function parseLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim());
}

async function getHtml(pageUrl: string): Promise<string> {
  if (!LIVE) {
    const path = pageUrl.replace(/^https?:\/\/[^/]+/, "");
    const clean = path === "/" ? "/index.html" : `${path.replace(/\/$/, "")}/index.html`;
    const filePath = join(DIST, clean);
    if (existsSync(filePath)) return readFileSync(filePath, "utf8");
    // Some routes are emitted as `<route>.html` rather than `<route>/index.html`.
    const alt = join(DIST, `${path.replace(/^\//, "")}.html`);
    if (existsSync(alt)) return readFileSync(alt, "utf8");
    throw new Error(`no dist HTML for ${pageUrl} (looked at ${filePath})`);
  }
  const res = await fetch(pageUrl, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch ${pageUrl} [${res.status}]`);
  return res.text();
}

type PageIssue = { url: string; problem: string };

function samePath(a: string, b: string): boolean {
  const norm = (u: string) => u.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
  return norm(a) === norm(b);
}

function check(html: string, url: string): string[] {
  const problems: string[] = [];

  const canonicalMatches = Array.from(
    html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi),
  );
  if (canonicalMatches.length === 0) {
    problems.push("missing <link rel=canonical>");
  } else if (canonicalMatches.length > 1) {
    problems.push(`${canonicalMatches.length} canonical tags (expected 1)`);
  } else {
    const href = canonicalMatches[0][0].match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) problems.push("canonical has no href");
    else if (!samePath(href, url))
      problems.push(`canonical href "${href}" does not resolve to ${url}`);
  }

  const ldMatches = Array.from(
    html.matchAll(
      /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  );
  if (ldMatches.length === 0) {
    problems.push("no JSON-LD block");
  } else {
    let anyValid = false;
    for (const m of ldMatches) {
      try {
        JSON.parse(m[1].trim());
        anyValid = true;
      } catch (e) {
        problems.push(`invalid JSON-LD: ${(e as Error).message}`);
      }
    }
    if (!anyValid) problems.push("no valid JSON-LD parsed");
  }

  return problems;
}

async function main() {
  const sitemap = readSitemap();
  const allLocs = parseLocs(sitemap);
  const blogLocs = allLocs.filter((u) => /\/blog(\/|$)/.test(u));
  const targets = [`${SITE}/`, `${SITE}/blog`, ...blogLocs];
  const unique = Array.from(new Set(targets));

  console.log(`seo-check: scanning ${unique.length} URLs (${LIVE ? "live" : "dist"})`);
  const issues: PageIssue[] = [];
  let ok = 0;
  for (const url of unique) {
    try {
      const html = await getHtml(url);
      const problems = check(html, url);
      if (problems.length === 0) {
        ok += 1;
      } else {
        for (const p of problems) issues.push({ url, problem: p });
      }
    } catch (e) {
      issues.push({ url, problem: (e as Error).message });
    }
  }

  console.log(`\n✓ ${ok} pages passed`);
  if (issues.length > 0) {
    console.log(`✗ ${issues.length} problems:`);
    for (const i of issues) console.log(`  ${i.url}\n    ${i.problem}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});