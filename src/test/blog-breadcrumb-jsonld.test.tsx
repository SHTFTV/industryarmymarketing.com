/**
 * BreadcrumbList JSON-LD must be emitted on:
 *   - /blog listing            → [Home, Blog]
 *   - /blog/:slug post pages   → [Home, Blog, <post>]
 *
 * Each ListItem must have a numeric `position` starting at 1 and increasing
 * by 1, and `item` URLs must be the canonical absolute URLs on SITE_URL.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

type BreadcrumbItem = { "@type": string; position: number; name: string; item: string };
type Breadcrumb = { "@type": string; itemListElement: BreadcrumbItem[] };

const readAllJsonLd = (): unknown[] => {
  const nodes = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  return nodes.flatMap((n) => {
    try {
      const parsed = JSON.parse(n.textContent || "null");
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
};

const findBreadcrumb = (): Breadcrumb | undefined =>
  readAllJsonLd().find(
    (s): s is Breadcrumb =>
      typeof s === "object" &&
      s !== null &&
      (s as { "@type"?: string })["@type"] === "BreadcrumbList",
  );

const assertPositionsValid = (bc: Breadcrumb) => {
  expect(bc.itemListElement.length).toBeGreaterThanOrEqual(2);
  bc.itemListElement.forEach((el, i) => {
    expect(el["@type"]).toBe("ListItem");
    expect(el.position).toBe(i + 1);
    expect(typeof el.name).toBe("string");
    expect(el.name.length).toBeGreaterThan(0);
    expect(el.item).toMatch(/^https?:\/\//);
  });
};

const renderRoute = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("BreadcrumbList JSON-LD parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing emits [Home → Blog] BreadcrumbList", async () => {
    renderRoute("/blog");
    const bc = await waitFor(() => {
      const found = findBreadcrumb();
      expect(found, "BreadcrumbList missing on /blog").toBeTruthy();
      return found!;
    });
    assertPositionsValid(bc);
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[0].item).toBe(`${SITE_URL}/`);
    expect(bc.itemListElement[1].item).toBe(`${SITE_URL}/blog`);
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug} emits [Home → Blog → post] BreadcrumbList`, async () => {
      renderRoute(`/blog/${post.slug}`);
      const bc = await waitFor(() => {
        const found = findBreadcrumb();
        expect(found, `BreadcrumbList missing on /blog/${post.slug}`).toBeTruthy();
        return found!;
      });
      assertPositionsValid(bc);
      expect(bc.itemListElement).toHaveLength(3);
      expect(bc.itemListElement[0].item).toBe(`${SITE_URL}/`);
      expect(bc.itemListElement[1].item).toBe(`${SITE_URL}/blog`);
      expect(bc.itemListElement[2].item).toBe(`${SITE_URL}/blog/${post.slug}`);
    });
  }
});