// For every entry in blogPosts:
//   1) The rendered page emits index/follow robots behaviour (Seo.tsx only
//      adds a robots meta when `noindex` is set — its absence is the signal).
//   2) The self-referencing canonical URL is present in public/sitemap.xml
//      so what the page claims and what Google is told to crawl agree.
//   3) The BlogPosting JSON-LD conforms to schema.org's required structure
//      (see src/lib/validateBlogPostingSchema.ts) — required fields present
//      and correctly typed.

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";
import { validateBlogPostingSchema } from "@/lib/validateBlogPostingSchema";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

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

const readRobotsMeta = () =>
  document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;

const readCanonical = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;

const readBlogPosting = () => {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  for (const s of scripts) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (j?.["@type"] === "BlogPosting") return j as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  return null;
};

describe("BlogPost robots + sitemap + schema validation (all posts)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: robots meta is index,follow (no noindex emitted)`, async () => {
      renderPost(post.slug);
      await waitFor(() => {
        expect(readCanonical()).toBe(`${SITE_URL}/blog/${post.slug}`);
      });
      const robots = readRobotsMeta();
      // Seo.tsx only emits <meta name="robots"> when noindex=true. Blog posts
      // must not opt-out of indexing, so either the tag is absent (default
      // index,follow) or it must not include noindex/nofollow.
      if (robots !== null) {
        expect(robots).not.toMatch(/noindex/i);
        expect(robots).not.toMatch(/nofollow/i);
      }
    });

    it(`/${post.slug}: canonical URL is listed in public/sitemap.xml`, async () => {
      renderPost(post.slug);
      const canonical = await waitFor(() => {
        const c = readCanonical();
        expect(c).toBeTruthy();
        return c!;
      });
      const loc = `<loc>${canonical}</loc>`;
      expect(
        sitemapXml.includes(loc),
        `sitemap.xml is missing <loc> for canonical ${canonical}`,
      ).toBe(true);
    });

    it(`/${post.slug}: BlogPosting JSON-LD validates against schema.org structure`, async () => {
      renderPost(post.slug);
      const blog = await waitFor(() => {
        const b = readBlogPosting();
        expect(b, `BlogPosting JSON-LD missing on /blog/${post.slug}`).not.toBeNull();
        return b!;
      });
      const violations = validateBlogPostingSchema(blog);
      if (violations.length > 0) {
        const lines = violations
          .map(
            (x) =>
              `  • ${x.field}: ${x.problem} — expected ${x.expected}, actual ${x.actual}`,
          )
          .join("\n");
        throw new Error(
          `BlogPosting schema violations on /blog/${post.slug}:\n${lines}`,
        );
      }
      expect(violations).toEqual([]);
    });
  }
});