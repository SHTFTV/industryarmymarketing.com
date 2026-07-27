import { test, expect, type Request } from "@playwright/test";

// End-to-end verification: clicking each labeled Compare / FAQ CTA on the
// homepage navigates to the expected target route AND records a
// `home_cta_conversion` analytics event (fired by CtaAttributionListener
// on the next page after route change) with the correct label + target.
//
// Analytics are persisted via the Supabase JS client → PostgREST, so we
// intercept POSTs to `/rest/v1/seo_events` and match on payload.

type CapturedEvent = {
  event: string;
  path: string | null;
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

const CASES = [
  {
    label: "Bullets",
    testid: "home-compare-cta-bullets",
    target: "/seo-packages/bullets",
    clickLabel: "Bullets",
    source: "home_seo_packages_compare",
  },
  {
    label: "Boom",
    testid: "home-compare-cta-boom",
    target: "/seo-packages/boom",
    clickLabel: "Boom",
    source: "home_seo_packages_compare",
  },
  {
    label: "Bombs",
    testid: "home-compare-cta-bombs",
    target: "/seo-packages/bombs",
    clickLabel: "Bombs",
    source: "home_seo_packages_compare",
  },
  {
    label: "FAQ · Tell us your budget → /contact",
    testid: "home-compare-faq-cta-contact",
    target: "/contact",
    clickLabel: "Tell us your budget",
    source: "home_seo_packages_compare_faq",
  },
  {
    label: "FAQ · Compare all packages → /seo-packages",
    testid: "home-compare-faq-cta-compare",
    target: "/seo-packages",
    clickLabel: "Compare all packages",
    source: "home_seo_packages_compare_faq",
  },
];

test.describe("Compare + FAQ CTA → conversion analytics attribution", () => {
  for (const c of CASES) {
    test(`${c.label} click lands on ${c.target} and fires home_cta_conversion`, async ({
      page,
    }) => {
      const captured = await withCapturedEvents(page, async () => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        const section = page.locator("#seo-packages-compare");
        await section.scrollIntoViewIfNeeded();

        const cta = section.locator(`[data-testid='${c.testid}']`);
        await expect(cta).toBeVisible();

        await Promise.all([
          page.waitForURL((u) => u.pathname === c.target || u.pathname.startsWith(c.target + "/"), {
            timeout: 10_000,
          }),
          cta.click(),
        ]);

        // Give the CtaAttributionListener a beat to flush after route change.
        await page.waitForTimeout(400);
      });

      expect(page.url()).toContain(c.target);

      const conversion = captured.find(
        (e) =>
          e.event === "home_cta_conversion" &&
          (e.meta?.label as string | undefined) === c.clickLabel &&
          (e.meta?.target as string | undefined) === c.target &&
          (e.meta?.source as string | undefined) === c.source,
      );

      expect(
        conversion,
        `Expected home_cta_conversion for label="${c.clickLabel}" target="${c.target}". Captured: ${JSON.stringify(
          captured,
          null,
          2,
        )}`,
      ).toBeTruthy();
      expect(conversion!.meta?.landedOn).toBe(c.target);
    });
  }
});
