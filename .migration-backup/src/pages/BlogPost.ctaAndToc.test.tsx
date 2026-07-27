import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { slugifyHeading } from "@/components/BlogToc";

// Silence IntersectionObserver in jsdom.
beforeEach(() => {
  // @ts-expect-error test shim
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null; rootMargin = ""; thresholds = [];
  };
});

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

describe("BlogPost CTA aside routes", () => {
  const sample = blogPosts.slice(0, 3);
  for (const post of sample) {
    it(`${post.slug}: CTA aside links point at valid SEO package + pricing routes`, () => {
      renderPost(post.slug);
      const asides = screen.getAllByRole("complementary", { hidden: true }).concat(
        Array.from(document.querySelectorAll("aside")) as HTMLElement[],
      );
      const aside = asides.find((el) =>
        /seo-packages/.test(el.innerHTML) && /pricing/.test(el.innerHTML),
      );
      expect(aside, "CTA aside with package + pricing links").toBeTruthy();
      const links = within(aside!).getAllByRole("link");
      const hrefs = links.map((a) => a.getAttribute("href"));
      // must include /pricing
      expect(hrefs).toContain("/pricing");
      // must include /seo-packages (compare-all)
      expect(hrefs).toContain("/seo-packages");
      // must include all three tier deep-links
      expect(hrefs).toEqual(
        expect.arrayContaining([
          "/seo-packages/bullets",
          "/seo-packages/boom",
          "/seo-packages/bombs",
        ]),
      );
      // Every link is a same-origin path — no accidental externals.
      hrefs.forEach((h) => {
        expect(h).toMatch(/^\/(seo-packages|pricing)/);
      });
    });
  }
});

describe("BlogPost TOC jump links", () => {
  const sample = blogPosts.slice(0, 4);
  for (const post of sample) {
    it(`${post.slug}: every TOC link resolves to a heading with matching id`, () => {
      renderPost(post.slug);
      const toc = screen.getByTestId("blog-toc");
      const jumps = within(toc).getAllByRole("link");
      expect(jumps.length).toBeGreaterThanOrEqual(2);

      const targets: string[] = [];
      for (const a of jumps) {
        const href = a.getAttribute("href") ?? "";
        expect(href.startsWith("#")).toBe(true);
        const id = href.slice(1);
        targets.push(id);
        const el = document.getElementById(id);
        expect(el, `heading #${id} missing`).toBeTruthy();
        expect(el!.tagName).toBe("H2");
      }

      // The FAQ heading must be one of them.
      const faqHeading =
        post.faqHeading ?? `Frequently asked: ${post.trade} in ${post.city}`;
      expect(targets).toContain(slugifyHeading(faqHeading));
    });
  }
});

describe("BlogPost Article JSON-LD", () => {
  const sample = blogPosts.slice(0, 3);
  for (const post of sample) {
    it(`${post.slug}: emits a BlogPosting schema with headline/description/image/dates`, () => {
      renderPost(post.slug);
      // Helmet writes into document.head asynchronously; wait a tick.
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const scripts = Array.from(
            document.head.querySelectorAll('script[type="application/ld+json"]'),
          );
          const schemas = scripts.map((s) => JSON.parse(s.textContent || "{}"));
          const article = schemas.find((s) => s["@type"] === "BlogPosting");
          expect(article, "BlogPosting schema present").toBeTruthy();
          expect(article.headline).toBe(post.title);
          expect(article.description).toBe(post.metaDescription);
          expect(article.url).toMatch(new RegExp(`/blog/${post.slug}$`));
          expect(article.image?.url).toMatch(/^https?:\/\//);
          expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(article.publisher?.name).toBe("Industry Army Marketing");
          resolve();
        }, 10);
      });
    });
  }
});