// Enforces that canonical === og:url === twitter:url, and that every
// one of those values matches the EXACT string emitted in
// public/sitemap.xml for the same route. "Exact" here means
// character-for-character equality — no trailing slash drift, no
// protocol swap, no host substitution.
//
// Why the redundancy vs. existing parity tests:
//   - blog-og-url-parity.test.tsx    → canonical ↔ og:url ↔ sitemap
//   - blog-twitter-og-parity.test.tsx → twitter:* ↔ og:*
// Neither closes the loop that twitter:url specifically matches the
// sitemap-formatted canonical. This suite does.

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");

// Build a map { pathname → exact <loc> string as it appears in the XML }.
// We key by pathname so per-route lookups don't need to reconstruct the
// origin (the origin comes from whatever the sitemap emitted).
const locsByPath: Record<string, string> = {};
for (const m of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const raw = m[1].trim();
  try {
    const u = new URL(raw);
    // Normalize only for the KEY (pathname lookup); the VALUE stays
    // exact so equality assertions catch trailing-slash drift.
    locsByPath[u.pathname.replace(/\/+$/, "") || "/"] = raw;
  } catch {
    /* skip malformed entries — other tests catch those */
  }
}

const readMeta = (
  name: string,
  attr: "name" | "property" = "property",
): string | null =>
  document
    .querySelector(`meta[${attr}="${name}"]`)
    ?.getAttribute("content") ?? null;

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

async function assertParityFor(path: string, sitemapKey: string) {
  renderRoute(path);
  const canonical = await waitFor(() => {
    const c = readCanonical();
    expect(c, `canonical missing on ${path}`).toBeTruthy();
    return c!;
  });

  const ogUrl = readMeta("og:url");
  // twitter:url is a `name=` meta (not `property=`), per the Twitter
  // Cards spec — read it via the correct attribute.
  const twitterUrl = readMeta("twitter:url", "name");

  const expected = locsByPath[sitemapKey];
  expect(
    expected,
    `sitemap.xml has no <loc> for pathname "${sitemapKey}"`,
  ).toBeTruthy();

  // Character-for-character equality — the whole point of this suite.
  expect(canonical, `canonical !== sitemap <loc> on ${path}`).toBe(expected);
  expect(ogUrl, `og:url !== sitemap <loc> on ${path}`).toBe(expected);
  expect(twitterUrl, `twitter:url !== sitemap <loc> on ${path}`).toBe(expected);

  // And, transitively, the three head values agree with each other.
  expect(ogUrl, `og:url !== canonical on ${path}`).toBe(canonical);
  expect(twitterUrl, `twitter:url !== canonical on ${path}`).toBe(canonical);
}

describe("canonical ≡ og:url ≡ twitter:url ≡ sitemap <loc> (exact string)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing: all four values are byte-identical", async () => {
    await assertParityFor("/blog", "/blog");
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug}: all four values are byte-identical`, async () => {
      await assertParityFor(`/blog/${post.slug}`, `/blog/${post.slug}`);
    });
  }
});