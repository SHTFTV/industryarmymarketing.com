import { test, expect, request } from "@playwright/test";

// Post-publish guard: fetches the deployed site and asserts the HTTP
// caching contract that makes pricing copy safe to update.
//
//   - HTML (index) MUST be no-cache so a new bundle is picked up immediately.
//   - Hashed /assets/*.{js,css} MUST be long-lived + immutable so the browser
//     never re-downloads a filename whose contents can't change.
//
// Override target with LIVE_URL or PLAYWRIGHT_BASE_URL.

const LIVE_URL = (
  process.env.LIVE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  "https://www.industryarmymarketing.com/"
).replace(/\/?$/, "/");

function assertNoCache(cc: string | null, label: string) {
  expect(cc, `${label}: missing cache-control`).not.toBeNull();
  const v = (cc || "").toLowerCase();
  // Accept any policy that prevents reuse without revalidation.
  const ok =
    v.includes("no-cache") ||
    v.includes("no-store") ||
    /max-age\s*=\s*0/.test(v);
  expect(ok, `${label}: expected no-cache/no-store/max-age=0, got "${cc}"`).toBe(true);
}

function assertImmutable(cc: string | null, label: string) {
  expect(cc, `${label}: missing cache-control`).not.toBeNull();
  const v = (cc || "").toLowerCase();
  expect(v, `${label}: expected "immutable", got "${cc}"`).toContain("immutable");
  const m = v.match(/max-age\s*=\s*(\d+)/);
  expect(m, `${label}: expected max-age directive, got "${cc}"`).not.toBeNull();
  const maxAge = Number(m![1]);
  // Hashed assets should be cached for at least a year.
  expect(maxAge, `${label}: max-age too low (${maxAge})`).toBeGreaterThanOrEqual(31_536_000);
}

test.describe("Live cache headers @ " + LIVE_URL, () => {
  test("HTML entry document is no-cache and hashed JS/CSS are immutable", async () => {
    const api = await request.newContext();

    // 1) HTML entry
    const html = await api.get(LIVE_URL, { maxRedirects: 5 });
    expect(html.status(), "HTML status").toBe(200);
    const htmlCT = html.headers()["content-type"] || "";
    expect(htmlCT, "HTML content-type").toContain("text/html");
    assertNoCache(html.headers()["cache-control"] ?? null, "HTML /");

    // 2) Extract hashed asset URLs from the served HTML.
    const body = await html.text();
    const assetPaths = Array.from(
      body.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g),
      (m) => m[1],
    );
    // De-dupe.
    const unique = Array.from(new Set(assetPaths));
    expect(unique.length, "at least one hashed /assets/*.js or *.css").toBeGreaterThan(0);

    // Every referenced asset must be content-hashed (Vite -[hash] before extension).
    for (const p of unique) {
      expect(p, `asset ${p} looks content-hashed`).toMatch(/-[A-Za-z0-9_-]{6,}\.(?:js|css)$/);
    }

    // 3) Sample HEAD each asset and assert immutable + long max-age.
    const origin = new URL(LIVE_URL).origin;
    for (const p of unique.slice(0, 6)) {
      const url = origin + p;
      const res = await api.fetch(url, { method: "HEAD" });
      expect(res.status(), `HEAD ${p} status`).toBe(200);
      assertImmutable(res.headers()["cache-control"] ?? null, `asset ${p}`);
    }

    await api.dispose();
  });
});