import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Analytics Test Post",
  articleUrl: "https://industryarmymarketing.com/blog/analytics-test",
  publication: "iam" as const,
};

type EventDetail = {
  event: string;
  platform: string;
  publication: string;
  articleUrl: string;
  copyMethod?: string;
  failureReason?: string;
};

function captureEvents(): EventDetail[] {
  const events: EventDetail[] = [];
  window.addEventListener("iam:ai-indexing", (e: Event) => {
    events.push((e as CustomEvent<EventDetail>).detail);
  });
  return events;
}

describe("AIIndexing — analytics", () => {
  afterEach(() => vi.restoreAllMocks());

  it("fires prompt_opened when a platform is expanded, not when collapsed", () => {
    const events = captureEvents();
    render(<AIIndexing {...PROPS} />);
    const btn = screen.getByRole("button", { name: /ChatGPT/i });
    fireEvent.click(btn);
    fireEvent.click(btn); // collapse
    const opens = events.filter((e) => e.event === "ai_indexing_prompt_opened");
    expect(opens).toHaveLength(1);
    expect(opens[0].platform).toBe("chatgpt");
    expect(opens[0].publication).toBe("iam");
    expect(opens[0].articleUrl).toBe(PROPS.articleUrl);
  });

  it("never includes prompt text in analytics payload", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });
    await act(async () => fireEvent.click(copyBtn));
    for (const ev of events) {
      const json = JSON.stringify(ev);
      expect(json).not.toContain("Analyse this article");
      expect(json).not.toContain(PROPS.articleTitle);
    }
  });

  it("fires copy_succeeded with copyMethod=clipboard on success", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Perplexity/i }));
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i })),
    );
    const ok = events.find((e) => e.event === "ai_indexing_copy_succeeded");
    expect(ok).toBeDefined();
    expect(ok!.copyMethod).toBe("clipboard");
    expect(ok!.platform).toBe("perplexity");
  });

  it("fires copy_failed with a failureReason when both paths fail", async () => {
    const events = captureEvents();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Grok/i }));
    fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i }));
    await waitFor(() =>
      expect(
        events.find((e) => e.event === "ai_indexing_copy_failed"),
      ).toBeDefined(),
    );
    const fail = events.find((e) => e.event === "ai_indexing_copy_failed")!;
    expect(fail.platform).toBe("grok");
    expect(fail.failureReason).toBeDefined();
  });
});