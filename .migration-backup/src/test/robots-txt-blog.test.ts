/**
 * Renderless robots.txt contract check:
 *   • the file contains a `Sitemap:` directive pointing at sitemap.xml
 *   • no rule (in any User-agent block) disallows `/blog`, `/blog/`, or
 *     any specific blog slug from src/data/blogPosts
 *
 * Catches accidental "Disallow: /blog" or overly-broad wildcards before
 * they ship and de-index every post.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPosts } from "@/data/blogPosts";

const robots = readFileSync(resolve("public/robots.txt"), "utf8");

const disallowLines = robots
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => /^disallow\s*:/i.test(l))
  .map((l) => l.replace(/^disallow\s*:\s*/i, ""));

const isBlocked = (path: string) =>
  disallowLines.some((rule) => {
    if (!rule) return false; // `Disallow:` (empty) means allow everything
    // Support the `*` wildcard the way Googlebot does — convert to a regex.
    const pattern = "^" +
      rule
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");
    return new RegExp(pattern).test(path);
  });

describe("public/robots.txt: sitemap present + blog not blocked", () => {
  it("declares a Sitemap: directive pointing at sitemap.xml", () => {
    const sitemapLine = robots
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => /^sitemap\s*:/i.test(l));
    expect(sitemapLine, "no Sitemap: directive in robots.txt").toBeTruthy();
    expect(sitemapLine!.toLowerCase()).toMatch(/sitemap\.xml\s*$/);
  });

  it("does not disallow the /blog listing or trailing-slash variant", () => {
    expect(isBlocked("/blog"), "/blog is disallowed").toBe(false);
    expect(isBlocked("/blog/"), "/blog/ is disallowed").toBe(false);
  });

  it("does not disallow any published blog post slug", () => {
    const blocked = blogPosts
      .map((p) => `/blog/${p.slug}`)
      .filter((path) => isBlocked(path));
    expect(blocked, `blocked blog slugs: ${blocked.join(", ")}`).toEqual([]);
  });
});