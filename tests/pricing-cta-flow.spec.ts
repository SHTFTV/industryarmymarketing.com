import { test, expect, type Page, type Request } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// These specs stub the Supabase network layer and shim window.gtag, so they
// only run against the local dev-server preview — not the live origin.
const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

const viewports = [
  { name: "desktop", width: 1280, height: 1200 },
  { name: "mobile", width: 390, height: 900 },
] as const;

// ---------------------------------------------------------------------------
// Test scaffolding
// ---------------------------------------------------------------------------

type Captured = {
  leads: Request[];
  events: string[];
  eventPayloads: Record<string, unknown>[];
};

function makeCaptured(): Captured {
  return { leads: [], events: [], eventPayloads: [] };
}

async function stubBackend(page: Page, captured: Captured) {
  await page.route("**/rest/v1/leads*", (route) => {
    if (route.request().method() === "POST") {
      captured.leads.push(route.request());
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: { "Content-Range": "0-0/1" },
        body: JSON.stringify([{ id: "test-lead-id" }]),
      });
    }
    return route.continue();
  });
  await page.route("**/rest/v1/seo_events*", (route) => {
    const body = route.request().postDataJSON();
    const rows = Array.isArray(body) ? body : [body];
    for (const r of rows) {
      if (r?.event) {
        captured.events.push(r.event);
        captured.eventPayloads.push(r);
      }
    }
    return route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
  });
}

/**
 * Shim window.gtag so we can capture GA4 mirror calls without loading the
 * real Google Tag Manager script. Must run before the app boots.
 */
async function shimGtag(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __ga4Calls: unknown[][];
      gtag: (...a: unknown[]) => void;
      dataLayer: unknown[];
    };
    w.__ga4Calls = [];
    w.dataLayer = w.dataLayer || [];
    w.gtag = (...args: unknown[]) => {
      w.__ga4Calls.push(args);
      w.dataLayer.push(args);
    };
  });
  // Prevent the real gtag script from loading — the shim above is enough.
  await page.route("https://www.googletagmanager.com/**", (r) => r.abort());
}

async function ga4EventCalls(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const calls =
      (window as unknown as { __ga4Calls?: unknown[][] }).__ga4Calls ?? [];
    return calls
      .filter((c) => c[0] === "event")
      .map((c) => c[1] as string);
  });
}

function countOf<T>(arr: T[], v: T) {
  return arr.filter((x) => x === v).length;
}

async function fillContactForm(page: Page) {
  await page.getByPlaceholder("Full name *").fill("Test Vendor");
  await page.getByPlaceholder("Email *").fill("test@example.com");
  await page.getByPlaceholder("City *").fill("Vancouver");
  await page.locator("select").selectOption("Roofing");
  await page
    .getByPlaceholder(/Tell us about your business/i)
    .fill(
      "Automated e2e test — verifying the pricing CTA to contact flow submits successfully.",
    );
}

