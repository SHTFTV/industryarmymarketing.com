// E2E: rapidly switch AIIndexing platforms and trigger Ctrl/Cmd+K while a
// prior copy is still in-flight. Verify:
//   • The CustomEvent success payload reflects the LATEST selected platform
//     at the moment the copy actually executes.
//   • Focus returns to that platform's Copy prompt button after completion.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — switch during in-flight copy", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("uses the latest selected platform and restores focus correctly", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Clipboard perms are Chromium-scoped");

    // Slow the clipboard write so we can observe an in-flight state.
    await page.addInitScript(() => {
      const real = navigator.clipboard?.writeText?.bind(navigator.clipboard);
      if (!real) return;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: (t: string) =>
              new Promise<void>((resolve, reject) => {
                setTimeout(() => real(t).then(resolve, reject), 250);
              }),
            readText: () => navigator.clipboard.readText?.() as Promise<string>,
          };
        },
      });
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

    // Open ChatGPT and kick off a copy (which will be pending ~250ms).
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    await page.keyboard.press("ControlOrMeta+k");

    // While the first copy is still in-flight, rapidly switch platforms.
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click(); // close
    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    await page.getByRole("button", { name: /^Claude\b/i }).first().click(); // close
    await page.getByRole("button", { name: /^Grok\b/i }).first().click();

    // Wait for the first (in-flight) copy to finish and its announcement.
    await expect(
      page.locator('[data-testid="ai-indexing-live-region"]').first(),
    ).toHaveText(/Copied/i, { timeout: 3000 });

    // Now press Ctrl/Cmd+K — this copy should target Grok (the latest open).
    await page.keyboard.press("ControlOrMeta+k");
    await expect(
      page.locator('[data-testid="ai-indexing-live-region"]').first(),
    ).toHaveText(/Copied/i, { timeout: 3000 });

    const successes = await page.evaluate(
      () =>
        (window as unknown as { __events: Array<Record<string, unknown>> }).__events
          .filter((e) => e.event === "ai_indexing_copy_succeeded"),
    );

    // First success = chatgpt (the one that was in-flight during switching).
    // Last success = grok (the currently-open platform when Ctrl/K fired again).
    expect(successes.length).toBeGreaterThanOrEqual(2);
    expect(successes[0]).toMatchObject({ platform: "chatgpt", copyMethod: "clipboard" });
    expect(successes[successes.length - 1]).toMatchObject({
      platform: "grok",
      copyMethod: "clipboard",
    });

    // Focus should now be on Grok's Copy prompt button.
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        text: el?.textContent?.trim() ?? "",
        state: el?.getAttribute("data-copy-state") ?? "",
      };
    });
    expect(focused.text).toMatch(/Copied|Copy prompt/i);
    // The focused button must live inside the Grok panel (next to "Open in Grok").
    const grokPanel = page
      .getByRole("link", { name: /Open in Grok/i })
      .first()
      .locator("..");
    await expect(
      grokPanel.getByRole("button", { name: /Copied|Copy prompt/i }),
    ).toBeFocused();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/broader significance of this story/i);
  });
});
