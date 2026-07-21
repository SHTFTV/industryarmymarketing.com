/**
 * Data-level SEO parity: iterate every entry in blogPosts and verify the
 * fields the SEO component (src/components/Seo.tsx) and BlogPost.tsx use
 * to emit JSON-LD, Open Graph, and Twitter tags are present and internally
 * consistent, and that each slug is discoverable via sitemap.xml.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { blogPosts } from "@/data/blogPosts";

const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
const rss = readFileSync(resolve("public/rss.xml"), "utf8");

describe("blogPosts SEO parity (all posts)", () => {
  it("dataset is non-empty", () => {
    expect(blogPosts.length).toBeGreaterThan(0);
  });

  for (const post of blogPosts) {
    describe(`post: ${post.slug}`, () => {
      it("has SEO-required fields for OG + Twitter + JSON-LD", () => {
        expect(post.slug, "slug").toMatch(/^[a-z0-9][a-z0-9-]*$/);
        expect(post.title?.length, "title").toBeGreaterThan(10);
        expect(post.metaDescription?.length, "metaDescription").toBeGreaterThan(
          40,
        );
        expect(post.image, "image").toBeTruthy();
        // Image must resolve to a URL or absolute site-relative path
        expect(post.image).toMatch(/^(https?:\/\/|\/)/);
        // Publish signal for JSON-LD datePublished
        const dateOk =
          (post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt))) ||
          !!post.date;
        expect(dateOk, "publishedAt or date").toBe(true);
      });

      it("slug is present in public/sitemap.xml", () => {
        expect(sitemap).toContain(`/blog/${post.slug}</loc>`);
      });

      it("slug appears in public/rss.xml", () => {
        expect(rss).toContain(`/blog/${post.slug}`);
      });
    });
  }

  it("all slugs are unique across the dataset", () => {
    const slugs = blogPosts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});