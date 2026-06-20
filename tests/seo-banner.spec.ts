import { test, expect } from "../playwright-fixture";
import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Auto-discovery of programmatic SEO routes.
//
// Rather than hard-coding a sample per template, we scan the source tree so
// new contractor data files, city records, and LocalCity pages get tested
// automatically the moment they're added.
// ---------------------------------------------------------------------------

const repoRoot = path.resolve(__dirname, "..");

function discoverContractorRoutes(): string[] {
  const dir = path.join(repoRoot, "src/data/contractors");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""))
    .map((slug) => {
      const [trade, city] = slug.split("__");
      return trade && city ? `/contractors/${trade}/${city}` : null;
    })
    .filter((x): x is string => !!x);
}

function discoverCityRoutes(): string[] {
  const file = path.join(repoRoot, "src/pages/CityPage.tsx");
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  // Match keys inside CITY_DATA: `  <slug>: {`
  const m = src.match(/CITY_DATA\s*:\s*Record<[^>]+>\s*=\s*\{([\s\S]*?)\n\};/);
  if (!m) return [];
  const body = m[1];
  const keys = [...body.matchAll(/^\s{2}([a-z0-9-]+)\s*:\s*\{/gm)].map(
    (x) => x[1],
  );
  return keys.map((k) => `/cities/${k}`);
}

function discoverLocalRoutes(): string[] {
  const dir = path.join(repoRoot, "src/pages/local");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && f !== "LocalCity.tsx")
    .map((f) => `/local/${f.replace(/\.tsx$/, "").toLowerCase()}`);
}

const routes = Array.from(
  new Set([
    ...discoverContractorRoutes(),
    ...discoverCityRoutes(),
    ...discoverLocalRoutes(),
  ]),
).sort();

if (routes.length === 0) {
  throw new Error(
    "SEO banner test discovery found no programmatic routes — check src/data/contractors, CityPage CITY_DATA, and src/pages/local.",
  );
}

// Representative viewport per form factor. Sizes match common device
// breakpoints so the test catches layout regressions in real-world widths.
const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.describe(`Programmatic SEO banner (${routes.length} routes × ${viewports.length} viewports)`, () => {
  for (const route of routes) {
    for (const vp of viewports) {
      test(`renders SeoBanner on ${route} @ ${vp.name} (${vp.width}x${vp.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        const imgResponses: { url: string; status: number }[] = [];
        page.on("response", (res) => {
          const url = res.url();
          if (url.includes("CONTRACTOR_SEO.png")) {
            imgResponses.push({ url, status: res.status() });
          }
        });

        await page.goto(route, { waitUntil: "networkidle" });

        const banner = page.locator('[data-testid="seo-banner"]').first();
        await expect(banner).toBeVisible();

        // Cache-bust query string must be present in the DOM.
        const img = banner.locator("img").first();
        await expect(img).toHaveAttribute("src", /CONTRACTOR_SEO\.png\?v=/);

        // The image must actually load (no 404s / broken assets).
        expect(imgResponses.length).toBeGreaterThan(0);
        for (const r of imgResponses) {
          expect(r.status, `bad status for ${r.url}`).toBeLessThan(400);
        }

        // Layout sanity: banner must span the viewport width (allowing for
        // scrollbar) and have non-zero height so it never collapses.
        const box = await banner.boundingBox();
        expect(box, "banner has no bounding box").not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(vp.width - 20);
        expect(box!.height).toBeGreaterThan(0);

        // The rendered image must have natural dimensions (i.e. actually
        // decoded, not a broken-image placeholder).
        const natural = await img.evaluate((el) => ({
          w: (el as HTMLImageElement).naturalWidth,
          h: (el as HTMLImageElement).naturalHeight,
        }));
        expect(natural.w, "image failed to decode (naturalWidth=0)").toBeGreaterThan(0);
        expect(natural.h, "image failed to decode (naturalHeight=0)").toBeGreaterThan(0);

        // Accessibility + CLS-prevention attributes.
        const attrs = await img.evaluate((el) => {
          const i = el as HTMLImageElement;
          return {
            alt: i.getAttribute("alt"),
            width: i.getAttribute("width"),
            height: i.getAttribute("height"),
            loading: i.getAttribute("loading"),
            decoding: i.getAttribute("decoding"),
            // React renders `fetchPriority` as the lowercase HTML attribute.
            fetchpriority:
              i.getAttribute("fetchpriority") ?? i.getAttribute("fetchPriority"),
          };
        });

        // Alt text: must exist, be non-empty, and not be a generic placeholder.
        expect(attrs.alt, "img is missing alt text").toBeTruthy();
        expect(attrs.alt!.trim().length).toBeGreaterThan(3);
        expect(attrs.alt!.toLowerCase()).not.toMatch(/^(image|photo|picture)$/);

        // Explicit width/height attrs prevent layout shift.
        expect(attrs.width, "img missing width attribute").toBeTruthy();
        expect(attrs.height, "img missing height attribute").toBeTruthy();
        expect(Number(attrs.width)).toBeGreaterThan(0);
        expect(Number(attrs.height)).toBeGreaterThan(0);

        // Performance attributes for a hero/LCP image.
        expect(attrs.loading).toBe("eager");
        expect(attrs.decoding).toBe("async");
        expect(attrs.fetchpriority).toBe("high");

        // ---------------------------------------------------------------
        // Visual regression snapshot.
        //
        // Wait until the underlying <img> has fully decoded so the snapshot
        // is deterministic, then compare against the per-viewport baseline.
        // Run with `--update-snapshots` to refresh baselines after an
        // intentional design change.
        // ---------------------------------------------------------------
        await img.evaluate((el) => (el as HTMLImageElement).decode());

        await expect(banner).toHaveScreenshot(
          `seo-banner-${vp.name}.png`,
          {
            // Allow ≤0.5% of pixels to differ (anti-aliasing across runs)
            // but anything larger — crop shifts, layout breaks, missing
            // overlay — will fail the test.
            maxDiffPixelRatio: 0.005,
            animations: "disabled",
          },
        );
      });
    }
  }
});