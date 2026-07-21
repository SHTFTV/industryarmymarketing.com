// E2E: in-flight clipboard permission denial → user retries → fallback
// execCommand succeeds. Verifies that after both attempts focus lands back on
// the correct AIIndexing "Copy prompt" button for the currently-open panel,
// and that the keyboard Tab order from that button walks through the expected
// controls (Open in <platform>, then the next panel's toggle / share links).

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — denial → retry restores focus + preserves tab order", () => {
  test("focus returns to Copy button; Tab walks to Open-in link next", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "requires chromium init-script overrides");

    // Toggleable clipboard + execCommand:
    //   • writeText always rejects with NotAllowedError (permission denial).
    //   • execCommand("copy") returns window.__execAllow — flip to true for retry.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((_, reject) =>
                setTimeout(
                  () => reject(new DOMException("denied", "NotAllowedError")),
                  30,
                ),
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
    await page
      .getByText(/IAM AI Indexing Section/i)
      .first()
      .scrollIntoViewIfNeeded();

    // Open the Perplexity panel so we can assert focus lands on THIS panel's
    // Copy button — not just any Copy button on the page.
    await page.getByRole("button", { name: /^Perplexity\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    // Attempt 1: in-flight permission denial → fallback fails → error state.
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 3000 });

    // Focus must be returned to the same Copy button in the open panel.
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

    // Attempt 2: allow the fallback path to succeed on retry.
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });

    // Retry via keyboard (Enter) — activeElement is already the Copy button.
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 3000 });

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

    // Tab order: from the Copy button, Shift+Tab should land on the sibling
    // "Open in Perplexity ↗" link (rendered immediately before the Copy button
    // in the same expanded panel row).
    await page.keyboard.press("Shift+Tab");
    const prev = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(prev.tag).toBe("A");
    expect(prev.text).toMatch(/Open in Perplexity/i);

    // Forward Tab from the Copy button should leave the current panel and
    // reach the next platform's toggle button (Grok, the last item).
    // Return focus to the Copy button first.
    await page.getByRole("button", { name: /Copied|Copy prompt/i }).first().focus();
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    // The very next tab stop is the Grok panel's header toggle button.
    expect(next.tag).toBe("BUTTON");
    expect(next.text).toMatch(/Grok/i);
  });
});