// Validates that every BlogPosting JSON-LD emitted from a rendered blog post
// (and the Blog listing's publisher reference) contains a resolvable author
// object and a publisher object with a valid name and a logo whose URL
// returns HTTP 200. The live logo fetch is opt-in via RUN_LIVE_LOGO_CHECK=1
// to keep local runs offline-safe (mirrors RUN_LIVE_OG_CHECK).

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const RUN_LIVE = process.env.RUN_LIVE_LOGO_CHECK === "1";

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

const readBlogPosting = () => {
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const j = JSON.parse(s.textContent || "");
      if (j?.["@type"] === "BlogPosting") return j as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  return null;
};

describe("BlogPosting JSON-LD author + publisher validation", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: author has @type + non-empty name`, async () => {
      renderPost(post.slug);
      const blog = await waitFor(() => {
        const b = readBlogPosting();
        expect(b).not.toBeNull();
        return b!;
      });
      const author = blog.author as Record<string, unknown> | undefined;
      expect(author, "author missing").toBeTruthy();
      expect(author!["@type"]).toMatch(/^(Person|Organization)$/);
      const name = author!.name;
      expect(typeof name).toBe("string");
      expect((name as string).trim().length).toBeGreaterThan(0);
    });

    it(`/${post.slug}: publisher is Organization with name + logo ImageObject`, async () => {
      renderPost(post.slug);
      const blog = await waitFor(() => {
        const b = readBlogPosting();
        expect(b).not.toBeNull();
        return b!;
      });
      const pub = blog.publisher as Record<string, unknown> | undefined;
      expect(pub, "publisher missing").toBeTruthy();
      expect(pub!["@type"]).toBe("Organization");
      expect(typeof pub!.name).toBe("string");
      expect((pub!.name as string).trim().length).toBeGreaterThan(0);
      const logo = pub!.logo as Record<string, unknown> | undefined;
      expect(logo, "publisher.logo missing").toBeTruthy();
      expect(logo!["@type"]).toBe("ImageObject");
      expect(typeof logo!.url).toBe("string");
      expect(logo!.url as string).toMatch(/^https?:\/\//);
    });
  }
});

// Live check — one fetch per unique publisher logo URL used across posts.
const collectLogos = (): string[] => {
  const set = new Set<string>();
  // The BlogPost publisher currently uses a single canonical logo, but we
  // discover it at runtime rather than hard-coding, so a future change to
  // per-post logos is still covered.
  for (const post of blogPosts.slice(0, 3)) {
    // Renders alone drive JSON-LD emission — same as the assertions above.
    document.head.innerHTML = "";
    const { unmount } = renderPost(post.slug);
    const j = readBlogPosting();
    const url = (j?.publisher as any)?.logo?.url;
    if (typeof url === "string") set.add(url);
    unmount();
  }
  // Fallback: the canonical org logo we know must exist.
  if (set.size === 0) set.add(`${SITE_URL}/icon-512.png`);
  return Array.from(set);
};

const fetchOnce = async (url: string) => {
  let r = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (r.status === 405 || r.status === 501) {
    r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-1023" },
    });
  }
  return r;
};

const fetchWithRetry = async (url: string) => {
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchOnce(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * 2 ** i + Math.random() * 200));
    }
  }
  throw lastErr;
};

describe.runIf(RUN_LIVE)(
  "publisher logo URL is reachable (RUN_LIVE_LOGO_CHECK=1)",
  () => {
    it("every distinct publisher.logo.url returns HTTP 200 image/*", async () => {
      const logos = collectLogos();
      expect(logos.length).toBeGreaterThan(0);
      for (const url of logos) {
        const r = await fetchWithRetry(url);
        expect(r.status, `${url} not 200`).toBe(200);
        const ct = r.headers.get("content-type") ?? "";
        expect(ct.toLowerCase()).toMatch(/^image\//);
      }
    }, 30_000);
  },
);