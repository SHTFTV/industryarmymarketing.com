// Post-publish freshness verifier.
//
// Fetches a set of URLs against one or more live origins ("regions" /
// CDN POPs) multiple times in a row and asserts:
//
//   1. Every response is 200 OK.
//   2. The HTML entry documents carry a no-cache / no-store / max-age=0
//      policy so a freshly published bundle can never be masked by a
//      stale edge copy.
//   3. The hashed `/assets/*.{js,css}` filenames referenced by the HTML
//      are identical across every repeat fetch. If one edge points at
//      a previous bundle, we surface it as a stale-content failure.
//   4. A stable sha256 of the served HTML per (region, route, run) is
//      computed. If a route's hash equals the last-known-good hash
//      recorded in `cache-checks.config.json`, that region is still
//      serving the previous deploy's HTML — fail.
//
// Configuration (edit `cache-checks.config.json`, no code changes needed):
//   - routes.allow / routes.deny         — allowlist/denylist
//   - regions                            — POP/edge test matrix
//   - previousDeployHashes               — stale-content tripwire
//
// Env overrides:
//   - BASE_URL / LIVE_URL   single region shortcut (skips config regions)
//   - REGIONS               comma-separated region ids to include
//   - ROUTES                comma-separated route allowlist override
//   - RUNS                  runs per (region, route), default 3
//
// Artifacts written to ./cache-report/:
//   - report.json   machine-readable
//   - report.md     GH Actions job summary
//   - hashes.json   per-run HTML sha256s (feed into previousDeployHashes)
//
// Exits non-zero on the first failing invariant, and prints an inline
// "Top diffs" block naming the first mismatching URL for fast triage.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Region = { id: string; label: string; baseUrl: string };
type Config = {
  routes?: { allow?: string[]; deny?: string[] };
  regions?: Region[];
  previousDeployHashes?: Record<string, string>;
};

const CONFIG_PATH = join(process.cwd(), "cache-checks.config.json");
const config: Config = existsSync(CONFIG_PATH)
  ? JSON.parse(readFileSync(CONFIG_PATH, "utf8"))
  : {};

const RUNS = Math.max(2, Number(process.env.RUNS || 3));

function parseCsv(v: string | undefined): string[] | null {
  if (!v) return null;
  const items = v.split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? items : null;
}

// --- Routes: allow/deny ---
const denySet = new Set(config.routes?.deny ?? []);
const routeAllowOverride = parseCsv(process.env.ROUTES);
const baseAllow = routeAllowOverride ?? config.routes?.allow ?? ["/"];
const ROUTES = baseAllow.filter((r) => !denySet.has(r));

// --- Regions: matrix ---
const singleBase = process.env.BASE_URL || process.env.LIVE_URL;
const regionFilter = parseCsv(process.env.REGIONS);
let REGIONS: Region[];
if (singleBase && !regionFilter) {
  REGIONS = [
    { id: "env", label: "env BASE_URL", baseUrl: singleBase.replace(/\/$/, "") },
  ];
} else {
  const all = (config.regions ?? []).map((r) => ({
    ...r,
    baseUrl: r.baseUrl.replace(/\/$/, ""),
  }));
  REGIONS = regionFilter ? all.filter((r) => regionFilter.includes(r.id)) : all;
  if (REGIONS.length === 0) {
    REGIONS = [
      {
        id: "default",
        label: "default",
        baseUrl: "https://www.industryarmymarketing.com",
      },
    ];
  }
}

const PREV_HASHES: Record<string, string> = config.previousDeployHashes ?? {};

const OUT_DIR = join(process.cwd(), "cache-report");

type RunRecord = {
  run: number;
  status: number;
  cacheControl: string | null;
  etag: string | null;
  contentType: string | null;
  hashedAssets: string[];
  htmlSha256: string | null;
  fetchedAt: string;
};

