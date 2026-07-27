// Cross-engine variant of ai-indexing-denial-retry-focus.spec.ts.
// Runs the same in-flight permission denial → retry → focus/tab-order
// assertions on Firefox and WebKit to catch engine-specific focus and
// keyboard-navigation regressions. Chromium is covered by the sibling spec.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — denial → retry focus (firefox + webkit)", () => {
  test("focus returns to Copy button; Tab order preserved", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "firefox" && browserName !== "webkit",
      "chromium is covered by ai-indexing-denial-retry-focus.spec.ts",
    );

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

    await page.getByRole("button", { name: /^Perplexity\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    // Attempt 1: permission denial → fallback fails → error state.
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 3000 });

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

    // Attempt 2: allow fallback to succeed.
    await page.evaluate(() => {
      (window as unknown as { __execAllow: boolean }).__execAllow = true;
    });
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

    // Shift+Tab → sibling "Open in Perplexity ↗" link.
    await page.keyboard.press("Shift+Tab");
    const prev = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(prev.tag).toBe("A");
    expect(prev.text).toMatch(/Open in Perplexity/i);

    // Tab forward from Copy button → next platform's toggle button (Grok).
    await page.getByRole("button", { name: /Copied|Copy prompt/i }).first().focus();
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return { tag: el?.tagName ?? "", text: el?.textContent?.trim() ?? "" };
    });
    expect(next.tag).toBe("BUTTON");
    expect(next.text).toMatch(/Grok/i);
  });
});