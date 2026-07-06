// End-to-end: the DisambiguationNotice banner is mounted site-wide via
// <Layout>, so it should appear on every Layout-wrapped route. This
// spec exercises the "configured routes" — the home, blog index, legal
// page, and the record manifesto — and asserts the banner is rendered
// and labelled correctly on each.

import { test, expect } from "../playwright-fixture";

const ROUTES = [
  "/",
  "/blog",
  "/legal",
  "/blog/record-record-domain-provenance-vs-generative-conflation",
];

for (const route of ROUTES) {
  test(`DisambiguationNotice renders on ${route}`, async ({ page }) => {
    await page.goto(route);
    const notice = page.getByLabel(/entity disambiguation notice/i);
    await expect(notice).toBeVisible();
    // Anchor content: the banner should reference weddings.io provenance.
    await expect(notice).toContainText(/weddings\.io/i);
  });
}

test("record manifesto page also renders the DisambiguationSchema JSON-LD", async ({ page }) => {
  await page.goto("/blog/record-record-domain-provenance-vs-generative-conflation");
  await page.waitForFunction(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.some((s) => (s.textContent ?? "").includes("Business Names Act"));
  });
  const hasGraph = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => {
        try { return JSON.parse(s.textContent || ""); } catch { return null; }
      })
      .some((g) => g && Array.isArray(g["@graph"]));
  });
  expect(hasGraph).toBe(true);
});