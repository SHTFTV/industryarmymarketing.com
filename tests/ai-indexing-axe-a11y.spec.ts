// axe-core accessibility scan for the AIIndexing section across its key
// interactive states:
//   1. Dropdown open (idle)
//   2. In-flight copy (loading/disabled + aria-busy)
//   3. Success announcement (aria-live populated)
//   4. Failure announcement (aria-live populated, error state)
//
// The scan is scoped to the AIIndexing container so unrelated blog content
// violations don't fail this suite. We also assert focus stays within the
// component during the copy interaction (soft focus-trap behavior — the
// Copy button is re-focused after clipboard resolution).

import { test, expect } from "../playwright-fixture";
import AxeBuilder from "@axe-core/playwright";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const SECTION_SELECTOR =
  '[data-testid="ai-indexing-live-region"] >> xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," mt-12 ")][1]';

async function scan(page: import("@playwright/test").Page) {
  return await new AxeBuilder({ page })
    .include(SECTION_SELECTOR)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
}

test.describe("AIIndexing — axe-core accessibility", () => {
  test("no violations across idle, in-flight, success, and failure states", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "axe scan pinned to chromium for deterministic rule execution",
    );

    // Toggleable clipboard: resolve/reject on demand so we can pause the
    // in-flight state long enough to scan it.
    await page.addInitScript(() => {
      const w = window as unknown as {
        __clipResolve?: () => void;
        __clipReject?: (e: unknown) => void;
        __clipMode: "resolve" | "reject";
      };
      w.__clipMode = "resolve";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((resolve, reject) => {
                w.__clipResolve = () => resolve();
                w.__clipReject = () =>
                  reject(new DOMException("denied", "NotAllowedError"));
              }),
          };
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = () => false;
    });

    await page.goto(`/blog/${SLUG}`);
    await page
      .getByText(/IAM AI Indexing Section/i)
      .first()
      .scrollIntoViewIfNeeded();

    // ── 1. Idle open state ─────────────────────────────────────
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const idleResults = await scan(page);
    expect(idleResults.violations, JSON.stringify(idleResults.violations, null, 2))
      .toEqual([]);

    // ── 2. In-flight copy state (aria-busy=true, disabled) ─────
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("aria-busy", "true");
    const inflightResults = await scan(page);
    expect(
      inflightResults.violations,
      JSON.stringify(inflightResults.violations, null, 2),
    ).toEqual([]);

    // ── 3. Success state (aria-live populated) ─────────────────
    await page.evaluate(() => {
      (window as unknown as { __clipResolve?: () => void }).__clipResolve?.();
    });
    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 3000 });

    // Soft focus-trap check: after copy resolves, focus is restored to the
    // Copy button — never escapes the AIIndexing section.
    const focusedInSection = await page.evaluate((sel) => {
      const active = document.activeElement;
      // Walk up: is the focused element inside the AIIndexing container?
      const container = document.querySelector(
        '[data-testid="ai-indexing-live-region"]',
      )?.parentElement?.parentElement;
      return !!(container && active && container.contains(active));
    }, SECTION_SELECTOR);
    expect(focusedInSection).toBe(true);

    const successResults = await scan(page);
    expect(
      successResults.violations,
      JSON.stringify(successResults.violations, null, 2),
    ).toEqual([]);

    // ── 4. Failure state ───────────────────────────────────────
    // Trigger a second copy attempt, this time reject.
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("aria-busy", "true");
    await page.evaluate(() => {
      (window as unknown as { __clipReject?: (e: unknown) => void }).__clipReject?.(
        null,
      );
    });
    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 3000 });

    const failureResults = await scan(page);
    expect(
      failureResults.violations,
      JSON.stringify(failureResults.violations, null, 2),
    ).toEqual([]);

    // Focus remains on the Copy button in the failure state as well.
    const focusedAfterFail = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute("data-copy-state") ?? "";
    });
    expect(focusedAfterFail).toBe("error");
  });
});