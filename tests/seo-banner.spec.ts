import { test, expect } from "../playwright-fixture";

// Sample one route per programmatic template to guarantee the SEO banner
// is always rendered. Add more routes here as new templates ship.
const routes = [
  "/contractors/plumbers/toronto",   // ContractorCityPage
  "/cities/vancouver",                // CityPage
  "/local/vancouver",                 // LocalCity
];

test.describe("Programmatic SEO banner", () => {
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