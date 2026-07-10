import { test, expect, type Page, type Request } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Skip these tests on live-origin runs — they stub the Supabase network layer,
// which only makes sense against the dev-server preview.
const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

const viewports = [
  { name: "desktop", width: 1280, height: 1200 },
  { name: "mobile", width: 390, height: 900 },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function stubBackend(
  page: Page,
  captured: { leads: Request[]; events: string[]; eventPayloads: Record<string, unknown>[] },
) {
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

async function fillContactForm(page: Page) {
  await page.getByPlaceholder("Full name *").fill("Test Vendor");
  await page.getByPlaceholder("Email *").fill("test@example.com");
  await page.getByPlaceholder("City *").fill("Vancouver");
  await page.locator("select").selectOption("Roofing");
  // Overwrite the tier-prefilled message so the test controls the exact text.
  const msg = page.getByPlaceholder(/Tell us about your business/i);
  await msg.fill(
    "Automated e2e test — verifying the pricing CTA to contact flow submits successfully.",
  );
}

// ---------------------------------------------------------------------------
// 1. Payload assertions: Directory + Exclusive CTAs each carry the right
//    Supabase `leads.source` tag.
// ---------------------------------------------------------------------------
test.describe("Pricing — tier CTA submits with the correct leads payload", () => {
  test.skip(LIVE, "Stubs Supabase; local dev only");

  for (const vp of viewports) {
    test(`Directory CTA → source='pricing-directory' (${vp.name})`, async ({ page }) => {
      const captured = { leads: [] as Request[], events: [] as string[], eventPayloads: [] as Record<string, unknown>[] };
      await stubBackend(page, captured);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");
      await page.getByRole("link", { name: /get listed/i }).first().click();
      await expect(page).toHaveURL(/\/contact\?tier=directory$/);

      // Verify pricing_tier_click event carried tier=directory
      const tierEvent = captured.eventPayloads.find(
        (e) => e.event === "pricing_tier_click",
      );
      expect(tierEvent).toBeTruthy();
      expect((tierEvent as { meta?: { tier?: string } }).meta?.tier).toBe("directory");

      await fillContactForm(page);
      const insertReq = page.waitForRequest(
        (r) => r.url().includes("/rest/v1/leads") && r.method() === "POST",
      );
      await page.getByRole("button", { name: /send message/i }).click();
      const req = await insertReq;
      const body = req.postDataJSON();

      expect(body.source).toBe("pricing-directory");
      expect(body.email).toBe("test@example.com");
      expect(body.trade).toBe("Roofing");
      expect(body.city).toBe("Vancouver");
      expect(body.name).toBe("Test Vendor");
      await expect(page.getByText(/message received/i)).toBeVisible();
    });

    test(`Exclusive CTA → source='pricing-exclusive' (${vp.name})`, async ({ page }) => {
      const captured = { leads: [] as Request[], events: [] as string[], eventPayloads: [] as Record<string, unknown>[] };
      await stubBackend(page, captured);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto("/pricing");
      await page
        .getByRole("link", { name: /contact us for your market rate/i })
        .first()
        .click();
      await expect(page).toHaveURL(/\/contact\?tier=exclusive$/);

      const tierEvent = captured.eventPayloads.find(
        (e) => e.event === "pricing_tier_click",
      );
      expect(tierEvent).toBeTruthy();
      expect((tierEvent as { meta?: { tier?: string } }).meta?.tier).toBe("exclusive");

      await fillContactForm(page);
      const insertReq = page.waitForRequest(
        (r) => r.url().includes("/rest/v1/leads") && r.method() === "POST",
      );
      await page.getByRole("button", { name: /send message/i }).click();
      const req = await insertReq;
      const body = req.postDataJSON();

      expect(body.source).toBe("pricing-exclusive");
      expect(body.email).toBe("test@example.com");
      await expect(page.getByText(/message received/i)).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Required-field / error-state validation on /contact after each tier CTA
// ---------------------------------------------------------------------------
test.describe("Pricing — /contact validates required fields before submit", () => {
  test.skip(LIVE, "Stubs Supabase; local dev only");

  for (const tier of ["directory", "exclusive"] as const) {
    test(`${tier}: empty form shows required-field errors, no POST fires`, async ({ page }) => {
      const captured = { leads: [] as Request[], events: [] as string[], eventPayloads: [] as Record<string, unknown>[] };
      await stubBackend(page, captured);

      await page.goto("/pricing");
      const linkName = tier === "directory" ? /get listed/i : /contact us for your market rate/i;
      await page.getByRole("link", { name: linkName }).first().click();
      await expect(page).toHaveURL(new RegExp(`/contact\\?tier=${tier}$`));

      // Clear the prefilled message so all required fields are empty.
      await page.getByPlaceholder(/Tell us about your business/i).fill("");
      await page.getByRole("button", { name: /send message/i }).click();

      // Validation messages appear
      await expect(page.getByText(/name is too short/i)).toBeVisible();
      await expect(page.getByText(/enter a valid email/i)).toBeVisible();
      await expect(page.getByText(/pick your trade/i)).toBeVisible();
      await expect(page.getByText(/city is required/i)).toBeVisible();
      await expect(page.getByText(/tell us a bit more/i)).toBeVisible();
      await expect(page.getByText(/please fix the highlighted fields/i)).toBeVisible();

      // aria-invalid wired on all required inputs
      await expect(page.getByPlaceholder("Full name *")).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByPlaceholder("Email *")).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByPlaceholder("City *")).toHaveAttribute("aria-invalid", "true");

      // Critical: no lead POST fired on invalid submit
      expect(captured.leads.length).toBe(0);
    });

    test(`${tier}: invalid email + short message blocks submit`, async ({ page }) => {
      const captured = { leads: [] as Request[], events: [] as string[], eventPayloads: [] as Record<string, unknown>[] };
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
// 3. A11y — axe scan + keyboard nav on tier CTAs, comparison table, FAQ
// ---------------------------------------------------------------------------
test.describe("Pricing — accessibility", () => {
  test.skip(LIVE, "Runs against dev server preview");

  for (const vp of viewports) {
    test(`axe: no serious/critical violations on /pricing (${vp.name})`, async ({ page }) => {
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
        `Axe found ${blocking.length} serious/critical violations: ${JSON.stringify(
          blocking.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        )}`,
      ).toHaveLength(0);
    });

    test(`keyboard: tier CTAs are reachable and named (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      const directory = page.getByRole("link", { name: /get listed/i }).first();
      const exclusive = page
        .getByRole("link", { name: /contact us for your market rate/i })
        .first();

      // Accessible names present
      await expect(directory).toHaveAccessibleName(/get listed/i);
      await expect(exclusive).toHaveAccessibleName(/contact us for your market rate/i);

      // Focusable via keyboard; Enter navigates
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

    test(`comparison table has accessible label + row/col headers (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      if (vp.name === "desktop") {
        const table = page.getByRole("table", { name: /comparison/i });
        await expect(table).toBeVisible();
        // Column headers
        await expect(
          table.getByRole("columnheader", { name: /feature/i }),
        ).toBeVisible();
        await expect(
          table.getByRole("columnheader", { name: /directory/i }),
        ).toBeVisible();
        await expect(
          table.getByRole("columnheader", { name: /exclusive/i }),
        ).toBeVisible();
        // Row headers present
        expect(await table.getByRole("rowheader").count()).toBeGreaterThan(0);
      } else {
        // Mobile: stacked list, labelled the same way
        const list = page.getByRole("list", { name: /comparison/i });
        await expect(list).toBeVisible();
        expect(await list.getByRole("listitem").count()).toBeGreaterThan(0);
      }
    });

    test(`FAQ accordion is keyboard-navigable (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      const firstTrigger = page
        .getByRole("button", { name: /what's included in the \$10\/year/i });
      await firstTrigger.scrollIntoViewIfNeeded();
      await firstTrigger.focus();
      await expect(firstTrigger).toBeFocused();
      // aria-expanded flips on Enter
      await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
      await page.keyboard.press("Enter");
      await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
      // Space closes
      await page.keyboard.press(" ");
      await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Analytics — Supabase seo_events + GA4 mirror both fire
// ---------------------------------------------------------------------------
test.describe("Pricing — analytics events fire (Supabase + GA4 mirror)", () => {
  test.skip(LIVE, "Local dev only");

  for (const vp of viewports) {
    test(`pricing_view / tier_click / faq_open / contact_click fire on ${vp.name}`, async ({
      page,
    }) => {
      const captured = { leads: [] as Request[], events: [] as string[], eventPayloads: [] as Record<string, unknown>[] };
      await stubBackend(page, captured);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Stub GA4 measurement id + capture gtag calls before any script runs.
      await page.addInitScript(() => {
        (window as unknown as { __ga4Calls: unknown[][] }).__ga4Calls = [];
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (
          ...args: unknown[]
        ) => {
          (window as unknown as { __ga4Calls: unknown[][] }).__ga4Calls.push(args);
        };
      });
      // Block the real GA4 script from loading — we only care that gtag() was called.
      await page.route("https://www.googletagmanager.com/**", (r) => r.abort());

      await page.goto("/pricing");
      await expect
        .poll(() => captured.events.includes("pricing_view"), { timeout: 5000 })
        .toBe(true);

      await page
        .getByRole("button", { name: /what's included in the \$10\/year/i })
        .click();
      await expect
        .poll(() => captured.events.includes("pricing_faq_open"), { timeout: 5000 })
        .toBe(true);

      await page.getByRole("link", { name: /get listed/i }).first().click();
      await expect
        .poll(() => captured.events.includes("pricing_tier_click"), { timeout: 5000 })
        .toBe(true);

      await page.goto("/pricing");
      await page
        .getByRole("link", { name: /still have questions\? contact us/i })
        .click();
      await expect
        .poll(() => captured.events.includes("pricing_contact_click"), {
          timeout: 5000,
        })
        .toBe(true);

      // GA4 mirror: gtag() should have been invoked with event names.
      // (Only asserted when VITE_GA4_MEASUREMENT_ID is set in the build env.)
      if (process.env.VITE_GA4_MEASUREMENT_ID) {
        const ga4Calls = await page.evaluate(
          () => (window as unknown as { __ga4Calls?: unknown[][] }).__ga4Calls ?? [],
        );
        const ga4Events = ga4Calls
          .filter((c) => c[0] === "event")
          .map((c) => c[1] as string);
        expect(ga4Events).toEqual(
          expect.arrayContaining([
            "pricing_view",
            "pricing_tier_click",
            "pricing_faq_open",
            "pricing_contact_click",
          ]),
        );
      }
    });
  }
});