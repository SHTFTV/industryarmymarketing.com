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

import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const BASE = (arg("--base", "https://www.industryarmymarketing.com") ?? "").replace(/\/$/, "");
const MAX_HOPS = Number(arg("--max-hops", "5"));
const TIMEOUT = Number(arg("--timeout", "10000"));

type Hop = { url: string; status: number; location?: string };
type Result = {
  from: string;
  expectedTo: string;
  finalUrl: string;
  hops: Hop[];
  ok: boolean;
  reason?: string;
};

async function followChain(startPath: string): Promise<{ hops: Hop[]; finalUrl: string; error?: string }> {
  const hops: Hop[] = [];
  let url = `${BASE}${startPath}`;
  for (let i = 0; i < MAX_HOPS; i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(t);
      return { hops, finalUrl: url, error: (e as Error).message };
    }
    clearTimeout(t);
    const location = res.headers.get("location") ?? undefined;
    hops.push({ url, status: res.status, location });
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

async function main() {
  const cases = LEGACY_REDIRECTS.flatMap(({ from, to }) => expand(from, to));
  console.log(`redirect-chain-validator: ${cases.length} cases against ${BASE}`);

  const results: Result[] = [];
  for (const { from, to } of cases) {
    const expectedFinal = `${BASE}${to}`.replace(/\/$/, "");
    const { hops, finalUrl, error } = await followChain(from);
    const finalNorm = finalUrl.replace(/\/$/, "").split("?")[0];
    const badHop = hops.find(
      (h, i) => i < hops.length - 1 && h.status !== 301 && h.status !== 302,
    );
    const ok =
      !error &&
      hops.length > 0 &&
      hops[0].status >= 300 &&
      hops[0].status < 400 &&
      !badHop &&
      finalNorm === expectedFinal;
    const reason = error
      ? `fetch error: ${error}`
      : hops.length === 0
        ? "no hops"
        : hops[0].status < 300 || hops[0].status >= 400
          ? `first hop was ${hops[0].status}, expected 301/302`
          : badHop
            ? `intermediate hop returned ${badHop.status}`
            : finalNorm !== expectedFinal
              ? `final ${finalNorm} !== expected ${expectedFinal}`
              : undefined;
    results.push({ from, expectedTo: to, finalUrl, hops, ok, reason });
    const tag = ok ? "PASS" : "FAIL";
    const chain = hops.map((h) => `${h.status}`).join("→");
    console.log(`  ${tag}  ${from.padEnd(60)} [${chain}] → ${finalUrl}${ok ? "" : ` (${reason})`}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${failed.length === 0 ? "PASS" : "FAIL"}: ${results.length - failed.length}/${results.length} redirects valid`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});