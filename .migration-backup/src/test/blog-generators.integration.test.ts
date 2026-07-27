import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeAll } from "vitest";

const CANONICAL_HOST = "https://www.industryarmymarketing.com";

function extractSlugs(): string[] {
  const src = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");
  return Array.from(src.matchAll(/"slug"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
}

describe("blog artifact generators (integration)", () => {
  const slugs = extractSlugs();

  beforeAll(() => {
    // Regenerate all three artifacts once, fail loudly if any exits non-zero.
    execSync("bunx tsx scripts/generate-static-blog-pages.ts", { stdio: "inherit" });
    execSync("bunx tsx scripts/generate-sitemap.ts", { stdio: "inherit" });
    execSync("bunx tsx scripts/generate-rss.ts", { stdio: "inherit" });
  }, 120_000);

  it("parses a non-zero set of blog posts from src/data/blogPosts.ts", () => {
    expect(slugs.length).toBeGreaterThan(30);
  });

  it("static blog page generator emits an HTML file for every slug on the canonical host", () => {
    for (const slug of slugs) {
      const exact = resolve("public/blog", slug);
      const html = resolve("public/blog", `${slug}.html`);
      expect(existsSync(exact), `missing extensionless file for ${slug}`).toBe(true);
      expect(existsSync(html), `missing .html file for ${slug}`).toBe(true);
      const body = readFileSync(exact, "utf8");
      expect(body.length, `empty body for ${slug}`).toBeGreaterThan(1000);
      expect(body).toContain(`<link rel="canonical" href="${CANONICAL_HOST}/blog/${slug}">`);
      expect(body).toContain(`<meta property="og:url" content="${CANONICAL_HOST}/blog/${slug}">`);
      expect(body).toMatch(/<script type="application\/ld\+json">[^<]*"BlogPosting"/);
      expect(body).toMatch(/<h1>/);
    }
  });

  it("sitemap.xml contains every blog slug on the canonical host and never regresses to zero", () => {
    const xml = readFileSync(resolve("public/sitemap.xml"), "utf8");
    const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(slugs.length);
    for (const slug of slugs) {
      expect(urls, `sitemap missing ${slug}`).toContain(`${CANONICAL_HOST}/blog/${slug}`);
    }
  });

  it("rss.xml contains an item for every blog slug on the canonical host", () => {
    const xml = readFileSync(resolve("public/rss.xml"), "utf8");
    const links = Array.from(xml.matchAll(/<link>([^<]+)<\/link>/g)).map((m) => m[1]);
    expect(links.length).toBeGreaterThan(1);
    for (const slug of slugs) {
      expect(links, `rss missing ${slug}`).toContain(`${CANONICAL_HOST}/blog/${slug}`);
    }
  });
});