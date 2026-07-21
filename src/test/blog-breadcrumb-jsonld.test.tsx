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

const assertBreadcrumbShape = (bc: Breadcrumb) => {
  // Top-level @type must be BreadcrumbList (not just present as an object).
  expect(bc["@type"]).toBe("BreadcrumbList");
  expect(Array.isArray(bc.itemListElement)).toBe(true);
  expect(bc.itemListElement.length).toBeGreaterThanOrEqual(2);

  const seenPositions = new Set<number>();
  bc.itemListElement.forEach((el, i) => {
    expect(el["@type"]).toBe("ListItem");
    // Position must be a number, start at 1, be strictly sequential, and unique.
    expect(typeof el.position).toBe("number");
    expect(Number.isInteger(el.position)).toBe(true);
    expect(el.position).toBe(i + 1);
    expect(seenPositions.has(el.position)).toBe(false);
    seenPositions.add(el.position);

    expect(typeof el.name).toBe("string");
    expect(el.name.length).toBeGreaterThan(0);

    // Every item URL must be an absolute canonical URL on SITE_URL.
    expect(typeof el.item).toBe("string");
    expect(el.item.startsWith(SITE_URL)).toBe(true);
    expect(el.item).toMatch(/^https:\/\//);
  });
};

const readCanonical = (): string | null =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;

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
    assertBreadcrumbShape(bc);
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[0].item).toBe(`${SITE_URL}/`);
    expect(bc.itemListElement[1].item).toBe(`${SITE_URL}/blog`);

    // The last crumb URL must match the page's rendered canonical link.
    const canonical = await waitFor(() => {
      const c = readCanonical();
      expect(c, "canonical link missing on /blog").toBeTruthy();
      return c!;
    });
    expect(bc.itemListElement[bc.itemListElement.length - 1].item).toBe(canonical);
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug} emits [Home → Blog → post] BreadcrumbList`, async () => {
      renderRoute(`/blog/${post.slug}`);
      const bc = await waitFor(() => {
        const found = findBreadcrumb();
        expect(found, `BreadcrumbList missing on /blog/${post.slug}`).toBeTruthy();
        return found!;
      });
      assertBreadcrumbShape(bc);
      expect(bc.itemListElement).toHaveLength(3);
      expect(bc.itemListElement[0].item).toBe(`${SITE_URL}/`);
      expect(bc.itemListElement[1].item).toBe(`${SITE_URL}/blog`);
      expect(bc.itemListElement[2].item).toBe(`${SITE_URL}/blog/${post.slug}`);

      // Terminal crumb must match the rendered canonical URL for this post.
      const canonical = await waitFor(() => {
        const c = readCanonical();
        expect(c, `canonical missing on /blog/${post.slug}`).toBeTruthy();
        return c!;
      });
      expect(canonical).toBe(`${SITE_URL}/blog/${post.slug}`);
      expect(bc.itemListElement[2].item).toBe(canonical);
    });
  }
});