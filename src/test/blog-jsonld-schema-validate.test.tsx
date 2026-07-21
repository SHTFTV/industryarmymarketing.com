/**
 * Validate every emitted JSON-LD block on /blog and /blog/:slug against
 * a schema.org type registry (see src/lib/validateJsonLdSchema.ts).
 * Fails on:
 *   • unknown @type (silent addition of a new schema type)
 *   • missing required properties for the @type
 *   • value-shape mismatches (non-URL URL, non-ISO date, etc.)
 * Also recurses into nested typed objects (author/publisher/logo/
 * mainEntityOfPage/itemListElement) so their required fields count too.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { blogPosts } from "@/data/blogPosts";
import {
  collectSchemaNodes,
  validateJsonLdBlock,
} from "@/lib/validateJsonLdSchema";

const readAllJsonLd = (): unknown[] => {
  const out: unknown[] = [];
  for (const s of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const parsed = JSON.parse(s.textContent || "");
      if (Array.isArray(parsed)) out.push(...parsed);
      else if (parsed) out.push(parsed);
    } catch {
      /* handled below — invalid JSON is a test failure */
      out.push({ __invalidJson: s.textContent });
    }
  }
  return out;
};

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

const violationsFor = (label: string) => {
  const blocks = readAllJsonLd();
  expect(blocks.length, `${label}: no JSON-LD emitted`).toBeGreaterThan(0);
  const nodes: unknown[] = [];
  for (const b of blocks) collectSchemaNodes(b, nodes);
  const all: string[] = [];
  for (const node of nodes) {
    const v = validateJsonLdBlock(node);
    for (const it of v) {
      all.push(
        `[${it.type}] ${it.field}: ${it.problem} — expected ${it.expected}, got ${it.actual}`,
      );
    }
  }
  return all;
};

describe("JSON-LD blocks validate against schema.org type registry", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("/blog listing has no schema violations", async () => {
    renderRoute("/blog");
    await waitFor(() => {
      expect(
        document.querySelectorAll('script[type="application/ld+json"]').length,
      ).toBeGreaterThan(0);
    });
    const v = violationsFor("/blog");
    expect(v, `/blog schema violations:\n${v.join("\n")}`).toEqual([]);
  });

  for (const post of blogPosts) {
    it(`/blog/${post.slug} has no schema violations`, async () => {
      renderRoute(`/blog/${post.slug}`);
      await waitFor(() => {
        expect(
          document.querySelectorAll('script[type="application/ld+json"]')
            .length,
        ).toBeGreaterThan(0);
      });
      const v = violationsFor(`/blog/${post.slug}`);
      expect(
        v,
        `/blog/${post.slug} schema violations:\n${v.join("\n")}`,
      ).toEqual([]);
    });
  }
});
