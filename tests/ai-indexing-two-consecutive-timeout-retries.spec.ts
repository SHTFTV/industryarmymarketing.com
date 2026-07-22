// E2E: triggers TWO consecutive timeout retries and verifies that:
//   • sessionId stays identical across all attempts (single mount).
//   • attemptId is unique per attempt AND monotonically ordered (attempt 2
//     sorts strictly after attempt 1, attempt 3 sorts strictly after 2, etc.).
//   • Every attempt fires exactly one analytics event (no duplicates).
//
// Determinism aids:
//   • crypto.randomUUID is stubbed with a monotonic counter so attemptId
//     ordering can be asserted with strict string comparison.
//   • Clipboard resolution is gated by a window flag flipped from the test.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

type Detail = {
  event: string;
  sessionId: string;
  attemptId: string;
  copyMethod?: string;
  failureReason?: string;
};

test.describe("AIIndexing — two consecutive timeout retries", () => {
  test("sessionId constant, attemptId increments monotonically", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "requires chromium init-script overrides",
    );

    await page.addInitScript(() => {
      const w = window as unknown as {
        __idSeq: number;
        __clipMode: "hang" | "resolve" | "reject";
        __execAllow: boolean;
        __events: unknown[];
      };
      w.__idSeq = 0;
      w.__clipMode = "hang";
      w.__execAllow = false;
      w.__events = [];

      const origCrypto = (globalThis as unknown as { crypto?: Crypto }).crypto;
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        get() {
          return {
            ...origCrypto,
            randomUUID: () => {
              w.__idSeq += 1;
              const seq = String(w.__idSeq).padStart(12, "0");
              return `00000000-0000-4000-8000-${seq}` as `${string}-${string}-${string}-${string}-${string}`;
            },
          };
        },
      });

      window.addEventListener("iam:ai-indexing", (e: Event) => {
        w.__events.push((e as CustomEvent).detail);
      });

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
                  setTimeout(poll, 10);
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
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();

    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();

    // ── Attempt #1: hang → reject → failure. ────────────────────────────
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // ── Attempt #2: reset to hang → reject → second failure. ────────────
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
    ).toBeVisible({ timeout: 5000 });

    // ── Attempt #3: allow fallback → success. ───────────────────────────
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

    await page.waitForTimeout(60);

    const events = (await page.evaluate(
      () => (window as unknown as { __events: unknown[] }).__events,
    )) as Detail[];

    const copyEvents = events.filter(
      (e) =>
        e.event === "ai_indexing_copy_succeeded" ||
        e.event === "ai_indexing_copy_failed",
    );

    // Exactly one event per attempt → three copy events total.
    expect(copyEvents).toHaveLength(3);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_failed"),
    ).toHaveLength(2);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_succeeded"),
    ).toHaveLength(1);

    // sessionId is stable across all three attempts.
    const sessionIds = new Set(copyEvents.map((e) => e.sessionId));
    expect(sessionIds.size).toBe(1);

    // attemptIds are all distinct AND monotonically ordered.
    const attemptIds = copyEvents.map((e) => e.attemptId);
    expect(new Set(attemptIds).size).toBe(3);
    expect(attemptIds[0] < attemptIds[1]).toBe(true);
    expect(attemptIds[1] < attemptIds[2]).toBe(true);

    // Shape sanity — session/attempt prefixes.
    for (const e of copyEvents) {
      expect(e.sessionId).toMatch(/^s_/);
      expect(e.attemptId).toMatch(/^a_/);
    }
  });
});
