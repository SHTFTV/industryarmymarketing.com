import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

const PROPS = {
  articleTitle: "Shortcut Post",
  articleUrl: "https://industryarmymarketing.com/blog/shortcut-post",
  publication: "iam" as const,
};

describe("AIIndexing — keyboard shortcut & disabled state", () => {
  afterEach(() => vi.restoreAllMocks());

  it("Ctrl+K copies the open dropdown's prompt", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Claude/i }));

    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain(PROPS.articleUrl);
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Copied|Copy prompt/i });
      expect(btn).toHaveAttribute("data-copy-state", "success");
    });
  });

  it("Cmd+K works and does nothing when no dropdown is open", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AIIndexing {...PROPS} />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(writeText).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Grok/i }));
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("shows copying state, disables the button, and blocks spam clicks", async () => {
    let resolve: (v?: unknown) => void = () => {};
    const writeText = vi.fn().mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AIIndexing {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));
    const copyBtn = screen.getByRole("button", { name: /Copy prompt/i });

    fireEvent.click(copyBtn);
    // Now in-flight — button should be disabled + aria-busy + show "Copying…"
    const busyBtn = screen.getByRole("button", { name: /Copying/i });
    expect(busyBtn).toBeDisabled();
    expect(busyBtn).toHaveAttribute("aria-busy", "true");
    expect(busyBtn).toHaveAttribute("data-copy-state", "copying");

    // Spam clicks and shortcut presses must not fire additional writeText calls
    fireEvent.click(busyBtn);
    fireEvent.click(busyBtn);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(writeText).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    await waitFor(() => {
      const done = screen.getByRole("button", { name: /Copied|Copy prompt/i });
      expect(done).not.toBeDisabled();
    });
  });

  it("announces the copy result in an aria-live region", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { container } = render(<AIIndexing {...PROPS} />);
    const live = container.querySelector('[role="status"][aria-live="polite"]');
    expect(live).toBeTruthy();
    expect(live!.textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: /ChatGPT/i }));
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Copy prompt/i })),
    );

    await waitFor(() => expect(live!.textContent).toMatch(/Copied/));
  });
});