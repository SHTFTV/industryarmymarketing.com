// E2E: switch AIIndexing platforms across copy attempts and assert that the
// aria-live announcement re-fires for each attempt and the analytics payload
// always matches the CURRENTLY selected platform.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

const STEPS: Array<{ label: string; id: string }> = [
  { label: "ChatGPT",    id: "chatgpt" },
  { label: "Claude",     id: "claude" },
  { label: "Perplexity", id: "perplexity" },
  { label: "Grok",       id: "grok" },
];

test.describe("AIIndexing — switch platforms, retry copy, live-region parity", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("live region updates for each attempt and matches the latest platform", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Clipboard perms are Chromium-scoped");

    await page.goto(`/blog/${SLUG}`);
    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();

    // Capture every mutation of the aria-live region so identical consecutive
    // "Copied ✓" announcements can be verified to have actually re-fired (the
    // component clears the region between announcements — see AIIndexing.tsx).
    await page.evaluate(() => {
      (window as unknown as { __events: unknown[] }).__events = [];
      (window as unknown as { __live: string[] }).__live = [];
      window.addEventListener("iam:ai-indexing", (e) =>
        (window as unknown as { __events: unknown[] }).__events.push(
          (e as CustomEvent).detail,
        ),
      );
      const region = document.querySelector('[data-testid="ai-indexing-live-region"]');
      if (region) {
        const push = () => {
          const t = (region.textContent ?? "").trim();
          (window as unknown as { __live: string[] }).__live.push(t);
        };
        new MutationObserver(push).observe(region, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    });

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];

      // Open this platform's dropdown.
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${step.label}\\b`, "i") })
        .first();
      await toggle.click();
      await expect(
        page.getByRole("link", { name: new RegExp(`Open in ${step.label}`, "i") }).first(),
      ).toBeVisible();

      // Copy.
      const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
      await copyBtn.click();
      await expect(
        page.locator('[data-testid="ai-indexing-live-region"]').first(),
      ).toHaveText(/Copied/i, { timeout: 3000 });

      // The latest success analytics event must match THIS platform.
      const latest = await page.evaluate(() => {
        const evs = (window as unknown as { __events: Array<Record<string, unknown>> }).__events;
        const successes = evs.filter((e) => e.event === "ai_indexing_copy_succeeded");
        return successes[successes.length - 1];
      });
      expect(latest, `no success event after ${step.label}`).toBeTruthy();
      expect(latest).toMatchObject({ platform: step.id, copyMethod: "clipboard" });

      // Close panel before switching.
      await toggle.click();
    }

    // Analytics: exactly one success per platform, in the order we copied.
    const platformsInOrder = await page.evaluate(
      () =>
        (window as unknown as { __events: Array<Record<string, unknown>> }).__events
          .filter((e) => e.event === "ai_indexing_copy_succeeded")
          .map((e) => e.platform as string),
    );
    expect(platformsInOrder).toEqual(STEPS.map((s) => s.id));

    // Live region: for each attempt we should see empty -> "Copied ✓" -> empty.
    // That guarantees screen readers re-announce even for identical strings.
    const liveHistory = await page.evaluate(
      () => (window as unknown as { __live: string[] }).__live,
    );
    const copiedTransitions = liveHistory.filter((t) => /Copied/i.test(t)).length;
    expect(copiedTransitions).toBeGreaterThanOrEqual(STEPS.length);
    // At least one clearing (empty string) mutation between announcements.
    const clears = liveHistory.filter((t) => t === "").length;
    expect(clears).toBeGreaterThanOrEqual(STEPS.length);
  });
});
