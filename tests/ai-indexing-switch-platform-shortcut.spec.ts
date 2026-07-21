// E2E: open AIIndexing dropdown for one platform, switch to a different
// platform, then trigger Ctrl/Cmd+K. Verify the dispatched CustomEvent
// payload references the *newly selected* platform and uses copyMethod
// "clipboard" (the primary path when permissions are granted).

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";

test.describe("AIIndexing — switch platform then Ctrl/Cmd+K", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("payload reflects the newly selected platform and copyMethod=clipboard", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Clipboard perms are Chromium-scoped here");

    await page.goto(`/blog/${SLUG}`);
    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();

    // Start capturing the CustomEvent payloads.
    await page.evaluate(() => {
      (window as unknown as { __events: unknown[] }).__events = [];
      window.addEventListener("iam:ai-indexing", (e) => {
        (window as unknown as { __events: unknown[] }).__events.push(
          (e as CustomEvent).detail,
        );
      });
    });

    // Open ChatGPT first.
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    await expect(
      page.getByRole("link", { name: /Open in ChatGPT/i }).first(),
    ).toBeVisible();

    // Switch to Perplexity.
    await page.getByRole("button", { name: /^Perplexity\b/i }).first().click();
    await expect(
      page.getByRole("link", { name: /Open in Perplexity/i }).first(),
    ).toBeVisible();

    // Ctrl/Cmd+K should copy the newly-selected (Perplexity) prompt.
    await page.keyboard.press("ControlOrMeta+k");

    await expect(
      page.locator('[data-testid="ai-indexing-live-region"]').first(),
    ).toHaveText(/Copied/i, { timeout: 3000 });

    const success = await page.evaluate(() => {
      const evs = (window as unknown as { __events: Array<Record<string, unknown>> }).__events;
      return evs.find((e) => e.event === "ai_indexing_copy_succeeded");
    });

    expect(success).toBeTruthy();
    expect(success).toMatchObject({
      event: "ai_indexing_copy_succeeded",
      platform: "perplexity",
      copyMethod: "clipboard",
    });

    // Sanity: the clipboard actually has Perplexity's prompt shape.
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/Research and expand on the topics/i);
  });
});
