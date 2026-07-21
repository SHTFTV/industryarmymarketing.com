import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const AI_HOSTS = [
  "chat.openai.com",
  "claude.ai",
  "perplexity.ai",
  "grok.com",
];

const CASES: Array<{ title: string; url: string }> = [
  {
    title: "Simple Post",
    url: "https://industryarmymarketing.com/blog/simple-post",
  },
  {
    title: "Post with spaces & symbols?",
    url: "https://industryarmymarketing.com/blog/post-with-query?ref=home&x=1",
  },
  {
    title: "Unicode — em‑dash + café",
    url: "https://industryarmymarketing.com/blog/unicode-café",
  },
  {
    title: "Already %20 percent",
    url: "https://industryarmymarketing.com/blog/already%20percent",
  },
  {
    title: 'Quotes "and" slashes/back',
    url: "https://industryarmymarketing.com/blog/quotes-slashes",
  },
];

function getAIHrefs(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("a[href]"))
    .map((a) => (a as HTMLAnchorElement).href)
    .filter((h) => AI_HOSTS.some((host) => h.includes(host)));
}

describe("AIIndexing — single-pass URL encoding", () => {
  for (const c of CASES) {
    it(`encodes prompt exactly once for: ${c.title}`, () => {
      const { container } = render(
        <AIIndexing articleTitle={c.title} articleUrl={c.url} publication="iam" />,
      );
      // Open every dropdown so all deep links render
      for (const btn of Array.from(
        container.querySelectorAll("button"),
      ) as HTMLButtonElement[]) {
        if (/ChatGPT|Claude|Perplexity|Grok/.test(btn.textContent ?? "")) {
          fireEvent.click(btn);
        }
      }
      const hrefs = getAIHrefs(container);
      expect(hrefs.length).toBeGreaterThanOrEqual(4);

      for (const href of hrefs) {
        const q = new URL(href).searchParams.get("q");
        expect(q, `q param missing for ${href}`).toBeTruthy();
        // Double-encoding would turn "%" -> "%25" leaving no raw spaces once decoded,
        // but importantly the decoded value should still contain the raw article URL.
        expect(q!).not.toMatch(/%2520/); // %20 -> %2520 is the classic double-encode tell
        expect(q!).not.toMatch(/%2522/); // %22 -> %2522
        expect(q!).not.toMatch(/%253A/); // %3A -> %253A
        // Decoding once must yield the original URL substring, not a still-encoded blob
        const decoded = decodeURIComponent(q!);
        expect(decoded).toContain(c.url);
        expect(decoded).toContain(c.title);
        // Decoding a second time must not "reveal" the URL (i.e. it wasn't hidden by a second layer)
        // Instead, once-decoded should already contain the raw URL.
        expect(decoded.includes("%2F") || decoded.includes("%3A")).toBe(false);
      }
    });
  }
});