import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Copy Flow Test Post",
  articleUrl: "https://industryarmymarketing.com/blog/copy-flow-test",
  publication: "iam" as const,
};

function openChatGPT() {
  fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));
}

function getCopyButton(): HTMLButtonElement {
  return screen.getAllByRole("button", { name: /Copy prompt|Copied|Copy failed/i })[0] as HTMLButtonElement;
}

describe("AIIndexing — Copy prompt flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows success state when navigator.clipboard resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<AIIndexing {...PROPS} />);
    openChatGPT();
    const btn = getCopyButton();
    expect(btn).toHaveAttribute("data-copy-state", "idle");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain(PROPS.articleUrl);
    expect(btn).toHaveAttribute("data-copy-state", "success");
    expect(btn.textContent).toMatch(/Copied/);

    // never gets stuck in success — always returns to idle
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(btn).toHaveAttribute("data-copy-state", "idle");
    expect(btn.textContent).toMatch(/Copy prompt/);
  });

  it("falls back to execCommand when navigator.clipboard is missing", async () => {
    delete (navigator as unknown as { clipboard?: unknown }).clipboard;
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    render(<AIIndexing {...PROPS} />);
    openChatGPT();
    const btn = getCopyButton();

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(btn).toHaveAttribute("data-copy-state", "success");
  });

  it("falls back when clipboard permission is denied", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    render(<AIIndexing {...PROPS} />);
    openChatGPT();
    const btn = getCopyButton();

    await act(async () => {
      fireEvent.click(btn);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("copy");
    await waitFor(() =>
      expect(btn).toHaveAttribute("data-copy-state", "success"),
    );
  });

  it("shows an explicit error state when both clipboard and fallback fail", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(<AIIndexing {...PROPS} />);
    openChatGPT();
    const btn = getCopyButton();

    await act(async () => {
      fireEvent.click(btn);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(btn).toHaveAttribute("data-copy-state", "error"),
    );
    expect(btn.textContent).toMatch(/Copy failed/);

    // error state must also clear — no indeterminate UI
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(btn).toHaveAttribute("data-copy-state", "idle");
    expect(btn.textContent).toMatch(/Copy prompt/);
  });
});