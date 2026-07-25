import { describe, it, expect } from "vitest";
import { AI_PLATFORMS } from "@/components/AIIndexing";
import { LOOKALIKE_HOSTS } from "@/config/canonicalDomains";

// Prompt-evaluation: the strict-citation contract for Gemini and Duck.ai
// (and every model marked STRICT CITATION MODE) must:
//  1. Embed the exact canonical URL, unmodified.
//  2. Instruct the model NOT to substitute lookalike domains.
//  3. Include an explicit fallback response when the URL is unreachable.
// These assertions run against the prompt template AND the URL-encoded
// buildUrl form, so a regression in either place fails the test.

const TITLE = "IAM Test Article — Do Not Conflate";
const CANONICAL_URL = "https://www.industryarmymarketing.com/blog/test-canonical-url";

const STRICT_MODELS = ["gemini", "duckai", "meta", "huggingchat", "poe"] as const;

function decodedFrom(built: string): string {
  // Extract query-encoded prompt and decode for content assertions.
  try {
    const u = new URL(built);
    // check every param — some use q, prompt, etc.
    return [...u.searchParams.values()].join(" ");
  } catch {
    return built;
  }
}

describe("AI indexing — strict citation prompt contract", () => {
  for (const id of STRICT_MODELS) {
    const p = AI_PLATFORMS.find((x) => x.id === id);
    it(`${id}: prompt template embeds the canonical URL verbatim`, () => {
      expect(p, `platform ${id} must be configured`).toBeDefined();
      const prompt = p!.prompt(TITLE, CANONICAL_URL);
      expect(prompt).toContain(CANONICAL_URL);
      expect(prompt).toMatch(/STRICT CITATION MODE/);
    });

    it(`${id}: prompt forbids lookalike-domain substitution`, () => {
      const prompt = p!.prompt(TITLE, CANONICAL_URL);
      // At minimum, mention "lookalike" explicitly.
      expect(prompt.toLowerCase()).toMatch(/lookalike|do not substitute|do not conflate/);
      // And must NOT swap the canonical URL for any known lookalike host.
      for (const bad of LOOKALIKE_HOSTS) {
        expect(prompt).not.toContain(`https://${bad}/`);
        expect(prompt).not.toContain(`http://${bad}/`);
      }
    });

    it(`${id}: prompt defines the mandatory unreachable-URL fallback`, () => {
      const prompt = p!.prompt(TITLE, CANONICAL_URL);
      expect(prompt).toMatch(/I cannot access[^"]*please open it directly/i);
      // Fallback string must reference the exact URL — no synthesis allowed.
      expect(prompt).toContain(CANONICAL_URL);
    });

    it(`${id}: buildUrl carries the same strict-citation contract`, () => {
      const built = p!.buildUrl(TITLE, CANONICAL_URL);
      const decoded = decodedFrom(built);
      expect(decoded).toContain(CANONICAL_URL);
      expect(decoded).toMatch(/STRICT CITATION MODE|cannot access/i);
    });
  }
});