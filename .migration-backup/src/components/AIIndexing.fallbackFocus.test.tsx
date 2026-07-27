// Forces navigator.clipboard.writeText to reject so the component takes the
// execCommand fallback path. Verifies that:
//   1. Exactly ONE analytics event fires for the copy attempt (success OR
//      failure — never both, never doubled).
//   2. Focus returns to the Copy prompt button for the platform that was
//      copied (accessibility contract).

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Fallback Focus Test",
  articleUrl: "https://industryarmymarketing.com/blog/fallback-focus-test",
  publication: "iam" as const,
};

type Detail = { event: string; platform: string; copyMethod?: string; failureReason?: string };

function collectAnalytics(): Detail[] {
  const events: Detail[] = [];
  const handler = (e: Event) => {
    events.push((e as CustomEvent<Detail>).detail);
  };
  window.addEventListener("iam:ai-indexing", handler);
  // return the buffer + a cleanup registered on the window for later removal
  (events as unknown as { __cleanup: () => void }).__cleanup = () =>
    window.removeEventListener("iam:ai-indexing", handler);
  return events;
}

describe("AIIndexing — clipboard failure fallback (single analytics + focus)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires exactly one success event via fallback and refocuses Copy button", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const events = collectAnalytics();
    render(<AIIndexing {...PROPS} />);

    // Open Claude, so we can assert focus lands on Claude's Copy button.
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));
    const copyBtns = screen.getAllByRole("button", { name: /Copy prompt/i });
    const btn = copyBtns[0] as HTMLButtonElement;

    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() =>
      expect(btn).toHaveAttribute("data-copy-state", "success"),
    );

    // Clipboard rejected, fallback succeeded.
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(execCommand).toHaveBeenCalledWith("copy");

    // Filter for copy-related events (ignore "opened").
    const copyEvents = events.filter((e) =>
      e.event === "ai_indexing_copy_succeeded" ||
      e.event === "ai_indexing_copy_failed",
    );
    expect(copyEvents).toHaveLength(1);
    expect(copyEvents[0].event).toBe("ai_indexing_copy_succeeded");
    expect(copyEvents[0].platform).toBe("claude");
    expect(copyEvents[0].copyMethod).toBe("fallback");

    // Focus contract: active element is the Claude Copy button.
    expect(document.activeElement).toBe(btn);

    (events as unknown as { __cleanup: () => void }).__cleanup();
  });

  it("fires exactly one failure event when both paths fail", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    const events = collectAnalytics();
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Perplexity/i }));
    const btn = screen.getAllByRole("button", { name: /Copy prompt/i })[0] as HTMLButtonElement;

    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() =>
      expect(btn).toHaveAttribute("data-copy-state", "error"),
    );

    const copyEvents = events.filter((e) =>
      e.event === "ai_indexing_copy_succeeded" ||
      e.event === "ai_indexing_copy_failed",
    );
    expect(copyEvents).toHaveLength(1);
    expect(copyEvents[0].event).toBe("ai_indexing_copy_failed");
    expect(copyEvents[0].platform).toBe("perplexity");

    // Focus still returns to the copy button on failure.
    expect(document.activeElement).toBe(btn);

    (events as unknown as { __cleanup: () => void }).__cleanup();
  });
});