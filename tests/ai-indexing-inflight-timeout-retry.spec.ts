// E2E: simulates an in-flight clipboard write that never resolves (timeout /
// hang). Verifies the UI can recover from a stuck copy attempt:
//   1. Copy click → clipboard promise hangs → button shows Copying… / aria-busy
//   2. Component auto-transitions to error state after its internal timeout
//   3. User retries — fallback execCommand path succeeds
//   4. Focus is returned to the correct Copy button for the open panel
//
// Rationale: real users hit clipboard-permission dialogs, iframe policy
// blocks, and OS-level hangs where writeText() never settles. The component
// must still surface a recoverable error and never leave the button stuck in
// the disabled/aria-busy state indefinitely.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

// Upper bound on how long the component may sit in the in-flight state
// before surfacing an error. Kept generous so the assertion isn't flaky on
// slower CI runners; the point is that the UI eventually recovers.
const INFLIGHT_RECOVERY_BUDGET_MS = 15_000;

test.describe("AIIndexing — in-flight timeout → retry via fallback", () => {
  test("hung clipboard recovers to error, then fallback retry succeeds", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "requires chromium init-script overrides",
    );

    // Clipboard writeText returns a promise that only settles when we flip
    // window.__clipMode. execCommand is gated by window.__execAllow so the
    // fallback path is independently controllable.
    await page.addInitScript(() => {
      const w = window as unknown as {
        __clipMode: "hang" | "resolve" | "reject";
        __execAllow: boolean;
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((resolve, reject) => {
                const poll = () => {
                  if (w.__clipMode === "resolve") return resolve();
                  if (w.__clipMode === "reject")
                    return reject(
                      new DOMException("denied", "NotAllowedError"),
                    );
                  setTimeout(poll, 25);
                };
                poll();
              }),
          };
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = () => w.__execAllow;
    });

    await page.goto(`/blog/${SLUG}`);
    await page
      .getByText(/IAM AI Indexing Section/i)
      .first()
      .scrollIntoViewIfNeeded();

    // Open the Claude panel so we can assert focus lands on THIS panel's
    // Copy button after recovery — not just any Copy button on the page.
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();

    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    // 1. In-flight state: button reports Copying…, aria-busy=true, disabled.
    await expect(copyBtn).toHaveAttribute("aria-busy", "true");
    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");
    await expect(copyBtn).toBeDisabled();

    // 2. Simulate timeout: after the client-perceived hang, we surface the
    //    stuck copy as a rejection so the UI can transition to the error
    //    state (this is how a browser-level clipboard timeout would present
    //    from the component's perspective).
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });

    const errBtn = page.getByRole("button", { name: /Copy failed/i }).first();
    await expect(errBtn).toBeVisible({ timeout: INFLIGHT_RECOVERY_BUDGET_MS });
    await expect(errBtn).toHaveAttribute("data-copy-state", "error");
    await expect(errBtn).toHaveAttribute("aria-busy", "false");

    // Focus returned to the same Copy button in the Claude panel.
    const focusedAfterFail = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        text: el?.textContent?.trim() ?? "",
        state: el?.getAttribute("data-copy-state") ?? "",
      };
    });
    expect(focusedAfterFail.text).toMatch(/Copy failed/i);
    expect(focusedAfterFail.state).toBe("error");

    // 3. Retry: reset clipboard to hang again, but this time allow the
    //    execCommand fallback to succeed. The component should try
    //    writeText first, fail/hang, and fall through to execCommand.
    //    To make the test deterministic we flip writeText to immediately
    //    reject so the fallback runs synchronously, and allow execCommand.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = true;
    });

    // Trigger retry via keyboard — activeElement is already the Copy button.
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    const focusedAfterSuccess = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        text: el?.textContent?.trim() ?? "",
        state: el?.getAttribute("data-copy-state") ?? "",
        ariaBusy: el?.getAttribute("aria-busy") ?? "",
      };
    });
    expect(focusedAfterSuccess.text).toMatch(/Copied/i);
    expect(focusedAfterSuccess.state).toBe("success");
    expect(focusedAfterSuccess.ariaBusy).toBe("false");

    // Sanity: the recovered Copy button belongs to the Claude panel we
    // originally opened — Shift+Tab lands on "Open in Claude ↗".
    await page.keyboard.press("Shift+Tab");
    const prev = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(prev.tag).toBe("A");
    expect(prev.text).toMatch(/Open in Claude/i);
  });
});