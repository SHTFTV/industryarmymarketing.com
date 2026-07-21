// Strict-shape contract: the CustomEvent detail (and forwarded gtag/plausible/
// dataLayer payloads) must contain EXACTLY the expected keys — no extra fields
// leak into analytics for either success or failure outcomes.

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const ARTICLE_URL = "https://industryarmymarketing.com/blog/payload-shape";
const SUCCESS_KEYS = ["event", "platform", "publication", "articleUrl", "copyMethod"].sort();
const FAILURE_KEYS = ["event", "platform", "publication", "articleUrl", "failureReason"].sort();

function captureDetails() {
  const details: Array<Record<string, unknown>> = [];
  const handler = (e: Event) => details.push((e as CustomEvent).detail as Record<string, unknown>);
  window.addEventListener("iam:ai-indexing", handler);
  return { details, off: () => window.removeEventListener("iam:ai-indexing", handler) };
}

function ownKeys(obj: Record<string, unknown>): string[] {
  // Only enumerable own keys with defined values count as "present".
  return Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
}

describe("AIIndexing — strict analytics payload shape", () => {
  afterEach(() => vi.restoreAllMocks());

  it("success payload has exactly {event, platform, publication, articleUrl, copyMethod}", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const gtag = vi.fn();
    const plausible = vi.fn();
    const dataLayer: Array<Record<string, unknown>> = [];
    Object.assign(window, { gtag, plausible, dataLayer });

    const { details, off } = captureDetails();
    render(
      <AIIndexing
        articleTitle="Shape Test"
        articleUrl={ARTICLE_URL}
        publication="iam"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^ChatGPT/i }));
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i })),
    );

    await waitFor(() =>
      expect(details.some((d) => d.event === "ai_indexing_copy_succeeded")).toBe(true),
    );
    const success = details.find((d) => d.event === "ai_indexing_copy_succeeded")!;

    // CustomEvent detail: exact key set, exact values, no extras.
    expect(ownKeys(success)).toEqual(SUCCESS_KEYS);
    expect(success).toEqual({
      event: "ai_indexing_copy_succeeded",
      platform: "chatgpt",
      publication: "iam",
      articleUrl: ARTICLE_URL,
      copyMethod: "clipboard",
    });
    expect(success).not.toHaveProperty("failureReason");

    // plausible: props exactly mirror the CustomEvent payload.
    const plausibleCall = plausible.mock.calls.find(
      (c) => c[0] === "ai_indexing_copy_succeeded",
    );
    expect(plausibleCall).toBeDefined();
    const plausibleProps = plausibleCall![1]?.props as Record<string, unknown>;
    expect(ownKeys(plausibleProps)).toEqual(SUCCESS_KEYS);

    // dataLayer entry: exact key set.
    const dlEntry = dataLayer.find((d) => d.event === "ai_indexing_copy_succeeded");
    expect(dlEntry).toBeDefined();
    expect(ownKeys(dlEntry!)).toEqual(SUCCESS_KEYS);

    // gtag: only the whitelisted GA property names, all defined ones present.
    const gtagCall = gtag.mock.calls.find((c) => c[1] === "ai_indexing_copy_succeeded");
    expect(gtagCall).toBeDefined();
    const gaParams = gtagCall![2] as Record<string, unknown>;
    const gaDefinedKeys = ownKeys(gaParams);
    expect(gaDefinedKeys).toEqual(
      ["platform", "publication", "article_url", "copy_method"].sort(),
    );

    off();
  });

  it("failure payload has exactly {event, platform, publication, articleUrl, failureReason}", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    const gtag = vi.fn();
    const plausible = vi.fn();
    const dataLayer: Array<Record<string, unknown>> = [];
    Object.assign(window, { gtag, plausible, dataLayer });

    const { details, off } = captureDetails();
    render(
      <AIIndexing
        articleTitle="Shape Test"
        articleUrl={ARTICLE_URL}
        publication="videographers"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Claude/i }));
    fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i }));

    await waitFor(() =>
      expect(details.some((d) => d.event === "ai_indexing_copy_failed")).toBe(true),
    );
    const failure = details.find((d) => d.event === "ai_indexing_copy_failed")!;

    expect(ownKeys(failure)).toEqual(FAILURE_KEYS);
    expect(failure).toEqual({
      event: "ai_indexing_copy_failed",
      platform: "claude",
      publication: "videographers",
      articleUrl: ARTICLE_URL,
      failureReason: "permission",
    });
    expect(failure).not.toHaveProperty("copyMethod");

    const plausibleCall = plausible.mock.calls.find(
      (c) => c[0] === "ai_indexing_copy_failed",
    );
    expect(plausibleCall).toBeDefined();
    expect(ownKeys(plausibleCall![1]?.props as Record<string, unknown>)).toEqual(FAILURE_KEYS);

    const dlEntry = dataLayer.find((d) => d.event === "ai_indexing_copy_failed");
    expect(dlEntry).toBeDefined();
    expect(ownKeys(dlEntry!)).toEqual(FAILURE_KEYS);

    const gtagCall = gtag.mock.calls.find((c) => c[1] === "ai_indexing_copy_failed");
    expect(gtagCall).toBeDefined();
    const gaDefinedKeys = ownKeys(gtagCall![2] as Record<string, unknown>);
    expect(gaDefinedKeys).toEqual(
      ["platform", "publication", "article_url", "failure_reason"].sort(),
    );

    off();
  });

  it("prompt_opened payload has exactly {event, platform, publication, articleUrl}", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { details, off } = captureDetails();
    render(
      <AIIndexing
        articleTitle="Shape Test"
        articleUrl={ARTICLE_URL}
        publication="iam"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Perplexity/i }));

    const opened = details.find((d) => d.event === "ai_indexing_prompt_opened");
    expect(opened).toBeDefined();
    expect(ownKeys(opened!)).toEqual(
      ["event", "platform", "publication", "articleUrl"].sort(),
    );
    expect(opened).not.toHaveProperty("copyMethod");
    expect(opened).not.toHaveProperty("failureReason");
    off();
  });
});
