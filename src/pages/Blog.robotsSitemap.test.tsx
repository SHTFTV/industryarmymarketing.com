/**
 * Render the /blog listing page through the real Seo component and confirm:
 *   • it emits a self-referencing canonical to SITE_URL/blog
 *   • it does NOT opt out of indexing (no noindex/nofollow robots meta)
 *   • that same canonical URL is present as a <loc> in public/sitemap.xml
 *
 * Guards against drift between what the listing page tells crawlers it is
 * and what sitemap.xml tells Google to crawl.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "./Blog";
import { SITE_URL } from "@/components/Seo";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

describe("/blog listing: canonical + robots + sitemap parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("emits canonical=SITE_URL/blog, no noindex, and sitemap.xml lists that <loc>", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/blog"]}>
          <Routes>
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    const expectedCanonical = `${SITE_URL}/blog`;

    const canonical = await waitFor(() => {
      const c = document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href");
      expect(c, "canonical link missing").toBeTruthy();
      return c!;
    });
    expect(canonical).toBe(expectedCanonical);

    const robots = document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content") ?? null;
    if (robots !== null) {
      expect(robots).not.toMatch(/noindex/i);
      expect(robots).not.toMatch(/nofollow/i);
    }

    expect(
      sitemapXml.includes(`<loc>${expectedCanonical}</loc>`),
      `sitemap.xml missing <loc>${expectedCanonical}</loc>`,
    ).toBe(true);
  });
});
