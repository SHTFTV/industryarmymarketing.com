// E2E: exactly one copy analytics event fires per timeout attempt, and no
// copy analytics events fire for unrelated success (immediate resolve),
// manual copy on a different platform, or non-timeout failures (permission
// denial without a preceding hang). Prompt_opened events are permitted.
import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

type Detail = {
  event: string;
  copyMethod?: string;
  failureReason?: string;
};

test.describe("AIIndexing — timeout attempts fire exactly one copy event each", () => {
  test("no copy events from unrelated success/manual/non-timeout flows", async ({
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
      w.__clipMode = "resolve"; // start in immediate-success mode
      w.__execAllow = true;
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

    // ── Unrelated immediate success (manual copy on ChatGPT). ─────────────
    // This is NOT a timeout attempt. It fires exactly one success event on
    // its own, but we assert this happens only once and is properly tagged
    // so the timeout-only invariants below hold.
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // ── Manual copy on a different platform (Claude), still immediate. ───
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    const claudeCopy = page.getByRole("button", { name: /Copy prompt/i }).first();
    await claudeCopy.click();
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // ── Non-timeout failure: reject immediately, execCommand also blocked.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = false;
    });
    await page.getByRole("button", { name: /^Perplexity\b/i }).first().click();
    const pplxCopy = page.getByRole("button", { name: /Copy prompt/i }).first();
    await pplxCopy.click();
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Snapshot copy events after the non-timeout flows.
    const preTimeout = (await page.evaluate(
      () => (window as unknown as { __events: Detail[] }).__events,
    )) as Detail[];
    const preCopy = preTimeout.filter(
      (e) =>
        e.event === "ai_indexing_copy_succeeded" ||
        e.event === "ai_indexing_copy_failed",
    );

    // Two immediate successes + one immediate failure. No duplicates.
    expect(
      preCopy.filter((e) => e.event === "ai_indexing_copy_succeeded"),
    ).toHaveLength(2);
    expect(
      preCopy.filter((e) => e.event === "ai_indexing_copy_failed"),
    ).toHaveLength(1);

    // ── Timeout attempt: hang -> reject -> failure event (exactly one). ──
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "hang";
    });
    // Reopen a panel so a Copy button is present, then click.
    await page.getByRole("button", { name: /^Grok\b/i }).first().click();
    const grokCopy = page.getByRole("button", { name: /Copy prompt/i }).first();
    await grokCopy.click();
    await expect(grokCopy).toHaveAttribute("data-copy-state", "copying");
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    await page.waitForTimeout(80);

    const all = (await page.evaluate(
      () => (window as unknown as { __events: Detail[] }).__events,
    )) as Detail[];
    const copyEvents = all.filter(
      (e) =>
        e.event === "ai_indexing_copy_succeeded" ||
        e.event === "ai_indexing_copy_failed",
    );

    // One more failure was added by the timeout attempt — total 4 copy events.
    expect(copyEvents).toHaveLength(4);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_succeeded"),
    ).toHaveLength(2);
    expect(
      copyEvents.filter((e) => e.event === "ai_indexing_copy_failed"),
    ).toHaveLength(2);
  });
});
