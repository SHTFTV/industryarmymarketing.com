// The aria-live status region MUST be cleared between copy attempts so
// assistive tech re-announces the "Copied ✓" text every time, even when the
// text content of two consecutive copies is identical.
//
// Contract:
//   1. Immediately after a copy, the live region is momentarily empty.
//   2. Then it becomes the announcement (e.g. "Copied ✓").
//   3. On a subsequent rapid copy, the region again transitions
//      empty → message so screen readers fire a fresh announcement.

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Live Region Clear Test",
  articleUrl: "https://industryarmymarketing.com/blog/live-region-clear-test",
  publication: "iam" as const,
};

describe("AIIndexing — aria-live region clears between copies", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("clears then re-populates on each copy so rapid repeats re-announce", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /^ChatGPT/i }));
    const btn = screen.getAllByRole("button", { name: /Copy prompt/i })[0] as HTMLButtonElement;
    const live = screen.getByTestId("ai-indexing-live-region");

    // Baseline: region starts empty.
    expect(live.textContent).toBe("");

    // ── First copy ─────────────────────────────────────────
    await act(async () => {
      fireEvent.click(btn);
    });
    // Between the state update and the deferred setLiveMessage, region is empty.
    expect(live.textContent).toBe("");

    // After the queued setTimeout fires, region reads "Copied ✓".
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(live.textContent).toMatch(/Copied/);

    // ── Second (rapid) copy while previous announcement is still displayed ──
    // Region MUST transition back to empty before the new message so AT
    // re-announces even though the message text is identical.
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(live.textContent).toBe("");

    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(live.textContent).toMatch(/Copied/);

    // Eventually clears entirely after the auto-dismiss window.
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(live.textContent).toBe("");
  });
});