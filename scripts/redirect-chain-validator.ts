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

import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";
import { writeFileSync } from "fs";
import { resolve } from "path";

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
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT);
    let res: Response;
    try {
      // GET (not HEAD): some CDNs/hosts skip cache/content-type headers
      // on HEAD but include them for GET. Discard the body via cancel().
      res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": userAgent, Accept: "text/html,*/*;q=0.8" },
      });
    } catch (e) {
      clearTimeout(t);
      return { hops, finalUrl: url, error: (e as Error).message };
    }
    try { await res.body?.cancel(); } catch { /* ignore */ }
    clearTimeout(t);
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
  const cases = LEGACY_REDIRECTS.flatMap(({ from, to }) => expand(from, to));
  const uaCount = Object.keys(userAgents).length;
  console.log(
    `redirect-chain-validator: ${cases.length} cases × ${uaCount} UA(s) against ${BASE}`,
  );

  const results: Result[] = [];
  const finalsByRule: Record<string, Set<string>> = {};
  for (const [uaLabel, ua] of Object.entries(userAgents)) {
    if (uaCount > 1) console.log(`\n— UA: ${uaLabel} —`);
    for (const { from, to } of cases) {
      const originalRule = LEGACY_REDIRECTS.find(
        (r) => r.from === from || (r.from.endsWith("/*") && from.startsWith(r.from.slice(0, -1))),
      )?.from ?? from;
      const expectedFinal = `${BASE}${to}`.replace(/\/$/, "");
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
    writeFileSync(
      resolve(JSON_OUT),
      JSON.stringify({ base: BASE, results, inconsistent }, null, 2),
    );
  }
  process.exit(totalOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});