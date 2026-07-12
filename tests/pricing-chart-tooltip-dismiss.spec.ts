import { test, expect, type Request } from "@playwright/test";

// Dismiss behaviors for the pricing chart tooltip:
//  • Scroll while open → tooltip closes, focus returns to trigger on keyboard-open
//  • Click outside    → tooltip closes; no stray tooltip_open events fire
// Runs across chromium / webkit / firefox via playwright.config.ts.

type CapturedEvent = {
  event: string;
  meta: Record<string, unknown> | null;
};
async function withCapturedEvents(
  page: import("@playwright/test").Page,
  run: () => Promise<void>,
): Promise<CapturedEvent[]> {
  const events: CapturedEvent[] = [];
  const onReq = (req: Request) => {
    if (!/\/rest\/v1\/seo_events/.test(req.url())) return;
    if (req.method() !== "POST") return;
    try {
      const body = req.postData();
      if (!body) return;
      const parsed = JSON.parse(body);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const row of rows) events.push({ event: row.event, meta: row.meta ?? null });
    } catch {
      /* ignore */
    }
  };
  page.on("request", onReq);
  try {
    await run();
  } finally {
    page.off("request", onReq);
  }
  return events;
}

test.describe("Pricing chart tooltip — dismissal", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.getByTestId("pricing-rule-banner").scrollIntoViewIfNeeded();
  });

  test("scrolling while a tooltip is open closes it and returns focus to trigger", async ({ page }) => {
    const btn = page.getByTestId("pricing-callout-button-250001");
    await btn.scrollIntoViewIfNeeded();
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("pricing-tooltip-250001")).toBeVisible();
    await expect(btn).toHaveAttribute("aria-expanded", "true");

    // Scroll — tooltip should dismiss.
    await page.mouse.wheel(0, 600);
    await expect(page.getByTestId("pricing-tooltip-250001")).toHaveCount(0);
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    // Trigger remains focused so keyboard users don't lose their place.
    await expect(btn).toBeFocused();
  });

  test("clicking outside a callout closes the tooltip", async ({ page }) => {
    const btn = page.getByTestId("pricing-callout-button-850001");
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const tip = page.getByTestId("pricing-tooltip-850001");
    await expect(tip).toBeVisible();

    // Click on the pinned banner (guaranteed to be outside the callout).
    await page.getByTestId("pricing-rule-banner").click();
    await expect(page.getByTestId("pricing-tooltip-850001")).toHaveCount(0);
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("tooltip_open analytics fires only when a callout is actually opened", async ({ page }) => {
    // Click outside first — must NOT record any tooltip_open event.
    // Then open two rows — must record exactly two tooltip_open events with
    // the right lowerBound in each meta.
    const banner = page.getByTestId("pricing-rule-banner");
    const rowA = { lowerBound: 250_001, pricePerSlot: 10 };
    const rowB = { lowerBound: 850_001, pricePerSlot: 10 };

    const events = await withCapturedEvents(page, async () => {
      // 1. Outside click — no tooltip should open.
      await banner.click();
      await page.waitForTimeout(150);

      // 2. Open row A, then click outside to dismiss.
      const btnA = page.getByTestId(`pricing-callout-button-${rowA.lowerBound}`);
      await btnA.scrollIntoViewIfNeeded();
      await btnA.click();
      await expect(page.getByTestId(`pricing-tooltip-${rowA.lowerBound}`)).toBeVisible();
      await banner.click();
      await expect(page.getByTestId(`pricing-tooltip-${rowA.lowerBound}`)).toHaveCount(0);

      // 3. Open row B.
      const btnB = page.getByTestId(`pricing-callout-button-${rowB.lowerBound}`);
      await btnB.scrollIntoViewIfNeeded();
      await btnB.click();
      await expect(page.getByTestId(`pricing-tooltip-${rowB.lowerBound}`)).toBeVisible();

      await page.waitForTimeout(500);
    });

    const opens = events.filter((e) => e.event === "pricing_chart_callout_tooltip_open");
    expect(opens.length).toBe(2);
    const bounds = opens
      .map((e) => (e.meta as { lowerBound?: number } | null)?.lowerBound)
      .sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(bounds).toEqual([rowA.lowerBound, rowB.lowerBound]);
    for (const o of opens) {
      expect(o.meta).toMatchObject({ layout: "desktop" });
    }
  });
});
