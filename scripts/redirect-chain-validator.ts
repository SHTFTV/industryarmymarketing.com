// Real-HTTP redirect chain validator for legacy WordPress URLs.
//
// Follows redirects manually and asserts each hop uses a 301/302 status
// with a Location header, and that the final URL matches the expected
// destination declared in src/components/LegacyRedirects.tsx.
//
// Unlike src/test/legacy-redirects.test.tsx (which tests SPA navigation
// in-memory), this hits the deployed origin so hosting-layer redirects
// are actually verified.
//
// Usage:
//   bunx tsx scripts/redirect-chain-validator.ts
//   bunx tsx scripts/redirect-chain-validator.ts --base https://www.industryarmymarketing.com
//   bunx tsx scripts/redirect-chain-validator.ts --max-hops 5 --timeout 10000
//   bunx tsx scripts/redirect-chain-validator.ts --ua-matrix        # cross-UA check
//   bunx tsx scripts/redirect-chain-validator.ts --ua "MyBot/1.0"   # single UA override
//   bunx tsx scripts/redirect-chain-validator.ts --json out.json    # machine-readable report
//   bunx tsx scripts/redirect-chain-validator.ts --only /packages --update-baseline
//     # regenerate baseline entries ONLY for rules matching /packages
//   bunx tsx scripts/redirect-chain-validator.ts --update-baseline --baseline-diff-out baseline-diff.md
//     # write a reviewable old-vs-new hop/finalPath diff before approval
//   bunx tsx scripts/redirect-chain-validator.ts --update-baseline --dry-run
//     # print the pending baseline changes and DO NOT write any files
//   bunx tsx scripts/redirect-chain-validator.ts --baseline-ref HEAD~1 \
//     --summary redirect-chain-summary.json
//     # validate against the baseline stored at a specific Git ref instead
//     # of the working-tree file — lets you review drift vs the previous commit
//   bunx tsx scripts/redirect-chain-validator.ts --update-baseline --dry-run \
//     --baseline-diff-out baseline-diff.md --baseline-diff-csv baseline-diff.csv \
//     --drift-max-rules 3 --drift-max-final-path-changes 1
//     # export a CSV alongside the Markdown table and fail the run only when
//     # drift exceeds configured thresholds (changed rules / finalPath changes)

import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { evaluateDriftGate, type BaselineDriftEntry } from "./lib/drift-gate";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const flag = (n: string) => args.includes(n);

const BASE = (arg("--base", "https://www.industryarmymarketing.com") ?? "").replace(/\/$/, "");
const MAX_HOPS = Number(arg("--max-hops", "5"));
const TIMEOUT = Number(arg("--timeout", "10000"));
const JSON_OUT = arg("--json");
const SUMMARY_OUT = arg("--summary");
const RETRIES = Number(arg("--retries", "3"));
const ANNOTATE = flag("--annotate");
// HEAD-first mode: try HEAD on each hop and only fall back to GET when
// the origin/CDN refuses HEAD (405/501) or returns a suspiciously empty
// response missing a Location on a 3xx. Reduces CI time and origin load.
const HEAD_FIRST = !flag("--no-head");
// Filter to a single legacy rule (exact match) or any rule whose `from`
// starts with the given prefix. Speeds up debugging when only one
// redirect changed. Wildcard suffix (`/*`) is honored as prefix match.
const ONLY = arg("--only");
// Path to the approved-outcomes baseline. When the file exists and has
// entries for a rule, those override the built-in expectations.
const BASELINE_PATH = resolve(arg("--baseline", ".redirect-baselines/redirect-chain-baseline.json")!);
// Rewrite the baseline file with the results of this run. Only rules
// that completed cleanly (had ≥1 hop and no fetch error) are updated.
const UPDATE_BASELINE = flag("--update-baseline");
// Dry-run: compute + display the pending diff and skip every write
// (baseline file, diff Markdown file, summary file). Useful for
// previewing what `--update-baseline` would do in CI before approval.
const DRY_RUN = flag("--dry-run");
// Optional path for a Markdown diff of pending baseline changes.
const BASELINE_DIFF_OUT = arg("--baseline-diff-out");
// Optional path for a CSV export of pending baseline changes. Same rows
// as the Markdown table but machine-readable for spreadsheets / BI tools.
const BASELINE_DIFF_CSV = arg("--baseline-diff-csv");
// Optional path for a per-rule JSON export of pending baseline drift.
// Includes old/new hops and finalPath for each changed rule so tools
// (dashboards, scripts, PR reviewers) can consume the diff programmatically
// without parsing the Markdown table or CSV.
const BASELINE_DIFF_JSON = arg("--baseline-diff-json");
// Drift thresholds. When set (>= 0), the process exits with code 2 if
// pending baseline changes exceed the limit. `--drift-max-rules` counts
// any rule marked added/changed. `--drift-max-final-path-changes` counts
// only rules whose finalPath changed. Undefined = no threshold enforced.
const DRIFT_MAX_RULES = arg("--drift-max-rules");
const DRIFT_MAX_FINAL_PATH_CHANGES = arg("--drift-max-final-path-changes");
// Optional path for a small JSON blob capturing measured drift counts
// and the configured thresholds. CI reads this to render the numbers
// in the PR comment and the workflow-summary "Checks" table.
const DRIFT_METRICS_OUT = arg("--drift-metrics-out");
// Load the baseline from a Git ref (e.g. `HEAD~1`, `origin/main`,
// a tag or SHA) instead of the working-tree file. Enables reviewing
// drift across deploys: run the validator with the previous deploy's
// baseline as the source of truth for expected hops/finalPath.
const BASELINE_REF = arg("--baseline-ref");
// Summary schema version emitted in redirect-chain-summary.json. Keep
// in sync with scripts/validate-summary-schema.ts SUPPORTED_SCHEMA_VERSIONS.
const SUMMARY_SCHEMA_VERSION = "1";
// Baseline file schema version. Bump alongside a migration when the
// on-disk shape changes.
const BASELINE_SCHEMA_VERSION = "1";

