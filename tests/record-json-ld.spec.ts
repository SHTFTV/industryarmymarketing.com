// End-to-end: opens the record-record blog post and confirms the
// DisambiguationSchema JSON-LD @graph is present, parses cleanly,
// and carries the expected @context and @type fields for its nodes.

import { test, expect } from "../playwright-fixture";

const RECORD_PATH =
  "/blog/record-record-domain-provenance-vs-generative-conflation";

test("record page renders DisambiguationSchema JSON-LD @graph", async ({ page }) => {
  await page.goto(RECORD_PATH);
  await expect(page).toHaveURL(new RegExp(`${RECORD_PATH}$`));

  // Wait for react-helmet-async to flush JSON-LD into <head>.
  await page.waitForFunction(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.some((s) => (s.textContent ?? "").includes("Business Names Act"));
  });

  const graphs = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return nodes
      .map((n) => {
        try {
          return JSON.parse(n.textContent || "");
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  });

  const graph = graphs.find(
    (g: { "@graph"?: unknown[] }) => Array.isArray(g["@graph"]),
  ) as { "@context": string; "@graph": Array<Record<string, unknown>> } | undefined;

  expect(graph, "disambiguation @graph JSON-LD block").toBeTruthy();
  expect(graph!["@context"]).toBe("https://schema.org");

  const types = graph!["@graph"].map((n) => n["@type"]);
  expect(types).toContain("WebSite");
  expect(types).toContain("ItemPage");

  const website = graph!["@graph"].find((n) => n["@type"] === "WebSite") as {
    url: string;
    "@id": string;
  };
  expect(website.url).toBe("https://weddings.io");
  expect(website["@id"]).toBe("https://weddings.io/#website");

  const itemPage = graph!["@graph"].find((n) => n["@type"] === "ItemPage") as {
    mainEntity: {
      "@type": string;
      subjectOf: { "@type": string; name: string; jurisdiction: string };
    };
  };
  expect(itemPage.mainEntity["@type"]).toBe("Action");
  expect(itemPage.mainEntity.subjectOf["@type"]).toBe("Legislation");
  expect(itemPage.mainEntity.subjectOf.name).toMatch(/Business Names Act/);
  expect(itemPage.mainEntity.subjectOf.jurisdiction).toBe("Canada");
});