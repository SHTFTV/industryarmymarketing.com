import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Validates the sitewide JSON-LD in index.html:
 *  - contains an ItemList named "Main Navigation"
 *  - every itemListElement is a SiteNavigationElement with absolute https URL
 *  - positions are 1..N, contiguous, no duplicates
 */
describe("index.html SiteNavigationElement JSON-LD", () => {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

  const scripts = Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ).map((m) => JSON.parse(m[1]));

  const graph = scripts.flatMap((s) =>
    Array.isArray(s?.["@graph"]) ? s["@graph"] : [s],
  );

  const navList = graph.find(
    (n: { [k: string]: unknown }) =>
      n?.["@type"] === "ItemList" && n?.name === "Main Navigation",
  );

  it("declares a Main Navigation ItemList", () => {
    expect(navList).toBeDefined();
  });

  it("only contains SiteNavigationElement entries with absolute https URLs", () => {
    expect(Array.isArray(navList.itemListElement)).toBe(true);
    expect(navList.itemListElement.length).toBeGreaterThanOrEqual(3);
    for (const item of navList.itemListElement) {
      expect(item["@type"]).toBe("SiteNavigationElement");
      expect(typeof item.name).toBe("string");
      expect(item.name.length).toBeGreaterThan(0);
      expect(String(item.url)).toMatch(/^https:\/\/industryarmymarketing\.com\//);
    }
  });

  it("has contiguous positions starting at 1 with no duplicates", () => {
    const positions = navList.itemListElement.map(
      (i: { position: number }) => i.position,
    );
    const expected = positions.map((_: unknown, i: number) => i + 1);
    expect([...positions].sort((a, b) => a - b)).toEqual(expected);
    const urls = navList.itemListElement.map((i: { url: string }) => i.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});