import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "In-Flight Guard",
  articleUrl: "https://industryarmymarketing.com/blog/in-flight-guard",
  publication: "iam" as const,
};

type Detail = { event: string; platform: string; copyMethod?: string; failureReason?: string };

function captureEvents() {
  const events: Detail[] = [];
  const handler = (e: Event) => events.push((e as CustomEvent).detail);
  window.addEventListener("iam:ai-indexing", handler);
  return { events, off: () => window.removeEventListener("iam:ai-indexing", handler) };
}

describe("AIIndexing — in-flight rapid-click single-event guarantee", () => {
  afterEach(() => vi.restoreAllMocks());

  it("fires exactly one success event when clipboard success is in-flight and clicks repeat", async () => {
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

    for (let i = 0; i < 8; i++) fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
      expect(succeeded).toHaveLength(1);
      expect(succeeded[0].copyMethod).toBe("clipboard");
      expect(succeeded[0].platform).toBe("chatgpt");
    });
    expect(events.filter((e) => e.event === "ai_indexing_copy_failed")).toHaveLength(0);
    off();
  });

  it("fires exactly one failure event when in-flight clipboard rejects and clicks repeat", async () => {
    let reject: (r?: unknown) => void = () => {};
    const writeText = vi.fn().mockReturnValue(
      new Promise((_, r) => {
        reject = r;
      }),
    );
    Object.assign(navigator, { clipboard: { writeText } });
    const originalExec = document.execCommand;
    document.execCommand = vi.fn().mockReturnValue(false) as unknown as typeof document.execCommand;

    const { events, off } = captureEvents();
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });

    for (let i = 0; i < 6; i++) fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledTimes(1);

    await act(async () => {
      reject(new Error("denied"));
      await Promise.resolve();
    });

    await waitFor(() => {
      const failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
      expect(failed).toHaveLength(1);
      expect(failed[0].failureReason).toBe("permission");
      expect(failed[0].platform).toBe("claude");
    });
    expect(events.filter((e) => e.event === "ai_indexing_copy_succeeded")).toHaveLength(0);

    document.execCommand = originalExec;
    off();
  });
});
