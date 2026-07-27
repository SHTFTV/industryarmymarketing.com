// og:url ↔ canonical ↔ sitemap.xml parity for /blog listing and every
// individual /blog/:slug page. If og:url and canonical drift, social
// scrapers and Google can end up pointing at different URLs for the same
// content, splitting authority.

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

const readMeta = (name: string, attr: "name" | "property" = "property") =>
  document
    .querySelector(`meta[${attr}="${name}"]`)
    ?.getAttribute("content") ?? null;

const readCanonical = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;

const sitemapHasLoc = (url: string) => sitemapXml.includes(`<loc>${url}</loc>`);

const renderRoute = (path: string, element: JSX.Element) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("og:url ↔ canonical ↔ sitemap parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing: og:url === canonical === sitemap <loc>", async () => {
    renderRoute("/blog", <Blog />);
    const canonical = await waitFor(() => {
      const c = readCanonical();
      expect(c).toBeTruthy();
      return c!;
    });
    const ogUrl = readMeta("og:url");
    expect(ogUrl).toBe(canonical);
    expect(canonical).toBe(`${SITE_URL}/blog`);
    expect(sitemapHasLoc(canonical)).toBe(true);
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}: og:url === canonical === sitemap <loc>`, async () => {
      renderRoute(`/blog/${post.slug}`, <BlogPost />);
      const canonical = await waitFor(() => {
        const c = readCanonical();
        expect(c).toBeTruthy();
        return c!;
      });
      const ogUrl = readMeta("og:url");
      expect(ogUrl, `og:url missing on /blog/${post.slug}`).toBe(canonical);
      expect(canonical).toBe(`${SITE_URL}/blog/${post.slug}`);
      expect(
        sitemapHasLoc(canonical),
        `sitemap.xml missing <loc>${canonical}</loc>`,
      ).toBe(true);
    });
  }
});