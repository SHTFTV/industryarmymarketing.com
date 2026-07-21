/**
 * For every blog post in the dataset, confirm that the <lastmod> value in
 * public/sitemap.xml for /blog/{slug} equals the BlogPosting JSON-LD
 * `dateModified` emitted by the rendered page. Both derive from
 * post.date ("Month YYYY" → YYYY-MM-01), so any drift between the sitemap
 * generator and BlogPost.tsx is caught here before it reaches crawlers.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

const lastmodForBlog = (slug: string): string | null => {
  const loc = `${SITE_URL}/blog/${slug}`;
  // Match the <url> block containing this <loc> and pull its <lastmod>.
  const block = sitemapXml.match(
    new RegExp(
      `<url>[\\s\\S]*?<loc>${loc.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}</loc>[\\s\\S]*?</url>`,
    ),
  )?.[0];
  if (!block) return null;
  return block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
};

const readDateModified = (): string | null => {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  for (const s of scripts) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (j?.["@type"] === "BlogPosting" && typeof j.dateModified === "string") {
        return j.dateModified;
      }
    } catch {
      /* ignore malformed nodes; other tests own JSON-LD validation */
    }
  }
  return null;
};

describe("sitemap <lastmod> ↔ BlogPosting JSON-LD dateModified (all posts)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: sitemap <lastmod> matches JSON-LD dateModified`, async () => {
      const lastmod = lastmodForBlog(post.slug);
      expect(
        lastmod,
        `sitemap.xml has no <lastmod> for /blog/${post.slug}`,
      ).toBeTruthy();

      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={[`/blog/${post.slug}`]}>
            <Routes>
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>,
      );

      const dateModified = await waitFor(() => {
        const d = readDateModified();
        expect(
          d,
          `BlogPosting JSON-LD dateModified missing for /blog/${post.slug}`,
        ).toBeTruthy();
        return d!;
      });

      expect(dateModified).toBe(lastmod);
    });
  }
});
