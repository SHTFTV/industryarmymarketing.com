// Integration test: hits the deployed origin for every legacy redirect
// and asserts per-hop status codes plus the final destination, for
// both trailing-slash and non-trailing-slash variants.
//
// Skipped by default. Enable in CI (post-deploy) with:
//   LEGACY_LIVE_BASE=https://www.industryarmymarketing.com \
//     bunx vitest run src/test/legacy-redirects-live.test.ts

import { describe, it, expect } from "vitest";
import { LEGACY_REDIRECTS } from "@/components/LegacyRedirects";

const BASE = (process.env.LEGACY_LIVE_BASE ?? "").replace(/\/$/, "");
const runIf = BASE ? describe : describe.skip;

const ALLOWED_HOP_STATUSES = new Set([301, 302, 307, 308]);
const MAX_HOPS = 5;

async function followChain(startPath: string) {
  const hops: { url: string; status: number; location?: string }[] = [];
  let url = `${BASE}${startPath}`;
  for (let i = 0; i < MAX_HOPS; i++) {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "Lovable-Legacy-Live-Test/1.0" },
    });
    try { await res.body?.cancel(); } catch { /* ignore */ }
    const location = res.headers.get("location") ?? undefined;
    hops.push({ url, status: res.status, location });
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url).toString();
      continue;
    }
    return { hops, finalUrl: url };
  }
  return { hops, finalUrl: url };
}

function variants(from: string): string[] {
  if (from.endsWith("/*")) {
    const prefix = from.slice(0, -2);
    return [`${prefix}/legacy-sample`, `${prefix}/nested/deep.html`];
  }
  const noSlash = from.replace(/\/$/, "");
  return noSlash === from ? [from, `${from}/`] : [noSlash, from];
}

runIf(`legacy redirects (live: ${BASE || "disabled"})`, () => {
  // De-dupe rules by canonical `from` to avoid re-testing the
  // trailing-slash entry twice (variants() covers both).
  const seen = new Set<string>();
  const rules = LEGACY_REDIRECTS.filter((r) => {
    const key = r.from.replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const rule of rules) {
    for (const path of variants(rule.from)) {
      it(`${path} → ${rule.to} (per-hop status + final)`, async () => {
        const { hops, finalUrl } = await followChain(path);
        expect(hops.length, "expected at least one hop").toBeGreaterThan(0);
        // First hop must be a redirect status.
        expect(ALLOWED_HOP_STATUSES.has(hops[0].status), `first hop status ${hops[0].status}`).toBe(true);
        // All intermediate hops must be redirects; final hop must terminate.
        for (let i = 0; i < hops.length - 1; i++) {
          expect(ALLOWED_HOP_STATUSES.has(hops[i].status), `hop ${i + 1} status ${hops[i].status}`).toBe(true);
        }
        const last = hops[hops.length - 1];
        expect(last.status < 300 || last.status >= 400, `chain must terminate; got ${last.status}`).toBe(true);
        // Final URL must equal expected destination (trailing slash tolerated).
        const finalNorm = finalUrl.replace(/\/$/, "").split("?")[0];
        const expected = `${BASE}${rule.to}`.replace(/\/$/, "");
        expect(finalNorm).toBe(expected);
      }, 20000);
    }
  }
});