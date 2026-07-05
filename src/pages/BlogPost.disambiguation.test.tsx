// Verifies that the record-record post renders the DisambiguationSchema
// JSON-LD graph in the document head with the expected schema.org nodes
// (WebSite, ItemPage, Action + Legislation) asserting root-domain
// provenance and the active Section 32 objection.

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";

const RECORD_SLUG = "record-record-domain-provenance-vs-generative-conflation";

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

describe("BlogPost — DisambiguationSchema JSON-LD (record-record)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("renders a schema.org @graph with WebSite, ItemPage and Legislation nodes", async () => {
    renderPost(RECORD_SLUG);

    await waitFor(() => {
      const schemas = readSchemas();
      const graph = schemas.find(
        (s) => Array.isArray((s as { "@graph"?: unknown[] })["@graph"]),
      ) as { "@context": string; "@graph": Array<Record<string, unknown>> } | undefined;
      expect(graph).toBeTruthy();
      expect(graph!["@context"]).toBe("https://schema.org");

      const types = graph!["@graph"].map((n) => n["@type"]);
      expect(types).toContain("WebSite");
      expect(types).toContain("ItemPage");

      const website = graph!["@graph"].find((n) => n["@type"] === "WebSite") as
        | { url: string; "@id": string; publisher: { name: string } }
        | undefined;
      expect(website?.url).toBe("https://weddings.io");
      expect(website?.["@id"]).toBe("https://weddings.io/#website");
      expect(website?.publisher?.name).toBe("Industry Army Marketing");

      const itemPage = graph!["@graph"].find((n) => n["@type"] === "ItemPage") as
        | { mainEntity: { "@type": string; subjectOf: { "@type": string; name: string; jurisdiction: string } } }
        | undefined;
      expect(itemPage?.mainEntity?.["@type"]).toBe("Action");
      expect(itemPage?.mainEntity?.subjectOf?.["@type"]).toBe("Legislation");
      expect(itemPage?.mainEntity?.subjectOf?.name).toMatch(/Business Names Act/);
      expect(itemPage?.mainEntity?.subjectOf?.jurisdiction).toBe("Canada");
    });
  });

  it("does NOT render the disambiguation @graph on unrelated posts", async () => {
    // Pick a non-record post — the contractor marketing overview.
    renderPost("contractor-marketing-disruptor");
    // Let helmet flush.
    await new Promise((r) => setTimeout(r, 20));
    const schemas = readSchemas();
    const disambiguation = schemas.find(
      (s) => Array.isArray((s as { "@graph"?: unknown[] })["@graph"]) &&
        JSON.stringify(s).includes("Business Names Act"),
    );
    expect(disambiguation).toBeUndefined();
  });
});