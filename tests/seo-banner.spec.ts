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

test.describe(`Programmatic SEO banner (${routes.length} discovered routes)`, () => {
  for (const route of routes) {
    test(`renders SeoBanner on ${route}`, async ({ page }) => {
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

      const img = banner.locator("img").first();
      await expect(img).toHaveAttribute("src", /CONTRACTOR_SEO\.png\?v=/);

      // The image must actually load (no 404s / broken assets).
      expect(imgResponses.length).toBeGreaterThan(0);
      for (const r of imgResponses) {
        expect(r.status, `bad status for ${r.url}`).toBeLessThan(400);
      }
    });
  }
});