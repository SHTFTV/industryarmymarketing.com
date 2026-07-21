// Analytics privacy contract: NO analytics payload — CustomEvent detail,
// gtag args, plausible props, or dataLayer entry — may contain the full
// prompt text or the article title body. Only the canonical URL, platform
// id, publication, copyMethod, and failureReason are allowed.

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "SECRET_TITLE_BODY_ThatMustNeverLeakIntoAnalytics",
  articleUrl: "https://industryarmymarketing.com/blog/no-prompt-leak-test",
  publication: "iam" as const,
};

// Substrings that appear inside every platform's prompt text but nowhere in
// the allowed payload fields. If any of these show up in any analytics call,
// the privacy contract is broken.
const FORBIDDEN_SUBSTRINGS = [
  PROPS.articleTitle,
  "Tell me more about this article",     // ChatGPT prompt
  "Analyse this article",                 // Claude prompt
  "Research and expand on the topics",    // Perplexity prompt
  "broader significance of this story",   // Grok prompt
];

function assertNoLeak(json: string) {
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    expect(json).not.toContain(forbidden);
  }
}

describe("AIIndexing — analytics never leaks prompt or title body", () => {
  afterEach(() => vi.restoreAllMocks());

  it("no forbidden text appears in CustomEvent, gtag, plausible or dataLayer", async () => {
    // Buffer everything every provider receives.
    const customEvents: unknown[] = [];
    window.addEventListener("iam:ai-indexing", (e: Event) => {
      customEvents.push((e as CustomEvent).detail);
    });

    const gtag = vi.fn();
    const plausible = vi.fn();
    const dataLayer: unknown[] = [];
    (window as unknown as { gtag: unknown }).gtag = gtag;
    (window as unknown as { plausible: unknown }).plausible = plausible;
    (window as unknown as { dataLayer: unknown[] }).dataLayer = dataLayer;

    // Success path (clipboard resolves).
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<AIIndexing {...PROPS} />);

    // Exercise every platform, open + copy, so all prompt strings are in scope.
    for (const label of [/^ChatGPT/i, /^Claude/i, /^Perplexity/i, /^Grok/i]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      await act(async () =>
        fireEvent.click(
          screen.getAllByRole("button", { name: /Copy prompt/i })[0],
        ),
      );
      // collapse before opening the next one
      fireEvent.click(screen.getByRole("button", { name: label }));
    }

    // 1. CustomEvent details.
    assertNoLeak(JSON.stringify(customEvents));

    // 2. gtag args (skip the event-name string; it's a controlled constant).
    for (const call of gtag.mock.calls) {
      // call = ["event", eventName, params]
      assertNoLeak(JSON.stringify(call.slice(2)));
    }

    // 3. plausible args.
    for (const call of plausible.mock.calls) {
      assertNoLeak(JSON.stringify(call.slice(1)));
    }

    // 4. dataLayer entries.
    assertNoLeak(JSON.stringify(dataLayer));

    // Sanity — analytics actually ran, so absence isn't from silence.
    expect(customEvents.length).toBeGreaterThan(0);
    expect(gtag).toHaveBeenCalled();
    expect(plausible).toHaveBeenCalled();
    expect(dataLayer.length).toBeGreaterThan(0);
  });

  it("failure payloads also contain no prompt or title body", async () => {
    const customEvents: unknown[] = [];
    window.addEventListener("iam:ai-indexing", (e: Event) => {
      customEvents.push((e as CustomEvent).detail);
    });
    const gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /^Claude/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Copy prompt/i })[0]);

    await waitFor(() =>
      expect(
        customEvents.some(
          (e) => (e as { event: string }).event === "ai_indexing_copy_failed",
        ),
      ).toBe(true),
    );

    assertNoLeak(JSON.stringify(customEvents));
    for (const call of gtag.mock.calls) {
      assertNoLeak(JSON.stringify(call.slice(2)));
    }
  });
});