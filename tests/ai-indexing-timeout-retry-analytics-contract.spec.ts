// E2E: verifies the in-flight timeout → fallback retry flow emits exactly
// one analytics event per attempt AND that each event's CustomEvent detail
// payload matches the expected contract with no extra keys.
//
// Contract:
//   Failure payload keys (exact set):
//     event, platform, publication, articleUrl, copyMethod, failureReason
//   Success payload keys (exact set):
//     event, platform, publication, articleUrl, copyMethod
//
// Attempts:
//   1. Clipboard hangs → forced reject → single ai_indexing_copy_failed event
//   2. Fallback execCommand succeeds → single ai_indexing_copy_succeeded event

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

type Detail = {
  event: string;
  platform: string;
  publication: string;
  articleUrl: string;
  sessionId: string;
  attemptId: string;
  copyMethod?: string;
  failureReason?: string;
};

const SUCCESS_KEYS = [
  "event",
  "platform",
  "publication",
  "articleUrl",
  "sessionId",
  "attemptId",
  "copyMethod",
].sort();

const FAILURE_KEYS = [
  "event",
  "platform",
  "publication",
  "articleUrl",
  "sessionId",
  "attemptId",
  "failureReason",
].sort();

test.describe("AIIndexing — timeout retry analytics contract", () => {
  test("exactly one event per attempt with exact payload shape", async ({
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
        __customEvents?: unknown[];
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
      w.__customEvents = [];
      window.addEventListener("iam:ai-indexing", (e: Event) => {
        w.__customEvents!.push((e as CustomEvent).detail);
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

    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");

    // Force the hang into a rejection so a failure event fires.
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });

    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 15_000 });

    // Attempt 2: fallback succeeds.
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Give the microtask queue a beat so both events are flushed.
    await page.waitForTimeout(50);

    const events = (await page.evaluate(
      () =>
        (window as unknown as { __customEvents?: unknown[] }).__customEvents ??
        [],
    )) as Detail[];

    const failures = events.filter(
      (e) => e.event === "ai_indexing_copy_failed",
    );
    const successes = events.filter(
      (e) => e.event === "ai_indexing_copy_succeeded",
    );

    // Exactly one analytics event per attempt.
    expect(failures).toHaveLength(1);
    expect(successes).toHaveLength(1);

    // Failure payload shape: exact keys, exact values.
    const fail = failures[0];
    expect(Object.keys(fail).sort()).toEqual(FAILURE_KEYS);
    expect(fail.event).toBe("ai_indexing_copy_failed");
    expect(fail.platform).toBe("chatgpt");
    expect(fail.publication).toBe("iam");
    expect(fail.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    expect(typeof fail.failureReason).toBe("string");
    expect(fail.failureReason!.length).toBeGreaterThan(0);
    expect(typeof (fail as unknown as { sessionId: string }).sessionId).toBe("string");
    expect(typeof (fail as unknown as { attemptId: string }).attemptId).toBe("string");

    // Success payload shape: exact keys, exact values, no failureReason.
    const ok = successes[0];
    expect(Object.keys(ok).sort()).toEqual(SUCCESS_KEYS);
    expect(ok.event).toBe("ai_indexing_copy_succeeded");
    expect(ok.platform).toBe("chatgpt");
    expect(ok.publication).toBe("iam");
    expect(ok.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    // Component reports the fallback path as "fallback" (matches AnalyticsPayload union).
    expect(ok.copyMethod).toBe("fallback");
    expect(ok.failureReason).toBeUndefined();

    // Cross-attempt ID contract:
    //   sessionId is stable across the whole mount (same for failure + success).
    //   attemptId is generated per copyPrompt() call → the retry gets a NEW one.
    expect((fail as unknown as { sessionId: string }).sessionId).toBe(
      (ok as unknown as { sessionId: string }).sessionId,
    );
    expect((fail as unknown as { attemptId: string }).attemptId).not.toBe(
      (ok as unknown as { attemptId: string }).attemptId,
    );
  });
});