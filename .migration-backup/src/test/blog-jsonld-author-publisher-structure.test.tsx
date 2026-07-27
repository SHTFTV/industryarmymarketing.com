// Structural JSON-LD validation for the author + publisher objects on
// every rendered blog post. Complements
// `blog-jsonld-author-publisher.test.tsx` (which is presence-focused
// and gates a live logo fetch behind RUN_LIVE_LOGO_CHECK): this suite
// enforces the full shape required by search engines:
//
//   author:
//     - @type ∈ {Person, Organization}
//     - name: non-empty string
//     - at least one of {url, sameAs} present and populated with
//       absolute https URLs (sameAs may be a string or a string[])
//     - image (if present): absolute URL or ImageObject with .url
//
//   publisher:
//     - @type === "Organization"
//     - name: non-empty string
//     - url: absolute https URL
//     - logo: ImageObject with absolute .url and (width & height
//       when present) numeric
//
// Any missing/typo'd property fails loudly with the offending slug in
// the assertion label so triage is one grep away.

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";

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

const readBlogPosting = (): Record<string, unknown> | null => {
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (j?.["@type"] === "BlogPosting") return j as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  return null;
};

const isAbsHttps = (v: unknown): v is string =>
  typeof v === "string" && /^https:\/\/[^\s]+$/i.test(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const collectSameAs = (raw: unknown): string[] => {
  if (raw == null) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  return [];
};

describe("BlogPosting JSON-LD author + publisher — full structural shape", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: author has name + (url or sameAs) with absolute URLs`, async () => {
      renderPost(post.slug);
      const blog = await waitFor(() => {
        const b = readBlogPosting();
        expect(b, `BlogPosting JSON-LD missing for ${post.slug}`).not.toBeNull();
        return b!;
      });

      const author = blog.author as Record<string, unknown> | undefined;
      expect(author, `author missing on ${post.slug}`).toBeTruthy();

      // @type
      const t = author!["@type"];
      expect(t, `author.@type on ${post.slug} = ${String(t)}`).toMatch(
        /^(Person|Organization)$/,
      );

      // name
      expect(
        isNonEmptyString(author!.name),
        `author.name on ${post.slug} must be non-empty string, got ${JSON.stringify(author!.name)}`,
      ).toBe(true);

      // url and/or sameAs — at least one must resolve to ≥1 absolute https URL
      const urlValue = author!.url;
      const sameAsValues = collectSameAs(author!.sameAs);
      const hasValidUrl = isAbsHttps(urlValue);
      const hasValidSameAs =
        sameAsValues.length > 0 && sameAsValues.every(isAbsHttps);

      expect(
        hasValidUrl || hasValidSameAs,
        `author on ${post.slug} needs url or sameAs (got url=${JSON.stringify(urlValue)}, sameAs=${JSON.stringify(author!.sameAs)})`,
      ).toBe(true);

      // image is optional, but if present must be an absolute URL or
      // an ImageObject with an absolute url property.
      if (author!.image !== undefined) {
        const img = author!.image;
        if (typeof img === "string") {
          expect(
            isAbsHttps(img),
            `author.image on ${post.slug} must be absolute https URL, got "${img}"`,
          ).toBe(true);
        } else if (img && typeof img === "object") {
          const obj = img as Record<string, unknown>;
          expect(obj["@type"]).toBe("ImageObject");
          expect(
            isAbsHttps(obj.url),
            `author.image.url on ${post.slug} must be absolute https URL, got ${JSON.stringify(obj.url)}`,
          ).toBe(true);
        } else {
          throw new Error(
            `author.image on ${post.slug} must be string or ImageObject`,
          );
        }
      }
    });

    it(`/${post.slug}: publisher is Organization with name, url, logo.url`, async () => {
      renderPost(post.slug);
      const blog = await waitFor(() => {
        const b = readBlogPosting();
        expect(b, `BlogPosting JSON-LD missing for ${post.slug}`).not.toBeNull();
        return b!;
      });

      const pub = blog.publisher as Record<string, unknown> | undefined;
      expect(pub, `publisher missing on ${post.slug}`).toBeTruthy();
      expect(pub!["@type"]).toBe("Organization");

      expect(
        isNonEmptyString(pub!.name),
        `publisher.name on ${post.slug} must be non-empty string`,
      ).toBe(true);

      // Organization needs a URL so search engines can attribute the
      // brand to a canonical origin; a missing url is a common cause
      // of "site name" mismatches in SERPs.
      expect(
        isAbsHttps(pub!.url),
        `publisher.url on ${post.slug} must be absolute https URL, got ${JSON.stringify(pub!.url)}`,
      ).toBe(true);

      const logo = pub!.logo as Record<string, unknown> | undefined;
      expect(logo, `publisher.logo missing on ${post.slug}`).toBeTruthy();
      expect(logo!["@type"]).toBe("ImageObject");
      expect(
        isAbsHttps(logo!.url),
        `publisher.logo.url on ${post.slug} must be absolute https URL, got ${JSON.stringify(logo!.url)}`,
      ).toBe(true);

      // width/height are optional in schema.org, but if present they
      // MUST be numeric — string dimensions silently fail Google's
      // logo eligibility check.
      for (const dim of ["width", "height"] as const) {
        if (logo![dim] !== undefined) {
          expect(
            typeof logo![dim] === "number" && Number.isFinite(logo![dim] as number),
            `publisher.logo.${dim} on ${post.slug} must be a finite number when present, got ${JSON.stringify(logo![dim])}`,
          ).toBe(true);
        }
      }
    });
  }
});