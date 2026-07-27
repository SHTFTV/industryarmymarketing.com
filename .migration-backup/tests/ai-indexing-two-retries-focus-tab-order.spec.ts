// E2E: after TWO consecutive timeout retries, focus returns to the correct
// Copy button on the currently opened platform panel, and the surrounding
// tab order matches the initial success path (Shift+Tab -> "Open in <plat> ↗",
// Tab -> "Copy prompt", Tab -> next focusable share control).
import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

async function captureTabOrder(page: import("@playwright/test").Page) {
  // Assumes activeElement is the Copy button. Walk Shift+Tab back one,
  // then Tab forward twice, snapshotting each active element.
  const snapshot = async () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        tag: el?.tagName ?? "",
        text: (el?.textContent ?? "").trim(),
        state: el?.getAttribute("data-copy-state") ?? "",
      };
    });

  const cur = await snapshot();
  await page.keyboard.press("Shift+Tab");
  const prev = await snapshot();
  await page.keyboard.press("Tab"); // back to Copy
  const back = await snapshot();
  await page.keyboard.press("Tab");
  const next = await snapshot();
  // Restore focus to Copy button.
  await page.keyboard.press("Shift+Tab");
  return { prev, cur, back, next };
}

test.describe("AIIndexing — two timeout retries preserve focus & tab order", () => {
  test("tab order after two retries matches initial success", async ({
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
      w.__clipMode = "resolve";
      w.__execAllow = true;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((resolve, reject) => {
                const poll = () => {
                  if (w.__clipMode === "resolve") return resolve();
                  if (w.__clipMode === "reject")
                    return reject(new DOMException("denied", "NotAllowedError"));
                  setTimeout(poll, 15);
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

    // ── Establish baseline tab order via initial success path. ────────────
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });
    // Focus should be on the Copied (success) button.
    const baseline = await captureTabOrder(page);
    expect(baseline.cur.text).toMatch(/Copied/i);
    expect(baseline.prev.tag).toBe("A");
    expect(baseline.prev.text).toMatch(/Open in Claude/i);

    // Reset state: reload not needed; we drive two timeout retries next.
    // Switch to hang mode to prep timeout attempts.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
    });

    // ── Retry #1: hang -> reject -> failure. ─────────────────────────────
    // The Copy button currently says "Copied"; press Enter (activeElement)
    // to trigger a new copy attempt.
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: /Copy prompt/i, exact: false }).first(),
    ).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 6000 });

    // ── Retry #2: hang again -> reject -> failure. ───────────────────────
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "hang";
    });
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: /Copy prompt/i, exact: false }).first(),
    ).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 6000 });

    // ── Final retry: allow fallback -> success. ──────────────────────────
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

    // Focus must be back on the same Claude Copy button.
    const after = await captureTabOrder(page);
    expect(after.cur.text).toMatch(/Copied/i);
    expect(after.cur.state).toBe("success");

    // Tab order matches the initial success path.
    expect(after.prev.tag).toBe(baseline.prev.tag);
    expect(after.prev.text).toBe(baseline.prev.text);
    expect(after.next.tag).toBe(baseline.next.tag);
    expect(after.next.text).toBe(baseline.next.text);
    expect(after.back.text).toBe(baseline.back.text);
  });
});
