/**
 * Assert Twitter Card tags are present and consistent with the Open Graph
 * title/description/image on every rendered blog post page. Renders through
 * the real Seo component so any drift between OG and Twitter (missing card,
 * mismatched image, missing image alt) fails here rather than in production.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";

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

const metaContent = (selector: string) =>
  document.querySelector(selector)?.getAttribute("content") ?? null;

describe("Blog post Twitter ↔ Open Graph parity (all posts)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: twitter:card + twitter:image + twitter:image:alt are set and consistent with OG`, async () => {
      renderPost(post.slug);
      await waitFor(() => {
        expect(metaContent('meta[property="og:title"]')).toBeTruthy();
      });

      const twCard = metaContent('meta[name="twitter:card"]');
      const twImage = metaContent('meta[name="twitter:image"]');
      const twImageAlt = metaContent('meta[name="twitter:image:alt"]');
      const twTitle = metaContent('meta[name="twitter:title"]');
      const twDesc = metaContent('meta[name="twitter:description"]');

      const ogTitle = metaContent('meta[property="og:title"]');
      const ogDesc = metaContent('meta[property="og:description"]');
      const ogImage = metaContent('meta[property="og:image"]');
      const ogImageAlt = metaContent('meta[property="og:image:alt"]');

      expect(twCard, "twitter:card").toBe("summary_large_image");
      expect(twImage, "twitter:image").toBeTruthy();
      expect(twImageAlt, "twitter:image:alt").toBeTruthy();

      // Consistency with Open Graph — the crawlers that read Twitter tags
      // should see the same title/description/image that OG advertises.
      expect(twTitle, "twitter:title == og:title").toBe(ogTitle);
      expect(twDesc, "twitter:description == og:description").toBe(ogDesc);
      expect(twImage, "twitter:image == og:image").toBe(ogImage);
      expect(twImageAlt, "twitter:image:alt == og:image:alt").toBe(ogImageAlt);
    });
  }
});
