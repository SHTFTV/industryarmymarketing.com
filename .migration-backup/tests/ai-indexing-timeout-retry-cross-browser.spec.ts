// Cross-engine variant of ai-indexing-inflight-timeout-retry.spec.ts.
// Runs the in-flight timeout → fallback retry flow on Firefox and WebKit
// and verifies focus returns to the correct Copy button with the same tab
// order as Chromium (Shift+Tab → this panel's "Open in <platform> ↗" link).

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const INFLIGHT_RECOVERY_BUDGET_MS = 15_000;

test.describe("AIIndexing — timeout → fallback retry (firefox + webkit)", () => {
  test("focus returns to Copy button; Tab order matches Chromium", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "firefox" && browserName !== "webkit",
      "chromium is covered by ai-indexing-inflight-timeout-retry.spec.ts",
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

    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");

    // Force the hang into a rejection so the UI surfaces the error state.
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });

    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: INFLIGHT_RECOVERY_BUDGET_MS });

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

    // Retry via fallback succeeds.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = true;
    });
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

    // Shift+Tab lands on this panel's "Open in Claude ↗" link — proves
    // tab order after recovery matches Chromium.
    await page.keyboard.press("Shift+Tab");
    const prev = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(prev.tag).toBe("A");
    expect(prev.text).toMatch(/Open in Claude/i);

    // Tab forward from Copy button → next platform's toggle button (Perplexity).
    await page
      .getByRole("button", { name: /Copied|Copy prompt/i })
      .first()
      .focus();
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(next.tag).toBe("BUTTON");
    expect(next.text).toMatch(/Perplexity/i);
  });
});