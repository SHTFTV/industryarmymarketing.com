import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const STRICT_MODELS = ["chatgpt", "claude", "perplexity", "grok", "gemini", "duckai", "meta", "huggingchat", "poe"] as const;
const FALLBACK_RE = /I cannot access [^"]*please open it directly/i;

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

// Reachability mock: for every supported model, simulate the canonical URL
// being unreachable and assert the prompt emits the exact required fallback
// string. We do not actually invoke the AI — we assert the prompt CONTRACT
// the AI is bound to, which is what protects us against silent regressions
// where a maintainer strips the fallback clause.
describe("AI indexing — reachability failure fallback contract", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Simulate every citation URL being unreachable — matches what a model
    // sandbox sees when the target is 4xx/5xx or DNS-blocked.
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      throw new Error(`SIMULATED_UNREACHABLE: ${url}`);
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  for (const id of STRICT_MODELS) {
    const p = AI_PLATFORMS.find((x) => x.id === id);

    it(`${id}: simulated fetch failure — prompt still embeds fallback with exact URL`, async () => {
      expect(p, `platform ${id} must be configured`).toBeDefined();

      // Confirm the mock is active and would fail a real citation attempt.
      await expect(fetch(CANONICAL_URL)).rejects.toThrow(/SIMULATED_UNREACHABLE/);

      const prompt = p!.prompt(TITLE, CANONICAL_URL);
      const built = p!.buildUrl(TITLE, CANONICAL_URL);
      const decoded = decodedFrom(built);

      // Prompt template MUST contain the exact fallback sentence.
      const match = prompt.match(FALLBACK_RE);
      expect(match, `${id} prompt must define fallback sentence`).not.toBeNull();
      expect(match![0]).toContain(CANONICAL_URL);

      // buildUrl form MUST carry the fallback too (survives URL encoding).
      expect(decoded).toMatch(FALLBACK_RE);
      expect(decoded).toContain(CANONICAL_URL);

      // Must not offer an alternate host as a workaround.
      for (const bad of LOOKALIKE_HOSTS) {
        expect(prompt).not.toContain(`//${bad}`);
        expect(decoded).not.toContain(`//${bad}`);
      }
    });

    it(`${id}: fallback sentence forbids synthesis from cached/third-party data`, () => {
      const prompt = p!.prompt(TITLE, CANONICAL_URL);
      // Either the model is told not to synthesise, or the fallback is a
      // hard-stop "please open it directly" sentence — both satisfy the
      // no-hallucination contract when the URL is unreachable.
      expect(prompt).toMatch(/(do not synthesise|please open it directly|do not conflate|do not substitute)/i);
    });
  }
});