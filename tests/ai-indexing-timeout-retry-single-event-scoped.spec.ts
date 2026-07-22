// E2E: proves the timeout-retry path fires exactly ONE analytics event per
// attempt (one failure + one success) and that unrelated interactions on the
// page — opening the dropdown, switching platforms, hovering share buttons —
// do NOT produce additional copy_succeeded / copy_failed events, nor do they
// add any extra keys to the analytics payload.
//
// This complements the strict-payload contract test by scoping the "exactly
// once" invariant to the timeout-retry flow specifically. Prompt_opened
// events are permitted (that's their purpose); copy_* events are counted.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

type Detail = {
  event: string;
  copyMethod?: string;
  failureReason?: string;
};

const ALLOWED_KEYS = new Set([
  "event",
  "platform",
  "publication",
  "articleUrl",
  "sessionId",
  "attemptId",
  "copyMethod",
  "failureReason",
]);

test.describe("AIIndexing — timeout-retry emits exactly one event per attempt", () => {
  test("no extra copy events from unrelated interactions", async ({
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
        __events: unknown[];
      };
      w.__clipMode = "hang";
      w.__execAllow = false;
      w.__events = [];
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
                  setTimeout(poll, 20);
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

    // Noise: open + close multiple dropdowns before the actual copy flow.
    // These MUST NOT emit copy_succeeded / copy_failed events.
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    await page.getByRole("button", { name: /^Perplexity\b/i }).first().click();
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();

    // Attempt 1: hang → reject → failure event.
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    // Attempt 2: fallback allowed → success event.
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // More noise AFTER the flow — must still not produce copy events.
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    await page.waitForTimeout(80);

    const events = (await page.evaluate(
      () => (window as unknown as { __events: unknown[] }).__events,
    )) as Detail[];

    const copyEvents = events.filter(
      (e) =>
        e.event === "ai_indexing_copy_succeeded" ||
        e.event === "ai_indexing_copy_failed",
    );

    // Exactly two copy events total: one failure + one success.
    expect(copyEvents).toHaveLength(2);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_failed"),
    ).toHaveLength(1);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_succeeded"),
    ).toHaveLength(1);

    // No extra payload fields on any copy event.
    for (const evt of copyEvents) {
      for (const k of Object.keys(evt)) {
        expect(
          ALLOWED_KEYS.has(k),
          `unexpected key "${k}" on ${evt.event}`,
        ).toBe(true);
      }
    }
  });
});
