import { test, expect } from "@playwright/test";

// Skip on live-origin runs — this spec needs to stub the Supabase network layer,
// which we can only safely do against the dev server preview.
const LIVE = !!(process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL);

test.describe("Pricing — tier CTA → contact flow", () => {
  test.skip(LIVE, "Stubs Supabase network; only runs against local dev server");

  test.beforeEach(async ({ page }) => {
    // Stub the Supabase `leads` insert so the form submits successfully
    // without hitting the backend.
    await page.route("**/rest/v1/leads*", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          headers: { "Content-Range": "0-0/1" },
          body: JSON.stringify([{ id: "test-lead-id" }]),
        });
      }
      return route.continue();
    });
    // Silence analytics inserts so they don't clutter or fail.
    await page.route("**/rest/v1/seo_events*", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: "[]",
      }),
    );
  });

  const viewports = [
    { name: "desktop", width: 1280, height: 1200 },
    { name: "mobile", width: 390, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Directory tier CTA opens contact and submits (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      await page
        .getByRole("link", { name: /get listed/i })
        .first()
        .click();

      await expect(page).toHaveURL(/\/contact$/);
      await submitContactForm(page);
    });

    test(`Exclusive tier CTA opens contact and submits (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      await page
        .getByRole("link", { name: /contact us for your market rate/i })
        .first()
        .click();

      await expect(page).toHaveURL(/\/contact$/);
      await submitContactForm(page);
    });
  }
});

async function submitContactForm(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("Full name *").fill("Test Vendor");
  await page.getByPlaceholder("Email *").fill("test@example.com");
  await page.getByPlaceholder("City *").fill("Vancouver");
  await page.locator("select").selectOption("Roofing");
  await page
    .getByPlaceholder(/Tell us about your business/i)
    .fill(
      "Automated e2e test — verifying the pricing CTA to contact flow submits successfully.",
    );

  const insertRequest = page.waitForRequest(
    (req) =>
      req.url().includes("/rest/v1/leads") && req.method() === "POST",
  );

  await page.getByRole("button", { name: /send message/i }).click();

  const req = await insertRequest;
  const body = req.postDataJSON();
  expect(body.source).toBe("contact-page");
  expect(body.email).toBe("test@example.com");

  // Success toast confirms end-to-end submit path.
  await expect(page.getByText(/message received/i)).toBeVisible();
}

test.describe("Pricing — analytics events fire", () => {
  test.skip(LIVE, "Intercepts Supabase seo_events; local dev only");

  const events: string[] = [];

  test.beforeEach(async ({ page }) => {
    events.length = 0;
    await page.route("**/rest/v1/seo_events*", async (route) => {
      const body = route.request().postDataJSON();
      const rows = Array.isArray(body) ? body : [body];
      for (const r of rows) if (r?.event) events.push(r.event);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: "[]",
      });
    });
  });

  for (const vp of [
    { name: "desktop", width: 1280, height: 1200 },
    { name: "mobile", width: 390, height: 900 },
  ]) {
    test(`fires pricing_view, tier_click, faq_open, contact_click (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pricing");

      await expect
        .poll(() => events.includes("pricing_view"), { timeout: 5000 })
        .toBe(true);

      // FAQ open
      await page
        .getByRole("button", { name: /what's included in the \$10\/year/i })
        .click();
      await expect
        .poll(() => events.includes("pricing_faq_open"), { timeout: 5000 })
        .toBe(true);

      // Tier click — intercept navigation so we stay on /pricing and can
      // capture the follow-on contact_click event too.
      const [tierLink] = await page.getByRole("link", { name: /get listed/i }).all();
      await tierLink.click();
      await expect
        .poll(() => events.includes("pricing_tier_click"), { timeout: 5000 })
        .toBe(true);

      // Navigate back and click a secondary "contact us" link on /pricing.
      await page.goto("/pricing");
      await page
        .getByRole("link", { name: /still have questions\? contact us/i })
        .click();
      await expect
        .poll(() => events.includes("pricing_contact_click"), { timeout: 5000 })
        .toBe(true);
    });
  }
});