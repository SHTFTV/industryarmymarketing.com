// Prerender performance budget check: for a set of key routes, load the
// prerendered HTML from dist/ (or --live) and assert budgets that prove
// the page ships fully rendered, fast HTML — without needing a browser.
//
// Budgets (per route):
//   - Raw HTML gzipped size    <= HTML_GZ_KB  (default 80 KB)
//   - Raw HTML byte size       <= HTML_KB     (default 250 KB)
//   - <title> present, non-default
//   - <meta name="description"> present, > 50 chars
//   - <link rel="canonical"> present
//   - At least one <h1>
//   - Body text length         >= MIN_BODY    (default 1200 chars)
//   - JSON-LD present and parses
//
// Optional: if PSI_API_KEY is set and --psi is passed, also runs
// PageSpeed Insights against the LIVE URLs and asserts LCP <= 2.5s,
// CLS <= 0.1, performance score >= 0.80.
//
// Usage:
//   bunx tsx scripts/perf-budget.ts
//   bunx tsx scripts/perf-budget.ts --live
//   bunx tsx scripts/perf-budget.ts --live --psi

import { readFileSync, existsSync, statSync } from "fs";
import { resolve, join } from "path";
import { gzipSync } from "zlib";

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const PSI = args.includes("--psi");
const SITE = "https://www.industryarmymarketing.com";
const DIST = resolve("dist");

const HTML_GZ_KB = Number(process.env.HTML_GZ_KB ?? 80);
const HTML_KB = Number(process.env.HTML_KB ?? 250);
const MIN_BODY = Number(process.env.MIN_BODY ?? 1200);

function readSitemap(): string {
  if (!LIVE && existsSync(join(DIST, "sitemap.xml"))) {
    return readFileSync(join(DIST, "sitemap.xml"), "utf8");
  }
  return readFileSync(resolve("public/sitemap.xml"), "utf8");
}

function parseLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim());
}

function pickRoutes(): string[] {
  const all = parseLocs(readSitemap());
  const blogPosts = all.filter((u) => /\/blog\/[^/]+$/.test(u)).slice(0, 5);
  const home = `${SITE}/`;
  const blog = `${SITE}/blog`;
  return Array.from(new Set([home, blog, ...blogPosts]));
}

async function loadHtml(url: string): Promise<string> {
  if (!LIVE) {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    const candidates = [
      path === "/" ? "/index.html" : `${path.replace(/\/$/, "")}/index.html`,
      `${path.replace(/^\//, "")}.html`,
    ];
    for (const c of candidates) {
      const p = join(DIST, c);
      if (existsSync(p)) return readFileSync(p, "utf8");
    }
    throw new Error(`no dist HTML for ${url}`);
  }
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`fetch ${url} [${r.status}]`);
  return r.text();
}

type Problem = { url: string; problem: string };
const issues: Problem[] = [];
let passed = 0;

function checkHtml(url: string, html: string) {
  const bytes = Buffer.byteLength(html, "utf8");
  const gzBytes = gzipSync(html).length;
  const kb = bytes / 1024;
  const gzKb = gzBytes / 1024;

  if (gzKb > HTML_GZ_KB) issues.push({ url, problem: `gzip ${gzKb.toFixed(1)}KB > ${HTML_GZ_KB}KB` });
  if (kb > HTML_KB) issues.push({ url, problem: `raw ${kb.toFixed(1)}KB > ${HTML_KB}KB` });

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  if (!title) issues.push({ url, problem: "missing <title>" });
  if (/^(Lovable App|Lovable Generated Project|Vite App|Vite \+ React)$/i.test(title))
    issues.push({ url, problem: `default <title>: ${title}` });

  const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
  if (!desc || desc.length < 50) issues.push({ url, problem: `meta description too short (${desc?.length ?? 0})` });

  if (!/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html))
    issues.push({ url, problem: "missing canonical" });

  if (!/<h1[\s>]/i.test(html)) issues.push({ url, problem: "no <h1>" });

  const bodyText = (html.match(/<body[\s\S]*?>([\s\S]*)<\/body>/i)?.[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (bodyText.length < MIN_BODY)
    issues.push({ url, problem: `body text ${bodyText.length} < ${MIN_BODY}` });

  const ldMatch = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i);
  if (!ldMatch) issues.push({ url, problem: "no JSON-LD block" });
  else {
    try {
      JSON.parse(ldMatch[1].trim());
    } catch (e) {
      issues.push({ url, problem: `invalid JSON-LD: ${(e as Error).message}` });
    }
  }

  console.log(
    `  ${url}\n    size: raw ${kb.toFixed(1)}KB / gz ${gzKb.toFixed(1)}KB · body ${bodyText.length} chars`,
  );
  passed += 1;
}

type PsiResult = { lcp?: number; cls?: number; score?: number; error?: string };

async function runPsi(url: string): Promise<PsiResult> {
  const key = process.env.PSI_API_KEY;
  if (!key) return { error: "PSI_API_KEY not set" };
  const api =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
  const r = await fetch(api);
  if (!r.ok) return { error: `PSI ${r.status}` };
  const j: any = await r.json();
  const audits = j.lighthouseResult?.audits ?? {};
  const lcp = audits["largest-contentful-paint"]?.numericValue / 1000;
  const cls = audits["cumulative-layout-shift"]?.numericValue;
  const score = j.lighthouseResult?.categories?.performance?.score;
  return { lcp, cls, score };
}

async function main() {
  const routes = pickRoutes();
  console.log(`perf-budget: ${routes.length} routes (${LIVE ? "live" : "dist"})`);
  for (const url of routes) {
    try {
      const html = await loadHtml(url);
      checkHtml(url, html);
    } catch (e) {
      issues.push({ url, problem: (e as Error).message });
    }
  }

  if (PSI && LIVE) {
    console.log("\nPageSpeed Insights (mobile):");
    for (const url of routes) {
      const r = await runPsi(url);
      if (r.error) {
        console.log(`  ${url}  ${r.error}`);
        continue;
      }
      console.log(
        `  ${url}  LCP=${r.lcp?.toFixed(2)}s CLS=${r.cls?.toFixed(3)} score=${r.score}`,
      );
      if (r.lcp !== undefined && r.lcp > 2.5) issues.push({ url, problem: `LCP ${r.lcp.toFixed(2)}s > 2.5s` });
      if (r.cls !== undefined && r.cls > 0.1) issues.push({ url, problem: `CLS ${r.cls.toFixed(3)} > 0.1` });
      if (r.score !== undefined && r.score < 0.8) issues.push({ url, problem: `perf ${r.score} < 0.80` });
    }
  }

  console.log(`\n✓ ${passed} routes checked`);
  if (issues.length > 0) {
    console.log(`✗ ${issues.length} budget failures:`);
    for (const i of issues) console.log(`  ${i.url}\n    ${i.problem}`);
    process.exit(1);
  }
  console.log("All budgets met.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
