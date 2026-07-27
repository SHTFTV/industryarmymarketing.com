import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SeoPackages from "./SeoPackages";
import SeoPackageDetail from "./SeoPackageDetail";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { SITE_URL } from "@/components/Seo";

const renderRoute = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/seo-packages" element={<SeoPackages />} />
          <Route path="/seo-packages/:slug" element={<SeoPackageDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const meta = (sel: string) =>
  document.querySelector(sel)?.getAttribute("content") ?? null;

describe("SEO Packages routes — head metadata", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/seo-packages renders title, description, canonical, and OG tags", async () => {
    renderRoute("/seo-packages");
    await waitFor(() => {
      expect(document.title).toMatch(/Bullets.*Boom.*Bombs/i);
    });
    const description = meta('meta[name="description"]');
    expect(description).toMatch(/link.building|packages|IAM/i);
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe(`${SITE_URL}/seo-packages`);
    expect(meta('meta[property="og:title"]')).toBe(document.title);
    expect(meta('meta[property="og:description"]')).toBe(description);
    expect(meta('meta[property="og:url"]')).toBe(`${SITE_URL}/seo-packages`);
    expect(meta('meta[property="og:type"]')).toBe("website");
    expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\//);
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  for (const pkg of SEO_PACKAGES) {
    it(`/seo-packages/${pkg.slug} renders package-specific title, description, and OG`, async () => {
      renderRoute(`/seo-packages/${pkg.slug}`);
      await waitFor(() => {
        expect(document.title).toContain(pkg.name);
      });
      expect(document.title).toContain(pkg.tagline);
      expect(document.title).toContain(String(pkg.price));
      const description = meta('meta[name="description"]');
      expect(description).toContain(pkg.name);
      expect(description).toContain(`${pkg.deliverables} placements`);
      expect(
        document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe(`${SITE_URL}/seo-packages/${pkg.slug}`);
      expect(meta('meta[property="og:title"]')).toBe(document.title);
      expect(meta('meta[property="og:description"]')).toBe(description);
      expect(meta('meta[property="og:url"]')).toBe(
        `${SITE_URL}/seo-packages/${pkg.slug}`,
      );
      expect(meta('meta[property="og:type"]')).toBe("website");
      expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\//);
    });
  }
});