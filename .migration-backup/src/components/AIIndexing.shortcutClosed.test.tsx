// Ctrl/Cmd+K MUST be a no-op when no AIIndexing dropdown is currently open:
//   • navigator.clipboard.writeText is never called
//   • document.execCommand("copy") is never called
//   • No analytics events fire (opened, succeeded, or failed)
//   • The aria-live region stays empty

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Closed Shortcut Test",
  articleUrl: "https://industryarmymarketing.com/blog/closed-shortcut-test",
  publication: "iam" as const,
};

describe("AIIndexing — Ctrl/Cmd+K is a no-op when nothing is open", () => {
  afterEach(() => vi.restoreAllMocks());

  it("does not touch clipboard, fallback, or analytics when no dropdown is open", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const events: unknown[] = [];
    window.addEventListener("iam:ai-indexing", (e: Event) => {
      events.push((e as CustomEvent).detail);
    });

    render(<AIIndexing {...PROPS} />);

    const live = screen.getByTestId("ai-indexing-live-region");
    expect(live.textContent).toBe("");

    // Fire the shortcut multiple times while nothing is open, using both
    // ctrl and meta modifiers.
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
      fireEvent.keyDown(window, { key: "K", ctrlKey: true });
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      fireEvent.keyDown(window, { key: "K", metaKey: true });
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
    expect(events).toHaveLength(0);
    expect(live.textContent).toBe("");

    // Sanity: once a dropdown IS opened, the shortcut works — proves the
    // no-op is due to the closed state, not a broken listener.
    fireEvent.click(screen.getByRole("button", { name: /^ChatGPT/i }));
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});