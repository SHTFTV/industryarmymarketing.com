// E2E: simulate navigator.clipboard.writeText permission denial and confirm
// the fallback (execCommand-based) copy path takes over. Assertions:
//   • Exactly ONE analytics event fires for the copy attempt (never doubled).
//   • That event is ai_indexing_copy_succeeded with copyMethod=fallback,
//     OR ai_indexing_copy_failed with a valid failureReason.
//   • The aria-live announcement reads "Copied ✓" (on success) or
//     "Copy failed" (on failure).
//   • The event payload carries the platform id, publication, and the
//     canonical article URL byte-for-byte.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

test.describe("AIIndexing — clipboard permission denied → fallback", () => {
  test("fallback copy path fires exactly one analytics event and announces success", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Fallback assertions rely on Chromium's execCommand behavior",
    );

    // Inject before any page script runs: force navigator.clipboard.writeText
    // to reject with a NotAllowedError (permission denied).
    await page.addInitScript(() => {
      const denied = () =>
        Promise.reject(
          Object.assign(new Error("NotAllowedError"), { name: "NotAllowedError" }),
        );
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get: () => ({
            writeText: denied,
            readText: () =>
              Promise.resolve(
                (window as unknown as { __fallbackClipboard?: string })
                  .__fallbackClipboard ?? "",
              ),
          }),
        });
      } catch {
        /* some engines lock this — ignore, test.skip guards behaviour */
      }

      // Capture whatever the execCommand-based fallback selects, so we can
      // read the "clipboard" contents even though real writeText was denied.
      const originalExec = document.execCommand?.bind(document);
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          const sel = document.getSelection?.()?.toString() ?? "";
          (window as unknown as { __fallbackClipboard?: string }).__fallbackClipboard = sel;
          return true;
        }
        return originalExec ? originalExec(cmd) : false;
      }) as typeof document.execCommand;

      // Buffer analytics events for later assertion from Node.
      const buf: unknown[] = [];
      (window as unknown as { __aiEvents?: unknown[] }).__aiEvents = buf;
      window.addEventListener("iam:ai-indexing", (e: Event) => {
        buf.push((e as CustomEvent).detail);
      });
    });

    await page.goto(`/blog/${SLUG}`);
    const section = page.getByText(/IAM AI Indexing Section/i).first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    // Open ChatGPT and click Copy prompt (mouse path, not shortcut).
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    const live = page
      .locator('[data-testid="ai-indexing-live-region"]')
      .first();
    await expect(live).toHaveText(/Copied|Copy failed/i, { timeout: 3000 });

    // Read buffered analytics events from the page.
    type Detail = {
      event: string;
      platform: string;
      publication: string;
      articleUrl: string;
      copyMethod?: string;
      failureReason?: string;
    };
    const events = (await page.evaluate(
      () =>
        (window as unknown as { __aiEvents?: unknown[] }).__aiEvents ?? [],
    )) as Detail[];

    const copyEvents = events.filter(
      (e) =>
        e.event === "ai_indexing_copy_succeeded" ||
        e.event === "ai_indexing_copy_failed",
    );
    // Exactly one copy event — clipboard rejection must NOT double-fire with
    // the fallback outcome.
    expect(copyEvents).toHaveLength(1);

    const ev = copyEvents[0];
    expect(ev.platform).toBe("chatgpt");
    expect(ev.publication).toBe("iam");
    expect(ev.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);

    if (ev.event === "ai_indexing_copy_succeeded") {
      expect(ev.copyMethod).toBe("fallback");
      expect(ev.failureReason).toBeUndefined();
      await expect(live).toHaveText(/Copied/i);
      // Fallback captured the selected text — should include canonical URL.
      const buffered = await page.evaluate(
        () =>
          (window as unknown as { __fallbackClipboard?: string })
            .__fallbackClipboard ?? "",
      );
      expect(buffered).toContain(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    } else {
      expect(ev.copyMethod).toBeUndefined();
      expect(["permission", "no_clipboard", "exec_command", "exception"]).toContain(
        ev.failureReason,
      );
      await expect(live).toHaveText(/Copy failed/i);
    }
  });
});