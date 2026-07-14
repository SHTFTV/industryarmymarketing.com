import { test, expect, request, type APIRequestContext } from "@playwright/test";

// Post-publish guard, part 2 — extends live-cache-headers.spec.ts with:
//
//   1. CDN cached-URL sanity: re-hits the same HTML entry twice and confirms
//      the second (potentially edge-cached) response still advertises the
//      HTML no-cache contract AND that any hashed /assets/*.{js,css,woff2,…}
//      it references remain immutable. Guarantees a stale edge node cannot
//      "downgrade" the caching policy after a publish.
//   2. Pricing-adjacent API responses: the app has NO runtime pricing
//      endpoint (pricing lives in the bundled matrix compiled into hashed
//      JS), but if any Supabase REST or Edge Function response is observed
//      while the homepage renders, we assert its cache-control forbids
//      shared/stale reuse so pricing copy from a data source could not go
//      stale even if one is added later.
//   3. Fonts + images: any /assets/*.{woff2,woff,ttf,otf,png,jpg,jpeg,webp,
//      avif,svg} referenced by the deployed HTML or CSS MUST be served with
//      an immutable + ≥1y max-age policy (Vite content-hashes them).
//      Unhashed public/ images (favicons, icons) MAY omit cache-control but
//      MUST at minimum ship an ETag so browsers can revalidate.
//
// Override target with LIVE_URL or PLAYWRIGHT_BASE_URL.

const LIVE_URL = (
  process.env.LIVE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  "https://www.industryarmymarketing.com/"
).replace(/\/?$/, "/");

const ORIGIN = new URL(LIVE_URL).origin;

const IMMUTABLE_MIN_MAX_AGE = 31_536_000; // 1 year

