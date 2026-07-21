// For each blog post, the canonical URL rendered on the page must equal:
//   • BlogPosting.mainEntityOfPage["@id"] in the emitted JSON-LD, AND
//   • a <loc> entry inside public/sitemap.xml.
// Prevents "which URL is the source of truth?" drift between the page's
// self-declared canonical, its structured data, and what we ask Google
// to crawl.

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

const readCanonical = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;

const readMainEntityId = (): string | null => {
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (j?.["@type"] === "BlogPosting") {
        const m = j.mainEntityOfPage;
        if (typeof m === "string") return m;
        if (m && typeof m === "object" && typeof m["@id"] === "string")
          return m["@id"];
      }
    } catch {
      /* ignore */
    }
  }
  return null;
};

const renderPost = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("canonical === mainEntityOfPage @id === sitemap <loc>", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}: canonical matches mainEntityOfPage and sitemap`, async () => {
      renderPost(post.slug);
      const canonical = await waitFor(() => {
        const c = readCanonical();
        expect(c).toBeTruthy();
        return c!;
      });
      const mainId = readMainEntityId();
      expect(
        mainId,
        `BlogPosting.mainEntityOfPage @id missing on /blog/${post.slug}`,
      ).toBe(canonical);
      expect(
        sitemapXml.includes(`<loc>${canonical}</loc>`),
        `sitemap.xml missing <loc>${canonical}</loc>`,
      ).toBe(true);
    });
  }
});