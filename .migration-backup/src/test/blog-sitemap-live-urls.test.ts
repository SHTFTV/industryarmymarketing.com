// Renderless integration test: fetches every /blog and /blog/:slug URL
// listed in public/sitemap.xml and asserts HTTP 200 + Content-Type
// text/html. This catches the class of bugs where a URL ships in the
// sitemap but the deployed origin serves a 404 / redirect / wrong
// content-type (e.g. a stale case-study HTML that got removed, or a
// blog slug renamed without updating the sitemap generator).
//
// Opt-in so local + PR runs stay offline-safe. Enable in post-deploy
// CI with:
//   SITEMAP_LIVE_BASE=https://www.industryarmymarketing.com \
//     bunx vitest run src/test/blog-sitemap-live-urls.test.ts
//
// The check follows redirects (`redirect: "follow"`) — a 301 from
// bare-apex to www is fine as long as the final hop is 200 text/html.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = (process.env.SITEMAP_LIVE_BASE ?? "").replace(/\/$/, "");
const runIf = BASE ? describe : describe.skip;

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

// Parse every <loc>…</loc>, then keep only /blog and /blog/:slug entries.
// Other sitemap URLs (services, contractors, etc.) are outside this
// test's scope by the user's request — they get their own suites.
const allLocs = Array.from(
  sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
  (m) => m[1].trim(),
);
const blogLocs = allLocs.filter((u) => /\/blog(?:\/[a-z0-9-]+)?$/i.test(u));

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Lovable-Sitemap-Live-Test/1.0",
      Accept: "text/html,application/xhtml+xml",
      // Cheap trick: ask for a tiny slice so the origin can stream less
      // if it honors Range; falls back cleanly if not.
      Range: "bytes=0-2047",
    },
  });
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchOnce(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * 2 ** i + Math.random() * 200));
    }
  }
  throw lastErr;
}

runIf(`sitemap /blog URLs live (base: ${BASE || "disabled"})`, () => {
  it("sitemap parse produced at least the /blog listing and one post", () => {
    expect(blogLocs.length).toBeGreaterThanOrEqual(2);
    expect(blogLocs.some((u) => u.endsWith("/blog"))).toBe(true);
    expect(blogLocs.some((u) => /\/blog\/[a-z0-9-]+$/.test(u))).toBe(true);
  });

  for (const loc of blogLocs) {
    it(`GET ${loc} → 200 text/html`, async () => {
      const r = await fetchWithRetry(loc);
      // Range requests may legitimately return 206; both prove the URL
      // is live and serving the requested bytes.
      expect([200, 206], `${loc} status ${r.status}`).toContain(r.status);
      const ct = (r.headers.get("content-type") ?? "").toLowerCase();
      expect(ct, `${loc} content-type "${ct}"`).toMatch(/^text\/html\b/);
      // Drain so the socket returns to the pool promptly.
      try {
        await r.body?.cancel();
      } catch {
        /* ignore */
      }
    }, 20_000);
  }
});