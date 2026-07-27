// E2E: keyboard-only navigation through the AIIndexing section.
//   • Tab to focus a platform toggle
//   • Enter to open it, Tab to the next toggle, Enter to switch platforms
//   • Ctrl/Cmd+K to copy
// Verifies the CustomEvent payload matches the currently-selected platform
// and reports copyMethod: "clipboard". No mouse interactions used.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

const PLATFORM_LABELS = ["ChatGPT", "Claude", "Perplexity", "Grok"] as const;
const PLATFORM_IDS: Record<(typeof PLATFORM_LABELS)[number], string> = {
  ChatGPT: "chatgpt",
  Claude: "claude",
  Perplexity: "perplexity",
  Grok: "grok",
};

test.describe("AIIndexing — keyboard-only platform switching", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("Tab/Enter to switch platforms, Ctrl/Cmd+K to copy — payload matches selection", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Clipboard perms are Chromium-scoped");

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

    // Focus the first platform toggle via keyboard (no mouse).
    await page
      .getByRole("button", { name: new RegExp(`^${PLATFORM_LABELS[0]}\\b`, "i") })
      .first()
      .focus();
    await expect(
      page
        .getByRole("button", { name: new RegExp(`^${PLATFORM_LABELS[0]}\\b`, "i") })
        .first(),
    ).toBeFocused();

    // Walk through every platform: open with Enter, verify, then close and Tab.
    for (let i = 0; i < PLATFORM_LABELS.length; i++) {
      const label = PLATFORM_LABELS[i];
      await expect(
        page.getByRole("button", { name: new RegExp(`^${label}\\b`, "i") }).first(),
      ).toBeFocused();

      // Open panel with Enter.
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("link", { name: new RegExp(`Open in ${label}`, "i") }).first(),
      ).toBeVisible();

      // Copy via Ctrl/Cmd+K.
      await page.keyboard.press("ControlOrMeta+k");
      await expect(
        page.locator('[data-testid="ai-indexing-live-region"]').first(),
      ).toHaveText(/Copied/i, { timeout: 3000 });

      const events = await page.evaluate(
        () =>
          (window as unknown as { __events: Array<Record<string, unknown>> }).__events,
      );
      const successes = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
      const latest = successes[successes.length - 1];
      expect(latest, `no success event after copying ${label}`).toBeTruthy();
      expect(latest).toMatchObject({
        platform: PLATFORM_IDS[label],
        copyMethod: "clipboard",
      });

      // Close panel: Shift+Tab back to the toggle, Enter to collapse, Tab forward
      // to the next platform's toggle. (When the panel is open, the toggle is
      // the previous focusable element from Copy prompt; on success focus is
      // on Copy prompt, so Shift+Tab lands on "Open in <platform>" link first.)
      // Simplest deterministic path: click via keyboard Space on the toggle.
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${label}\\b`, "i") })
        .first();
      await toggle.focus();
      await page.keyboard.press("Enter"); // collapse

      if (i < PLATFORM_LABELS.length - 1) {
        // Tab to the next platform's toggle. Panels are collapsed so Tab
        // lands directly on the next toggle button.
        await page.keyboard.press("Tab");
      }
    }

    // Every platform should have exactly one recorded success event.
    const finalEvents = await page.evaluate(
      () =>
        (window as unknown as { __events: Array<Record<string, unknown>> }).__events
          .filter((e) => e.event === "ai_indexing_copy_succeeded")
          .map((e) => e.platform),
    );
    for (const label of PLATFORM_LABELS) {
      expect(
        finalEvents.filter((p) => p === PLATFORM_IDS[label]).length,
        `expected exactly one success for ${label}`,
      ).toBe(1);
    }
  });
});