function parseMaxAge(cc: string): number | null {
  const m = cc.match(/max-age\s*=\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function assertImmutable(cc: string | null, label: string) {
  expect(cc, `${label}: missing cache-control`).not.toBeNull();
  const v = (cc || "").toLowerCase();
  expect(v, `${label}: expected "immutable", got "${cc}"`).toContain("immutable");
  const maxAge = parseMaxAge(v);
  expect(maxAge, `${label}: missing max-age, got "${cc}"`).not.toBeNull();
  expect(
    maxAge!,
    `${label}: max-age too low (${maxAge})`,
  ).toBeGreaterThanOrEqual(IMMUTABLE_MIN_MAX_AGE);
}

function assertNoSharedCache(cc: string | null, label: string) {
  expect(cc, `${label}: missing cache-control`).not.toBeNull();
  const v = (cc || "").toLowerCase();
  const ok =
    v.includes("no-cache") ||
    v.includes("no-store") ||
    v.includes("private") ||
    /max-age\s*=\s*0/.test(v) ||
    /s-maxage\s*=\s*0/.test(v);
  expect(
    ok,
    `${label}: expected no-cache/no-store/private/max-age=0, got "${cc}"`,
  ).toBe(true);
}

async function fetchHtml(api: APIRequestContext) {
  const res = await api.get(LIVE_URL, { maxRedirects: 5 });
  expect(res.status(), "HTML status").toBe(200);
  return { res, body: await res.text() };
}

function extractPaths(body: string, extRegex: RegExp): string[] {
  const paths = Array.from(
    body.matchAll(/(?:src|href)="(\/[^"]+)"/g),
    (m) => m[1],
  ).filter((p) => extRegex.test(p));
  return Array.from(new Set(paths));
}

test.describe("Live cache headers — extended @ " + LIVE_URL, () => {
  test("CDN keeps HTML no-cache + hashed assets immutable across repeat fetches", async () => {
    const api = await request.newContext();
    const first = await fetchHtml(api);
    const second = await fetchHtml(api);

    for (const [label, r] of [
      ["HTML / (first hit)", first.res],
      ["HTML / (repeat hit)", second.res],
    ] as const) {
      assertNoSharedCache(r.headers()["cache-control"] ?? null, label);
      expect(
        r.headers()["content-type"] || "",
        `${label}: content-type`,
      ).toContain("text/html");
    }

    // Hashed asset URLs must survive both fetches with immutable policy.
    const assets = extractPaths(second.body, /^\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg)$/);
    expect(assets.length, "hashed /assets/* references in HTML").toBeGreaterThan(0);
    for (const p of assets.slice(0, 8)) {
      const res = await api.fetch(ORIGIN + p, { method: "HEAD" });
      expect(res.status(), `HEAD ${p}`).toBe(200);
      assertImmutable(res.headers()["cache-control"] ?? null, `asset ${p}`);
    }

    await api.dispose();
  });

  test("Font + image responses use immutable long-lived headers where hashed; unhashed public images ship ETag", async () => {
    const api = await request.newContext();
    const { body } = await fetchHtml(api);

    // Hashed fonts + images bundled under /assets/*
    const hashed = extractPaths(
      body,
      /^\/assets\/.+-[A-Za-z0-9_-]{6,}\.(woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg)$/,
    );

    // Also pull hashed assets referenced from the served CSS (fonts are
    // usually declared in @font-face, not in the HTML shell).
    const cssPaths = extractPaths(body, /^\/assets\/.+\.css$/);
    for (const cssPath of cssPaths.slice(0, 3)) {
      const cssRes = await api.get(ORIGIN + cssPath);
      if (cssRes.status() !== 200) continue;
      const css = await cssRes.text();
      const urls = Array.from(
        css.matchAll(/url\(["']?([^"')]+\.(?:woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg))["']?\)/gi),
        (m) => m[1],
      );
      for (const u of urls) {
        if (u.startsWith("data:")) continue;
        // Only track same-origin hashed assets — external font CDNs (e.g.
        // fonts.gstatic.com) manage their own headers.
        const abs = u.startsWith("http")
          ? u
          : u.startsWith("/")
            ? ORIGIN + u
            : new URL(u, ORIGIN + cssPath).toString();
        if (abs.startsWith(ORIGIN) && /\/assets\/.+-[A-Za-z0-9_-]{6,}\./.test(abs)) {
          hashed.push(abs.slice(ORIGIN.length));
        }
      }
    }

    const uniqueHashed = Array.from(new Set(hashed));
    for (const p of uniqueHashed.slice(0, 12)) {
      const res = await api.fetch(ORIGIN + p, { method: "HEAD" });
      expect(res.status(), `HEAD ${p}`).toBe(200);
      assertImmutable(res.headers()["cache-control"] ?? null, `hashed asset ${p}`);
    }

    // Unhashed public/ icons must be revalidatable — either explicit
    // cache-control OR an ETag/Last-Modified so the browser can conditional-GET.
    const publicImages = extractPaths(
      body,
      /^\/(?!assets\/).+\.(png|jpg|jpeg|webp|avif|svg|ico)$/,
    );
    for (const p of publicImages.slice(0, 6)) {
      const res = await api.fetch(ORIGIN + p, { method: "HEAD" });
      expect(res.status(), `HEAD ${p}`).toBe(200);
      const h = res.headers();
      const revalidatable =
        !!h["cache-control"] || !!h["etag"] || !!h["last-modified"];
      expect(
        revalidatable,
        `public image ${p}: needs cache-control OR etag OR last-modified for safe revalidation`,
      ).toBe(true);
      const cc = h["cache-control"];
      if (cc && /max-age\s*=\s*(\d+)/i.test(cc) && !/immutable/i.test(cc)) {
        // If it opts into a long TTL without immutable + a content hash,
        // fail — that combo is what causes the stale-copy pain we're
        // guarding pricing against.
        const maxAge = parseMaxAge(cc) ?? 0;
        expect(
          maxAge,
          `public image ${p}: unhashed asset with long max-age but no immutable ("${cc}") could serve stale content`,
        ).toBeLessThan(IMMUTABLE_MIN_MAX_AGE);
      }
    }

    await api.dispose();
  });

  test("Any pricing-adjacent API response served while the homepage loads is not shared-cacheable", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    type Seen = { url: string; cc: string | null };
    const dataResponses: Seen[] = [];

    page.on("response", (res) => {
      const url = res.url();
      // Any Supabase REST / Edge Function / same-origin /api/ hit that
      // could carry dynamic pricing copy.
      if (
        /\/rest\/v1\//.test(url) ||
        /\/functions\/v1\//.test(url) ||
        /supabase\.co\/(rest|functions)\//.test(url) ||
        new RegExp(`^${ORIGIN}/api/`).test(url)
      ) {
        dataResponses.push({
          url,
          cc: res.headers()["cache-control"] ?? null,
        });
      }
    });

    await page.goto(LIVE_URL, { waitUntil: "networkidle" });

    // The homepage renders pricing from the bundled matrix, so it is
    // valid for zero API responses to be observed. When any are seen,
    // enforce the no-shared-cache contract so a future pricing API
    // cannot ship stale copy through the CDN.
    for (const r of dataResponses) {
      assertNoSharedCache(r.cc, `data response ${r.url}`);
    }

    await context.close();
  });
});
