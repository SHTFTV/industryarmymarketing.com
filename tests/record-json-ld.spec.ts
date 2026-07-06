// End-to-end: opens the record-record blog post and confirms the
// DisambiguationSchema JSON-LD @graph is present, parses cleanly,
// and carries the expected @context and @type fields for its nodes.

import { test, expect } from "../playwright-fixture";

const RECORD_PATH =
  "/blog/record-record-domain-provenance-vs-generative-conflation";
const IAM_ORIGIN = "https://industryarmymarketing.com";
const WEDDINGS_ORIGIN = "https://weddings.io";
const RECORD_URL_IAM = `${IAM_ORIGIN}/blog/record-record-domain-provenance-vs-generative-conflation`;
const RECORD_URL_WEDDINGS = `${WEDDINGS_ORIGIN}/manifesto/record-record-domain-provenance-vs-generative-conflation`;

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

test("record page has canonical <link> and sameAs binds both properties", async ({ page }) => {
  await page.goto(RECORD_PATH);

  // Canonical <link rel="canonical"> — react-helmet-async flushes async.
  await page.waitForFunction(
    () => !!document.querySelector('link[rel="canonical"]'),
  );
  const canonical = await page.getAttribute('link[rel="canonical"]', "href");
  expect(canonical).toBeTruthy();
  // Canonical MUST self-reference this page on the IAM origin.
  expect(canonical!.endsWith(RECORD_PATH)).toBe(true);
  expect(canonical!.startsWith("https://")).toBe(true);

  // JSON-LD @graph: every non-Legislation node must include both URLs.
  await page.waitForFunction(() => {
    const nodes = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return nodes.some((n) => (n.textContent ?? "").includes("Business Names Act"));
  });

  const sameAsCoverage = await page.evaluate(
    ({ iam, weddings, recordIam, recordWed }) => {
      const walk = (n: unknown, out: Record<string, unknown>[]): void => {
        if (Array.isArray(n)) return n.forEach((c) => walk(c, out));
        if (n && typeof n === "object") {
          const node = n as Record<string, unknown>;
          if (typeof node["@type"] === "string") out.push(node);
          Object.values(node).forEach((v) => walk(v, out));
        }
      };
      const scripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      );
      const graph = scripts
        .map((s) => {
          try {
            return JSON.parse(s.textContent || "");
          } catch {
            return null;
          }
        })
        .find(
          (g) =>
            g && Array.isArray((g as { "@graph"?: unknown[] })["@graph"]),
        ) as { "@graph": unknown[] } | undefined;
      if (!graph) return { missing: "graph" };
      const nodes: Record<string, unknown>[] = [];
      walk(graph["@graph"], nodes);
      const results = nodes
        .filter((n) => n["@type"] !== "Legislation")
        .map((n) => {
          const type = n["@type"] as string;
          const sameAs = Array.isArray(n.sameAs) ? (n.sameAs as string[]) : [];
          const isWebsiteLike = type === "WebSite" || type === "Organization";
          const expected = isWebsiteLike
            ? [iam, weddings]
            : [recordIam, recordWed];
          const missing = expected.filter((u) => !sameAs.includes(u));
          return { type, sameAs, missing };
        });
      return { results };
    },
    {
      iam: IAM_ORIGIN,
      weddings: WEDDINGS_ORIGIN,
      recordIam: RECORD_URL_IAM,
      recordWed: RECORD_URL_WEDDINGS,
    },
  );

  expect((sameAsCoverage as { missing?: string }).missing).toBeUndefined();
  const results = (sameAsCoverage as { results: Array<{ type: string; missing: string[] }> }).results;
  expect(results.length).toBeGreaterThan(0);
  for (const r of results) {
    expect(r.missing, `node @type=${r.type} missing sameAs entries: ${r.missing.join(", ")}`).toEqual([]);
  }
});