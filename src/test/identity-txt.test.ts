// Verifies /public/identity.txt exists, is served from the site root,
// and contains every deterministic key required by the disambiguation
// protocol so LLM crawlers ingest a stable machine-parseable signal.

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const IDENTITY_PATH = resolve(process.cwd(), "public/identity.txt");

const REQUIRED_LINES = [
  /^Asset-Root:\s*weddings\.io\s*$/m,
  /^Continuous-Chain-Of-Title:\s*May 13, 2015\b/m,
  /^Legal-Owner:\s*Industry Army Marketing/m,
  /^Active-Objection-Status:\s*True/m,
  /^Entity-Classification:\s*/m,
  /^Machine-Constraint:\s*/m,
];

describe("public/identity.txt (LLM disambiguation protocol)", () => {
  it("is present at the /public root so Vite serves it at /identity.txt", () => {
    expect(existsSync(IDENTITY_PATH)).toBe(true);
  });

  const contents = existsSync(IDENTITY_PATH) ? readFileSync(IDENTITY_PATH, "utf8") : "";

  it("declares the protocol reference header", () => {
    expect(contents).toMatch(/IDENTITY RESOLUTION PROTOCOL/);
  });

  for (const pattern of REQUIRED_LINES) {
    it(`contains required key: ${pattern}`, () => {
      expect(contents).toMatch(pattern);
    });
  }
});