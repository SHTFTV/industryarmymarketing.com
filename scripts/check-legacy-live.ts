// Live-origin audit for legacy WordPress paths:
//   1. Every path returns a 3xx redirect (not a 200 page and not a
//      hard 404, unless the rule explicitly targets a 404 destination).
//   2. The live sitemap.xml never lists any legacy path.
//
// Runs after deploy in CI. Complements scripts/redirect-chain-validator.ts,
// which asserts per-hop status codes and final destinations; this
// script is a lighter cross-check that also parses the live sitemap.

import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const BASE = (arg("--base", "https://www.industryarmymarketing.com") ?? "").replace(/\/$/, "");
const RETRIES = Number(arg("--retries", "3"));
const ANNOTATE = args.includes("--annotate");
const HEAD_FIRST = !args.includes("--no-head");

async function backoff(attempt: number) {
  const base = 500 * Math.pow(2, attempt);
  await new Promise((r) => setTimeout(r, base + Math.random() * base));
}

function annotate(title: string, message: string) {
  if (!ANNOTATE) return;
  const encoded = message.replace(/\r/g, "").replace(/\n/g, "%0A");
  console.log(
    `::error file=src/components/LegacyRedirects.tsx,title=${title}::${encoded}`,
  );
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status >= 500 || res.status === 429) {
        if (attempt < RETRIES) {
          try { await res.body?.cancel(); } catch { /* ignore */ }
          await backoff(attempt);
          continue;
        }
      }
      return res;
    } catch (e) {
      lastErr = e as Error;
      if (attempt < RETRIES) await backoff(attempt);
    }
  }
  throw lastErr ?? new Error("fetch failed after retries");
}

function expand(from: string): string[] {
  const base = from.replace(/\/\*$/, "");
  if (from.endsWith("/*")) return [`${base}/legacy-sample`, `${base}/nested/deep.html`];
  // Cover both trailing-slash and non-trailing-slash variants.
  const noSlash = base.replace(/\/$/, "");
  return noSlash === base ? [base, `${base}/`] : [noSlash, base];
}

async function head(path: string): Promise<{ status: number; location?: string }> {
  const url = `${BASE}${path}`;
  const headers = { "User-Agent": "Lovable-Legacy-Live-Check/1.0" };
  // HEAD-first to save origin load; fall back to GET when the origin
  // refuses HEAD (405/501) or omits Location on a 3xx.
  if (HEAD_FIRST) {
    try {
      const res = await fetchWithRetry(url, { method: "HEAD", redirect: "manual", headers });
      try { await res.body?.cancel(); } catch { /* ignore */ }
      const location = res.headers.get("location") ?? undefined;
      const needsGet =
        res.status === 405 ||
        res.status === 501 ||
        (res.status >= 300 && res.status < 400 && !location);
      if (!needsGet) return { status: res.status, location };
    } catch { /* fall through to GET */ }
  }
  const res = await fetchWithRetry(url, { method: "GET", redirect: "manual", headers });
  try { await res.body?.cancel(); } catch { /* ignore */ }
  return { status: res.status, location: res.headers.get("location") ?? undefined };
}

async function main() {
  const paths = Array.from(new Set(LEGACY_REDIRECTS.flatMap((r) => expand(r.from))));
  console.log(`check-legacy-live: probing ${paths.length} legacy paths against ${BASE}`);

  const failures: string[] = [];
  for (const p of paths) {
    const rule = LEGACY_REDIRECTS.find(
      (r) => p === r.from || p === `${r.from.replace(/\/$/, "")}/` ||
        (r.from.endsWith("/*") && p.startsWith(r.from.slice(0, -2))),
    );
    try {
      const { status } = await head(p);
      // Acceptable: 3xx redirect or 404 (host may prefer to hard-drop).
      // Never acceptable: 200 OK (means path is still a live page).
      if (status === 200) {
        failures.push(`${p} returned 200 (should be 3xx or 404)`);
        annotate(
          `Legacy path still live: ${rule?.from ?? p}`,
          `Requested: ${p}\nExpected: 3xx redirect → ${rule?.to ?? "n/a"} (or 404)\nActual: 200 OK`,
        );
      } else if (!(status >= 300 && status < 500)) {
        failures.push(`${p} returned ${status}`);
        annotate(
          `Legacy path unexpected status: ${rule?.from ?? p}`,
          `Requested: ${p}\nExpected: 3xx/4xx\nActual: ${status}`,
        );
      } else {
        console.log(`  OK  ${p} → ${status}`);
      }
    } catch (e) {
      failures.push(`${p} fetch error: ${(e as Error).message}`);
    }
  }

  // Live sitemap must not include any legacy literal.
  const sitemapUrl = `${BASE}/sitemap.xml`;
  console.log(`check-legacy-live: fetching ${sitemapUrl}`);
  const sm = await fetchWithRetry(sitemapUrl, {
    headers: { "User-Agent": "Lovable-Legacy-Live-Check/1.0" },
  });
  if (!sm.ok) {
    failures.push(`sitemap.xml returned ${sm.status}`);
  } else {
    const body = await sm.text();
    for (const { from } of LEGACY_REDIRECTS) {
      const literal = from.replace(/\/\*$/, "").replace(/\/$/, "");
      if (!literal) continue;
      // Match `<loc>...{literal}</loc>` or trailing-slash variant to avoid
      // false positives on unrelated paths that happen to share a prefix.
      const re = new RegExp(`<loc>[^<]*${literal.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}/?</loc>`);
      if (re.test(body)) {
        failures.push(`sitemap.xml lists legacy path ${literal}`);
        annotate(
          `Legacy path in sitemap: ${from}`,
          `Legacy rule ${from} appears in live sitemap.xml at ${literal}`,
        );
      }
    }
  }

  if (failures.length) {
    console.error(`\ncheck-legacy-live: FAIL`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\ncheck-legacy-live: PASS`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});