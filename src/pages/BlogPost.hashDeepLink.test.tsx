import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogPost from "./BlogPost";
import { blogPosts, getPost } from "@/data/blogPosts";
import { slugifyHeading } from "@/components/BlogToc";

// jsdom shims — IntersectionObserver is used by TOC + ReadingProgress,
// scrollIntoView is asserted below, matchMedia is used to detect reduced
// motion in the smooth-scroll effect.
beforeEach(() => {
  // @ts-expect-error jsdom shim
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  };
  Element.prototype.scrollIntoView = vi.fn();
  window.history.replaceState(null, "", "/");
  document.head.innerHTML = "";
});

const renderPost = (slug: string, hash: string) => {
  // BlogToc/BlogPost read window.location.hash directly, so drive jsdom's
  // real URL alongside MemoryRouter's initial entry.
  window.history.replaceState(null, "", `/blog/${slug}${hash}`);
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}${hash}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
};

const richPost = getPost("beyond-domain-name-entity-authority-modern-seo")!;
const fallbackPost = getPost("contractor-marketing-disruptor")!;

describe("BlogPost hash-on-load deep linking", () => {
  it("rich-content path: TOC heading hash smooth-scrolls and marks active", async () => {
    const heading = richPost.richContent!.sections[0].heading;
    const id = slugifyHeading(heading);
    const { container } = renderPost(richPost.slug, `#${id}`);

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calls = (Element.prototype.scrollIntoView as any).mock.calls as unknown[][];
      expect(calls.length).toBeGreaterThan(0);
      const smooth = calls.some(
        (c) => (c[0] as { behavior?: string } | undefined)?.behavior === "smooth",
      );
      expect(smooth).toBe(true);
    });

    await waitFor(() => {
      const active = container.querySelector('[data-active="true"]');
      expect(active).toBeTruthy();
      expect(active?.getAttribute("href")).toBe(`#${id}`);
      expect(active?.getAttribute("aria-current")).toBe("location");
    });
  });

  it("fallback path: TOC heading hash smooth-scrolls and marks active", async () => {
    const heading = `Why ${fallbackPost.trade} in ${fallbackPost.city} is different from anywhere else in Canada`;
    const id = slugifyHeading(heading);
    const { container } = renderPost(fallbackPost.slug, `#${id}`);

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calls = (Element.prototype.scrollIntoView as any).mock.calls as unknown[][];
      expect(calls.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const active = container.querySelector('[data-active="true"]');
      expect(active?.getAttribute("href")).toBe(`#${id}`);
    });
  });

  it("FAQ hash: highlights the FAQ card and smooth-scrolls into view", async () => {
    const faq = richPost.faqs[0];
    const id = `faq-${slugifyHeading(faq.q)}`;
    const { container } = renderPost(richPost.slug, `#${id}`);

    await waitFor(() => {
      const el = container.querySelector(`[id="${id}"]`);
      expect(el).toBeTruthy();
      expect(el?.getAttribute("data-highlighted")).toBe("true");
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calls = (Element.prototype.scrollIntoView as any).mock.calls as unknown[][];
    expect(calls.length).toBeGreaterThan(0);
    const smooth = calls.some(
      (c) => (c[0] as { behavior?: string } | undefined)?.behavior === "smooth",
    );
    expect(smooth).toBe(true);
  });

  it("no hash: no FAQ card is highlighted", async () => {
    const { container } = renderPost(richPost.slug, "");
    // Give effects a tick to settle.
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector('[data-highlighted="true"]')).toBeNull();
  });

  it("unrelated TOC hash for a fallback post does not touch FAQ highlight", async () => {
    const faqHeading =
      fallbackPost.faqHeading ??
      `Frequently asked: ${fallbackPost.trade} in ${fallbackPost.city}`;
    const id = slugifyHeading(faqHeading);
    // TOC anchors are plain slugs (no faq- prefix), so the FAQ highlight
    // effect must not fire for these.
    const { container } = renderPost(fallbackPost.slug, `#${id}`);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector('[data-highlighted="true"]')).toBeNull();
  });
});

describe("BlogPost read-time estimate", () => {
  it("computes read minutes from actual word count, not a fixed default", () => {
    // Every post has enough words to exceed 1 minute; check the "N min read"
    // label reflects the per-post value rather than a hardcoded 10.
    for (const post of blogPosts.slice(0, 5)) {
      const { container, unmount } = renderPost(post.slug, "");
      const meta = Array.from(container.querySelectorAll("p")).find((p) =>
        /min read/.test(p.textContent ?? ""),
      );
      expect(meta, `meta line missing on /blog/${post.slug}`).toBeTruthy();
      const m = meta!.textContent!.match(/(\d+)\s*min read/);
      expect(m).toBeTruthy();
      const minutes = Number(m![1]);
      expect(minutes).toBeGreaterThanOrEqual(1);
      expect(minutes).toBeLessThan(120);
      unmount();
    }
  });
});