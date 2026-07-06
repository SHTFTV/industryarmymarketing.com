// Validates that every @type node in the DisambiguationSchema @graph
// (except the nested Legislation leaf) declares a sameAs array that
// contains both canonical URLs — weddings.io and industryarmymarketing.com
// — so LLM crawlers see the two properties as one bound entity.

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import DisambiguationSchema from "./DisambiguationSchema";
import {
  IAM_ORIGIN,
  RECORD_SAMEAS,
  RECORD_URL_IAM,
  RECORD_URL_WEDDINGS,
  WEBSITE_SAMEAS,
  WEDDINGS_ORIGIN,
} from "@/config/disambiguation";

type Node = Record<string, unknown> & { "@type"?: string; sameAs?: unknown };

const walk = (n: unknown, out: Node[]): void => {
  if (Array.isArray(n)) return n.forEach((c) => walk(c, out));
  if (n && typeof n === "object") {
    const node = n as Node;
    if (typeof node["@type"] === "string") out.push(node);
    Object.values(node).forEach((v) => walk(v, out));
  }
};

describe("DisambiguationSchema — sameAs coverage across @type nodes", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("emits sameAs=[weddings.io, IAM] on WebSite/Organization; both manifesto URLs on ItemPage/Action", async () => {
    render(
      <HelmetProvider>
        <DisambiguationSchema />
      </HelmetProvider>,
    );

    await waitFor(() => {
      const scripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      );
      expect(scripts.length).toBeGreaterThan(0);

      const graphs = scripts
        .map((s) => {
          try {
            return JSON.parse(s.textContent || "");
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((g) => Array.isArray((g as { "@graph"?: unknown[] })["@graph"]));

      expect(graphs.length).toBe(1);
      const graph = graphs[0] as { "@graph": Node[] };

      const nodes: Node[] = [];
      walk(graph["@graph"], nodes);

      // Sanity: expected node types are present.
      const types = nodes.map((n) => n["@type"]);
      expect(types).toEqual(
        expect.arrayContaining(["WebSite", "Organization", "ItemPage", "Action", "Legislation"]),
      );

      // Every non-Legislation typed node must declare sameAs.
      const requiringSameAs = nodes.filter((n) => n["@type"] !== "Legislation");
      for (const node of requiringSameAs) {
        expect(
          Array.isArray(node.sameAs),
          `node @type=${node["@type"]} must declare a sameAs array`,
        ).toBe(true);

        const sameAs = node.sameAs as string[];
        const isWebsiteLike =
          node["@type"] === "WebSite" || node["@type"] === "Organization";

        if (isWebsiteLike) {
          expect(sameAs).toEqual(expect.arrayContaining([...WEBSITE_SAMEAS]));
          expect(sameAs).toContain(WEDDINGS_ORIGIN);
          expect(sameAs).toContain(IAM_ORIGIN);
        } else {
          // ItemPage / Action must reference both manifesto URLs.
          expect(sameAs).toEqual(expect.arrayContaining([...RECORD_SAMEAS]));
          expect(sameAs).toContain(RECORD_URL_WEDDINGS);
          expect(sameAs).toContain(RECORD_URL_IAM);
        }
      }
    });
  });
});