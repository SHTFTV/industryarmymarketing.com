/**
 * Ordering + date parity between public/rss.xml and public/sitemap.xml.
 *
 *   1. The sequence of /blog/:slug URLs in the RSS feed must exactly
 *      match the sequence of those same URLs in sitemap.xml. This keeps
 *      the "newest-first" contract enforced in a single place — if one
 *      generator changes its ordering, this test fails loudly instead
 *      of readers and Google seeing conflicting orderings.
 *
 *   2. For every slug, the RSS <pubDate> (and optional atom:updated /
 *      <lastBuildDate>-style updated field) must parse and, when the
 *      sitemap has a <lastmod> for that slug, the RSS "updated" (or
 *      pubDate when no explicit updated is present) must resolve to
 *      the same calendar day. Silent drift between the two dates makes
 *      Google discard one of them.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE_URL } from "@/components/Seo";

const rss = readFileSync(resolve("public/rss.xml"), "utf8");
const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");

const BLOG_PREFIX = `${SITE_URL}/blog/`;

// Ordered list of RSS <item> blocks and their <link>s.
const rssItemBlocks = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
  (m) => m[1],
);
const rssBlogLinks = rssItemBlocks
  .map((b) => b.match(/<link>([^<]+)<\/link>/)?.[1] ?? null)
  .filter((l): l is string => !!l && l.startsWith(BLOG_PREFIX));

// Ordered list of sitemap <url> blocks whose <loc> is a /blog/:slug URL.
const sitemapUrlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
  (m) => m[1],
);
const sitemapBlogEntries = sitemapUrlBlocks
  .map((b) => {
    const loc = b.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null;
    const lastmod = b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
    return { loc, lastmod };
  })
  .filter(
    (e): e is { loc: string; lastmod: string | null } =>
      !!e.loc && e.loc.startsWith(BLOG_PREFIX),
  );
const sitemapBlogLinks = sitemapBlogEntries.map((e) => e.loc);

const isoDay = (v: string): string | null => {
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
};

describe("RSS ↔ sitemap ordering + pubDate/updated consistency", () => {
  it("has at least one blog entry in both feeds", () => {
    expect(rssBlogLinks.length).toBeGreaterThan(0);
    expect(sitemapBlogLinks.length).toBeGreaterThan(0);
  });

  it("emits the same set of /blog/:slug URLs in RSS and sitemap", () => {
    expect(new Set(rssBlogLinks)).toEqual(new Set(sitemapBlogLinks));
  });

  it("emits /blog/:slug URLs in the same order in RSS and sitemap", () => {
    // Filter both lists to the intersection to make failure output
    // focused on ordering rather than set membership (covered above).
    const shared = new Set(rssBlogLinks.filter((l) => sitemapBlogLinks.includes(l)));
    const rssOrdered = rssBlogLinks.filter((l) => shared.has(l));
    const sitemapOrdered = sitemapBlogLinks.filter((l) => shared.has(l));
    expect(rssOrdered).toEqual(sitemapOrdered);
  });

  it.each(rssBlogLinks.map((l) => [l] as const))(
    "pubDate/updated for %s is valid and consistent with sitemap <lastmod>",
    (link) => {
      const idx = rssBlogLinks.indexOf(link);
      const block = rssItemBlocks.find((b) =>
        b.includes(`<link>${link}</link>`),
      );
      expect(block, `RSS item missing for ${link}`).toBeTruthy();

      const pubDate = block!.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? null;
      expect(pubDate, `pubDate missing for ${link}`).toBeTruthy();
      const pubDay = isoDay(pubDate!);
      expect(pubDay, `pubDate not parseable for ${link}: ${pubDate}`).toBeTruthy();

      const updated =
        block!.match(/<atom:updated>([^<]+)<\/atom:updated>/)?.[1] ??
        block!.match(/<updated>([^<]+)<\/updated>/)?.[1] ??
        null;
      if (updated) {
        const updDay = isoDay(updated);
        expect(
          updDay,
          `atom:updated not parseable for ${link}: ${updated}`,
        ).toBeTruthy();
      }

      // Sitemap <lastmod> parity — where present, must match either the
      // RSS updated field (when present) or the pubDate day-of.
      const sitemapEntry = sitemapBlogEntries.find((e) => e.loc === link);
      expect(sitemapEntry, `sitemap missing entry for ${link}`).toBeTruthy();
      if (sitemapEntry?.lastmod) {
        const lastmodDay = isoDay(sitemapEntry.lastmod);
        const expectedDay = updated ? isoDay(updated) : pubDay;
        expect(
          lastmodDay,
          `sitemap <lastmod> not parseable for ${link}: ${sitemapEntry.lastmod}`,
        ).toBeTruthy();
        expect(
          lastmodDay,
          `sitemap <lastmod> (${lastmodDay}) drifts from RSS ${
            updated ? "atom:updated" : "pubDate"
          } (${expectedDay}) for ${link}`,
        ).toBe(expectedDay);
      }

      // Sanity: same position across both feeds.
      expect(
        sitemapBlogLinks.indexOf(link),
        `positional drift: RSS index ${idx} vs sitemap for ${link}`,
      ).toBe(idx);
    },
  );
});
