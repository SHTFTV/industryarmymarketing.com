import { test, expect } from "../playwright-fixture";

/**
 * E2E: the Share button on the SEO Audit history must regain keyboard focus
 * after the 2-second "Copied" auto-dismiss timer fires.
 *
 * The /seo-audit history list only renders for an authenticated user with
 * saved audits. We stub the Supabase backend at the network layer so the
 * page renders deterministically without a real session.
 */

const SUPABASE_HOST = "xgqlbobmnsgxivzxcayi.supabase.co";
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";
const FAKE_SESSION = {
  access_token: "fake-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "fake-refresh-token",
  user: {
    id: FAKE_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "tester@example.com",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  },
};

const FAKE_AUDIT = {
  id: "audit-1",
  url: "https://example.com",
  score: 92,
  status: 200,
  ttfb: 120,
  checks: [],
  meta: {
    title: "Example",
    description: "Example desc",
    canonical: "",
    wordCount: 100,
    h1s: [],
    ogImage: "",
    hasSchema: false,
  },
  deep_dive: null,
  created_at: new Date().toISOString(),
};

test("Share button regains focus after the Copied state auto-dismisses", async ({
  page,
  context,
}) => {
  // Grant clipboard permission so navigator.clipboard.writeText resolves.
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  // Preseed an auth session before the app loads so getSession() succeeds.
  await page.addInitScript(
    ({ host, session }) => {
      const projectRef = host.split(".")[0];
      const key = `sb-${projectRef}-auth-token`;
      try {
        window.localStorage.setItem(key, JSON.stringify(session));
      } catch {
        /* ignore */
      }
    },
    { host: SUPABASE_HOST, session: FAKE_SESSION },
  );

  // Stub every Supabase REST/auth call so the page renders with one audit row
  // and never makes a real network request.
  await page.route(`https://${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/v1/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_SESSION),
      });
    }
    if (url.includes("/rest/v1/seo_audits")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([FAKE_AUDIT]),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

  const shareBtn = page.getByRole("button", {
    name: /copy shareable link to this audit history view/i,
  });
  await expect(shareBtn).toBeVisible({ timeout: 10_000 });

  await shareBtn.focus();
  await shareBtn.click();

  // Button label flips to the Copied state.
  const copiedBtn = page.getByRole("button", { name: /^link copied to clipboard$/i });
  await expect(copiedBtn).toBeVisible();

  // After the 2s auto-dismiss the label reverts and focus is restored.
  await expect(shareBtn).toBeVisible({ timeout: 5_000 });
  await expect(copiedBtn).toHaveCount(0);

  const focusedLabel = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? "",
  );
  expect(focusedLabel.toLowerCase()).toContain("copy shareable link");
});

test("Shift+Tab and Enter keep focus correctly on the Share/Copied button during the toast lifecycle", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.addInitScript(
    ({ host, session }) => {
      const projectRef = host.split(".")[0];
      const key = `sb-${projectRef}-auth-token`;
      try {
        window.localStorage.setItem(key, JSON.stringify(session));
      } catch {
        /* ignore */
      }
    },
    { host: SUPABASE_HOST, session: FAKE_SESSION },
  );

  await page.route(`https://${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/v1/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_SESSION),
      });
    }
    if (url.includes("/rest/v1/seo_audits")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([FAKE_AUDIT]),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

  const shareBtn = page.getByRole("button", {
    name: /copy shareable link to this audit history view/i,
  });
  await expect(shareBtn).toBeVisible({ timeout: 10_000 });

  // 1. Focus the button via the keyboard path, then activate with Enter.
  await shareBtn.focus();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("BUTTON");
  await page.keyboard.press("Enter");

  // The button flips to the Copied state and focus stays on it
  // (same DOM node — only children + aria-label change).
  const copiedBtn = page.getByRole("button", { name: /^link copied to clipboard$/i });
  await expect(copiedBtn).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/link copied to clipboard/i);
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-pressed") ?? ""))
    .toBe("true");

  // 2. Shift+Tab moves focus to the previous focusable element. The Copied
  //    button must NOT trap focus, and our auto-restore must not yank it back.
  await page.keyboard.press("Shift+Tab");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .not.toMatch(/link copied to clipboard/i);

  // 3. Tab forward returns focus to the same Share/Copied button.
  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/link copied to clipboard|copy shareable link/i);

  // 4. After the 2s auto-dismiss the label reverts to "Share" and
  //    aria-pressed flips back to false. Focus stays on the same node.
  await expect(shareBtn).toBeVisible({ timeout: 5_000 });
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/copy shareable link/i);
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-pressed") ?? ""))
    .toBe("false");
});