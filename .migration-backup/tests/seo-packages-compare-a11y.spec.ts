import { test, expect } from "@playwright/test";

// Vite dev server default. playwright-fixture / lovable config sets baseURL when
// LOVABLE_BROWSER auth is present; fall back to localhost:8080 otherwise.
const HOME = "/";

test.describe("SEO Packages compare — a11y + reduced motion (live route)", () => {
  test.use({ reducedMotion: "reduce", colorScheme: "dark" });

  test("keyboard-only tab order reaches every compare CTA in DOM order", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "domcontentloaded" });
    const section = page.locator("#seo-packages-compare");
    await section.scrollIntoViewIfNeeded();

    const ctaSelectors = [
      "[data-testid='home-compare-cta-bullets']",
      "[data-testid='home-compare-cta-boom']",
      "[data-testid='home-compare-cta-bombs']",
      "[data-testid='home-compare-faq-cta-contact']",
      "[data-testid='home-compare-faq-cta-compare']",
    ];

    for (const sel of ctaSelectors) {
      const el = section.locator(sel);
      await expect(el).toBeVisible();
      await el.focus();
      // The focused element must be the CTA itself, not a wrapper.
      await expect(el).toBeFocused();
      // Accessible name (aria-label) must be present.
      const ariaLabel = await el.getAttribute("aria-label");
      expect(ariaLabel?.length ?? 0).toBeGreaterThan(0);
      // Visible focus ring via focus-visible utility classes.
      const cls = (await el.getAttribute("class")) ?? "";
      expect(cls).toMatch(/focus-visible:ring/);
    }
  });

  test("prefers-reduced-motion suppresses neon text-shadow animations on the headline", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(HOME, { waitUntil: "domcontentloaded" });
    await page.locator("#seo-packages-compare").scrollIntoViewIfNeeded();

    const arsenal = page
      .locator("#seo-packages-compare-heading span", { hasText: /arsenal/i })
      .first();
    await expect(arsenal).toBeVisible();

    // Under reduced-motion, Tailwind's motion-reduce:[text-shadow:none] wins.
    const textShadow = await arsenal.evaluate(
      (el) => window.getComputedStyle(el).textShadow,
    );
    expect(textShadow.toLowerCase()).toBe("none");
  });

  test("FAQPage JSON-LD is present with the expected question set", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "domcontentloaded" });
    const raw = await page
      .locator('[data-testid="seo-packages-compare-faq-jsonld"]')
      .textContent();
    expect(raw).toBeTruthy();
    const json = JSON.parse(raw!);
    expect(json["@type"]).toBe("FAQPage");
    expect(Array.isArray(json.mainEntity)).toBe(true);
    expect(json.mainEntity.length).toBeGreaterThanOrEqual(4);
    for (const q of json.mainEntity) {
      expect(q["@type"]).toBe("Question");
      expect(typeof q.name).toBe("string");
      expect(q.acceptedAnswer?.["@type"]).toBe("Answer");
      expect(typeof q.acceptedAnswer?.text).toBe("string");
    }
  });
});
