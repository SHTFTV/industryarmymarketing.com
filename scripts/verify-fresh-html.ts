// Post-publish freshness verifier.
//
// Fetches a set of URLs against the live origin multiple times in a row
// (simulating repeated hits from potentially different CDN edge nodes)
// and asserts:
//
//   1. Every response is 200 OK.
//   2. The HTML entry documents carry a no-cache / no-store / max-age=0
//      policy so a freshly published bundle can never be masked by a
//      stale edge copy.
//   3. The hashed `/assets/*.{js,css}` filenames referenced by the HTML
//      are identical across every repeat fetch. If the HTML is truly
//      fresh, every edge that serves it must point at the same content-
//      hashed bundle — a mismatch means one edge is still handing out a
//      previous deploy.
//
// Emits two CI artifacts under ./cache-report/:
//
//   - report.json — machine-readable record with every URL, every run's
//     status code and cache-control, and per-URL diffs between runs.
//   - report.md   — human-readable summary suitable for the GitHub
//     Actions job summary (also uploaded as an artifact).
//
// Usage:
//   BASE_URL=https://www.industryarmymarketing.com \
//     RUNS=3 bunx tsx scripts/verify-fresh-html.ts
//
// Exits non-zero on the first failing invariant.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = (
  process.env.BASE_URL ||
  process.env.LIVE_URL ||
  "https://www.industryarmymarketing.com"
).replace(/\/$/, "");

const RUNS = Math.max(2, Number(process.env.RUNS || 3));

const ROUTES = [
  "/",
  "/pricing",
  "/blog",
  "/legal",
];

const OUT_DIR = join(process.cwd(), "cache-report");

type RunRecord = {
  run: number;
  status: number;
  cacheControl: string | null;
  etag: string | null;
  contentType: string | null;
  hashedAssets: string[];
  fetchedAt: string;
};

type UrlRecord = {
  url: string;
  runs: RunRecord[];
  failures: string[];
};

function extractHashedAssets(body: string): string[] {
  const paths = Array.from(
    body.matchAll(/(?:src|href)="(\/assets\/[^"]+-[A-Za-z0-9_-]{6,}\.(?:js|css))"/g),
    (m) => m[1],
  );
  return Array.from(new Set(paths)).sort();
}

function isNoCache(cc: string | null): boolean {
  if (!cc) return false;
  const v = cc.toLowerCase();
  return (
    v.includes("no-cache") ||
    v.includes("no-store") ||
    v.includes("private") ||
    /max-age\s*=\s*0/.test(v)
  );
}

async function fetchOnce(url: string, run: number): Promise<RunRecord> {
  // Cache-busting query and headers force any well-behaved intermediary
  // to skip its own cache and revalidate against origin.
  const buster = `${url.includes("?") ? "&" : "?"}_cb=${Date.now()}-${run}`;
  const res = await fetch(url + buster, {
    redirect: "follow",
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });
  const body = res.ok && (res.headers.get("content-type") || "").includes("text/html")
    ? await res.text()
    : "";
  return {
    run,
    status: res.status,
    cacheControl: res.headers.get("cache-control"),
    etag: res.headers.get("etag"),
    contentType: res.headers.get("content-type"),
    hashedAssets: extractHashedAssets(body),
    fetchedAt: new Date().toISOString(),
  };
}

function diffAssets(runs: RunRecord[]): string[] {
  const first = runs[0]?.hashedAssets.join("\n") ?? "";
  const diffs: string[] = [];
  for (const r of runs.slice(1)) {
    const cur = r.hashedAssets.join("\n");
    if (cur !== first) {
      diffs.push(
        `run 1 vs run ${r.run}: hashed asset set differs\n` +
          `  run 1: ${runs[0].hashedAssets.join(", ") || "(none)"}\n` +
          `  run ${r.run}: ${r.hashedAssets.join(", ") || "(none)"}`,
      );
    }
  }
  return diffs;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Freshness check against ${BASE_URL} × ${RUNS} runs`);

  const records: UrlRecord[] = [];
  let hardFail = false;

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    const record: UrlRecord = { url, runs: [], failures: [] };

    for (let i = 1; i <= RUNS; i++) {
      try {
        const r = await fetchOnce(url, i);
        record.runs.push(r);

        if (r.status !== 200) {
          record.failures.push(`run ${i}: HTTP ${r.status}`);
        }
        if (!isNoCache(r.cacheControl)) {
          record.failures.push(
            `run ${i}: HTML cache-control not fresh (got "${r.cacheControl}")`,
          );
        }
      } catch (err) {
        record.failures.push(`run ${i}: fetch crashed — ${String(err)}`);
      }
    }

    const diffs = diffAssets(record.runs);
    for (const d of diffs) record.failures.push(d);

    if (record.failures.length > 0) hardFail = true;
    records.push(record);
  }

  // Machine-readable report.
  writeFileSync(
    join(OUT_DIR, "report.json"),
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        runs: RUNS,
        generatedAt: new Date().toISOString(),
        ok: !hardFail,
        records,
      },
      null,
      2,
    ),
  );

  // Human-readable summary.
  const md: string[] = [];
  md.push(`# Freshness / cache-control report`);
  md.push(``);
  md.push(`- Base URL: \`${BASE_URL}\``);
  md.push(`- Runs per URL: **${RUNS}**`);
  md.push(`- Generated: ${new Date().toISOString()}`);
  md.push(`- Overall: ${hardFail ? "❌ FAIL" : "✅ PASS"}`);
  md.push(``);
  for (const rec of records) {
    md.push(`## ${rec.url}`);
    md.push(``);
    md.push(`| Run | Status | Cache-Control | ETag | Hashed assets |`);
    md.push(`| --- | ------ | ------------- | ---- | ------------- |`);
    for (const r of rec.runs) {
      md.push(
        `| ${r.run} | ${r.status} | \`${r.cacheControl ?? "(none)"}\` | \`${
          r.etag ?? "(none)"
        }\` | ${r.hashedAssets.length} |`,
      );
    }
    if (rec.failures.length > 0) {
      md.push(``);
      md.push(`**Failures:**`);
      for (const f of rec.failures) md.push(`- ${f}`);
    }
    md.push(``);
  }
  writeFileSync(join(OUT_DIR, "report.md"), md.join("\n"));

  console.log(`\nReport written to ${OUT_DIR}/report.{json,md}`);
  if (hardFail) {
    console.error("\n❌ Freshness verification failed. See report for details.");
    process.exit(1);
  }
  console.log("\n✅ All freshness checks passed.");
}

main().catch((err) => {
  console.error("verify-fresh-html crashed:", err);
  process.exit(1);
});