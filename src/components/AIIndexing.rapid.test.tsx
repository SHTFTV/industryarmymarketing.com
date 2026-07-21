import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Rapid Fire Post",
  articleUrl: "https://industryarmymarketing.com/blog/rapid-fire",
  publication: "iam" as const,
};

function captureEvents() {
  const events: Array<{ event: string; platform: string; copyMethod?: string }> = [];
  const handler = (e: Event) => {
    events.push((e as CustomEvent).detail);
  };
  window.addEventListener("iam:ai-indexing", handler);
  return { events, off: () => window.removeEventListener("iam:ai-indexing", handler) };
}

describe("AIIndexing — rapid interaction integrity", () => {
  afterEach(() => vi.restoreAllMocks());

  it("copies the correct platform's prompt across rapid platform switches", async () => {
    const writes: string[] = [];
    const writeText = vi.fn((text: string) => {
      writes.push(text);
      return Promise.resolve();
    });
    Object.assign(navigator, { clipboard: { writeText } });

    const { events, off } = captureEvents();
    render(<AIIndexing {...PROPS} />);

    for (const name of ["ChatGPT", "Claude", "Perplexity", "Grok"]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
      const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });
      await act(async () => fireEvent.click(copyBtn));
      // close before opening the next platform
      fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
    }

    expect(writes).toHaveLength(4);
    // Each write must reference the article URL and be a different prompt (per-platform wording)
    for (const w of writes) expect(w).toContain(PROPS.articleUrl);
    expect(new Set(writes).size).toBe(4);

    const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
    expect(succeeded.map((s) => s.platform)).toEqual([
      "chatgpt",
      "claude",
      "perplexity",
      "grok",
    ]);
    off();
  });

  it("does not double-fire analytics when copy is spammed while in-flight", async () => {
    let resolve: (v?: unknown) => void = () => {};
    const writeText = vi.fn().mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    Object.assign(navigator, { clipboard: { writeText } });

    const { events, off } = captureEvents();
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });

    // Spam clicks + shortcut before the promise resolves
    fireEvent.click(copyBtn);
    fireEvent.click(copyBtn);
    fireEvent.click(copyBtn);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(writeText).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
      expect(succeeded).toHaveLength(1);
    });
    off();
  });

  it("returns focus to the Copy prompt button after click and after Ctrl+K", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });

    // Click path — start with focus elsewhere
    (document.body as HTMLElement).focus();
    expect(document.activeElement).not.toBe(copyBtn);
    await act(async () => fireEvent.click(copyBtn));
    await waitFor(() => expect(document.activeElement).toBe(copyBtn));

    // Shortcut path — move focus away, then Ctrl+K, then focus should return
    (document.body as HTMLElement).focus();
    expect(document.activeElement).not.toBe(copyBtn);
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });
    await waitFor(() => expect(document.activeElement).toBe(copyBtn));
  });
});