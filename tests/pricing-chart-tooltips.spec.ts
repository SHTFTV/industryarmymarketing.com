import { test, expect, type Request } from "@playwright/test";

// Cross-browser E2E for the Territory Pricing chart interactions:
// keyboard focus, hover + tap-to-open tooltips, pinned banner visibility,
// and analytics event recording. Runs on every configured project
// (chromium / webkit / firefox) via playwright.config.ts.

const RULE = "$10 USD per 100,000 population, per slot";

const SAMPLES = [
  { lowerBound: 0,          pricePerSlot: 10,   population: "0 – 100,000" },
  { lowerBound: 250_001,    pricePerSlot: 35,   population: "250,001 – 350,000" },
  { lowerBound: 850_001,    pricePerSlot: 100,  population: "850,001 – 1,000,000" },
  { lowerBound: 5_000_001,  pricePerSlot: 600,  population: "5,000,001 – 6,000,000" },
  { lowerBound: 29_000_001, pricePerSlot: 3000, population: "29,000,001 – 30,000,000+" },
];

function calloutText(price: number): string {
  const blocks = price / 10;
  return `${blocks} × 100K × $10 = $${price}/slot/mo`;
}

type CapturedEvent = {
  event: string;
  path: string | null;
  meta: Record<string, unknown> | null;
};

// Analytics are persisted via the Supabase JS client → PostgREST, so we
// intercept POSTs to `/rest/v1/seo_events` and collect the payloads.
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
      for (const row of rows) {
        events.push({
          event: row.event,
          path: row.path ?? null,
          meta: row.meta ?? null,
        });
      }
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

test.describe("Territory Pricing chart — tooltips + pinned banner (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.getByTestId("pricing-rule-banner").scrollIntoViewIfNeeded();
  });

  test("each row exposes the correct $10-per-100K explanation on hover and focus", async ({ page }) => {
    for (const row of SAMPLES) {
      const btn = page.getByTestId(`pricing-callout-button-${row.lowerBound}`);
      await btn.scrollIntoViewIfNeeded();

      await expect(btn).toContainText(calloutText(row.pricePerSlot));

      await btn.focus();
      await expect(btn).toBeFocused();
      const ariaLabel = await btn.getAttribute("aria-label");
      expect(ariaLabel).toContain(RULE);
      expect(ariaLabel).toContain(calloutText(row.pricePerSlot));
      expect(ariaLabel).toContain(row.population);

      await btn.hover();
      const title = await btn.getAttribute("title");
      expect(title).toContain(RULE);
      expect(title).toContain(calloutText(row.pricePerSlot));
    }
  });

  test("clicking a callout opens an inline tooltip with the correct rule text", async ({ page }) => {
    const row = SAMPLES[2]; // mid-tier sample
    const btn = page.getByTestId(`pricing-callout-button-${row.lowerBound}`);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const tip = page.getByTestId(`pricing-tooltip-${row.lowerBound}`);
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(RULE);
    await expect(tip).toContainText(calloutText(row.pricePerSlot));
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    // Click again → closes.
    await btn.click();
    await expect(page.getByTestId(`pricing-tooltip-${row.lowerBound}`)).toHaveCount(0);
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("pinned banner stays visible while scrolling the pricing chart", async ({ page }) => {
    const banner = page.getByTestId("pricing-rule-banner");
    await expect(banner).toBeVisible();
    await page.getByTestId("pricing-callout-29000001").scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();
    const bannerBox = await banner.boundingBox();
    const viewport = page.viewportSize();
    expect(bannerBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(bannerBox!.y).toBeGreaterThanOrEqual(0);
    expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(viewport!.height);
    await expect(banner).toContainText(RULE);
  });

  test("banner is keyboard-focusable and exposes the rule to screen readers", async ({ page }) => {
    const banner = page.getByTestId("pricing-rule-banner");
    await banner.focus();
    await expect(banner).toBeFocused();
    expect(await banner.getAttribute("aria-label")).toBe(RULE);
    expect(await banner.getAttribute("role")).toBe("note");
  });

  test("banner and callout interactions record the expected analytics events", async ({ page }) => {
    // Assert focus / hover / tooltip_open events carry the exact tier +
    // $/slot mapping in meta for multiple representative rows.
    const banner = page.getByTestId("pricing-rule-banner");
    const rows = [SAMPLES[0], SAMPLES[2], SAMPLES[4]];

    const events = await withCapturedEvents(page, async () => {
      await banner.hover();
      await banner.focus();
      for (const row of rows) {
        const btn = page.getByTestId(`pricing-callout-button-${row.lowerBound}`);
        await btn.scrollIntoViewIfNeeded();
        await btn.hover();
        await btn.focus();
        await btn.click();
      }
      await page.waitForTimeout(500);
    });

    const names = events.map((e) => e.event);
    expect(names).toContain("pricing_chart_banner_hover");
    expect(names).toContain("pricing_chart_banner_focus");

    for (const row of rows) {
      const expected = {
        lowerBound: row.lowerBound,
        pricePerSlot: row.pricePerSlot,
        population: row.population,
        layout: "desktop",
      };
      const focus = events.find(
        (e) =>
          e.event === "pricing_chart_callout_focus" &&
          (e.meta as { lowerBound?: number } | null)?.lowerBound === row.lowerBound,
      );
      const hover = events.find(
        (e) =>
          e.event === "pricing_chart_callout_hover" &&
          (e.meta as { lowerBound?: number } | null)?.lowerBound === row.lowerBound,
      );
      const open = events.find(
        (e) =>
          e.event === "pricing_chart_callout_tooltip_open" &&
          (e.meta as { lowerBound?: number } | null)?.lowerBound === row.lowerBound,
      );
      expect(focus, `focus event missing for ${row.population}`).toBeDefined();
      expect(hover, `hover event missing for ${row.population}`).toBeDefined();
      expect(open, `tooltip_open event missing for ${row.population}`).toBeDefined();
      expect(focus!.meta).toMatchObject(expected);
      expect(hover!.meta).toMatchObject(expected);
      expect(open!.meta).toMatchObject(expected);
    }
  });

  test("Escape closes an open tooltip via keyboard-only navigation", async ({ page }) => {
    const row = SAMPLES[2];
    const btn = page.getByTestId(`pricing-callout-button-${row.lowerBound}`);
    await btn.scrollIntoViewIfNeeded();

    // Keyboard-only: focus the button, Enter to open, Escape to close.
    await btn.focus();
    await expect(btn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId(`pricing-tooltip-${row.lowerBound}`)).toBeVisible();
    await expect(btn).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId(`pricing-tooltip-${row.lowerBound}`)).toHaveCount(0);
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    // Focus remains on the trigger so keyboard users don't lose their place.
    await expect(btn).toBeFocused();
  });
});

