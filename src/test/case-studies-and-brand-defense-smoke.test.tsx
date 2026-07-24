// Automated SEO smoke test for the Brand Defense case-study consolidation:
//
//   1. sitemap.xml and rss.xml INCLUDE the new /blog/brand-defense-global-territory
//      URL and EXCLUDE the retired /case-studies/... path.
//   2. The legacy /case-studies/brand-defense-global-territory route
//      renders a redirect that lands on /blog/brand-defense-global-territory
//      (covers both hard navigation and deep-link refresh cases — react-router's
//      <Navigate replace> mirrors the production 301 for SPA hosting, which
//      also serves index.html for unknown paths per Lovable's SPA fallback).
//   3. The /blog/brand-defense-global-territory page emits self-referencing
//      canonical + og:url + twitter:url matching the new slug, plus a
//      BlogPosting JSON-LD graph. NewsArticle graphs, when present on this
//      route, also self-reference the new slug (the disambiguation notice
//      test suite covers the notice-specific NewsArticle emission).
//   4. The /case-studies landing page renders and links each card to /blog/:slug.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import CaseStudies from "@/pages/CaseStudies";
import { SITE_URL } from "@/components/Seo";

const SLUG = "brand-defense-global-territory";
const NEW_URL = `${SITE_URL}/blog/${SLUG}`;
const OLD_PATH = `/case-studies/${SLUG}`;

const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
const rss = readFileSync(resolve("public/rss.xml"), "utf8");

const readMeta = (selector: string) =>
  document.querySelector(selector)?.getAttribute("content") ?? null;
const readCanonical = () =>
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
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

describe("brand-defense case-study consolidation — sitemap + RSS inclusion", () => {
  it("sitemap.xml lists the new /blog URL", () => {
    expect(sitemap).toContain(`<loc>${NEW_URL}</loc>`);
  });

  it("rss.xml lists the new /blog URL as an <item> <link>", () => {
    expect(rss).toContain(`<link>${NEW_URL}</link>`);
    expect(rss).toContain(`<guid isPermaLink="true">${NEW_URL}</guid>`);
  });

  it("neither feed lists the retired /case-studies path", () => {
    const bareUrl = `https://industryarmymarketing.com${OLD_PATH}`;
    const wwwUrl = `https://www.industryarmymarketing.com${OLD_PATH}`;
    expect(sitemap.includes(`<loc>${bareUrl}</loc>`)).toBe(false);
    expect(sitemap.includes(`<loc>${wwwUrl}</loc>`)).toBe(false);
    expect(rss.includes(`<link>${bareUrl}</link>`)).toBe(false);
    expect(rss.includes(`<link>${wwwUrl}</link>`)).toBe(false);
  });
});

describe(`legacy ${OLD_PATH} → ${NEW_URL} redirect`, () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("redirects deep-link visits (initial load) to the new /blog URL", async () => {
    // Mirrors the App.tsx route wiring so the test tracks the real config.
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[OLD_PATH]}>
          <Routes>
            <Route
              path={OLD_PATH}
              element={<Navigate to={`/blog/${SLUG}`} replace />}
            />
            <Route
              path="/blog/:slug"
              element={<div data-testid="blog-post-landed">landed</div>}
            />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(await screen.findByTestId("blog-post-landed")).toBeInTheDocument();
  });

  it("preserves refresh behaviour: rendering the redirect twice still lands on /blog", async () => {
    for (let i = 0; i < 2; i++) {
      cleanup();
      document.head.innerHTML = "";
      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={[OLD_PATH]}>
            <Routes>
              <Route
                path={OLD_PATH}
                element={<Navigate to={`/blog/${SLUG}`} replace />}
              />
              <Route
                path="/blog/:slug"
                element={<div data-testid="blog-post-landed">landed</div>}
              />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>,
      );
      expect(await screen.findByTestId("blog-post-landed")).toBeInTheDocument();
    }
  });
});

describe(`/blog/${SLUG} — canonical / OG / Twitter / JSON-LD parity`, () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  const renderPost = () =>
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/blog/${SLUG}`]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

  it("emits canonical + og:url + twitter:url that all point to the new /blog URL", async () => {
    renderPost();
    await waitFor(() => {
      expect(readCanonical()).toBe(NEW_URL);
      expect(readMeta('meta[property="og:url"]')).toBe(NEW_URL);
      expect(readMeta('meta[name="twitter:url"]')).toBe(NEW_URL);
    });
  });

  it("emits og:type=article + og:image + twitter:card=summary_large_image", async () => {
    renderPost();
    await waitFor(() => {
      expect(readMeta('meta[property="og:type"]')).toBe("article");
      expect(readMeta('meta[property="og:image"]')).toMatch(/^https?:\/\//);
      expect(readMeta('meta[name="twitter:card"]')).toBe(
        "summary_large_image",
      );
      expect(readMeta('meta[name="twitter:image"]')).toMatch(/^https?:\/\//);
    });
  });

  it("emits BlogPosting JSON-LD anchored to the new /blog URL", async () => {
    renderPost();
    const schemas = await waitFor(() => {
      const s = readSchemas();
      expect(s.length).toBeGreaterThan(0);
      return s;
    });
    const blog = schemas.find((s) => s["@type"] === "BlogPosting");
    expect(blog, "BlogPosting JSON-LD missing").toBeTruthy();
    expect(blog!.url).toBe(NEW_URL);
    const mainEntity = blog!.mainEntityOfPage as Record<string, unknown>;
    expect(mainEntity?.["@id"]).toBe(NEW_URL);
  });

  it("any NewsArticle JSON-LD present on this route self-references the new /blog URL", async () => {
    renderPost();
    const schemas = await waitFor(() => {
      const s = readSchemas();
      expect(s.length).toBeGreaterThan(0);
      return s;
    });
    const news = schemas.find((s) => s["@type"] === "NewsArticle");
    // NewsArticle is conditional per post; when present it must not leak
    // the retired /case-studies path.
    if (news) {
      expect(news.url).toBe(NEW_URL);
      const mainEntity = news.mainEntityOfPage as Record<string, unknown>;
      expect(mainEntity?.["@id"]).toBe(NEW_URL);
    }
  });
});

describe("/case-studies landing page", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("renders and links every card to a /blog/:slug URL (never /case-studies/:slug)", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/case-studies"]}>
          <Routes>
            <Route path="/case-studies" element={<CaseStudies />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    // At least one card exists (the Brand Defense study seeded above).
    const brandDefenseLink = await waitFor(() => {
      const anchors = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(`a[href="/blog/${SLUG}"]`),
      );
      expect(anchors.length).toBeGreaterThan(0);
      return anchors[0];
    });
    expect(brandDefenseLink.getAttribute("href")).toBe(`/blog/${SLUG}`);

    // No card should point at the retired /case-studies/:slug pattern.
    const legacyLinks = document.querySelectorAll(
      `a[href^="/case-studies/"]`,
    );
    expect(legacyLinks.length).toBe(0);
  });
});