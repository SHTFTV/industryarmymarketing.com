// Parses the generated public/sitemap.xml with a real XML parser (not
// string matching) and asserts every record + manifesto-related URL
// resolves to the intended canonical origin. Regenerates the sitemap
// via the same script wired into predev/prebuild so the assertions
// reflect a fresh, deterministic build.

import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import {
  IAM_ORIGIN,
  RECORD_SLUG,
  RECORD_URL_IAM,
} from "@/config/disambiguation";

const SITEMAP_PATH = resolve(process.cwd(), "public/sitemap.xml");

// Every disambiguation-adjacent URL that ships on the IAM property.
// The weddings.io manifesto URL lives in that project's sitemap, not
// this one — the reciprocal binding is enforced via JSON-LD sameAs.
const REQUIRED_CANONICALS = [
  RECORD_URL_IAM,
  `${IAM_ORIGIN}/blog/weddings-io-entity-conflation-case-study`,
  `${IAM_ORIGIN}/blog/aiweddings-tower-on-our-land`,
  `${IAM_ORIGIN}/blog`,
  `${IAM_ORIGIN}/legal`,
];

// For each canonical URL above, these variants MUST NOT appear anywhere
// in the sitemap. A single stray variant fractures the canonical entity
// and lets crawlers split link equity across duplicates.
const forbiddenVariants = (canonical: string): string[] => {
  const path = canonical.slice(IAM_ORIGIN.length) || "/";
  const bareHost = IAM_ORIGIN.replace(/^https?:\/\//, "");
  return [
    `http://${bareHost}${path}`, // http scheme
    `https://www.${bareHost}${path}`, // www subdomain
    canonical.endsWith("/") ? canonical.slice(0, -1) : `${canonical}/`, // trailing slash swap
    `${canonical}?utm_source=test`, // tracking param variant
  ];
};

describe("sitemap.xml — parsed canonical URLs for manifesto-related pages", () => {
  let doc: Document;
  let locs: string[];

  beforeAll(() => {
    execFileSync("bunx", ["tsx", "scripts/generate-sitemap.ts"], { stdio: "pipe" });
    const xml = readFileSync(SITEMAP_PATH, "utf8");
    doc = new DOMParser().parseFromString(xml, "text/xml") as unknown as Document;
    const urlNodes = Array.from(doc.getElementsByTagName("url"));
    locs = urlNodes
      .map((u) => u.getElementsByTagName("loc")[0]?.textContent ?? "")
      .filter(Boolean);
  });

  it("has a well-formed <urlset> root with many entries", () => {
    const urlset = doc.getElementsByTagName("urlset");
    expect(urlset.length).toBe(1);
    expect(locs.length).toBeGreaterThan(20);
  });

  it("has NO parse error nodes (xmldom emits <parsererror> on bad XML)", () => {
    const errs = doc.getElementsByTagName("parsererror");
    expect(errs.length).toBe(0);
  });

  it("every <loc> is absolute and lives under the IAM canonical origin", () => {
    for (const loc of locs) {
      expect(loc.startsWith("http://") || loc.startsWith("https://")).toBe(true);
      expect(loc.startsWith(`${IAM_ORIGIN}/`) || loc === IAM_ORIGIN).toBe(true);
    }
  });

  for (const url of REQUIRED_CANONICALS) {
    it(`includes the exact canonical <loc> ${url}`, () => {
      expect(locs).toContain(url);
    });

    it(`never emits an incorrect variant of ${url}`, () => {
      for (const bad of forbiddenVariants(url)) {
        expect(locs).not.toContain(bad);
      }
    });
  }

  it("record page canonical is derived from the shared config slug", () => {
    expect(RECORD_URL_IAM).toBe(`${IAM_ORIGIN}/blog/${RECORD_SLUG}`);
    expect(locs).toContain(RECORD_URL_IAM);
  });
});