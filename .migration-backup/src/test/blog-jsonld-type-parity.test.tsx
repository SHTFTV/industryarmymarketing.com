/**
 * Confirms the JSON-LD @type parity contract for the blog surface:
 *   • Blog listing (/blog) emits a top-level document schema whose @type
 *     is "Blog" or "WebPage" (both are valid schema.org descriptors for
 *     the listing; the project currently ships "Blog"), whose @id
 *     canonically points at /blog, and whose name matches the rendered
 *     <title>/og:title copy.
 *   • Each blog post emits a BlogPosting whose @id resolves to the post
 *     URL, whose mainEntityOfPage.@id matches the canonical URL, and
 *     whose headline equals the rendered <title>/og:title (post.title).
 *
 * Regression guard: keeps the graph "shape" that Google Rich Results and
 * AI-search crawlers key off from drifting silently.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const readAllJsonLd = (): Array<Record<string, unknown>> => {
  const out: Array<Record<string, unknown>> = [];
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (Array.isArray(j)) out.push(...j);
      else if (j) out.push(j);
    } catch {
      /* ignore */
    }
  }
  return out;
};

const readOgTitle = () =>
  document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute("content") ?? null;

describe("blog JSON-LD @type + @id + name/headline parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog: listing schema is Blog|WebPage with @id + name matching og:title", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/blog"]}>
          <Routes>
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    const { listing, ogTitle } = await waitFor(() => {
      const schemas = readAllJsonLd();
      const l = schemas.find(
        (s) => s["@type"] === "Blog" || s["@type"] === "WebPage",
      );
      const t = readOgTitle();
      expect(l, "no Blog/WebPage schema found on /blog").toBeTruthy();
      expect(t, "og:title missing on /blog").toBeTruthy();
      return { listing: l!, ogTitle: t! };
    });

    expect(String(listing["@id"] ?? "")).toContain(`${SITE_URL}/blog`);
    const name = String(listing.name ?? "");
    expect(name.length, "listing schema.name empty").toBeGreaterThan(0);
    // Listing name is a short brand ("Industry Army Intel") that should
    // appear inside the longer <title>/og:title copy.
    expect(ogTitle.toLowerCase()).toContain(name.toLowerCase());
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}: BlogPosting @id + mainEntityOfPage.@id + headline match`, async () => {
      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={[`/blog/${post.slug}`]}>
            <Routes>
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>,
      );

      const article = await waitFor(() => {
        const schemas = readAllJsonLd();
        const a = schemas.find((s) => s["@type"] === "BlogPosting");
        expect(a, `BlogPosting missing on /blog/${post.slug}`).toBeTruthy();
        return a!;
      });

      const expectedUrl = `${SITE_URL}/blog/${post.slug}`;
      expect(article["@id"]).toBe(`${expectedUrl}#article`);
      const mep = article.mainEntityOfPage as Record<string, unknown>;
      expect(mep?.["@id"]).toBe(expectedUrl);
      expect(article.headline).toBe(post.title);
      // Rendered og:title reflects post.title verbatim.
      expect(readOgTitle()).toBe(post.title);
    });
  }
});