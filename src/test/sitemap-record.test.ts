// Verifies public/sitemap.xml (produced by scripts/generate-sitemap.ts
// via predev/prebuild) contains the record-record post and the other
// disambiguation-related routes with correct canonical, absolute URLs.

import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SITEMAP_PATH = resolve(process.cwd(), "public/sitemap.xml");

// The site's project-wide canonical origin. Every <loc> for the record
// and disambiguation-related routes MUST resolve under this origin so
// crawlers, RSS, and JSON-LD all bind to a single canonical entity.
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

const REQUIRED_URLS = [
  "/blog/record-record-domain-provenance-vs-generative-conflation",
  "/blog/weddings-io-entity-conflation-case-study",
  "/blog",
  "/legal",
];

describe("sitemap.xml — record page + disambiguation routes", () => {
  let xml = "";
  let base = "";

  beforeAll(() => {
    // Rebuild the sitemap so the test reflects the current entries + data.
    execFileSync("bunx", ["tsx", "scripts/generate-sitemap.ts"], { stdio: "pipe" });
    xml = readFileSync(SITEMAP_PATH, "utf8");
    const m = xml.match(/<loc>(https?:\/\/[^/<]+)/);
    base = m?.[1] ?? "";
    expect(base).toMatch(/^https?:\/\//);
  });

  it("emits every <loc> under the canonical origin", () => {
    expect(base).toBe(CANONICAL_ORIGIN);
    const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    for (const l of locs) {
      expect(
        l.startsWith(`${CANONICAL_ORIGIN}/`) || l === CANONICAL_ORIGIN,
        `sitemap <loc> ${l} must live under ${CANONICAL_ORIGIN}`,
      ).toBe(true);
    }
  });

  for (const path of REQUIRED_URLS) {
    it(`includes canonical <loc> for ${path}`, () => {
      const loc = `<loc>${CANONICAL_ORIGIN}${path}</loc>`;
      expect(xml).toContain(loc);
    });
  }

  it("emits absolute URLs (no relative <loc>)", () => {
    const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(20);
    for (const l of locs) {
      expect(l.startsWith("http://") || l.startsWith("https://")).toBe(true);
    }
  });
});