test.describe("Territory Pricing chart — tap-to-open tooltips (mobile)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.getByTestId("pricing-rule-banner").scrollIntoViewIfNeeded();
  });

  test("tapping a mobile callout reveals the $10-per-100K explanation", async ({ page }) => {
    for (const row of SAMPLES.slice(0, 3)) {
      const btn = page.getByTestId(`pricing-callout-mobile-${row.lowerBound}`);
      await btn.scrollIntoViewIfNeeded();
      await btn.tap();
      const tip = page.getByTestId(`pricing-tooltip-mobile-${row.lowerBound}`);
      await expect(tip).toBeVisible();
      await expect(tip).toContainText(RULE);
      await expect(tip).toContainText(calloutText(row.pricePerSlot));
      await expect(btn).toHaveAttribute("aria-expanded", "true");
      // Close by tapping again so only one tooltip is open at a time.
      await btn.tap();
      await expect(page.getByTestId(`pricing-tooltip-mobile-${row.lowerBound}`)).toHaveCount(0);
    }
  });

  test("tap records the tooltip_open analytics event with mobile layout label", async ({ page }) => {
    const row = SAMPLES[0];
    const btn = page.getByTestId(`pricing-callout-mobile-${row.lowerBound}`);
    const events = await withCapturedEvents(page, async () => {
      await btn.scrollIntoViewIfNeeded();
      await btn.tap();
      await page.waitForTimeout(400);
    });
    const tooltipOpen = events.find((e) => e.event === "pricing_chart_callout_tooltip_open");
    expect(tooltipOpen).toBeDefined();
    expect(tooltipOpen?.meta).toMatchObject({
      lowerBound: row.lowerBound,
      pricePerSlot: row.pricePerSlot,
      layout: "mobile",
    });
  });
});
