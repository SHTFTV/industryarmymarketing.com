// Smoke test: keep public/rss.xml in lockstep with src/data/blogPosts.ts.
//
// If a post is added/edited/removed in blogPosts.ts and the RSS feed is not
// regenerated (scripts/generate-rss.ts), this test fails loudly instead of
// letting the drift ship to production. It also spot-checks that each RSS
// item maps back to a valid post URL and category.

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";
import { blogPosts } from "@/data/blogPosts";

const SITE = "https://industryarmymarketing.com";
const rss = readFileSync(resolve("public/rss.xml"), "utf8");

const unesc = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

type Item = { title: string; link: string; slug: string; category: string; description: string };

const items: Item[] = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
  const body = m[1];
  const pick = (tag: string) =>
    unesc((body.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`))?.[1] ?? "").trim());
  const link = pick("link");
  return {
    title: pick("title"),
    link,
    slug: link.replace(`${SITE}/blog/`, ""),
    category: pick("category"),
    description: pick("description"),
  };
});

describe("RSS ↔ blogPosts sync", () => {
  it("has one <item> per blog post", () => {
    expect(items.length).toBe(blogPosts.length);
  });

  it("every blogPost slug appears in rss.xml exactly once", () => {
    const rssSlugs = items.map((i) => i.slug).sort();
    const postSlugs = blogPosts.map((p) => p.slug).sort();
    expect(rssSlugs).toEqual(postSlugs);
    // no duplicates
    expect(new Set(rssSlugs).size).toBe(rssSlugs.length);
  });

  it("every RSS item title, link, category matches its blogPost source of truth", () => {
    const bySlug = new Map(blogPosts.map((p) => [p.slug, p]));
    for (const item of items) {
      const post = bySlug.get(item.slug);
      expect(post, `RSS item ${item.slug} has no matching blogPost`).toBeTruthy();
      expect(item.link).toBe(`${SITE}/blog/${post!.slug}`);
      expect(item.title).toBe(post!.title);
      expect(item.category).toBe(post!.category);
      // description should be the metaDescription (or excerpt fallback) — non-empty
      const expected = post!.metaDescription || post!.excerpt;
      expect(item.description).toBe(expected);
    }
  });

  it("channel <lastBuildDate> is present and parseable", () => {
    const built = rss.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/)?.[1];
    expect(built, "rss.xml missing <lastBuildDate>").toBeTruthy();
    expect(Number.isNaN(new Date(built!).getTime())).toBe(false);
  });

  it("sitemap.xml lists every blog post slug", () => {
    const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
    for (const p of blogPosts) {
      expect(
        sitemap.includes(`/blog/${p.slug}`),
        `sitemap.xml missing /blog/${p.slug} — regenerate via scripts/generate-sitemap.ts`,
      ).toBe(true);
    }
  });
});