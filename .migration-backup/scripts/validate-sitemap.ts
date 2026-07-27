// Validates public/sitemap.xml: checks for duplicate <loc> entries and that
// every URL returns HTTP 200. Pass a base URL via CLI arg or SITEMAP_BASE_URL
// env var when the sitemap entries are relative paths.
//
// Usage:
//   bunx tsx scripts/validate-sitemap.ts                       # uses sitemap as-is
//   bunx tsx scripts/validate-sitemap.ts https://example.com   # prefixes relative paths
//   SITEMAP_BASE_URL=https://example.com bunx tsx scripts/validate-sitemap.ts

import { readFileSync } from "fs";
import { resolve } from "path";

const SITEMAP_PATH = resolve("public/sitemap.xml");
const BASE_URL = (process.argv[2] ?? process.env.SITEMAP_BASE_URL ?? "").replace(/\/$/, "");
const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;

function parseLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

function resolveUrl(loc: string): string | null {
  if (/^https?:\/\//i.test(loc)) return loc;
  if (!BASE_URL) return null;
  return `${BASE_URL}${loc.startsWith("/") ? "" : "/"}${loc}`;
}

async function check(url: string): Promise<{ url: string; status: number | string; ok: boolean }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
    // Some servers don't support HEAD — retry with GET on 405/501.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
    }
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    return { url, status: (err as Error).message, ok: false };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx]);
      }
    }),
  );
  return results;
}

async function main() {
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  const locs = parseLocs(xml);

  if (locs.length === 0) {
    console.error("✗ No <loc> entries found in sitemap.xml");
    process.exit(1);
  }

  // Duplicate detection
  const counts = new Map<string, number>();
  for (const loc of locs) counts.set(loc, (counts.get(loc) ?? 0) + 1);
  const duplicates = [...counts.entries()].filter(([, n]) => n > 1);

  console.log(`Found ${locs.length} URL(s) in sitemap (${counts.size} unique).`);
  if (duplicates.length > 0) {
    console.error("\n✗ Duplicate <loc> entries:");
    for (const [loc, n] of duplicates) console.error(`  - ${loc}  (×${n})`);
  }

  const unique = [...counts.keys()];
  const resolvable: string[] = [];
  const unresolvable: string[] = [];
  for (const loc of unique) {
    const url = resolveUrl(loc);
    if (url) resolvable.push(url);
    else unresolvable.push(loc);
  }

  if (unresolvable.length > 0) {
    console.error(
      `\n✗ ${unresolvable.length} relative URL(s) cannot be checked without a base URL.`,
    );
    console.error("  Pass one as an argument or via SITEMAP_BASE_URL.");
    for (const loc of unresolvable) console.error(`  - ${loc}`);
  }

  console.log(`\nChecking ${resolvable.length} URL(s) (concurrency ${CONCURRENCY})...\n`);
  const results = await runPool(resolvable, CONCURRENCY, check);

  const broken = results.filter((r) => !r.ok);
  for (const r of results) {
    const tag = r.ok ? "✓" : "✗";
    console.log(`  ${tag} ${r.status}  ${r.url}`);
  }

  console.log("\n— Summary —");
  console.log(`  Total entries:     ${locs.length}`);
  console.log(`  Unique URLs:       ${counts.size}`);
  console.log(`  Duplicates:        ${duplicates.length}`);
  console.log(`  Unresolvable:      ${unresolvable.length}`);
  console.log(`  Checked:           ${results.length}`);
  console.log(`  Broken (non-200):  ${broken.length}`);

  const failed = duplicates.length > 0 || unresolvable.length > 0 || broken.length > 0;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});