type UrlRecord = {
  region: string;
  regionLabel: string;
  route: string;
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
  const isHtml =
    res.ok && (res.headers.get("content-type") || "").includes("text/html");
  const body = isHtml ? await res.text() : "";
  return {
    run,
    status: res.status,
    cacheControl: res.headers.get("cache-control"),
    etag: res.headers.get("etag"),
    contentType: res.headers.get("content-type"),
    hashedAssets: extractHashedAssets(body),
    htmlSha256: isHtml
      ? createHash("sha256").update(body).digest("hex")
      : null,
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
  console.log(
    `Freshness check: ${REGIONS.length} region(s) × ${ROUTES.length} route(s) × ${RUNS} run(s)`,
  );
  for (const r of REGIONS) console.log(`  region ${r.id}: ${r.baseUrl}`);
  console.log(`  routes: ${ROUTES.join(", ")}`);

  const records: UrlRecord[] = [];
  const failedRegions = new Set<string>();
  const hashOut: Record<string, string> = {};
  let hardFail = false;

  for (const region of REGIONS) {
    for (const route of ROUTES) {
      const url = `${region.baseUrl}${route}`;
      const record: UrlRecord = {
        region: region.id,
        regionLabel: region.label,
        route,
        url,
        runs: [],
        failures: [],
      };

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

      // Stale-content tripwire: compare against last-known-good hash.
      const key = `${region.id}::${route}`;
      const prev = PREV_HASHES[key];
      const currentHashes = record.runs
        .map((r) => r.htmlSha256)
        .filter((h): h is string => !!h);
      // Store the first non-null hash for this route so the user can
      // roll it into `previousDeployHashes` after a good deploy.
      if (currentHashes[0]) hashOut[key] = currentHashes[0];
      if (prev && currentHashes.includes(prev)) {
        record.failures.push(
          `stale content: HTML sha256 ${prev.slice(0, 12)}… matches previous deploy for ${key}`,
        );
      }

      if (record.failures.length > 0) {
        hardFail = true;
        failedRegions.add(`${region.id} (${region.label})`);
      }
      records.push(record);
    }
  }

  // Machine-readable report.
  writeFileSync(
    join(OUT_DIR, "report.json"),
    JSON.stringify(
      {
        regions: REGIONS,
        routes: ROUTES,
        runs: RUNS,
        generatedAt: new Date().toISOString(),
        ok: !hardFail,
        failedRegions: [...failedRegions],
        records,
      },
      null,
      2,
    ),
  );
  writeFileSync(join(OUT_DIR, "hashes.json"), JSON.stringify(hashOut, null, 2));

  // Human-readable summary.
  const md: string[] = [];
  md.push(`# Freshness / cache-control report`);
  md.push(``);
  md.push(`- Regions: ${REGIONS.map((r) => `\`${r.id}\``).join(", ")}`);
  md.push(`- Routes: ${ROUTES.map((r) => `\`${r}\``).join(", ")}`);
  md.push(`- Runs per URL: **${RUNS}**`);
  md.push(`- Generated: ${new Date().toISOString()}`);
  md.push(`- Overall: ${hardFail ? "❌ FAIL" : "✅ PASS"}`);
  if (failedRegions.size > 0) {
    md.push(`- Failed regions: ${[...failedRegions].map((r) => `**${r}**`).join(", ")}`);
  }
  md.push(``);
  for (const rec of records) {
    md.push(`## [${rec.region}] ${rec.url}`);
    md.push(``);
    md.push(`| Run | Status | Cache-Control | ETag | Assets | HTML sha256 |`);
    md.push(`| --- | ------ | ------------- | ---- | ------ | ----------- |`);
    for (const r of rec.runs) {
      md.push(
        `| ${r.run} | ${r.status} | \`${r.cacheControl ?? "(none)"}\` | \`${
          r.etag ?? "(none)"
        }\` | ${r.hashedAssets.length} | \`${(r.htmlSha256 ?? "").slice(0, 12) || "(n/a)"}\` |`,
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

  console.log(`\nReport written to ${OUT_DIR}/report.{json,md} + hashes.json`);
  if (hardFail) {
    // Inline diagnostics — first mismatching URL and top cache-control diffs
    // — surface directly in the GitHub Actions logs.
    const firstFail = records.find((r) => r.failures.length > 0);
    console.error("\n::group::❌ Freshness verification failed");
    if (firstFail) {
      console.error(`First mismatching URL: ${firstFail.url} [region ${firstFail.region}]`);
      for (const f of firstFail.failures.slice(0, 5)) console.error(`  - ${f}`);
    }
    // Top cache-control diffs across all failing records (deduped).
    const ccDiffs = new Map<string, string[]>();
    for (const rec of records) {
      if (rec.failures.length === 0) continue;
      const seen = new Set<string>();
      for (const r of rec.runs) {
        const v = r.cacheControl ?? "(none)";
        seen.add(v);
      }
      if (seen.size > 1) ccDiffs.set(rec.url, [...seen]);
    }
    if (ccDiffs.size > 0) {
      console.error("\nTop cache-control header diffs:");
      let n = 0;
      for (const [url, vals] of ccDiffs) {
        console.error(`  ${url}`);
        for (const v of vals) console.error(`    → ${v}`);
        if (++n >= 5) break;
      }
    }
    if (failedRegions.size > 0) {
      console.error(`\nFailed regions: ${[...failedRegions].join(", ")}`);
    }
    console.error("::endgroup::");
    process.exit(1);
  }
  console.log("\n✅ All freshness checks passed.");
}

main().catch((err) => {
  console.error("verify-fresh-html crashed:", err);
  process.exit(1);
});