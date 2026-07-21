// Poll Google Search Console for indexing status of key URLs until they
// show as indexed, or a timeout elapses. Also (re)submits sitemap.xml
// on each iteration so a fresh crawl request is queued.
//
// Targets by default:
//   - Homepage:  https://www.industryarmymarketing.com/
//   - Blog hub:  https://www.industryarmymarketing.com/blog
//   - Newest N /blog/* posts from public/sitemap.xml (default N = 3)
//
// Env: LOVABLE_API_KEY, GOOGLE_SEARCH_CONSOLE_API_KEY.
//
// Usage:
//   bunx tsx scripts/gsc-poll-indexing.ts
//   bunx tsx scripts/gsc-poll-indexing.ts --timeout 30 --interval 5 --count 5
//   bunx tsx scripts/gsc-poll-indexing.ts --site https://industryarmymarketing.com/

import { readFileSync } from "fs";
import { resolve } from "path";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const LOVABLE_KEY = process.env.LOVABLE_API_KEY;
const GSC_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

if (!LOVABLE_KEY || !GSC_KEY) {
  console.error(
    "gsc-poll-indexing: missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY. Link the Google Search Console connector first.",
  );
  process.exit(2);
}

const args = process.argv.slice(2);
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const SITE = arg("--site", "https://www.industryarmymarketing.com/")!;
const TIMEOUT_MIN = Number(arg("--timeout", "20"));
const INTERVAL_SEC = Number(arg("--interval", "60"));
const COUNT = Number(arg("--count", "3"));

// Rate limiter + backoff — GSC URL Inspection API allows ~2000 QPD and
// bursts trigger 429s. We serialize requests through a token bucket and
// retry with exponential backoff + jitter on 429/5xx.
const RPS = Number(arg("--rps", "1")); // requests/sec (soft cap)
const MAX_RETRIES = Number(arg("--max-retries", "5"));
const BASE_BACKOFF_MS = Number(arg("--backoff-ms", "1000"));
const MAX_BACKOFF_MS = Number(arg("--max-backoff-ms", "60000"));

