// E2E: keyboard-only variant of the in-flight timeout → fallback retry flow.
// The user never touches the mouse — Tab to the panel toggle, Enter to open,
// Tab to Copy prompt, Enter to trigger the copy, wait for the hung clipboard
// to be surfaced as an error, then Enter again to retry via the execCommand
// fallback. Asserts aria-live announcements and focus transitions match the
// mouse-driven flow covered by ai-indexing-inflight-timeout-retry.spec.ts.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const INFLIGHT_RECOVERY_BUDGET_MS = 15_000;

test.describe("AIIndexing — keyboard-only timeout → fallback retry", () => {
  test("hung clipboard recovers to error, keyboard retry succeeds via fallback", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "requires chromium init-script overrides",
    );

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

    // Focus the Claude panel toggle programmatically (equivalent to the
    // user having Tabbed there) then use pure keyboard from that point.
    await page.getByRole("button", { name: /^Claude\b/i }).first().focus();
    await page.keyboard.press("Enter");

    // Tab forward until focus lands on this panel's Copy prompt button.
    // Bounded loop so the test can't hang if the DOM order changes.
    let landed = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return {
          text: el?.textContent?.trim() ?? "",
          state: el?.getAttribute("data-copy-state") ?? "",
        };
      });
      if (/Copy prompt/i.test(info.text) && info.state === "idle") {
        landed = true;
        break;
      }
    }
    expect(landed).toBe(true);

    // Attempt 1: keyboard-activate copy — clipboard hangs.
    await page.keyboard.press("Enter");

    const live = page
      .locator('[data-testid="ai-indexing-live-region"]')
      .first();

    // In-flight aria-live announcement.
    await expect(live).toHaveText(/Copying|In progress/i, { timeout: 3000 });

    // Force the hung writeText to reject so the component surfaces error.
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });

    await expect(live).toHaveText(/Copy failed|failed/i, {
      timeout: INFLIGHT_RECOVERY_BUDGET_MS,
    });

    const focusedAfterFail = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        text: el?.textContent?.trim() ?? "",
        state: el?.getAttribute("data-copy-state") ?? "",
        ariaBusy: el?.getAttribute("aria-busy") ?? "",
      };
    });
    expect(focusedAfterFail.text).toMatch(/Copy failed/i);
    expect(focusedAfterFail.state).toBe("error");
    expect(focusedAfterFail.ariaBusy).toBe("false");

    // Attempt 2: allow the execCommand fallback to succeed on retry.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = true;
    });

    // Retry entirely via keyboard.
    await page.keyboard.press("Enter");

    await expect(live).toHaveText(/Copied/i, { timeout: 5000 });

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

    // Shift+Tab must land on this panel's "Open in Claude ↗" link, proving
    // the keyboard-only flow preserved tab order within the Claude panel.
    await page.keyboard.press("Shift+Tab");
    const prev = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(prev.tag).toBe("A");
    expect(prev.text).toMatch(/Open in Claude/i);
  });
});