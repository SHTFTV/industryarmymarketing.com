import { readFileSync } from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { blogPosts, compareBlogPostsByNewest, postTime } from "./blogPosts";

// Slug list, in the exact order they appear in the public RSS feed.
const rssSlugs = (): string[] => {
  const xml = readFileSync(path.resolve("public/rss.xml"), "utf8");
  return [...xml.matchAll(/<link>https?:\/\/[^<]+\/blog\/([^<]+)<\/link>/g)].map(
    (m) => m[1],
  );
};

describe("blogPosts data integrity", () => {
  it("every post has a valid ISO publishedAt", () => {
    for (const post of blogPosts) {
      expect(post.publishedAt, `post "${post.slug}" missing publishedAt`).toBeTruthy();
      const t = Date.parse(post.publishedAt!);
      expect(Number.isFinite(t), `post "${post.slug}" has invalid publishedAt`).toBe(true);
    }
  });

  it("blogPosts is sorted strictly newest-first by publishedAt", () => {
    for (let i = 1; i < blogPosts.length; i++) {
      const prev = postTime(blogPosts[i - 1]);
      const cur = postTime(blogPosts[i]);
      expect(prev, `${blogPosts[i - 1].slug} must be newer than ${blogPosts[i].slug}`).toBeGreaterThanOrEqual(cur);
    }
  });

  it("publishedAt is unique across every post (no ambiguous ties)", () => {
    const stamps = blogPosts.map((p) => p.publishedAt);
    expect(new Set(stamps).size).toBe(stamps.length);
  });

  it("comparator resorts to the exact same order (idempotent)", () => {
    const resorted = [...blogPosts].sort(compareBlogPostsByNewest);
    expect(resorted.map((p) => p.slug)).toEqual(blogPosts.map((p) => p.slug));
  });
});

describe("blog ordering consistency across surfaces", () => {
  it("public/rss.xml order matches blogPosts newest-first order exactly", () => {
    const feed = rssSlugs();
    expect(feed).toEqual(blogPosts.map((p) => p.slug));
  });

  it("LatestBlogPosts (homepage carousel) top-4 matches the first 4 of blogPosts and RSS", () => {
    // LatestBlogPosts consumes blogPosts.slice(0, 4) via the ranking helper.
    const carouselTop4 = blogPosts.slice(0, 4).map((p) => p.slug);
    const rssTop4 = rssSlugs().slice(0, 4);
    expect(carouselTop4).toEqual(rssTop4);
  });

  it("Blog page featured slot is the newest blogPosts entry", () => {
    // src/pages/Blog.tsx uses blogPosts[0] as the fallback featured post.
    expect(blogPosts[0].slug).toBe(rssSlugs()[0]);
  });
});