// E2E: verifies dataLayer push entries for copy events occur in the correct
// chronological order across failure -> fallback -> success. sessionId stays
// constant across attempts; attemptId differs and sorts monotonically.
import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

type DLEntry = {
  event?: string;
  session_id?: string;
  attempt_id?: string;
};

test.describe("AIIndexing — dataLayer chronological order per attempt", () => {
  test("failure push precedes success push; IDs consistent per attempt", async ({
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
        dataLayer: unknown[];
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
      w.dataLayer = [];
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
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();

    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();

    // Attempt 1: hang -> reject -> failure push.
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Attempt 2: hang -> reject -> execCommand fallback -> success push.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
    });
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: /Copy prompt/i, exact: false }).first(),
    ).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = true;
    });
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    const entries = (await page.evaluate(() => {
      const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
      const out: DLEntry[] = [];
      for (const raw of dl) {
        const args = Array.from(raw as ArrayLike<unknown>);
        if (args[0] !== "event") continue;
        const name = args[1] as string;
        if (
          name !== "ai_indexing_copy_succeeded" &&
          name !== "ai_indexing_copy_failed"
        )
          continue;
        const params = (args[2] ?? {}) as Record<string, unknown>;
        out.push({
          event: name,
          session_id: params.session_id as string,
          attempt_id: params.attempt_id as string,
        });
      }
      return out;
    })) as DLEntry[];

    // Exactly one failure and one success push, in that chronological order.
    const failIdx = entries.findIndex(
      (e) => e.event === "ai_indexing_copy_failed",
    );
    const okIdx = entries.findIndex(
      (e) => e.event === "ai_indexing_copy_succeeded",
    );
    expect(failIdx).toBeGreaterThanOrEqual(0);
    expect(okIdx).toBeGreaterThan(failIdx);

    const failEntry = entries[failIdx];
    const okEntry = entries[okIdx];

    // sessionId is stable across attempts.
    expect(failEntry.session_id).toBeTruthy();
    expect(failEntry.session_id).toBe(okEntry.session_id);

    // attemptId is per-attempt and monotonically ordered.
    expect(failEntry.attempt_id).toBeTruthy();
    expect(okEntry.attempt_id).toBeTruthy();
    expect(failEntry.attempt_id).not.toBe(okEntry.attempt_id);
    expect(String(failEntry.attempt_id) < String(okEntry.attempt_id)).toBe(
      true,
    );
  });
});
