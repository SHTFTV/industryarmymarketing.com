import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Loading & Disabled States",
  articleUrl: "https://industryarmymarketing.com/blog/loading-disabled",
  publication: "iam" as const,
};

// Deferred promise helper — lets us keep clipboard.writeText "in-flight".
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("AIIndexing — loading/spinner + disabled state toggles", () => {
  afterEach(() => vi.restoreAllMocks());

  it("toggles loading label + disabled + aria-busy while in-flight, resets on success", async () => {
    const d = deferred<void>();
    const writeText = vi.fn().mockReturnValue(d.promise);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));

    const idleBtn = screen.getByRole("button", { name: /Copy prompt/i });
    expect(idleBtn).toBeEnabled();
    expect(idleBtn).toHaveAttribute("aria-busy", "false");
    expect(idleBtn.getAttribute("data-copy-state")).toBe("idle");

    await act(async () => {
      fireEvent.click(idleBtn);
    });

    // In-flight: label switched to "Copying…", disabled, aria-busy=true.
    const busyBtn = screen.getByRole("button", { name: /Copying/i });
    expect(busyBtn).toBeDisabled();
    expect(busyBtn).toHaveAttribute("aria-busy", "true");
    expect(busyBtn.getAttribute("data-copy-state")).toBe("copying");

    // Resolve the clipboard write — state must reset.
    await act(async () => {
      d.resolve();
      await d.promise;
    });

    await waitFor(() => {
      const doneBtn = screen.getByRole("button", { name: /Copied/i });
      expect(doneBtn).toBeEnabled();
      expect(doneBtn).toHaveAttribute("aria-busy", "false");
      expect(doneBtn.getAttribute("data-copy-state")).toBe("success");
    });
  });

  it("resets loading + disabled after clipboard permission denial and fallback failure", async () => {
    const d = deferred<void>();
    const writeText = vi.fn().mockReturnValue(d.promise);
    Object.assign(navigator, { clipboard: { writeText } });
    const originalExec = document.execCommand;
    document.execCommand = vi
      .fn()
      .mockReturnValue(false) as unknown as typeof document.execCommand;

    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i }));
    });

    // Still in-flight while the promise is pending.
    const busy = screen.getByRole("button", { name: /Copying/i });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute("aria-busy", "true");

    // Reject with a permission error — both clipboard and fallback fail.
    await act(async () => {
      d.reject(new DOMException("denied", "NotAllowedError"));
      await d.promise.catch(() => {});
    });

    await waitFor(() => {
      const errBtn = screen.getByRole("button", { name: /Copy failed/i });
      expect(errBtn).toBeEnabled();
      expect(errBtn).toHaveAttribute("aria-busy", "false");
      expect(errBtn.getAttribute("data-copy-state")).toBe("error");
    });

    document.execCommand = originalExec;
  });

  it("goes idle → copying → error → copying → success across a retry, never stuck disabled", async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    const writeText = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    Object.assign(navigator, { clipboard: { writeText } });
    const originalExec = document.execCommand;
    document.execCommand = vi
      .fn()
      .mockReturnValue(false) as unknown as typeof document.execCommand;

    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Perplexity/i }));

    // Attempt 1 — reject to force error state.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i }));
    });
    expect(screen.getByRole("button", { name: /Copying/i })).toBeDisabled();
    await act(async () => {
      first.reject(new DOMException("denied", "NotAllowedError"));
      await first.promise.catch(() => {});
    });
    await waitFor(() => {
      const errBtn = screen.getByRole("button", { name: /Copy failed/i });
      expect(errBtn).toBeEnabled();
      expect(errBtn.getAttribute("data-copy-state")).toBe("error");
    });

    // Attempt 2 — succeed.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt|Copy failed/i }));
    });
    // Mid-flight again — must show copying + disabled.
    expect(screen.getByRole("button", { name: /Copying/i })).toBeDisabled();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    await waitFor(() => {
      const okBtn = screen.getByRole("button", { name: /Copied/i });
      expect(okBtn).toBeEnabled();
      expect(okBtn).toHaveAttribute("aria-busy", "false");
      expect(okBtn.getAttribute("data-copy-state")).toBe("success");
    });

    document.execCommand = originalExec;
  });
});