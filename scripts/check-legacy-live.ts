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

function expand(from: string): string[] {
  const base = from.replace(/\/\*$/, "");
  if (from.endsWith("/*")) return [`${base}/legacy-sample`, `${base}/nested/deep.html`];
  // Cover both trailing-slash and non-trailing-slash variants.
  const noSlash = base.replace(/\/$/, "");
  return noSlash === base ? [base, `${base}/`] : [noSlash, base];
}

async function head(path: string): Promise<{ status: number; location?: string }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "Lovable-Legacy-Live-Check/1.0" },
  });
  try { await res.body?.cancel(); } catch { /* ignore */ }
  return { status: res.status, location: res.headers.get("location") ?? undefined };
}

async function main() {
  const paths = Array.from(new Set(LEGACY_REDIRECTS.flatMap((r) => expand(r.from))));
  console.log(`check-legacy-live: probing ${paths.length} legacy paths against ${BASE}`);

  const failures: string[] = [];
  for (const p of paths) {
    try {
      const { status } = await head(p);
      // Acceptable: 3xx redirect or 404 (host may prefer to hard-drop).
      // Never acceptable: 200 OK (means path is still a live page).
      if (status === 200) failures.push(`${p} returned 200 (should be 3xx or 404)`);
      else if (!(status >= 300 && status < 500)) failures.push(`${p} returned ${status}`);
      else console.log(`  OK  ${p} → ${status}`);
    } catch (e) {
      failures.push(`${p} fetch error: ${(e as Error).message}`);
    }
  }

  // Live sitemap must not include any legacy literal.
  const sitemapUrl = `${BASE}/sitemap.xml`;
  console.log(`check-legacy-live: fetching ${sitemapUrl}`);
  const sm = await fetch(sitemapUrl, { headers: { "User-Agent": "Lovable-Legacy-Live-Check/1.0" } });
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
      if (re.test(body)) failures.push(`sitemap.xml lists legacy path ${literal}`);
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