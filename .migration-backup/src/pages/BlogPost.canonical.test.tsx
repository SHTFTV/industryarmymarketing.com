// Validates that each blog post renders:
//   1) a self-referencing <link rel="canonical"> and og:url,
//   2) BlogPosting JSON-LD with the schema.org-required fields
//      (@context, @type, headline, image, datePublished, author, publisher)
//      populated with the right values,
//   3) BreadcrumbList JSON-LD with position-ordered ListItems whose final
//      item points at the post URL.
// Runs against every entry in src/data/blogPosts.ts so drift is caught the
// moment a post is added or edited.

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

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

const readSchemas = () =>
  Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => {
      try {
        return JSON.parse(s.textContent || "");
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

const readMeta = (property: string) =>
  document
    .querySelector(`meta[property="${property}"]`)
    ?.getAttribute("content") ?? null;

const readCanonical = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;

describe("BlogPost canonical URL + schema.org JSON-LD", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: canonical + og:url self-reference the post URL`, async () => {
      renderPost(post.slug);
      const expected = `${SITE_URL}/blog/${post.slug}`;
      await waitFor(() => {
        expect(readCanonical()).toBe(expected);
        expect(readMeta("og:url")).toBe(expected);
      });
    });

    it(`/${post.slug}: BlogPosting JSON-LD conforms to schema.org expectations`, async () => {
      renderPost(post.slug);
      const schemas = await waitFor(() => {
        const s = readSchemas();
        expect(s.length).toBeGreaterThan(0);
        return s;
      });
      const blog = schemas.find((s) => s["@type"] === "BlogPosting");
      expect(blog, `BlogPosting missing on /blog/${post.slug}`).toBeTruthy();

      // Required @context per schema.org
      expect(blog!["@context"]).toBe("https://schema.org");
      // Google's required BlogPosting fields
      expect(blog!.headline).toBe(post.title);
      expect(typeof blog!.headline).toBe("string");
      expect((blog!.headline as string).length).toBeLessThanOrEqual(110);
      expect(blog!.url).toBe(`${SITE_URL}/blog/${post.slug}`);
      expect(blog!.description).toBe(post.metaDescription);

      // datePublished must be ISO-parseable
      const published = blog!.datePublished as string;
      expect(published, "datePublished missing").toBeTruthy();
      expect(Number.isNaN(new Date(published).getTime())).toBe(false);

      // author / publisher shapes
      const author = blog!.author as Record<string, unknown>;
      expect(author).toBeTruthy();
      expect(author["@type"]).toMatch(/^(Person|Organization)$/);
      expect(typeof author.name).toBe("string");

      const publisher = blog!.publisher as Record<string, unknown>;
      expect(publisher).toBeTruthy();
      expect(publisher["@type"]).toBe("Organization");
      const logo = publisher.logo as Record<string, unknown> | undefined;
      expect(logo?.["@type"]).toBe("ImageObject");
      expect(typeof logo?.url).toBe("string");

      // image must be an absolute URL, either as string or ImageObject.url
      const image = blog!.image as string | Record<string, unknown>;
      const imageUrl =
        typeof image === "string" ? image : (image?.url as string | undefined);
      expect(imageUrl, "image URL missing").toBeTruthy();
      expect(/^https?:\/\//.test(imageUrl!)).toBe(true);

      // mainEntityOfPage should self-reference the post
      const mainEntity = blog!.mainEntityOfPage as Record<string, unknown>;
      expect(mainEntity?.["@id"]).toBe(`${SITE_URL}/blog/${post.slug}`);
    });

    it(`/${post.slug}: BreadcrumbList is ordered and ends on this post`, async () => {
      renderPost(post.slug);
      const schemas = await waitFor(() => {
        const s = readSchemas();
        expect(s.length).toBeGreaterThan(0);
        return s;
      });
      const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
      expect(bc, "BreadcrumbList missing").toBeTruthy();
      const items = bc!.itemListElement as Array<Record<string, unknown>>;
      expect(Array.isArray(items)).toBe(true);
      // positions must be 1..N in order
      items.forEach((it, i) => {
        expect(it["@type"]).toBe("ListItem");
        expect(it.position).toBe(i + 1);
        expect(typeof it.name).toBe("string");
        expect(typeof it.item).toBe("string");
      });
      expect(items[items.length - 1].item).toBe(`${SITE_URL}/blog/${post.slug}`);
    });
  }
});