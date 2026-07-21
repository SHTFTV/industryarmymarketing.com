import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import Blog from "./Blog";
import { blogPosts } from "@/data/blogPosts";

const CANONICAL = "https://industryarmymarketing.com";
const MARKER = /IAM AI Indexing Section/;

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

const renderListing = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/blog"]}>
        <Routes>
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("AIIndexing on blog post pages", () => {
  afterEach(() => cleanup());

  it.each(blogPosts.map((p) => [p.slug]))(
    "renders the IAM AI Indexing section on /blog/%s",
    (slug) => {
      renderPost(slug);
      // Section label is unique to AIIndexing.
      const labels = screen.getAllByText(MARKER);
      expect(labels.length).toBeGreaterThan(0);
    },
  );

  it.each(blogPosts.map((p) => [p.slug]))(
    "wires articleUrl to the canonical URL for /blog/%s",
    (slug) => {
      renderPost(slug);
      const expectedUrl = `${CANONICAL}/blog/${slug}`;
      const encoded = encodeURIComponent(expectedUrl);
      // LinkedIn share button hrefs the encoded articleUrl.
      const linkedin = document.querySelector(
        `a[href*="linkedin.com/sharing/share-offsite/?url=${encoded}"]`,
      );
      expect(
        linkedin,
        `LinkedIn share link must encode ${expectedUrl}`,
      ).not.toBeNull();
      // X share too, defense in depth.
      const x = document.querySelector(
        `a[href*="x.com/intent/tweet"][href*="url=${encoded}"]`,
      );
      expect(x, `X share link must encode ${expectedUrl}`).not.toBeNull();
    },
  );
});

describe("AIIndexing on the blog listing page", () => {
  afterEach(() => cleanup());

  it("does NOT render the IAM AI Indexing section on /blog", () => {
    renderListing();
    expect(screen.queryByText(MARKER)).toBeNull();
  });
});