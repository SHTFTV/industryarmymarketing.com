// Every rendered blog surface must expose at least one JSON-LD node
// whose `@id` byte-matches the sitemap <loc> for that route, and every
// fragmented `@id` on the page must share that same canonical base
// (i.e. `${sitemapLoc}#fragment`). Search engines join JSON-LD graphs
// by `@id`, so the primary route identifier and the sitemap canonical
// must line up exactly — otherwise the page's entity graph is orphaned
// from the URL crawlers store.

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

const locsByPath: Record<string, string> = {};
for (const m of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const raw = m[1].trim();
  try {
    const u = new URL(raw);
    locsByPath[u.pathname.replace(/\/+$/, "") || "/"] = raw;
  } catch {
    /* skip malformed */
  }
}

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

// Recursively walk every JSON-LD object on the page and yield every
// `@id` string encountered. Nested nodes (publisher, mainEntityOfPage,
// itemListElement, etc.) matter as much as the root — a mismatched
// nested @id splits the graph just as effectively.
function* walkIds(v: unknown): Generator<string> {
  if (v == null) return;
  if (Array.isArray(v)) {
    for (const el of v) yield* walkIds(el);
    return;
  }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (typeof obj["@id"] === "string") yield obj["@id"];
    for (const key of Object.keys(obj)) {
      if (key === "@id") continue;
      yield* walkIds(obj[key]);
    }
  }
}

function collectAllIds(): string[] {
  const ids: string[] = [];
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const parsed = JSON.parse(s.textContent || "");
      for (const id of walkIds(parsed)) ids.push(id);
    } catch {
      /* other suites catch malformed JSON-LD */
    }
  }
  return ids;
}

async function assertIdParity(path: string, sitemapKey: string) {
  renderRoute(path);
  const expected = locsByPath[sitemapKey];
  expect(expected, `sitemap.xml has no <loc> for ${sitemapKey}`).toBeTruthy();

  const ids = await waitFor(() => {
    const found = collectAllIds();
    expect(found.length, `no @id found on ${path}`).toBeGreaterThan(0);
    return found;
  });

  // 1. At least one @id byte-matches the canonical sitemap loc.
  const matches = ids.filter((id) => id === expected);
  expect(
    matches.length,
    `no @id on ${path} matches sitemap <loc> "${expected}" — found: ${JSON.stringify(ids)}`,
  ).toBeGreaterThanOrEqual(1);

  // 2. Every route-scoped @id (i.e. one whose non-fragment portion is
  //    this route, not a cross-route reference like /#website or
  //    /#organization) must share the exact canonical base.
  //    We detect route-scoped by pathname equality with sitemapKey.
  for (const id of ids) {
    let idPath: string;
    try {
      idPath = new URL(id).pathname.replace(/\/+$/, "") || "/";
    } catch {
      throw new Error(`@id "${id}" on ${path} is not a valid URL`);
    }
    if (idPath !== sitemapKey) continue; // cross-route reference — fine
    const base = id.split("#")[0];
    expect(
      base,
      `route-scoped @id "${id}" on ${path} does not share canonical base "${expected}"`,
    ).toBe(expected);
  }
}

describe("JSON-LD @id ≡ sitemap <loc> (byte-identical for the primary node)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing has a primary @id equal to the sitemap canonical", async () => {
    await assertIdParity("/blog", "/blog");
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug} has a primary @id equal to the sitemap canonical`, async () => {
      await assertIdParity(`/blog/${post.slug}`, `/blog/${post.slug}`);
    });
  }
});