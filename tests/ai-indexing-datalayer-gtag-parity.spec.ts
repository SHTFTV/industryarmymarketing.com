// E2E: verifies that dataLayer.push payloads and gtag() parameter payloads
// carry identical sessionId/attemptId across BOTH success and failure states.
//
// Contract under test (see src/components/AIIndexing.tsx → trackAIIndexing):
//   • dataLayer.push receives the raw AnalyticsPayload → keys sessionId / attemptId.
//   • gtag("event", name, params) receives snake_case params → session_id / attempt_id.
// The values MUST match 1:1 for every fired event. This test proves both
// analytics sinks stay in lock-step so downstream GA4 + GTM dashboards agree.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

type DLEntry = {
  event: string;
  sessionId?: string;
  attemptId?: string;
};

type GtagCall = [
  "event",
  string,
  {
    session_id?: string;
    attempt_id?: string;
    platform?: string;
  },
];

test.describe("AIIndexing — dataLayer ↔ gtag identifier parity", () => {
  test("session_id/attempt_id match across success + failure", async ({
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
        gtag: (...args: unknown[]) => void;
        __gtagCalls: unknown[][];
      };
      w.__clipMode = "reject";
      w.__execAllow = false;
      w.dataLayer = [];
      w.__gtagCalls = [];
      w.gtag = (...args: unknown[]) => {
        w.__gtagCalls.push(args);
      };

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
    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();

    // ── Attempt 1: failure (clipboard rejects, fallback denied). ────────
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // ── Attempt 2: success via fallback (execCommand allowed). ──────────
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(50);

    const { dl, gtag } = await page.evaluate(() => {
      const w = window as unknown as {
        dataLayer: unknown[];
        __gtagCalls: unknown[][];
      };
      return { dl: w.dataLayer, gtag: w.__gtagCalls };
    });

    const dlEvents = (dl as DLEntry[]).filter(
      (e) =>
        e?.event === "ai_indexing_copy_failed" ||
        e?.event === "ai_indexing_copy_succeeded",
    );
    const gtagEvents = (gtag as GtagCall[]).filter(
      (c) =>
        c[0] === "event" &&
        (c[1] === "ai_indexing_copy_failed" ||
          c[1] === "ai_indexing_copy_succeeded"),
    );

    // Exactly one of each in each sink.
    expect(dlEvents).toHaveLength(2);
    expect(gtagEvents).toHaveLength(2);

    // Pair by event name; assert cross-sink id parity for each event.
    for (const name of [
      "ai_indexing_copy_failed",
      "ai_indexing_copy_succeeded",
    ] as const) {
      const dlHit = dlEvents.find((e) => e.event === name)!;
      const gtagHit = gtagEvents.find((c) => c[1] === name)!;
      expect(dlHit, `dataLayer missing ${name}`).toBeTruthy();
      expect(gtagHit, `gtag missing ${name}`).toBeTruthy();

      const params = gtagHit[2];
      expect(params.session_id).toBe(dlHit.sessionId);
      expect(params.attempt_id).toBe(dlHit.attemptId);
      expect(typeof params.session_id).toBe("string");
      expect(typeof params.attempt_id).toBe("string");
      expect(params.session_id!.length).toBeGreaterThan(0);
      expect(params.attempt_id!.length).toBeGreaterThan(0);
    }

    // Cross-attempt contract: sessionId stable, attemptId regenerated.
    const fail = dlEvents.find((e) => e.event === "ai_indexing_copy_failed")!;
    const ok = dlEvents.find((e) => e.event === "ai_indexing_copy_succeeded")!;
    expect(fail.sessionId).toBe(ok.sessionId);
    expect(fail.attemptId).not.toBe(ok.attemptId);
  });
});
