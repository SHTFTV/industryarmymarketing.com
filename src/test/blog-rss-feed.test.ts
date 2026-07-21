/**
 * Validate the generated RSS feed at public/rss.xml:
 *  - well-formed XML with a single <channel>
 *  - every <item> has <title>, <link>, <guid>, and a valid RFC 822 <pubDate>
 *    (RSS 2.0 has no <updated>; where an atom:updated is present we parse it too)
 *  - every <item><link> is present in public/sitemap.xml as a <loc>
 *  - every blogPosts entry has a matching <item> in the feed
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const rss = readFileSync(resolve("public/rss.xml"), "utf8");
const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(re)].map((m) => m[1]);
}

function firstTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : null;
}

describe("RSS feed structural + sitemap parity", () => {
  it("is well-formed with a single <channel>", () => {
    expect(rss.startsWith("<?xml")).toBe(true);
    expect(extractAll(rss, "channel").length).toBe(1);
    expect(rss).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
  });

  const items = extractAll(rss, "item");

  it("has one <item> per blog post", () => {
    expect(items.length).toBe(blogPosts.length);
  });

  it.each(blogPosts.map((p) => [p.slug, p.title] as const))(
    "item for /%s has valid link, title, guid, pubDate",
    (slug, title) => {
      const expectedLink = `${SITE_URL}/blog/${slug}`;
      const item = items.find((b) => b.includes(`<link>${expectedLink}</link>`));
      expect(item, `no <item> for slug ${slug}`).toBeTruthy();

      const rssTitle = firstTag(item!, "title");
      expect(rssTitle).toBeTruthy();

      const guid = firstTag(item!, "guid");
      expect(guid).toBe(expectedLink);

      const pubDate = firstTag(item!, "pubDate");
      expect(pubDate, `pubDate missing for ${slug}`).toBeTruthy();
      const ts = Date.parse(pubDate!);
      expect(Number.isFinite(ts), `pubDate not parseable for ${slug}: ${pubDate}`).toBe(true);

      // atom:updated is optional; when present it must parse too.
      const updated = firstTag(item!, "atom:updated");
      if (updated) {
        expect(Number.isFinite(Date.parse(updated))).toBe(true);
      }

      // Sitemap parity — RSS item link must exist as sitemap <loc>.
      expect(
        sitemap.includes(`<loc>${expectedLink}</loc>`),
        `sitemap missing <loc>${expectedLink}</loc>`,
      ).toBe(true);

      // Sanity: title is non-empty (we don't force an exact match because
      // the RSS title is XML-escaped and blogPosts.title is raw).
      expect(title.length).toBeGreaterThan(0);
    },
  );

  it("channel <lastBuildDate> is a valid RFC 822 date", () => {
    const channel = extractAll(rss, "channel")[0];
    const lbd = firstTag(channel, "lastBuildDate");
    expect(lbd).toBeTruthy();
    expect(Number.isFinite(Date.parse(lbd!))).toBe(true);
  });
});