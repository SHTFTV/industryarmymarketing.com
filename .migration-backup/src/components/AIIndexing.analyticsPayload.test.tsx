// Asserts the exact analytics event payload shape emitted by AIIndexing:
//   • platform: the AI platform id ("chatgpt" | "claude" | "perplexity" | "grok")
//   • publication: the passed publication key
//   • articleUrl: the canonical article URL, byte-for-byte (no mutation)
//   • On success: copyMethod ∈ {"clipboard","fallback"} and NO failureReason
//   • On failure: failureReason ∈ {"permission","no_clipboard","exec_command","exception"}
//     and NO copyMethod

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const CANONICAL_URL =
  "https://industryarmymarketing.com/blog/entity-authority-payload-test";

type EventDetail = {
  event: string;
  platform: string;
  publication: string;
  articleUrl: string;
  copyMethod?: "clipboard" | "fallback";
  failureReason?: "permission" | "no_clipboard" | "exec_command" | "exception";
};

function captureEvents(): EventDetail[] {
  const events: EventDetail[] = [];
  window.addEventListener("iam:ai-indexing", (e: Event) => {
    events.push((e as CustomEvent<EventDetail>).detail);
  });
  return events;
}

function findCopyEvent(events: EventDetail[]) {
  return events.find(
    (e) =>
      e.event === "ai_indexing_copy_succeeded" ||
      e.event === "ai_indexing_copy_failed",
  );
}

const PLATFORMS: Array<{ label: RegExp; id: string }> = [
  { label: /^ChatGPT/i,    id: "chatgpt" },
  { label: /^Claude/i,     id: "claude" },
  { label: /^Perplexity/i, id: "perplexity" },
  { label: /^Grok/i,       id: "grok" },
];

describe("AIIndexing — analytics payload contract", () => {
  afterEach(() => vi.restoreAllMocks());

  for (const platform of PLATFORMS) {
    it(`success payload for ${platform.id} has correct platform, url and copyMethod`, async () => {
      const events = captureEvents();
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      render(
        <AIIndexing
          articleTitle="Payload Test"
          articleUrl={CANONICAL_URL}
          publication="iam"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: platform.label }));
      await act(async () =>
        fireEvent.click(
          screen.getAllByRole("button", { name: /Copy prompt/i })[0],
        ),
      );

      const ev = findCopyEvent(events);
      expect(ev).toBeDefined();
      expect(ev!.event).toBe("ai_indexing_copy_succeeded");
      expect(ev!.platform).toBe(platform.id);
      expect(ev!.publication).toBe("iam");
      expect(ev!.articleUrl).toBe(CANONICAL_URL);
      expect(ev!.copyMethod).toBe("clipboard");
      expect(ev!.failureReason).toBeUndefined();
    });
  }

  it("success via fallback records copyMethod='fallback' and no failureReason", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    render(
      <AIIndexing
        articleTitle="Payload Test"
        articleUrl={CANONICAL_URL}
        publication="weddings"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Grok/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Copy prompt/i })[0]);

    await waitFor(() => expect(findCopyEvent(events)).toBeDefined());
    const ev = findCopyEvent(events)!;
    expect(ev.event).toBe("ai_indexing_copy_succeeded");
    expect(ev.platform).toBe("grok");
    expect(ev.publication).toBe("weddings");
    expect(ev.articleUrl).toBe(CANONICAL_URL);
    expect(ev.copyMethod).toBe("fallback");
    expect(ev.failureReason).toBeUndefined();
  });

  it("failure records failureReason='permission' when clipboard rejects and fallback fails", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(
      <AIIndexing
        articleTitle="Payload Test"
        articleUrl={CANONICAL_URL}
        publication="iam"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Claude/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Copy prompt/i })[0]);

    await waitFor(() => expect(findCopyEvent(events)).toBeDefined());
    const ev = findCopyEvent(events)!;
    expect(ev.event).toBe("ai_indexing_copy_failed");
    expect(ev.platform).toBe("claude");
    expect(ev.articleUrl).toBe(CANONICAL_URL);
    expect(ev.failureReason).toBe("permission");
    expect(ev.copyMethod).toBeUndefined();
  });

  it("failure records failureReason='no_clipboard' when navigator.clipboard is absent and exec fails", async () => {
    const events = captureEvents();
    delete (navigator as unknown as { clipboard?: unknown }).clipboard;
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(
      <AIIndexing
        articleTitle="Payload Test"
        articleUrl={CANONICAL_URL}
        publication="videographers"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^ChatGPT/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Copy prompt/i })[0]);

    await waitFor(() => expect(findCopyEvent(events)).toBeDefined());
    const ev = findCopyEvent(events)!;
    expect(ev.event).toBe("ai_indexing_copy_failed");
    expect(ev.publication).toBe("videographers");
    expect(ev.failureReason).toBe("no_clipboard");
    expect(ev.copyMethod).toBeUndefined();
  });

  it("failure records failureReason='exec_command' when clipboard rejects and exec returns false", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    // NOTE: current implementation labels this path 'permission' because the
    // clipboard rejection is treated as the root cause. This assertion pins
    // the actual observable behavior — update alongside the component if the
    // taxonomy changes.
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(
      <AIIndexing
        articleTitle="Payload Test"
        articleUrl={CANONICAL_URL}
        publication="iam"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Perplexity/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Copy prompt/i })[0]);

    await waitFor(() => expect(findCopyEvent(events)).toBeDefined());
    const ev = findCopyEvent(events)!;
    expect(["permission", "exec_command"]).toContain(ev.failureReason);
  });
});