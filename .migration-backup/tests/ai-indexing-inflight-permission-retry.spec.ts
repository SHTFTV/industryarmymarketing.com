// E2E: An in-flight copy hits permission denial from navigator.clipboard.writeText,
// the fallback path fails on that attempt (recorded as a failure), then the user
// retries and this time the fallback (execCommand) succeeds. Verifies:
//   • Attempt 1 records exactly one FAILURE analytics event (failureReason: "permission").
//   • Attempt 2 records exactly one SUCCESS analytics event (copyMethod: "fallback").
//   • aria-live announcements transition "Copy failed" -> "Copied ✓".
//   • Exactly one analytics event per attempt, no duplicates.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — in-flight permission denial then fallback retry", () => {
  test("failure transitions to success and analytics fires once per attempt", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "requires chromium init-script overrides");

    // Install BEFORE app scripts:
    //   • navigator.clipboard.writeText rejects with a fake permission error.
    //   • document.execCommand("copy") is toggleable via window.__execAllow.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((_, reject) =>
                setTimeout(() => reject(new DOMException("denied", "NotAllowedError")), 40),
              ),
          };
        },
      });
      (window as unknown as { __execAllow: boolean }).__execAllow = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = () =>
        (window as unknown as { __execAllow: boolean }).__execAllow;
    });

    await page.goto(`/blog/${SLUG}`);
    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      (window as unknown as { __events: unknown[] }).__events = [];
      window.addEventListener("iam:ai-indexing", (e) =>
        (window as unknown as { __events: unknown[] }).__events.push(
          (e as CustomEvent).detail,
        ),
      );
    });

    // Open ChatGPT and kick off attempt #1 (in-flight then denied, fallback fails).
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
    await expect(live).toHaveText(/Copy failed/i, { timeout: 3000 });

    let events = await page.evaluate(
      () =>
        (window as unknown as { __events: Array<Record<string, unknown>> }).__events,
    );
    let failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
    let succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
    expect(failed).toHaveLength(1);
    expect(failed[0]).toMatchObject({ platform: "chatgpt", failureReason: "permission" });
    expect(succeeded).toHaveLength(0);

    // Attempt #2: allow the fallback path to succeed. Clipboard promise still
    // rejects, so execCommand runs and now returns true.
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });

    // Wait until the copy button re-enables (isCopying resets in `finally`).
    await expect(page.getByRole("button", { name: /Copy prompt|Copy failed/i }).first())
      .toBeEnabled();

    await page.getByRole("button", { name: /Copy prompt|Copy failed/i }).first().click();

    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

    events = await page.evaluate(
      () =>
        (window as unknown as { __events: Array<Record<string, unknown>> }).__events,
    );
    failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
    succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
    expect(failed).toHaveLength(1); // unchanged
    expect(succeeded).toHaveLength(1);
    expect(succeeded[0]).toMatchObject({ platform: "chatgpt", copyMethod: "fallback" });
  });
});
