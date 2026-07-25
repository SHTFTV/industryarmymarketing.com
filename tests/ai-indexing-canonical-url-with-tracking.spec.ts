// E2E: When the blog page is loaded with query/hash tracking parameters
// (utm_*, gclid, fbclid, #fragment), the analytics payload for every
// AIIndexing copy — success and failure — must use the canonical
// articleUrl (https://www.industryarmymarketing.com/blog/<slug>) and NEVER
// the raw window.location.href.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL = `https://www.industryarmymarketing.com/blog/${SLUG}`;
const TRACKING = "?utm_source=nl&utm_medium=email&utm_campaign=july&gclid=abc123&fbclid=xyz#section-hero";

const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Grok"] as const;
const PLATFORM_IDS: Record<(typeof PLATFORMS)[number], string> = {
  ChatGPT: "chatgpt",
  Claude: "claude",
  Perplexity: "perplexity",
  Grok: "grok",
};

async function installEventCapture(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    (window as unknown as { __events: unknown[] }).__events = [];
    window.addEventListener("iam:ai-indexing", (e) => {
      (window as unknown as { __events: unknown[] }).__events.push(
        (e as CustomEvent).detail,
      );
    });
  });
}

async function getEvents(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => (window as unknown as { __events: Array<Record<string, unknown>> }).__events,
  );
}

test.describe("AIIndexing — canonical articleUrl under tracking params", () => {
  test("success payloads for every platform use canonical URL, not raw href", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Clipboard perms are Chromium-scoped");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(`/blog/${SLUG}${TRACKING}`);

    // Confirm the raw href really includes tracking (so this test is meaningful).
    const rawHref = await page.evaluate(() => window.location.href);
    expect(rawHref).toContain("utm_source=nl");
    expect(rawHref).not.toBe(CANONICAL);

    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();
    await installEventCapture(page);

    for (const platform of PLATFORMS) {
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${platform}\\b`, "i") })
        .first();
      await toggle.click();
      const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
      await copyBtn.click();
      await expect(
        page.locator('[data-testid="ai-indexing-live-region"]').first(),
      ).toHaveText(/Copied/i, { timeout: 3000 });
      // Close before next iteration.
      await toggle.click();
    }

    const events = await getEvents(page);
    const succeeded = events.filter((e) => e.event === "ai_indexing_copy_succeeded");
    expect(succeeded.length).toBeGreaterThanOrEqual(PLATFORMS.length);

    for (const platform of PLATFORMS) {
      const match = succeeded.find((e) => e.platform === PLATFORM_IDS[platform]);
      expect(match, `no success event for ${platform}`).toBeTruthy();
      expect(match!.articleUrl).toBe(CANONICAL);
      // Belt-and-suspenders: raw tracking must not leak.
      expect(String(match!.articleUrl)).not.toContain("utm_");
      expect(String(match!.articleUrl)).not.toContain("gclid");
      expect(String(match!.articleUrl)).not.toContain("#");
    }

    // "prompt_opened" events must also carry the canonical URL.
    for (const e of events.filter((x) => x.event === "ai_indexing_prompt_opened")) {
      expect(e.articleUrl).toBe(CANONICAL);
    }
  });

  test("failure payloads also use canonical URL when clipboard is denied", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "requires chromium overrides");

    // Sabotage clipboard + execCommand BEFORE the app scripts run.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () => Promise.reject(new Error("denied")),
          };
        },
      });
      // Force fallback to also fail so we get the failure analytics path.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = () => false;
    });

    await page.goto(`/blog/${SLUG}${TRACKING}`);
    await page.getByText(/IAM AI Indexing Section/i).first().scrollIntoViewIfNeeded();
    await installEventCapture(page);

    for (const platform of PLATFORMS) {
      const toggle = page
        .getByRole("button", { name: new RegExp(`^${platform}\\b`, "i") })
        .first();
      await toggle.click();
      const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
      await copyBtn.click();
      await expect(
        page.locator('[data-testid="ai-indexing-live-region"]').first(),
      ).toHaveText(/Copy failed/i, { timeout: 3000 });
      await toggle.click();
    }

    const events = await getEvents(page);
    const failed = events.filter((e) => e.event === "ai_indexing_copy_failed");
    expect(failed.length).toBeGreaterThanOrEqual(PLATFORMS.length);

    for (const platform of PLATFORMS) {
      const match = failed.find((e) => e.platform === PLATFORM_IDS[platform]);
      expect(match, `no failure event for ${platform}`).toBeTruthy();
      expect(match!.articleUrl).toBe(CANONICAL);
      expect(String(match!.articleUrl)).not.toContain("utm_");
      expect(String(match!.articleUrl)).not.toContain("gclid");
      expect(String(match!.articleUrl)).not.toContain("#");
    }
  });
});