// ---------------------------------------------------------------------------
// 1. Payload assertions per tier CTA
// ---------------------------------------------------------------------------
test.describe("Pricing — tier CTA submits with the correct leads payload", () => {
  test.skip(LIVE, "Stubs Supabase; local dev only");

  for (const vp of viewports) {
    test(`Directory CTA → source='pricing-directory' (${vp.name})`, async ({ page }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");
      await page.getByRole("link", { name: /get listed/i }).first().click();
      await expect(page).toHaveURL(/\/contact\?tier=directory$/);

      await fillContactForm(page);
      const insertReq = page.waitForRequest(
        (r) => r.url().includes("/rest/v1/leads") && r.method() === "POST",
      );
      await page.getByRole("button", { name: /send message/i }).click();
      const body = (await insertReq).postDataJSON();

      expect(body.source).toBe("pricing-directory");
      expect(body.email).toBe("test@example.com");
      expect(body.trade).toBe("Roofing");
      expect(body.city).toBe("Vancouver");
      expect(body.name).toBe("Test Vendor");
      await expect(page.getByText(/message received/i)).toBeVisible();
    });

    test(`Exclusive CTA → source='pricing-exclusive' (${vp.name})`, async ({ page }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");
      await page
        .getByRole("link", { name: /contact us for your market rate/i })
        .first()
        .click();
      await expect(page).toHaveURL(/\/contact\?tier=exclusive$/);

      await fillContactForm(page);
      const insertReq = page.waitForRequest(
        (r) => r.url().includes("/rest/v1/leads") && r.method() === "POST",
      );
      await page.getByRole("button", { name: /send message/i }).click();
      const body = (await insertReq).postDataJSON();

      expect(body.source).toBe("pricing-exclusive");
      expect(body.email).toBe("test@example.com");
      await expect(page.getByText(/message received/i)).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Required-field / error-state validation on /contact per tier CTA
// ---------------------------------------------------------------------------
test.describe("Pricing — /contact validates required fields before submit", () => {
  test.skip(LIVE, "Stubs Supabase; local dev only");

  for (const tier of ["directory", "exclusive"] as const) {
    test(`${tier}: empty form shows required-field errors and blocks POST`, async ({
      page,
    }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);

      await page.goto("/pricing");
      const linkName =
        tier === "directory" ? /get listed/i : /contact us for your market rate/i;
      await page.getByRole("link", { name: linkName }).first().click();
      await expect(page).toHaveURL(new RegExp(`/contact\\?tier=${tier}$`));

      await page.getByPlaceholder(/Tell us about your business/i).fill("");
      await page.getByRole("button", { name: /send message/i }).click();

      await expect(page.getByText(/name is too short/i)).toBeVisible();
      await expect(page.getByText(/enter a valid email/i)).toBeVisible();
      await expect(page.getByText(/pick your trade/i)).toBeVisible();
      await expect(page.getByText(/city is required/i)).toBeVisible();
      await expect(page.getByText(/tell us a bit more/i)).toBeVisible();

      await expect(page.getByPlaceholder("Full name *")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(page.getByPlaceholder("Email *")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(page.getByPlaceholder("City *")).toHaveAttribute(
        "aria-invalid",
        "true",
      );

      expect(captured.leads.length).toBe(0);
    });

    test(`${tier}: invalid email + short message blocks submit`, async ({ page }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);

      await page.goto(`/contact?tier=${tier}`);
      await page.getByPlaceholder("Full name *").fill("Test Vendor");
      await page.getByPlaceholder("Email *").fill("not-an-email");
      await page.getByPlaceholder("City *").fill("Vancouver");
      await page.locator("select").selectOption("Roofing");
      await page.getByPlaceholder(/Tell us about your business/i).fill("too short");
      await page.getByRole("button", { name: /send message/i }).click();

      await expect(page.getByText(/enter a valid email/i)).toBeVisible();
      await expect(page.getByText(/tell us a bit more/i)).toBeVisible();
      expect(captured.leads.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Accessibility — axe scan, keyboard nav, mobile stacked cards, FAQ SR labels
// ---------------------------------------------------------------------------
test.describe("Pricing — accessibility", () => {
  test.skip(LIVE, "Local dev only");

  for (const vp of viewports) {
    test(`axe: no serious/critical violations on /pricing (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        blocking,
        `Axe found ${blocking.length} blocking violations: ${JSON.stringify(
          blocking.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        )}`,
      ).toHaveLength(0);
    });

    test(`axe: no serious/critical violations on /contact (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/contact");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        blocking,
        `Axe found ${blocking.length} blocking violations: ${JSON.stringify(
          blocking.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        )}`,
      ).toHaveLength(0);
    });

    test(`keyboard: tier CTAs are focusable and named (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      const directory = page.getByRole("link", { name: /get listed/i }).first();
      const exclusive = page
        .getByRole("link", { name: /contact us for your market rate/i })
        .first();

      await expect(directory).toHaveAccessibleName(/get listed/i);
      await expect(exclusive).toHaveAccessibleName(/contact us for your market rate/i);

      await directory.focus();
      await expect(directory).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/contact\?tier=directory$/);

      await page.goBack();
      await exclusive.focus();
      await expect(exclusive).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/contact\?tier=exclusive$/);
    });
  }

  // --- Mobile stacked comparison cards ---------------------------------------
  test("mobile stacked comparison cards expose semantic list + labels", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/pricing");

    const list = page.getByRole("list", { name: /comparison/i });
    await expect(list).toBeVisible();
    const items = list.getByRole("listitem");
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);

    // Every mobile card exposes both a Directory and an Exclusive column with
    // accessible copy — this is what a screen-reader user hears per row.
    for (let i = 0; i < itemCount; i++) {
      const item = items.nth(i);
      await expect(item.getByText(/^Directory$/i)).toBeVisible();
      await expect(item.getByText(/^Exclusive$/i)).toBeVisible();
    }

    // Desktop table must be hidden at this viewport (only stacked list renders).
    await expect(page.getByRole("table", { name: /comparison/i })).toHaveCount(0);
  });

  test("desktop comparison table exposes row + column headers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto("/pricing");

    const table = page.getByRole("table", { name: /comparison/i });
    await expect(table).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /feature/i })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /directory/i })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /exclusive/i })).toBeVisible();
    expect(await table.getByRole("rowheader").count()).toBeGreaterThan(0);
  });

  // --- FAQ accordion: keyboard + SR-friendly wiring --------------------------
  for (const vp of viewports) {
    test(`FAQ accordion is keyboard + SR accessible (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      const first = page.getByRole("button", {
        name: /what's included in the \$10\/year/i,
      });
      await first.scrollIntoViewIfNeeded();
      await first.focus();
      await expect(first).toBeFocused();

      // Radix wires aria-expanded + aria-controls automatically.
      await expect(first).toHaveAttribute("aria-expanded", "false");
      const controlsId = await first.getAttribute("aria-controls");
      expect(controlsId, "FAQ trigger must reference its panel via aria-controls").toBeTruthy();

      // Enter opens; the referenced panel becomes visible.
      await page.keyboard.press("Enter");
      await expect(first).toHaveAttribute("aria-expanded", "true");
      const panel = page.locator(`#${controlsId}`);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(/directory profile|full directory profile|eyespyr/i);

      // Space closes.
      await page.keyboard.press(" ");
      await expect(first).toHaveAttribute("aria-expanded", "false");

      // Arrow-Down moves focus to the next FAQ trigger (Radix roving tabindex).
      await first.focus();
      await page.keyboard.press("ArrowDown");
      const second = page.getByRole("button", {
        name: /what's included in exclusive market ownership/i,
      });
      await expect(second).toBeFocused();
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Analytics — exactly-once per action, Supabase + GA4 mirror
// ---------------------------------------------------------------------------
test.describe("Pricing — analytics fire exactly once per user action", () => {
  test.skip(LIVE, "Local dev only");

  for (const vp of viewports) {
    test(`no duplicate events across full flow (${vp.name})`, async ({ page }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);
      await shimGtag(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // --- pricing_view fires exactly once on mount --------------------------
      await page.goto("/pricing");
      await expect
        .poll(() => countOf(captured.events, "pricing_view"), { timeout: 5000 })
        .toBe(1);

      // Give any lingering handlers a chance to double-fire; assert steady state.
      await page.waitForTimeout(400);
      expect(countOf(captured.events, "pricing_view")).toBe(1);

      // --- pricing_faq_open fires exactly once per FAQ click -----------------
      await page
        .getByRole("button", { name: /what's included in the \$10\/year/i })
        .click();
      await expect
        .poll(() => countOf(captured.events, "pricing_faq_open"), { timeout: 5000 })
        .toBe(1);
      await page.waitForTimeout(300);
      expect(countOf(captured.events, "pricing_faq_open")).toBe(1);

      // --- pricing_tier_click fires exactly once, no duplicate on nav --------
      await page.getByRole("link", { name: /get listed/i }).first().click();
      await expect(page).toHaveURL(/\/contact\?tier=directory$/);
      await page.waitForTimeout(500);
      expect(countOf(captured.events, "pricing_tier_click")).toBe(1);

      // Also verify the payload carries the right tier and only one entry.
      const tierClicks = captured.eventPayloads.filter(
        (e) => e.event === "pricing_tier_click",
      );
      expect(tierClicks).toHaveLength(1);
      expect((tierClicks[0] as { meta?: { tier?: string } }).meta?.tier).toBe(
        "directory",
      );

      // --- pricing_contact_click fires exactly once --------------------------
      await page.goto("/pricing");
      // pricing_view fired again on remount — that's expected per-page-load,
      // but each event's *per-action* count is still 1.
      expect(countOf(captured.events, "pricing_view")).toBe(2);

      await page
        .getByRole("link", { name: /still have questions\? contact us/i })
        .click();
      await expect(page).toHaveURL(/\/contact$/);
      await page.waitForTimeout(500);
      expect(countOf(captured.events, "pricing_contact_click")).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. GA4 mirror — asserts window.gtag('event', ...) receives every event
// ---------------------------------------------------------------------------
test.describe("Pricing — GA4 mirror sends events", () => {
  test.skip(LIVE, "Local dev only");
  // The mirror only runs when a GA4 measurement id is compiled into the app.
  test.skip(
    !process.env.VITE_GA4_MEASUREMENT_ID,
    "VITE_GA4_MEASUREMENT_ID not set — GA4 mirror is disabled in this build",
  );

  for (const vp of viewports) {
    test(`GA4 receives pricing_view / tier_click / faq_open / contact_click (${vp.name})`, async ({
      page,
    }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);
      await shimGtag(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");
      await expect
        .poll(async () => (await ga4EventCalls(page)).includes("pricing_view"), {
          timeout: 5000,
        })
        .toBe(true);

      await page
        .getByRole("button", { name: /what's included in the \$10\/year/i })
        .click();
      await expect
        .poll(async () => (await ga4EventCalls(page)).includes("pricing_faq_open"), {
          timeout: 5000,
        })
        .toBe(true);

      await page.getByRole("link", { name: /get listed/i }).first().click();
      await expect(page).toHaveURL(/\/contact\?tier=directory$/);
      // GA4 call was fired on the previous page — check history via localStorage
      // is not possible, so we reload /pricing and re-verify by triggering a
      // separate contact_click, then read the accumulated calls.
      await page.goto("/pricing");
      await page
        .getByRole("link", { name: /still have questions\? contact us/i })
        .click();

      // Final GA4 assertion: every tracked event appears in the mirror,
      // exactly once per triggering action within this test session.
      const ga4 = await ga4EventCalls(page);
      // Note: the tier_click GA4 push happened on the /pricing page BEFORE
      // navigation. The __ga4Calls array is scoped to the current document,
      // so we assert the events that happened in *this* document below.
      expect(ga4).toEqual(
        expect.arrayContaining([
          "pricing_view",
          "pricing_contact_click",
        ]),
      );
      // No duplicate contact_click in this document
      expect(ga4.filter((e) => e === "pricing_contact_click").length).toBe(1);
    });

    test(`GA4 receives pricing_tier_click on tier CTA (${vp.name})`, async ({
      page,
    }) => {
      const captured = makeCaptured();
      await stubBackend(page, captured);
      await shimGtag(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");

      // Intercept the click by preventing the SPA navigation just long enough
      // to snapshot GA4 calls — but React Router navigation is synchronous, so
      // we click and immediately read the mirror before the /contact page mounts.
      await page.getByRole("link", { name: /get listed/i }).first().click();

      await expect
        .poll(async () => (await ga4EventCalls(page)).includes("pricing_tier_click"), {
          timeout: 5000,
        })
        .toBe(true);
      const ga4 = await ga4EventCalls(page);
      expect(ga4.filter((e) => e === "pricing_tier_click").length).toBe(1);
    });
  }
});