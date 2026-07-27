// End-to-end: On a real blog post page, use Ctrl/Cmd+K to copy the prompt
// for EACH AI platform (ChatGPT, Claude, Perplexity, Grok) and verify:
//   • The clipboard contains the prompt built for the selected platform
//     (platform-specific opening phrase + this post's canonical URL).
//   • The aria-live status region announces "Copied ✓".
//   • Focus returns to that platform's Copy prompt button.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

const PLATFORMS: Array<{ name: string; promptOpening: RegExp }> = [
  { name: "ChatGPT",    promptOpening: /Tell me more about this article/i },
  { name: "Claude",     promptOpening: /Analyse this article/i },
  { name: "Perplexity", promptOpening: /Research and expand on the topics/i },
  { name: "Grok",       promptOpening: /broader significance of this story/i },
];

test.describe("AIIndexing — Ctrl/Cmd+K across all platforms", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  for (const platform of PLATFORMS) {
    test(`copies ${platform.name} prompt and announces success`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "Clipboard permissions are Chromium-scoped in this suite",
      );

      await page.goto(`/blog/${SLUG}`);

      const section = page.getByText(/IAM AI Indexing Section/i).first();
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();

      // Open this platform's dropdown.
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${platform.name}\\b`, "i") })
        .first();
      await toggle.click();
      await expect(
        page.getByRole("link", { name: new RegExp(`Open in ${platform.name}`, "i") }).first(),
      ).toBeVisible();

      // Trigger the copy via keyboard shortcut.
      await page.keyboard.press("ControlOrMeta+k");

      // Live region announces success.
      const live = page.locator('[data-testid="ai-indexing-live-region"]').first();
      await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

      // Clipboard content matches this specific platform's prompt shape.
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toMatch(platform.promptOpening);
      expect(copied).toContain(`${CANONICAL_ORIGIN}/blog/${SLUG}`);

      // Focus returns to the Copy prompt control (a11y contract).
      const focusedText = await page.evaluate(
        () => document.activeElement?.textContent?.trim() ?? "",
      );
      expect(focusedText).toMatch(/Copied|Copy prompt/i);
    });
  }
});