const MIN_GAP_MS = Math.max(1, Math.floor(1000 / Math.max(RPS, 0.1)));
let nextAvailableAt = 0;
async function acquireSlot() {
  const now = Date.now();
  const wait = Math.max(0, nextAvailableAt - now);
  nextAvailableAt = Math.max(now, nextAvailableAt) + MIN_GAP_MS;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

async function throttledFetch(url: string, init: RequestInit): Promise<Response> {
  let attempt = 0;
  while (true) {
    await acquireSlot();
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e) {
      if (attempt >= MAX_RETRIES) throw e;
      const delay = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 250);
      console.warn(`  fetch error (attempt ${attempt + 1}/${MAX_RETRIES}): ${(e as Error).message}; retrying in ${delay + jitter}ms`);
      await new Promise((r) => setTimeout(r, delay + jitter));
      attempt += 1;
      continue;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "0") * 1000;
      const exp = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 500);
      const delay = Math.max(retryAfter, exp) + jitter;
      console.warn(`  ${res.status} from ${url} (attempt ${attempt + 1}/${MAX_RETRIES}); backing off ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
      continue;
    }
    return res;
  }
}

const SITEMAP = new URL("/sitemap.xml", SITE).toString();

const authHeaders = {
  Authorization: `Bearer ${LOVABLE_KEY}`,
  "X-Connection-Api-Key": GSC_KEY!,
};

function newestBlogUrls(n: number): string[] {
  const xml = readFileSync(resolve("public/sitemap.xml"), "utf8");
  const entries = Array.from(
    xml.matchAll(/<url>([\s\S]*?)<\/url>/g),
    (m) => m[1],
  );
  const rows = entries
    .map((e) => {
      const loc = e.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
      const lastmod = e.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "";
      return { loc, lastmod };
    })
    .filter((r) => /\/blog\/[^/]+$/.test(r.loc))
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
  const inspectBase = SITE.replace(/\/$/, "");
  return rows.slice(0, n).map((r) => r.loc.replace(/^https?:\/\/[^/]+/, inspectBase));
}

async function submitSitemap() {
  const encSite = encodeURIComponent(SITE);
  const encMap = encodeURIComponent(SITEMAP);
  const res = await throttledFetch(
    `${GATEWAY}/webmasters/v3/sites/${encSite}/sitemaps/${encMap}`,
    { method: "PUT", headers: authHeaders },
  );
  if (!res.ok) {
    const body = await res.text();
    console.warn(`  sitemap submit failed [${res.status}]: ${body}`);
    return;
  }
  console.log(`  sitemap submitted: ${SITEMAP}`);
}

type Verdict = "PASS" | "PARTIAL" | "FAIL" | "NEUTRAL" | "UNKNOWN" | "ERROR";
type Row = { url: string; verdict: Verdict; coverage: string; lastCrawl: string };

async function inspect(u: string): Promise<Row> {
  try {
    const res = await throttledFetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ inspectionUrl: u, siteUrl: SITE }),
    });
    const body = await res.text();
    if (!res.ok) return { url: u, verdict: "ERROR", coverage: `${res.status}`, lastCrawl: "" };
    const s = (JSON.parse(body).inspectionResult?.indexStatusResult ?? {}) as any;
    return {
      url: u,
      verdict: (s.verdict ?? "UNKNOWN") as Verdict,
      coverage: s.coverageState ?? "",
      lastCrawl: s.lastCrawlTime ?? "",
    };
  } catch (e) {
    return { url: u, verdict: "ERROR", coverage: (e as Error).message, lastCrawl: "" };
  }
}

function isIndexed(r: Row): boolean {
  return r.verdict === "PASS" && /^(Submitted and indexed|Indexed)/i.test(r.coverage);
}

async function main() {
  const inspectBase = SITE.replace(/\/$/, "");
  const targets = [
    `${inspectBase}/`,
    `${inspectBase}/blog`,
    ...newestBlogUrls(COUNT),
  ];
  const unique = Array.from(new Set(targets));

  console.log(`gsc-poll-indexing: ${unique.length} URLs, timeout ${TIMEOUT_MIN}m, interval ${INTERVAL_SEC}s`);
  for (const u of unique) console.log(`  · ${u}`);

  const deadline = Date.now() + TIMEOUT_MIN * 60_000;
  const pending = new Set(unique);
  const finalRows = new Map<string, Row>();
  let iter = 0;

  while (pending.size > 0 && Date.now() < deadline) {
    iter += 1;
    console.log(`\n— iteration ${iter} (${new Date().toISOString()}) —`);
    await submitSitemap();
    // Serialize inspections through the rate limiter so we don't
    // burst-fire the GSC API and trigger 429s.
    const rows: Row[] = [];
    for (const u of pending) rows.push(await inspect(u));
    for (const r of rows) {
      finalRows.set(r.url, r);
      console.log(`  ${r.verdict.padEnd(7)} ${r.coverage.padEnd(40)} ${r.url}`);
      if (isIndexed(r)) pending.delete(r.url);
    }
    if (pending.size === 0) break;
    if (Date.now() + INTERVAL_SEC * 1000 >= deadline) break;
    await new Promise((r) => setTimeout(r, INTERVAL_SEC * 1000));
  }

  console.log("\n=== Final report ===");
  let indexed = 0;
  for (const u of unique) {
    const r = finalRows.get(u);
    if (r && isIndexed(r)) {
      indexed += 1;
      console.log(`  PASS ${u} — ${r.coverage}`);
    } else {
      console.log(`  FAIL ${u} — ${r ? `${r.verdict} · ${r.coverage}` : "no data"}`);
    }
  }

  const ok = indexed === unique.length;
  console.log(`\n${ok ? "PASS" : "FAIL"}: ${indexed}/${unique.length} indexed`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});