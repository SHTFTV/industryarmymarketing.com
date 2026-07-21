/**
 * HTML <meta name="description"> must match og:description and
 * twitter:description on both the /blog listing and every /blog/:slug
 * page. Prevents drift where a copy edit lands in one tag but not the
 * other two (which is common when a page is customised outside <Seo>).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";

const meta = (sel: string) =>
  document.querySelector(sel)?.getAttribute("content") ?? null;

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

const assertDescriptionParity = (label: string) => {
  const nameDesc = meta('meta[name="description"]');
  const ogDesc = meta('meta[property="og:description"]');
  const twDesc = meta('meta[name="twitter:description"]');

  expect(nameDesc, `${label}: <meta name="description"> missing`).toBeTruthy();
  expect(ogDesc, `${label}: og:description missing`).toBeTruthy();
  expect(twDesc, `${label}: twitter:description missing`).toBeTruthy();

  expect(
    nameDesc,
    `${label}: <meta name="description"> !== og:description`,
  ).toBe(ogDesc);
  expect(
    nameDesc,
    `${label}: <meta name="description"> !== twitter:description`,
  ).toBe(twDesc);
  expect(ogDesc, `${label}: og:description !== twitter:description`).toBe(
    twDesc,
  );
};

describe("meta description ↔ og:description ↔ twitter:description parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing", async () => {
    renderRoute("/blog");
    await waitFor(() => {
      expect(meta('meta[name="description"]')).toBeTruthy();
    });
    assertDescriptionParity("/blog");
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}`, async () => {
      renderRoute(`/blog/${post.slug}`);
      await waitFor(() => {
        expect(meta('meta[name="description"]')).toBeTruthy();
      });
      assertDescriptionParity(`/blog/${post.slug}`);
    });
  }
});
