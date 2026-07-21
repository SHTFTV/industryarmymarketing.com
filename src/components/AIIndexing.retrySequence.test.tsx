import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Retry Sequence",
  articleUrl: "https://industryarmymarketing.com/blog/retry-sequence",
  publication: "iam" as const,
};

type Detail = {
  event: string;
  platform: string;
  copyMethod?: string;
  failureReason?: string;
};

function captureEvents() {
  const events: Detail[] = [];
  const handler = (e: Event) => events.push((e as CustomEvent).detail);
  window.addEventListener("iam:ai-indexing", handler);
  return { events, off: () => window.removeEventListener("iam:ai-indexing", handler) };
}

describe("AIIndexing — clipboard failure then retry success", () => {
  afterEach(() => vi.restoreAllMocks());

  it("first attempt fails via fallback path, retry succeeds; exactly one event per attempt", async () => {
    // First writeText rejects -> fallback runs. Force fallback to fail on the
    // first call and succeed on the second.
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error("denied"))
      .mockResolvedValueOnce(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const originalExec = document.execCommand;
    const exec = vi.fn().mockReturnValue(false);
    document.execCommand = exec as unknown as typeof document.execCommand;

    const { events, off } = captureEvents();
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));

    // Attempt 1 -> failure
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    await waitFor(() => {
      const failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
      expect(failed).toHaveLength(1);
      expect(failed[0].platform).toBe("chatgpt");
      expect(failed[0].failureReason).toBe("permission");
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(events.filter((e) => e.event === "ai_indexing_copy_succeeded")).toHaveLength(0);

    // Attempt 2 -> success via clipboard
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt|Copy failed/i }));
    });
    await waitFor(() => {
      const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
      expect(succeeded).toHaveLength(1);
      expect(succeeded[0].platform).toBe("chatgpt");
      expect(succeeded[0].copyMethod).toBe("clipboard");
    });

    // Totals: exactly one failure, exactly one success — no duplicates.
    expect(events.filter((e) => e.event === "ai_indexing_copy_failed")).toHaveLength(1);
    expect(events.filter((e) => e.event === "ai_indexing_copy_succeeded")).toHaveLength(1);
    expect(writeText).toHaveBeenCalledTimes(2);

    document.execCommand = originalExec;
    off();
  });

  it("first attempt fails via fallback (exec_command), retry succeeds via fallback path", async () => {
    // No native clipboard — every attempt goes through fallbackCopy().
    Object.assign(navigator, { clipboard: undefined });
    const originalExec = document.execCommand;
    const exec = vi
      .fn()
      .mockReturnValueOnce(false) // first attempt: fallback fails
      .mockReturnValueOnce(true); // retry: fallback succeeds
    document.execCommand = exec as unknown as typeof document.execCommand;

    const { events, off } = captureEvents();
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });

    await act(async () => fireEvent.click(copyBtn));
    await waitFor(() => {
      const failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
      expect(failed).toHaveLength(1);
      expect(failed[0].failureReason).toBe("exec_command");
    });

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt|Copy failed/i })),
    );
    await waitFor(() => {
      const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
      expect(succeeded).toHaveLength(1);
      expect(succeeded[0].copyMethod).toBe("fallback");
    });

    expect(events.filter((e) => e.event === "ai_indexing_copy_failed")).toHaveLength(1);
    expect(events.filter((e) => e.event === "ai_indexing_copy_succeeded")).toHaveLength(1);

    document.execCommand = originalExec;
    off();
  });
});
