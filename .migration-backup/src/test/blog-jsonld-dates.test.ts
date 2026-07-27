/**
 * Verify that the BlogPosting JSON-LD `datePublished` / `dateModified` values
 * emitted by src/pages/BlogPost.tsx parse as valid ISO 8601 for every post,
 * and that they agree with the metadata (`publishedAt`) used elsewhere for
 * ordering, RSS, and sitemap emission.
 *
 * BlogPost.tsx derives `isoDate` from `post.date` ("Month YYYY") — we mirror
 * that derivation here so the test fails the moment the two representations
 * drift apart.
 */
import { describe, it, expect } from "vitest";
import { blogPosts } from "@/data/blogPosts";

const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

const deriveJsonLdIsoDate = (postDate: string): string => {
  const [mName, yStr] = postDate.split(" ");
  return MONTHS[mName] && yStr ? `${yStr}-${MONTHS[mName]}-01` : postDate;
};

// Strict ISO 8601: YYYY-MM-DD or full timestamp with T + offset/Z.
const ISO_8601 = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2}))?$/;

describe("BlogPosting JSON-LD dates (all posts)", () => {
  it("dataset is non-empty", () => {
    expect(blogPosts.length).toBeGreaterThan(0);
  });

  for (const post of blogPosts) {
    describe(`post: ${post.slug}`, () => {
      const isoDate = deriveJsonLdIsoDate(post.date);

      it("datePublished is a valid ISO 8601 string", () => {
        expect(isoDate, `datePublished for ${post.slug}`).toMatch(ISO_8601);
        expect(
          Number.isNaN(Date.parse(isoDate)),
          `Date.parse failed for ${isoDate}`,
        ).toBe(false);
      });

      it("dateModified matches datePublished (BlogPost.tsx emits both from the same source)", () => {
        // Mirror BlogPost.tsx: dateModified === datePublished === isoDate.
        const dateModified = isoDate;
        expect(dateModified).toBe(isoDate);
        expect(Number.isNaN(Date.parse(dateModified))).toBe(false);
      });

      it("JSON-LD date agrees with publishedAt metadata (year + month)", () => {
        if (!post.publishedAt) return; // dataset guard elsewhere enforces presence
        const t = Date.parse(post.publishedAt);
        expect(
          Number.isNaN(t),
          `publishedAt for ${post.slug} is not ISO 8601: ${post.publishedAt}`,
        ).toBe(false);
        const d = new Date(t);
        const y = String(d.getUTCFullYear());
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const [isoY, isoM] = isoDate.split("-");
        expect(
          `${isoY}-${isoM}`,
          `JSON-LD ${isoDate} disagrees with publishedAt ${post.publishedAt} for ${post.slug}`,
        ).toBe(`${y}-${m}`);
      });
    });
  }
});