type BaselineEntry = { hops: string[][]; finalPath: string; approvedAt?: string };
type BaselineFile = {
  schemaVersion?: string;
  generatedAt: string | null;
  base: string | null;
  rules: Record<string, BaselineEntry>;
};
function parseBaselineJson(source: string, raw: string): BaselineFile {
  const parsed = JSON.parse(raw) as BaselineFile;
  if (parsed.schemaVersion && parsed.schemaVersion !== BASELINE_SCHEMA_VERSION) {
    console.error(
      `redirect-chain-validator: MIGRATION REQUIRED — baseline (${source}) schemaVersion "${parsed.schemaVersion}" is not supported (expected "${BASELINE_SCHEMA_VERSION}").`,
    );
    process.exit(3);
  }
  return {
    schemaVersion: parsed.schemaVersion ?? BASELINE_SCHEMA_VERSION,
    generatedAt: parsed.generatedAt ?? null,
    base: parsed.base ?? null,
    rules: parsed.rules ?? {},
  };
}
function loadBaseline(): BaselineFile {
  // Git-ref mode: read the baseline blob out of the requested ref.
  // Useful for cross-deploy drift review without checking out the ref.
  if (BASELINE_REF) {
    const relPath = arg("--baseline", ".redirect-baselines/redirect-chain-baseline.json")!;
    const spec = `${BASELINE_REF}:${relPath}`;
    try {
      const raw = execSync(`git show ${spec}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      console.log(`redirect-chain-validator: baseline loaded from git ${spec}`);
      const parsed = parseBaselineJson(`git:${spec}`, raw);
      // Strict cross-schema check: a baseline loaded from an arbitrary
      // Git ref must match the CURRENT summary schema version. Prevents
      // silently validating against an out-of-date baseline shape when
      // the summary schema has moved forward on this commit.
      const bv = parsed.schemaVersion ?? BASELINE_SCHEMA_VERSION;
      if (bv !== SUMMARY_SCHEMA_VERSION) {
        const msg =
          `redirect-chain-validator: SCHEMA MISMATCH — baseline at git ${spec} ` +
          `has schemaVersion "${bv}" but current summary schemaVersion is "${SUMMARY_SCHEMA_VERSION}". ` +
          `Regenerate the baseline on this commit (--update-baseline) or drop --baseline-ref.`;
        console.error(msg);
        if (ANNOTATE) console.log(`::error::${msg}`);
        process.exit(3);
      }
      return parsed;
    } catch (e) {
      console.error(
        `redirect-chain-validator: --baseline-ref could not read ${spec}: ${(e as Error).message.trim()}`,
      );
      process.exit(2);
    }
  }
  if (!existsSync(BASELINE_PATH)) return { generatedAt: null, base: null, rules: {} };
  try {
    return parseBaselineJson(BASELINE_PATH, readFileSync(BASELINE_PATH, "utf8"));
  } catch (e) {
    console.warn(`redirect-chain-validator: could not parse ${BASELINE_PATH}: ${(e as Error).message}`);
    return { generatedAt: null, base: null, rules: {} };
  }
}
const BASELINE = loadBaseline();

// Sleep with jittered exponential backoff. Base delay grows 500ms →
// 1s → 2s and each attempt adds up to `base` of random jitter to avoid
// thundering herds against the origin/CDN.
async function backoff(attempt: number) {
  const base = 500 * Math.pow(2, attempt);
  const jitter = Math.random() * base;
  await new Promise((r) => setTimeout(r, base + jitter));
}

// Emit a GitHub Actions error annotation. Falls back to plain console
// output when not running in CI (or when --annotate is not set).
function annotate(title: string, message: string) {
  if (!ANNOTATE) return;
  const file = "src/components/LegacyRedirects.tsx";
  // Newlines must be encoded per the workflow-commands format.
  const encoded = message.replace(/\r/g, "").replace(/\n/g, "%0A");
  console.log(`::error file=${file},title=${title}::${encoded}`);
}

// Common browser + crawler user agents. Redirects must resolve to the
// same final destination regardless of client.
const UA_MATRIX: Record<string, string> = {
  "chrome-desktop":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "safari-macos":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "firefox-desktop":
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "safari-ios":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot:
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
};

const useMatrix = flag("--ua-matrix");
const singleUa = arg("--ua");
const userAgents: Record<string, string> = useMatrix
  ? UA_MATRIX
  : { default: singleUa ?? UA_MATRIX["chrome-desktop"] };

// Per-rule header expectations. Keys are the exact `from` path in
// LEGACY_REDIRECTS; `default` applies to any rule without an override.
// Values are regexes each response header must match (case-insensitive).
type HeaderExpectations = {
  location?: RegExp; // matched against absolute resolved location
  cacheControl?: RegExp;
  contentType?: RegExp;
};
// Expected redirect status codes per hop for a given rule. The first
// entry applies to the first hop, the second to the second, etc. If a
// rule has more hops than entries, remaining hops fall back to
// `defaultHopStatus`. A hop is considered valid when its status is
// included in the allowed list.
type StatusExpectations = {
  hops: number[][]; // e.g. [[301], [301,308]] → hop 1 must be 301, hop 2 either 301 or 308
  defaultHopStatus: number[]; // allowed statuses for any hop beyond `hops`
};
const STATUS_EXPECTATIONS: Record<string, StatusExpectations> = {
  default: { hops: [[301]], defaultHopStatus: [301, 302, 307, 308] },
  // Admin/login paths may legitimately use 302/307 to force a fresh flow
  "/wp-admin/*": { hops: [[301, 302, 307]], defaultHopStatus: [301, 302, 307, 308] },
  "/wp-login.php": { hops: [[301, 302, 307]], defaultHopStatus: [301, 302, 307, 308] },
};
function statusExpectationsFor(rule: string): StatusExpectations {
  const b = BASELINE.rules[rule];
  if (b && Array.isArray(b.hops) && b.hops.length > 0) {
    return {
      hops: b.hops.map((h) => h.map((s) => Number(s)).filter((n) => Number.isInteger(n))),
      defaultHopStatus: STATUS_EXPECTATIONS.default.defaultHopStatus,
    };
  }
  return STATUS_EXPECTATIONS[rule] ?? STATUS_EXPECTATIONS.default;
}
const HEADER_EXPECTATIONS: Record<string, HeaderExpectations> = {
  default: {
    cacheControl: /(max-age|public|no-cache|no-store|private|s-maxage)/i,
    contentType: /^(text\/html|text\/plain|$)/i,
  },
  "/wp-admin/*": {
    // Never leak an admin page cache; expect short/no cache
    cacheControl: /(no-store|no-cache|max-age=0|private)/i,
  },
  "/wp-login.php": {
    cacheControl: /(no-store|no-cache|max-age=0|private)/i,
  },
};

type Hop = {
  url: string;
  status: number;
  location?: string;
  cacheControl?: string;
  contentType?: string;
};
type Result = {
  ua: string;
  from: string;
  expectedTo: string;
  finalUrl: string;
  hops: Hop[];
  ok: boolean;
  reasons: string[];
};

async function followChain(
  startPath: string,
  userAgent: string,
): Promise<{ hops: Hop[]; finalUrl: string; error?: string }> {
  const hops: Hop[] = [];
  let url = `${BASE}${startPath}`;
  for (let i = 0; i < MAX_HOPS; i++) {
    // Retry each hop with jittered exponential backoff. Transient
    // DNS/network/CDN glitches must not fail CI.
    let res: Response | undefined;
    let lastErr: Error | undefined;
    // Prefer HEAD to save bandwidth; fall back to GET when HEAD is
    // unsupported or the response is unusable for redirect analysis.
    const methods: Array<"HEAD" | "GET"> = HEAD_FIRST ? ["HEAD", "GET"] : ["GET"];
    outer: for (const method of methods) {
      for (let attempt = 0; attempt <= RETRIES; attempt++) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), TIMEOUT);
        try {
          res = await fetch(url, {
            method,
            redirect: "manual",
            signal: controller.signal,
            headers: { "User-Agent": userAgent, Accept: "text/html,*/*;q=0.8" },
          });
          clearTimeout(t);
          if (res.status >= 500 || res.status === 429) {
            try { await res.body?.cancel(); } catch { /* ignore */ }
            if (attempt < RETRIES) { await backoff(attempt); continue; }
          }
          // HEAD not supported → try GET.
          if (method === "HEAD" && (res.status === 405 || res.status === 501)) {
            try { await res.body?.cancel(); } catch { /* ignore */ }
            res = undefined;
            continue outer;
          }
          // 3xx without Location on HEAD is unreliable → retry with GET.
          if (method === "HEAD" && res.status >= 300 && res.status < 400 && !res.headers.get("location")) {
            try { await res.body?.cancel(); } catch { /* ignore */ }
            res = undefined;
            continue outer;
          }
          break outer;
        } catch (e) {
          clearTimeout(t);
          lastErr = e as Error;
          if (attempt < RETRIES) { await backoff(attempt); continue; }
          // On persistent HEAD failure, try GET before giving up.
          if (method === "HEAD") continue outer;
        }
      }
    }
    if (!res) {
      return { hops, finalUrl: url, error: lastErr?.message ?? "fetch failed" };
    }
    try { await res.body?.cancel(); } catch { /* ignore */ }
    const location = res.headers.get("location") ?? undefined;
    hops.push({
      url,
      status: res.status,
      location,
      cacheControl: res.headers.get("cache-control") ?? undefined,
      contentType: res.headers.get("content-type") ?? undefined,
    });
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url).toString();
      continue;
    }
    return { hops, finalUrl: url };
  }
  return { hops, finalUrl: url, error: `exceeded ${MAX_HOPS} hops` };
}

function expand(from: string, to: string): Array<{ from: string; to: string }> {
  // Expand wildcard redirects to a couple of concrete sample paths.
  if (from.endsWith("/*")) {
    const prefix = from.slice(0, -2);
    return [
      { from: `${prefix}/sample-legacy-path`, to },
      { from: `${prefix}/nested/deep/path.html`, to },
    ];
  }
  return [{ from, to }];
}

function expectationsFor(rule: string): HeaderExpectations {
  return { ...HEADER_EXPECTATIONS.default, ...(HEADER_EXPECTATIONS[rule] ?? {}) };
}

function checkHeaders(
  firstHop: Hop,
  expected: HeaderExpectations,
  expectedFinal: string,
): string[] {
  const reasons: string[] = [];
  // Location must be present and resolve to expected final URL
  if (!firstHop.location) {
    reasons.push("missing Location header");
  } else {
    const resolved = new URL(firstHop.location, firstHop.url).toString().replace(/\/$/, "");
    if (expected.location && !expected.location.test(firstHop.location)) {
      reasons.push(`Location "${firstHop.location}" fails ${expected.location}`);
    }
    if (resolved.split("?")[0] !== expectedFinal) {
      reasons.push(`Location resolves to ${resolved}, expected ${expectedFinal}`);
    }
  }
  if (expected.cacheControl) {
    if (!firstHop.cacheControl) reasons.push("missing Cache-Control header");
    else if (!expected.cacheControl.test(firstHop.cacheControl))
      reasons.push(`Cache-Control "${firstHop.cacheControl}" fails ${expected.cacheControl}`);
  }
  if (expected.contentType && firstHop.contentType && !expected.contentType.test(firstHop.contentType)) {
    reasons.push(`Content-Type "${firstHop.contentType}" fails ${expected.contentType}`);
  }
  return reasons;
}

async function main() {
  // Apply --only rule filter (exact match or prefix match, wildcard-aware).
  const filteredRedirects = ONLY
    ? LEGACY_REDIRECTS.filter((r) => {
        if (r.from === ONLY) return true;
        if (r.from.endsWith("/*") && ONLY.startsWith(r.from.slice(0, -2))) return true;
        return r.from.startsWith(ONLY);
      })
    : LEGACY_REDIRECTS;
  if (ONLY && filteredRedirects.length === 0) {
    console.error(`redirect-chain-validator: --only "${ONLY}" matched no legacy rules`);
    process.exit(2);
  }
  const cases = filteredRedirects.flatMap(({ from, to }) => expand(from, to));
  // Apply per-rule expected-final override from baseline when present.
  const expectedFinalFor = (originalRule: string, defaultTo: string): string => {
    const b = BASELINE.rules[originalRule];
    if (b && typeof b.finalPath === "string" && b.finalPath.length > 0) {
      return `${BASE}${b.finalPath}`.replace(/\/$/, "");
    }
    return `${BASE}${defaultTo}`.replace(/\/$/, "");
  };
  const uaCount = Object.keys(userAgents).length;
  console.log(
    `redirect-chain-validator: ${cases.length} cases × ${uaCount} UA(s) against ${BASE}` +
      (ONLY ? ` [--only ${ONLY}]` : "") +
      (Object.keys(BASELINE.rules).length ? ` [baseline: ${Object.keys(BASELINE.rules).length} rules]` : ""),
  );

  const results: Result[] = [];
  const finalsByRule: Record<string, Set<string>> = {};
  for (const [uaLabel, ua] of Object.entries(userAgents)) {
    if (uaCount > 1) console.log(`\n— UA: ${uaLabel} —`);
    for (const { from, to } of cases) {
      const originalRule = LEGACY_REDIRECTS.find(
        (r) => r.from === from || (r.from.endsWith("/*") && from.startsWith(r.from.slice(0, -1))),
      )?.from ?? from;
      const expectedFinal = expectedFinalFor(originalRule, to);
      const { hops, finalUrl, error } = await followChain(from, ua);
      const finalNorm = finalUrl.replace(/\/$/, "").split("?")[0];
      const reasons: string[] = [];
      if (error) reasons.push(`fetch error: ${error}`);
      else if (hops.length === 0) reasons.push("no hops");
      else {
        const statusExp = statusExpectationsFor(originalRule);
        // Validate each redirect hop (all hops except the final terminal one).
        for (let i = 0; i < hops.length - 1; i++) {
          const allowed = statusExp.hops[i] ?? statusExp.defaultHopStatus;
          if (!allowed.includes(hops[i].status)) {
            reasons.push(
              `hop ${i + 1} returned ${hops[i].status}, expected one of ${allowed.join("/")}`,
            );
          }
        }
        // The final hop must not itself be a redirect (chain must terminate).
        const last = hops[hops.length - 1];
        if (last.status >= 300 && last.status < 400) {
          reasons.push(`chain did not terminate; final hop was ${last.status}`);
        }
        if (finalNorm !== expectedFinal)
          reasons.push(`final ${finalNorm} !== expected ${expectedFinal}`);
        reasons.push(...checkHeaders(hops[0], expectationsFor(originalRule), expectedFinal));
      }
      const ok = reasons.length === 0;
      results.push({ ua: uaLabel, from, expectedTo: to, finalUrl, hops, ok, reasons });
      (finalsByRule[from] ??= new Set()).add(finalNorm);
      const tag = ok ? "PASS" : "FAIL";
      const chain = hops.map((h) => `${h.status}`).join("→");
      const uaTag = uaCount > 1 ? `[${uaLabel}] ` : "";
      console.log(
        `  ${tag}  ${uaTag}${from.padEnd(56)} [${chain}] → ${finalUrl}${ok ? "" : ` (${reasons.join("; ")})`}`,
      );
      if (!ok) {
        const statusExp = statusExpectationsFor(originalRule);
        const expectedHop1 = (statusExp.hops[0] ?? statusExp.defaultHopStatus).join("/");
        const actualHop1 = hops[0]?.status ?? "none";
        const msg = [
          `Rule: ${originalRule}${uaCount > 1 ? ` [${uaLabel}]` : ""}`,
          `Requested: ${from}`,
          `Expected hop 1: ${expectedHop1}`,
          `Actual hop 1: ${actualHop1}`,
          `Expected final: ${expectedFinal}`,
          `Actual final: ${finalNorm}`,
          `Reasons: ${reasons.join("; ")}`,
        ].join("\n");
        annotate(`Legacy redirect FAIL: ${originalRule}`, msg);
      }
    }
  }

  // Cross-UA consistency: every rule must yield the same final URL across all UAs.
  const inconsistent: string[] = [];
  if (uaCount > 1) {
    for (const [rule, finals] of Object.entries(finalsByRule)) {
      if (finals.size > 1) inconsistent.push(`${rule} → ${[...finals].join(" | ")}`);
    }
    if (inconsistent.length) {
      console.log(`\nCross-UA inconsistency:`);
      for (const l of inconsistent) console.log(`  FAIL ${l}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  const totalOk = failed.length === 0 && inconsistent.length === 0;
  console.log(
    `\n${totalOk ? "PASS" : "FAIL"}: ${results.length - failed.length}/${results.length} checks; ${inconsistent.length} cross-UA mismatches`,
  );

  if (JSON_OUT) {
    if (DRY_RUN) {
      console.log(`redirect-chain-validator: [dry-run] would write ${JSON_OUT}`);
    } else {
      writeFileSync(
        resolve(JSON_OUT),
        JSON.stringify({ base: BASE, results, inconsistent }, null, 2),
      );
    }
  }
  if (SUMMARY_OUT) {
    // Compact per-rule expected-vs-actual summary suitable for CI review.
    const summary = {
      schemaVersion: SUMMARY_SCHEMA_VERSION,
      base: BASE,
      generatedAt: new Date().toISOString(),
      totals: {
        cases: results.length,
        passed: results.length - failed.length,
        failed: failed.length,
        crossUaMismatches: inconsistent.length,
      },
      rules: results.map((r) => {
        const rule =
          LEGACY_REDIRECTS.find(
            (x) => x.from === r.from || (x.from.endsWith("/*") && r.from.startsWith(x.from.slice(0, -1))),
          )?.from ?? r.from;
        const statusExp = statusExpectationsFor(rule);
        const expectedHops = statusExp.hops.length
          ? statusExp.hops.map((h) => h.join("/"))
          : [statusExp.defaultHopStatus.join("/")];
        return {
          rule,
          ua: r.ua,
          requested: r.from,
          expected: {
            hops: expectedHops,
            finalUrl: expectedFinalFor(rule, r.expectedTo),
          },
          actual: {
            hops: r.hops.map((h) => h.status),
            finalUrl: r.finalUrl.replace(/\/$/, "").split("?")[0],
          },
          ok: r.ok,
          reasons: r.reasons,
        };
      }),
      inconsistent,
    };
    if (DRY_RUN) {
      console.log(`redirect-chain-validator: [dry-run] would write ${SUMMARY_OUT}`);
    } else {
      writeFileSync(resolve(SUMMARY_OUT), JSON.stringify(summary, null, 2));
      console.log(`redirect-chain-validator: summary written to ${SUMMARY_OUT}`);
    }
  }

  if (UPDATE_BASELINE) {
    if (BASELINE_REF) {
      console.error(
        `redirect-chain-validator: --update-baseline cannot be combined with --baseline-ref (${BASELINE_REF}). The Git-ref baseline is read-only; check out the ref or drop --baseline-ref to write.`,
      );
      process.exit(2);
    }
    if (ONLY) {
      console.log(
        `redirect-chain-validator: --update-baseline scoped by --only "${ONLY}" — untouched rules retain their prior baseline entry.`,
      );
    }
    // Fold clean per-rule outcomes into a fresh baseline file. Only
    // rules that produced at least one hop AND terminated (last hop is
    // non-3xx or a valid terminal) get written — errored rules retain
    // their previous baseline entry, if any.
    const nowIso = new Date().toISOString();
    const merged: BaselineFile = {
      schemaVersion: BASELINE_SCHEMA_VERSION,
      generatedAt: nowIso,
      base: BASE,
      rules: { ...BASELINE.rules },
    };
    const byRule: Record<string, Result[]> = {};
    for (const r of results) {
      const rule =
        LEGACY_REDIRECTS.find(
          (x) => x.from === r.from || (x.from.endsWith("/*") && r.from.startsWith(x.from.slice(0, -1))),
        )?.from ?? r.from;
      (byRule[rule] ??= []).push(r);
    }
    let updated = 0;
    type BaselineDiff = {
      rule: string;
      kind: "added" | "changed" | "unchanged";
      old?: BaselineEntry;
      next: BaselineEntry;
      hopsChanged: boolean;
      finalPathChanged: boolean;
    };
    const diffs: BaselineDiff[] = [];
    for (const [rule, rs] of Object.entries(byRule)) {
      // Prefer entries with a clean chain to derive the new baseline.
      const clean = rs.filter(
        (r) => r.hops.length > 0 && !r.reasons.some((x) => x.startsWith("fetch error")),
      );
      if (clean.length === 0) continue;
      // Union of observed statuses per hop across all UA runs; keep last
      // hop chain length. If UAs disagree on hop count, use the shortest
      // (conservative) to avoid over-permissive baselines.
      const minHopLen = Math.min(...clean.map((r) => r.hops.length - 1)); // drop terminal
      const hops: string[][] = [];
      for (let i = 0; i < minHopLen; i++) {
        const set = new Set<number>();
        for (const r of clean) set.add(r.hops[i].status);
        hops.push([...set].sort((a, b) => a - b).map(String));
      }
      const finalUrl = clean[0].finalUrl.replace(/\/$/, "").split("?")[0];
      const finalPath = finalUrl.startsWith(BASE) ? finalUrl.slice(BASE.length) || "/" : finalUrl;
      const next: BaselineEntry = { hops, finalPath, approvedAt: nowIso };
      const prev = BASELINE.rules[rule];
      const hopsChanged =
        !prev ||
        JSON.stringify(prev.hops ?? []) !== JSON.stringify(hops);
      const finalPathChanged = !prev || prev.finalPath !== finalPath;
      const kind: BaselineDiff["kind"] = !prev
        ? "added"
        : hopsChanged || finalPathChanged
          ? "changed"
          : "unchanged";
      diffs.push({ rule, kind, old: prev, next, hopsChanged, finalPathChanged });
      merged.rules[rule] = next;
      updated++;
    }

    // Emit an old-vs-new diff so reviewers can inspect what will
    // change BEFORE approving the new baseline. Always print to stdout;
    // optionally write a Markdown file for PR upload.
    const fmtHops = (h?: string[][]) =>
      !h || h.length === 0 ? "(none)" : h.map((x) => x.join("/")).join(" → ");
    const changed = diffs.filter((d) => d.kind !== "unchanged");
    console.log(
      `\nBaseline changes: ${changed.length} rule(s) will change (${diffs.filter((d) => d.kind === "added").length} added, ${diffs.filter((d) => d.kind === "changed").length} changed, ${diffs.filter((d) => d.kind === "unchanged").length} unchanged).`,
    );
    for (const d of changed) {
      console.log(`  ${d.kind.toUpperCase().padEnd(9)} ${d.rule}`);
      if (d.hopsChanged)
        console.log(`    hops:      ${fmtHops(d.old?.hops)}  →  ${fmtHops(d.next.hops)}`);
      if (d.finalPathChanged)
        console.log(`    finalPath: ${d.old?.finalPath ?? "(none)"}  →  ${d.next.finalPath}`);
      // Per-rule GitHub annotation so the drifting rule shows up as
      // its own entry on the PR "Checks" page.
      if (ANNOTATE) {
        const parts: string[] = [`baseline ${d.kind}: ${d.rule}`];
        if (d.hopsChanged) parts.push(`hops ${fmtHops(d.old?.hops)} → ${fmtHops(d.next.hops)}`);
        if (d.finalPathChanged)
          parts.push(`finalPath ${d.old?.finalPath ?? "(none)"} → ${d.next.finalPath}`);
        const level = d.kind === "added" ? "notice" : "warning";
        const title = `Redirect baseline ${d.kind}`;
        console.log(`::${level} title=${title}::${parts.join(" | ")}`);
      }
    }
    if (BASELINE_DIFF_OUT) {
      const lines: string[] = [];
      lines.push(`# Redirect baseline changes`);
      lines.push("");
      lines.push(`- Base: \`${BASE}\``);
      lines.push(`- Generated: ${nowIso}`);
      if (DRY_RUN) lines.push(`- Mode: **dry-run** (no files written)`);
      if (ONLY) lines.push(`- Scope (\`--only\`): \`${ONLY}\``);
      lines.push(
        `- Summary: **${changed.length} change(s)** (${diffs.filter((d) => d.kind === "added").length} added, ${diffs.filter((d) => d.kind === "changed").length} changed)`,
      );
      lines.push("");
      if (changed.length === 0) {
        lines.push(`_No baseline entries would change._`);
      } else {
        lines.push(`| Rule | Kind | Old hops | New hops | Old finalPath | New finalPath |`);
        lines.push(`|------|------|----------|----------|---------------|---------------|`);
        for (const d of changed) {
          lines.push(
            `| \`${d.rule}\` | ${d.kind} | ${fmtHops(d.old?.hops)} | ${fmtHops(d.next.hops)} | \`${d.old?.finalPath ?? "—"}\` | \`${d.next.finalPath}\` |`,
          );
        }
      }
      lines.push("");
      if (DRY_RUN) {
        console.log(`redirect-chain-validator: [dry-run] would write baseline diff to ${BASELINE_DIFF_OUT}`);
        console.log("--- baseline-diff.md (dry-run preview) ---");
        console.log(lines.join("\n"));
        console.log("--- end preview ---");
      } else {
        mkdirSync(dirname(resolve(BASELINE_DIFF_OUT)), { recursive: true });
        writeFileSync(resolve(BASELINE_DIFF_OUT), lines.join("\n"));
        console.log(`redirect-chain-validator: baseline diff written to ${BASELINE_DIFF_OUT}`);
      }
    }

    // CSV export of pending baseline changes. Always emitted alongside
    // the Markdown table when requested; header row is stable so CI can
    // diff/aggregate it across runs.
    if (BASELINE_DIFF_CSV) {
      const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
      const rows: string[] = [
        "rule,kind,hopsChanged,finalPathChanged,oldHops,newHops,oldFinalPath,newFinalPath",
      ];
      for (const d of changed) {
        rows.push(
          [
            esc(d.rule),
            esc(d.kind),
            String(d.hopsChanged),
            String(d.finalPathChanged),
            esc(fmtHops(d.old?.hops)),
            esc(fmtHops(d.next.hops)),
            esc(d.old?.finalPath ?? ""),
            esc(d.next.finalPath),
          ].join(","),
        );
      }
      const csv = rows.join("\n") + "\n";
      if (DRY_RUN) {
        console.log(`redirect-chain-validator: [dry-run] would write baseline diff CSV to ${BASELINE_DIFF_CSV}`);
      } else {
        mkdirSync(dirname(resolve(BASELINE_DIFF_CSV)), { recursive: true });
        writeFileSync(resolve(BASELINE_DIFF_CSV), csv);
        console.log(`redirect-chain-validator: baseline diff CSV written to ${BASELINE_DIFF_CSV}`);
      }
    }

    // Threshold gating: exit code 2 when drift exceeds configured limits.
    // Kept separate from the run's pass/fail (exit 1) so CI can
    // distinguish "checks failed" from "drift exceeded threshold".
    // Evaluation is delegated to a pure helper (scripts/lib/drift-gate.ts)
    // so it can be unit-tested in isolation.
    const maxRules = DRIFT_MAX_RULES !== undefined ? Number(DRIFT_MAX_RULES) : undefined;
    const maxFinalPath =
      DRIFT_MAX_FINAL_PATH_CHANGES !== undefined ? Number(DRIFT_MAX_FINAL_PATH_CHANGES) : undefined;
    const gate = evaluateDriftGate({
      diffs: diffs as BaselineDriftEntry[],
      maxRules,
      maxFinalPathChanges: maxFinalPath,
    });
    const finalPathChanges = gate.finalPathChanges;
    const overRules = gate.overRules;
    const overFinal = gate.overFinal;

    // Per-rule JSON drift diff — machine-readable artifact that mirrors
    // the Markdown/CSV outputs but preserves structured hop arrays and
    // finalPath strings for downstream tooling.
    if (BASELINE_DIFF_JSON) {
      const payload = {
        schemaVersion: SUMMARY_SCHEMA_VERSION,
        generatedAt: nowIso,
        base: BASE,
        baselineRef: BASELINE_REF ?? null,
        dryRun: DRY_RUN,
        thresholds: {
          maxRules: maxRules ?? null,
          maxFinalPathChanges: maxFinalPath ?? null,
        },
        measured: {
          rulesChanged: gate.changedCount,
          rulesAdded: gate.addedCount,
          rulesModified: gate.modifiedCount,
          finalPathChanges,
        },
        exceeded: { rules: overRules, finalPath: overFinal },
        rules: diffs
          .filter((d) => d.kind !== "unchanged")
          .map((d) => ({
            rule: d.rule,
            kind: d.kind,
            hopsChanged: d.hopsChanged,
            finalPathChanged: d.finalPathChanged,
            old: d.old
              ? { hops: d.old.hops ?? [], finalPath: d.old.finalPath ?? null }
              : null,
            next: { hops: d.next.hops, finalPath: d.next.finalPath },
          })),
      };
      if (DRY_RUN) {
        console.log(
          `redirect-chain-validator: [dry-run] would write baseline diff JSON to ${BASELINE_DIFF_JSON}`,
        );
      } else {
        mkdirSync(dirname(resolve(BASELINE_DIFF_JSON)), { recursive: true });
        writeFileSync(resolve(BASELINE_DIFF_JSON), JSON.stringify(payload, null, 2) + "\n");
        console.log(
          `redirect-chain-validator: baseline diff JSON written to ${BASELINE_DIFF_JSON}`,
        );
      }
    }

    // Persist measured counts + thresholds so CI can surface them in the
    // PR comment and the "Checks" summary without re-parsing baseline-diff.
    if (DRIFT_METRICS_OUT) {
      const metrics = {
        schemaVersion: SUMMARY_SCHEMA_VERSION,
        generatedAt: nowIso,
        baselineRef: BASELINE_REF ?? null,
        thresholds: {
          maxRules: maxRules ?? null,
          maxFinalPathChanges: maxFinalPath ?? null,
        },
        measured: {
          rulesChanged: changed.length,
          rulesAdded: diffs.filter((d) => d.kind === "added").length,
          rulesModified: diffs.filter((d) => d.kind === "changed").length,
          finalPathChanges,
        },
        exceeded: { rules: overRules, finalPath: overFinal },
      };
      mkdirSync(dirname(resolve(DRIFT_METRICS_OUT)), { recursive: true });
      writeFileSync(resolve(DRIFT_METRICS_OUT), JSON.stringify(metrics, null, 2) + "\n");
      console.log(`redirect-chain-validator: drift metrics written to ${DRIFT_METRICS_OUT}`);
    }

    if (overRules || overFinal) {
      console.error(gate.message);
      if (ANNOTATE) console.log(`::error::${gate.message}`);
      process.exit(2);
    }

    if (DRY_RUN) {
      console.log(
        `redirect-chain-validator: [dry-run] would update baseline (${updated} rule(s)) → ${BASELINE_PATH} — no files written.`,
      );
    } else {
      mkdirSync(dirname(BASELINE_PATH), { recursive: true });
      writeFileSync(BASELINE_PATH, JSON.stringify(merged, null, 2) + "\n");
      console.log(
        `redirect-chain-validator: baseline updated (${updated} rule(s)) → ${BASELINE_PATH}`,
      );
    }
  }

  process.exit(totalOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});