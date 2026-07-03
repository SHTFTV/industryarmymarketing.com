import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";

const renderPost = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const parseSchemas = () =>
  Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => {
      try {
        return JSON.parse(s.textContent || "");
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

// Anything in this list would indicate un-stripped Lovable/debug artifacts
// leaking into the rendered post page.
const FORBIDDEN_MARKERS = [
  "lovable.app",
  "lovable.dev",
  "gpteng.co",
  "Edit with Lovable",
  "Lovable Generated Project",
  "Lovable App",
];

describe("BlogPost JSON-LD schemas + no debug/branding leakage", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: emits BlogPosting JSON-LD self-referencing the route`, async () => {
      renderPost(post.slug);
      const schemas = await waitFor(() => {
        const parsed = parseSchemas();
        expect(parsed.length).toBeGreaterThan(0);
        return parsed;
      });
      const blog = schemas.find((s) => s["@type"] === "BlogPosting");
      expect(blog, `BlogPosting missing on /blog/${post.slug}`).toBeTruthy();
      expect(blog!.url).toBe(`https://industryarmymarketing.com/blog/${post.slug}`);
      expect(blog!.headline).toBe(post.title);
      expect(blog!.description).toBe(post.metaDescription);
      expect(blog!.publisher).toBeTruthy();
      expect(blog!.image).toBeTruthy();
    });

    it(`/${post.slug}: emits BreadcrumbList JSON-LD ending on the post`, async () => {
      renderPost(post.slug);
      const schemas = await waitFor(() => {
        const parsed = parseSchemas();
        expect(parsed.length).toBeGreaterThan(0);
        return parsed;
      });
      const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
      expect(bc, `BreadcrumbList missing on /blog/${post.slug}`).toBeTruthy();
      const items = bc!.itemListElement as Array<Record<string, unknown>>;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(3);
      expect(items[2].item).toBe(`https://industryarmymarketing.com/blog/${post.slug}`);
    });

    it(`/${post.slug}: rendered HTML contains no Lovable branding or debug markers`, () => {
      const { container } = renderPost(post.slug);
      const html = (container.innerHTML + document.head.innerHTML).toLowerCase();
      for (const marker of FORBIDDEN_MARKERS) {
        expect(
          html.includes(marker.toLowerCase()),
          `forbidden marker '${marker}' found on /blog/${post.slug}`,
        ).toBe(false);
      }
    });
  }
});