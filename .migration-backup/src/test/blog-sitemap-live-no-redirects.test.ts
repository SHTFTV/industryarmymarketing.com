// Strict live check: for every /blog and /blog/:slug entry in
// public/sitemap.xml, issue a manual (no-follow) request and assert
// the FIRST response is 200 text/html with a URL byte-identical to
// the sitemap <loc> — i.e. zero redirects.
//
// This is stricter than blog-sitemap-live-urls.test.ts (which follows
// redirects). A 301 www↔apex or trailing-slash swap will pass the
// permissive check but fail here, catching sitemap drift that dilutes
// link equity and confuses crawlers.
//
// Opt-in — enable in post-deploy CI with:
//   SITEMAP_LIVE_BASE=https://www.industryarmymarketing.com \
//     bunx vitest run src/test/blog-sitemap-live-no-redirects.test.ts

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = (process.env.SITEMAP_LIVE_BASE ?? "").replace(/\/$/, "");
const runIf = BASE ? describe : describe.skip;

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");
const allLocs = Array.from(
  sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
  (m) => m[1].trim(),
);
const blogLocs = allLocs.filter((u) => /\/blog(?:\/[a-z0-9-]+)?$/i.test(u));

async function fetchNoFollow(url: string): Promise<Response> {
  return fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      "User-Agent": "Lovable-Sitemap-Strict-Test/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });
}

runIf(`sitemap /blog URLs strict (no redirects, base: ${BASE || "disabled"})`, () => {
  for (const loc of blogLocs) {
    it(`GET ${loc} → 200 text/html, no redirect`, async () => {
      const r = await fetchNoFollow(loc);

      // 3xx means the sitemap advertises a URL that isn't the canonical
      // one the origin actually serves — fix the sitemap generator.
      expect(
        r.status,
        `${loc} redirected (status ${r.status} → ${r.headers.get("location") ?? "?"})`,
      ).toBe(200);

      const ct = (r.headers.get("content-type") ?? "").toLowerCase();
      expect(ct, `${loc} content-type "${ct}"`).toMatch(/^text\/html\b/);

      // Fetch's `Response.url` reflects the final URL after any internal
      // resolution. With redirect: "manual" it should equal the request.
      expect(r.url, `${loc} .url drifted to "${r.url}"`).toBe(loc);

      try {
        await r.body?.cancel();
      } catch {
        /* ignore */
      }
    }, 20_000);
  }
});