/**
 * OG ↔ Twitter parity for both /blog listing and every /blog/:slug page.
 *
 * Asserts twitter:card + twitter:title + twitter:description + twitter:url
 * + twitter:image all match the rendered Open Graph values, and that
 * twitter:url === og:url === <link rel="canonical">.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const meta = (sel: string) =>
  document.querySelector(sel)?.getAttribute("content") ?? null;
const canonical = () =>
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

const assertParity = (label: string, expectedUrl: string) => {
  const c = canonical();
  expect(c, `${label}: canonical missing`).toBe(expectedUrl);

  const ogUrl = meta('meta[property="og:url"]');
  const ogTitle = meta('meta[property="og:title"]');
  const ogDesc = meta('meta[property="og:description"]');
  const ogImage = meta('meta[property="og:image"]');

  const twCard = meta('meta[name="twitter:card"]');
  const twTitle = meta('meta[name="twitter:title"]');
  const twDesc = meta('meta[name="twitter:description"]');
  const twUrl = meta('meta[name="twitter:url"]');
  const twImage = meta('meta[name="twitter:image"]');

  expect(twCard, `${label}: twitter:card`).toBe("summary_large_image");
  expect(twTitle, `${label}: twitter:title == og:title`).toBe(ogTitle);
  expect(twDesc, `${label}: twitter:description == og:description`).toBe(ogDesc);
  expect(twImage, `${label}: twitter:image == og:image`).toBe(ogImage);
  expect(twUrl, `${label}: twitter:url == og:url`).toBe(ogUrl);
  expect(twUrl, `${label}: twitter:url == canonical`).toBe(c);
  expect(ogUrl, `${label}: og:url == canonical`).toBe(c);
  expect(c, `${label}: canonical matches expected`).toBe(expectedUrl);
};

describe("Twitter ↔ OG ↔ canonical parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing", async () => {
    renderRoute("/blog");
    await waitFor(() => {
      expect(meta('meta[name="twitter:url"]')).toBeTruthy();
    });
    assertParity("/blog", `${SITE_URL}/blog`);
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}`, async () => {
      renderRoute(`/blog/${post.slug}`);
      await waitFor(() => {
        expect(meta('meta[name="twitter:url"]')).toBeTruthy();
      });
      assertParity(`/blog/${post.slug}`, `${SITE_URL}/blog/${post.slug}`);
    });
  }
});