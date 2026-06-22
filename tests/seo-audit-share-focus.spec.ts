import { test, expect } from "../playwright-fixture";
import { devices } from "@playwright/test";

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

test("Toast exposes an aria-live region and the Share control has the correct accessible name while the toast is visible", async ({
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

  // Before copying: button accessible name is the idle "Copy shareable link…"
  // form, and aria-pressed reports the non-copied state.
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");
  await expect(shareBtn).toHaveAccessibleName(/copy shareable link to this audit history view/i);

  await shareBtn.click();

  // Sonner renders a region with role="region" and aria-label="Notifications"
  // that contains live-region children (status / aria-live="polite").
  // Either the region itself or an inner [aria-live] element must be present
  // and announce the success copy.
  const liveRegions = page.locator("[aria-live]");
  await expect(liveRegions.first()).toHaveCount(1, { timeout: 5_000 });
  const liveValue = await liveRegions.first().getAttribute("aria-live");
  expect(["polite", "assertive"]).toContain(liveValue);

  // While the toast is visible at least one aria-live element must contain
  // the success copy so it actually gets announced.
  await expect(
    liveRegions.filter({ hasText: /link copied to clipboard/i }).first(),
  ).toBeVisible({ timeout: 5_000 });

  // The on-page sr-only status region next to the button announces the copy.
  const statusRegion = page.locator('[role="status"][aria-live="polite"]');
  await expect(statusRegion.first()).toContainText(/link copied to clipboard/i, { timeout: 3_000 });

  // The toast itself surfaces the success message.
  await expect(page.getByText(/link copied to clipboard/i).first()).toBeVisible();

  // While the toast is visible the Share control's accessible name flips to
  // the "Link copied to clipboard" form and aria-pressed becomes true.
  const copiedBtn = page.getByRole("button", { name: /^link copied to clipboard$/i });
  await expect(copiedBtn).toBeVisible();
  await expect(copiedBtn).toHaveAttribute("aria-pressed", "true");
  await expect(copiedBtn).toHaveAccessibleName(/^link copied to clipboard$/i);

  // After the 2s auto-dismiss the accessible name reverts.
  await expect(shareBtn).toHaveAccessibleName(/copy shareable link to this audit history view/i, {
    timeout: 5_000,
  });
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

  // And the sr-only status region empties out so it doesn't keep
  // re-announcing the stale "copied" message to screen readers.
  await expect(statusRegion.first()).toHaveText("", { timeout: 5_000 });

  // No aria-live element on the page may still contain the stale "copied"
  // text after the toast lifecycle ends — Sonner removes the toast node
  // from its live region, and our sr-only status region empties out.
  await expect(
    page.locator("[aria-live]").filter({ hasText: /link copied to clipboard/i }),
  ).toHaveCount(0, { timeout: 6_000 });
});

test("Rapid clicks on the Share button collapse into a single toast and a single live-region announcement", async ({
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

  // Fire several rapid clicks in quick succession.
  for (let i = 0; i < 6; i++) {
    await shareBtn.click({ force: true });
  }

  // Exactly one visible Sonner toast carrying the success copy.
  const toastByText = page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i });
  await expect(toastByText).toHaveCount(1, { timeout: 3_000 });

  // Exactly one aria-live element on the page contains the announcement
  // — Sonner's live region for the deduplicated toast plus the page's
  // sr-only status region resolve to a single live announcement source
  // (Sonner's portal nests its toast inside one live region).
  const liveWithCopy = page.locator("[aria-live]").filter({ hasText: /link copied to clipboard/i });
  await expect(liveWithCopy).toHaveCount(1, { timeout: 3_000 });

  // The sr-only status region shows the message exactly once, not stacked.
  const statusRegion = page.locator('[role="status"][aria-live="polite"]');
  await expect(statusRegion).toHaveCount(1);
  await expect(statusRegion).toHaveText(/^link copied to clipboard$/i);

  // After auto-dismiss everything clears back to baseline.
  await expect(toastByText).toHaveCount(0, { timeout: 6_000 });
  await expect(liveWithCopy).toHaveCount(0);
  await expect(statusRegion).toHaveText("");
});

test("Holding Enter on the Share button still produces exactly one toast and one live-region announcement", async ({
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

  await shareBtn.focus();

  // Simulate the user holding the Enter key down. Playwright's
  // keyboard.down() fires a single non-repeat keydown, so we follow up
  // with synthetic repeat events dispatched at the focused element —
  // mirroring the OS auto-repeat behaviour every ~30ms for ~600ms.
  await page.keyboard.down("Enter");
  await page.evaluate(async () => {
    const target = document.activeElement as HTMLElement | null;
    if (!target) return;
    for (let i = 0; i < 20; i++) {
      target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          repeat: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      // A real "Enter held down" also re-fires click on the active button
      // each repeat — mirror that so we exercise the copy handler the same
      // way the browser would.
      if (target instanceof HTMLButtonElement) target.click();
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  await page.keyboard.up("Enter");

  const toastByText = page.locator("[data-sonner-toast]", {
    hasText: /link copied to clipboard/i,
  });
  const liveWithCopy = page
    .locator("[aria-live]")
    .filter({ hasText: /link copied to clipboard/i });
  const statusRegion = page.locator('[role="status"][aria-live="polite"]');

  // During the visible lifecycle: exactly one of each.
  await expect(toastByText).toHaveCount(1, { timeout: 3_000 });
  await expect(liveWithCopy).toHaveCount(1);
  await expect(statusRegion).toHaveCount(1);
  await expect(statusRegion).toHaveText(/^link copied to clipboard$/i);

  // The toast's visible text must match the announced message exactly.
  await expect(toastByText.first()).toHaveText(/link copied to clipboard/i);

  // The clipboard now holds the current page URL — the value the Share
  // button is meant to copy. Read it through the same async clipboard API
  // the app uses; permissions were granted at the top of the test.
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(page.url());

  // Hold one more brief settle window — any queued duplicate toasts would
  // surface here. Count must stay at one.
  await page.waitForTimeout(500);
  await expect(toastByText).toHaveCount(1);
  await expect(liveWithCopy).toHaveCount(1);

  // After the 2s auto-dismiss everything clears.
  await expect(toastByText).toHaveCount(0, { timeout: 6_000 });
  await expect(liveWithCopy).toHaveCount(0);
  await expect(statusRegion).toHaveText("");
});

test("Share flow surfaces an accessible error toast when navigator.clipboard is denied", async ({
  page,
  context,
}) => {
  // Do NOT grant clipboard permissions. Additionally override
  // navigator.clipboard.writeText to reject — covers browsers where
  // permission denial throws and browsers where it returns a rejected
  // promise.
  await context.clearPermissions();

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

  await page.addInitScript(() => {
    // Stub the clipboard so writeText always rejects with NotAllowedError.
    const denied = () =>
      Promise.reject(
        new DOMException("Clipboard write denied by test", "NotAllowedError"),
      );
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: denied, readText: denied },
      });
    } catch {
      /* ignore */
    }
  });

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

  // Capture unhandled page errors — denial must NOT bubble out as an
  // unhandled exception ("silent failure" tripwire).
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await shareBtn.click();

  // Error toast surfaces with the expected copy.
  const errorToast = page.locator("[data-sonner-toast]", {
    hasText: /could not copy link/i,
  });
  await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
  await expect(errorToast.first()).toBeVisible();

  // The toast lives inside a screen-reader-announceable live region.
  const liveWithError = page
    .locator("[aria-live]")
    .filter({ hasText: /could not copy link/i });
  await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
  const liveValue = await liveWithError.first().getAttribute("aria-live");
  expect(["polite", "assertive"]).toContain(liveValue);

  // Sonner marks error toasts with a recognisable data attribute so AT
  // and tests can differentiate from success.
  const toastType = await errorToast.first().getAttribute("data-type");
  expect(toastType).toBe("error");

  // The success copy must NOT appear — neither in a toast nor in any
  // aria-live element.
  await expect(
    page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
  ).toHaveCount(0);
  await expect(
    page.locator("[aria-live]").filter({ hasText: /link copied to clipboard/i }),
  ).toHaveCount(0);

  // Button stays in the idle "Share" state — aria-pressed must not flip
  // and the accessible name must not change to the copied form.
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");
  await expect(shareBtn).toHaveAccessibleName(/copy shareable link to this audit history view/i);
  await expect(
    page.getByRole("button", { name: /^link copied to clipboard$/i }),
  ).toHaveCount(0);

  // No unhandled errors leaked from the rejected clipboard promise.
  expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
});

test("Insecure context with no navigator.clipboard falls back to execCommand and surfaces the success toast", async ({
  page,
  context,
}) => {
  await context.clearPermissions();

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

  // Simulate an insecure context (http://, embedded webview, old browser):
  // navigator.clipboard is undefined entirely. The app must not throw an
  // uncaught TypeError accessing `.writeText` on undefined.
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return undefined;
        },
      });
    } catch {
      /* ignore */
    }
  });

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

  // Sanity: the stub took effect — clipboard is actually undefined inside
  // the page, not just hidden behind a permissions prompt.
  expect(await page.evaluate(() => typeof (navigator as Navigator).clipboard)).toBe("undefined");

  const shareBtn = page.getByRole("button", {
    name: /copy shareable link to this audit history view/i,
  });
  await expect(shareBtn).toBeVisible({ timeout: 10_000 });

  // Baseline count of <textarea> elements before the fallback runs — used
  // below to assert no leftover temp textarea remains.
  const baselineTextareas = await page.locator("textarea").count();

  // Select some on-page text before triggering the copy so we can verify
  // the fallback restores the user's original selection. Triggering via
  // Alt+S (instead of a click) avoids the click itself clearing the
  // selection.
  const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
  await expect(selectionTarget).toBeVisible();
  await page.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el as Node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, await selectionTarget.elementHandle());

  const originalSelection = await page.evaluate(
    () => window.getSelection()?.toString() ?? "",
  );
  expect(originalSelection.length).toBeGreaterThan(0);

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  // Trigger via the Alt+S shortcut so the user's text selection is preserved
  // up to the moment the fallback runs.
  await page.keyboard.press("Alt+S");

  // The execCommand fallback should succeed, so the success toast appears.
  const successToast = page.locator("[data-sonner-toast]", {
    hasText: /link copied to clipboard/i,
  });
  await expect(successToast).toHaveCount(1, { timeout: 3_000 });
  await expect(successToast.first()).toBeVisible();
  expect(await successToast.first().getAttribute("data-type")).toBe("success");

  const liveWithCopy = page
    .locator("[aria-live]")
    .filter({ hasText: /link copied to clipboard/i });
  await expect(liveWithCopy.first()).toBeVisible({ timeout: 3_000 });
  const liveValue = await liveWithCopy.first().getAttribute("aria-live");
  expect(["polite", "assertive"]).toContain(liveValue);

  // Button flips to the Copied state with the right ARIA semantics.
  await expect(
    page.getByRole("button", { name: /^link copied to clipboard$/i }),
  ).toBeVisible();
  await expect(shareBtn).toHaveAttribute("aria-pressed", "true");

  // No error toast should appear since the fallback handled the copy.
  await expect(
    page.locator("[data-sonner-toast]", { hasText: /could not copy link/i }),
  ).toHaveCount(0);

  // Cleanup: the temporary <textarea> used by the fallback is removed.
  await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

  // Selection restoration: the user's original text selection is restored
  // after the fallback completes, not left pointing at the (now-removed)
  // temp textarea.
  const restoredSelection = await page.evaluate(
    () => window.getSelection()?.toString() ?? "",
  );
  expect(restoredSelection).toBe(originalSelection);

  // And no uncaught TypeError ("Cannot read properties of undefined…") leaked.
  expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
});

test("Share flow surfaces the accessible error toast when both clipboard and execCommand fail", async ({
  page,
  context,
}) => {
  await context.clearPermissions();

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

  // Block both copy paths: navigator.clipboard missing AND execCommand("copy")
  // returns false (the textarea fallback can't write either).
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return undefined;
        },
      });
    } catch {
      /* ignore */
    }
    const originalExec = document.execCommand.bind(document);
    document.execCommand = ((cmd: string, ...rest: unknown[]) => {
      if (cmd === "copy") return false;
      // Defer to the real implementation for anything else.
      return originalExec(cmd, ...(rest as [boolean?, string?]));
    }) as typeof document.execCommand;
  });

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

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await shareBtn.click();

  // Accessible error toast surfaces.
  const errorToast = page.locator("[data-sonner-toast]", {
    hasText: /could not copy link/i,
  });
  await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
  await expect(errorToast.first()).toBeVisible();
  expect(await errorToast.first().getAttribute("data-type")).toBe("error");

  const liveWithError = page
    .locator("[aria-live]")
    .filter({ hasText: /could not copy link/i });
  await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
  const liveValue = await liveWithError.first().getAttribute("aria-live");
  expect(["polite", "assertive"]).toContain(liveValue);

  // No success leakage anywhere.
  await expect(
    page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
  ).toHaveCount(0);
  await expect(
    page.locator("[aria-live]").filter({ hasText: /link copied to clipboard/i }),
  ).toHaveCount(0);

  // Button stays idle.
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");
  await expect(shareBtn).toHaveAccessibleName(
    /copy shareable link to this audit history view/i,
  );

  // No uncaught errors leaked from either copy path.
  expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
});

test.describe("Firefox desktop: execCommand fallback cleanup and selection restoration", () => {
  test.use({ browserName: "firefox" });

  test("Temp textarea is removed and the previous selection is restored after execCommand('copy') succeeds in Firefox", async ({
    page,
    context,
  }) => {
    // Firefox does not currently honour Chromium's clipboard permission
    // grants the same way, and we want to force the fallback path anyway,
    // so we stub navigator.clipboard out entirely.
    await context.clearPermissions();

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

    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      // Make execCommand("copy") succeed and record the selection it was
      // given so the test can assert the fallback ran with the right value.
      (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls = [];
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          const sel = window.getSelection()?.toString() ?? "";
          (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls.push(sel);
          return true;
        }
        return false;
      }) as typeof document.execCommand;
    });

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

    expect(await page.evaluate(() => typeof (navigator as Navigator).clipboard)).toBe(
      "undefined",
    );

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    // Baseline <textarea> count before the fallback runs.
    const baselineTextareas = await page.locator("textarea").count();

    // Select the "Audit History" heading text and trigger via Alt+S so the
    // click doesn't clear the user's selection.
    const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
    await expect(selectionTarget).toBeVisible();
    await page.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el as Node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, await selectionTarget.elementHandle());

    const originalSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(originalSelection.length).toBeGreaterThan(0);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.keyboard.press("Alt+S");

    // Success toast appears (fallback handled the copy).
    const successToast = page.locator("[data-sonner-toast]", {
      hasText: /link copied to clipboard/i,
    });
    await expect(successToast).toHaveCount(1, { timeout: 3_000 });
    expect(await successToast.first().getAttribute("data-type")).toBe("success");
    await expect(shareBtn).toHaveAttribute("aria-pressed", "true");

    // Fallback actually ran with the share URL selected in the textarea.
    const execCalls = await page.evaluate(
      () => (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls,
    );
    expect(execCalls.length).toBeGreaterThanOrEqual(1);
    expect(execCalls[0]).toBe(page.url());

    // Cleanup: temp <textarea> removed.
    await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

    // Selection restored to the original heading text.
    const restoredSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(restoredSelection).toBe(originalSelection);

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("execCommand('copy') returning false in Firefox shows the error toast and restores focus + selection", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();

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

    // Both copy paths fail: no navigator.clipboard, and execCommand("copy")
    // silently returns false.
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") return false;
        return false;
      }) as typeof document.execCommand;
    });

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

    const baselineTextareas = await page.locator("textarea").count();

    // Focus the Share button first so we can assert focus is restored to it
    // after the fallback's temp <textarea> mount/unmount cycle.
    await shareBtn.focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    // Select on-page text. The Alt+S trigger preserves the selection up to
    // the moment the fallback runs.
    const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
    await expect(selectionTarget).toBeVisible();
    await page.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el as Node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, await selectionTarget.elementHandle());

    const originalSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(originalSelection.length).toBeGreaterThan(0);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.keyboard.press("Alt+S");

    // Accessible error toast — both paths failed.
    const errorToast = page.locator("[data-sonner-toast]", {
      hasText: /could not copy link/i,
    });
    await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
    expect(await errorToast.first().getAttribute("data-type")).toBe("error");

    const liveWithError = page
      .locator("[aria-live]")
      .filter({ hasText: /could not copy link/i });
    await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithError.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    // No success leakage anywhere.
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);
    await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

    // Cleanup: the temporary <textarea> the fallback briefly mounted is gone.
    await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

    // Selection restored to the original heading text — the fallback's
    // textarea selection must not leak out as the page's selection.
    const restoredSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(restoredSelection).toBe(originalSelection);

    // Focus restored to the Share button.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("execCommand('copy') throwing in Firefox shows the error toast and restores focus + selection", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();

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

    // Both copy paths fail: no navigator.clipboard, and execCommand("copy")
    // throws (mirrors hardened Firefox profiles / extensions that block the
    // deprecated API).
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          throw new DOMException("execCommand copy blocked", "NotAllowedError");
        }
        return false;
      }) as typeof document.execCommand;
    });

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

    const baselineTextareas = await page.locator("textarea").count();

    // Focus the Share button so we can assert focus is restored to it.
    await shareBtn.focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    // Select on-page text — Alt+S preserves it through the copy attempt.
    const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
    await expect(selectionTarget).toBeVisible();
    await page.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el as Node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, await selectionTarget.elementHandle());

    const originalSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(originalSelection.length).toBeGreaterThan(0);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.keyboard.press("Alt+S");

    // Accessible error toast surfaces.
    const errorToast = page.locator("[data-sonner-toast]", {
      hasText: /could not copy link/i,
    });
    await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
    expect(await errorToast.first().getAttribute("data-type")).toBe("error");

    const liveWithError = page
      .locator("[aria-live]")
      .filter({ hasText: /could not copy link/i });
    await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithError.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    // No success leakage anywhere.
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);
    await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

    // Cleanup: temp <textarea> removed even though execCommand threw —
    // the implementation's `finally` block must guarantee this.
    await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

    // Selection restored despite the thrown exception.
    const restoredSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(restoredSelection).toBe(originalSelection);

    // Focus restored to the Share button.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    // The thrown DOMException must be caught — no uncaught page errors.
    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });
});

test.describe("Safari/iOS emulation: execCommand('copy') unavailable", () => {
  test.use({ ...devices["iPhone 13"] });

  const stubSupabase = async (page: import("@playwright/test").Page) => {
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
  };

  test("Primary navigator.clipboard path still succeeds on iOS when execCommand('copy') throws", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await stubSupabase(page);

    // Mirror Safari/iOS behaviour: execCommand("copy") throws (or returns
    // false) inside a user-activated handler. Our fallback must not be
    // reached because navigator.clipboard succeeds first.
    await page.addInitScript(() => {
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          throw new DOMException("execCommand copy unsupported on iOS", "NotSupportedError");
        }
        return false;
      }) as typeof document.execCommand;
    });

    await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Tap (iOS) instead of click to mirror the real interaction.
    await shareBtn.tap();

    const successToast = page.locator("[data-sonner-toast]", {
      hasText: /link copied to clipboard/i,
    });
    await expect(successToast).toHaveCount(1, { timeout: 3_000 });
    expect(await successToast.first().getAttribute("data-type")).toBe("success");

    await expect(shareBtn).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /could not copy link/i }),
    ).toHaveCount(0);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(page.url());

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("On iOS with no navigator.clipboard AND execCommand('copy') throwing, the accessible error toast appears", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();
    await stubSupabase(page);

    // Older iOS Safari: navigator.clipboard is absent and the deprecated
    // execCommand("copy") throws inside a webview. Both copy paths fail.
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          throw new DOMException("execCommand copy unsupported on iOS", "NotSupportedError");
        }
        return false;
      }) as typeof document.execCommand;
    });

    await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await shareBtn.tap();

    const errorToast = page.locator("[data-sonner-toast]", {
      hasText: /could not copy link/i,
    });
    await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
    expect(await errorToast.first().getAttribute("data-type")).toBe("error");

    const liveWithError = page
      .locator("[aria-live]")
      .filter({ hasText: /could not copy link/i });
    await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithError.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    await expect(
      page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);
    await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("On iOS with no navigator.clipboard AND execCommand('copy') returning false, the accessible error toast appears", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();
    await stubSupabase(page);

    // iOS Safari webview variant: navigator.clipboard is unavailable and the
    // deprecated execCommand("copy") silently returns false (no throw, no
    // copy). Both paths fail and the app must surface the error toast.
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") return false;
        return false;
      }) as typeof document.execCommand;
    });

    await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await shareBtn.tap();

    const errorToast = page.locator("[data-sonner-toast]", {
      hasText: /could not copy link/i,
    });
    await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
    expect(await errorToast.first().getAttribute("data-type")).toBe("error");

    const liveWithError = page
      .locator("[aria-live]")
      .filter({ hasText: /could not copy link/i });
    await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithError.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    // No success leakage anywhere.
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);
    await expect(
      page.locator("[aria-live]").filter({ hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);

    // Button stays idle: no Copied state, accessible name unchanged.
    await expect(shareBtn).toHaveAttribute("aria-pressed", "false");
    await expect(shareBtn).toHaveAccessibleName(
      /copy shareable link to this audit history view/i,
    );

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("On iOS with no navigator.clipboard but execCommand('copy') succeeding, the success toast and Copied state appear", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();
    await stubSupabase(page);

    // iOS Safari fallback path: navigator.clipboard is unavailable but the
    // hidden-textarea + document.execCommand("copy") path succeeds.
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      // Track every execCommand("copy") call so the test can assert the
      // fallback path actually ran (and was given the share URL via the
      // selected <textarea>).
      (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls = [];
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          const sel = window.getSelection()?.toString() ?? "";
          (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls.push(sel);
          return true;
        }
        return false;
      }) as typeof document.execCommand;
    });

    await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    // Capture the count of <textarea> elements before the fallback runs so
    // we can assert that no leftover temp textarea remains afterwards.
    const baselineTextareas = await page.locator("textarea").count();

    // Select some text on the page before triggering the copy, so we can
    // verify the fallback restores the user's original selection. We use the
    // Alt+S keyboard shortcut (instead of a tap) so the click doesn't clear
    // the selection itself.
    const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
    await expect(selectionTarget).toBeVisible();
    await page.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el as Node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, await selectionTarget.elementHandle());

    const originalSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(originalSelection.length).toBeGreaterThan(0);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Trigger via the Alt+S shortcut so the user's selection isn't cleared
    // by a tap/click on the Share button itself.
    await page.keyboard.press("Alt+S");

    // Success toast with the right semantics.
    const successToast = page.locator("[data-sonner-toast]", {
      hasText: /link copied to clipboard/i,
    });
    await expect(successToast).toHaveCount(1, { timeout: 3_000 });
    expect(await successToast.first().getAttribute("data-type")).toBe("success");

    // Live region announces the success.
    const liveWithCopy = page
      .locator("[aria-live]")
      .filter({ hasText: /link copied to clipboard/i });
    await expect(liveWithCopy.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithCopy.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    // Button flips to the Copied state with the right ARIA semantics.
    await expect(
      page.getByRole("button", { name: /^link copied to clipboard$/i }),
    ).toBeVisible();
    await expect(shareBtn).toHaveAttribute("aria-pressed", "true");

    // No error toast surfaces since the fallback handled the copy.
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /could not copy link/i }),
    ).toHaveCount(0);

    // The fallback actually executed and selected the share URL in the
    // hidden textarea before invoking execCommand("copy").
    const execCalls = await page.evaluate(
      () => (window as unknown as { __execCopyCalls: string[] }).__execCopyCalls,
    );
    expect(execCalls.length).toBeGreaterThanOrEqual(1);
    expect(execCalls[0]).toBe(page.url());

    // The temporary <textarea> used by the fallback must be cleaned up —
    // no stray textarea elements should remain in the DOM.
    await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

    // The user's original text selection must be restored after the
    // fallback completes, not left pointing at the (now-removed) textarea.
    const restoredSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(restoredSelection).toBe(originalSelection);

    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("On iOS with no navigator.clipboard AND execCommand('copy') throwing NotAllowedError, the error toast surfaces and selection + focus are restored", async ({
    page,
    context,
  }) => {
    await context.clearPermissions();
    await stubSupabase(page);

    // iOS WKWebview / hardened Safari: navigator.clipboard is absent and
    // execCommand("copy") throws NotAllowedError. Both copy paths fail and
    // the implementation's `finally` block must still clean up the temp
    // textarea, restore the user's selection, and restore focus.
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch {
        /* ignore */
      }
      document.execCommand = ((cmd: string) => {
        if (cmd === "copy") {
          throw new DOMException("execCommand copy blocked on iOS", "NotAllowedError");
        }
        return false;
      }) as typeof document.execCommand;
    });

    await page.goto("/seo-audit", { waitUntil: "domcontentloaded" });

    const shareBtn = page.getByRole("button", {
      name: /copy shareable link to this audit history view/i,
    });
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });

    const baselineTextareas = await page.locator("textarea").count();

    // Focus the Share button so we can verify focus restoration after the
    // fallback's temp <textarea> mount/unmount cycle.
    await shareBtn.focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    // Select on-page text so we can verify selection restoration. Alt+S
    // (not a tap) preserves the selection through the copy attempt.
    const selectionTarget = page.locator("h2", { hasText: /audit history/i }).first();
    await expect(selectionTarget).toBeVisible();
    await page.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el as Node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, await selectionTarget.elementHandle());

    const originalSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(originalSelection.length).toBeGreaterThan(0);

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.keyboard.press("Alt+S");

    // Accessible error toast — both paths failed.
    const errorToast = page.locator("[data-sonner-toast]", {
      hasText: /could not copy link/i,
    });
    await expect(errorToast).toHaveCount(1, { timeout: 3_000 });
    expect(await errorToast.first().getAttribute("data-type")).toBe("error");

    const liveWithError = page
      .locator("[aria-live]")
      .filter({ hasText: /could not copy link/i });
    await expect(liveWithError.first()).toBeVisible({ timeout: 3_000 });
    const liveValue = await liveWithError.first().getAttribute("aria-live");
    expect(["polite", "assertive"]).toContain(liveValue);

    // No success leakage anywhere.
    await expect(
      page.locator("[data-sonner-toast]", { hasText: /link copied to clipboard/i }),
    ).toHaveCount(0);
    await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

    // Cleanup: temp <textarea> removed despite execCommand throwing — the
    // `finally` block in copyShareLink must guarantee this.
    await expect.poll(() => page.locator("textarea").count()).toBe(baselineTextareas);

    // Selection restored to the original heading text despite the throw.
    const restoredSelection = await page.evaluate(
      () => window.getSelection()?.toString() ?? "",
    );
    expect(restoredSelection).toBe(originalSelection);

    // Focus restored to the Share button.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
      .toMatch(/copy shareable link/i);

    // The NotAllowedError must be caught — no uncaught page errors.
    expect(pageErrors, `page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });
});

test("Keyboard activation (Enter and Space) on the Share button fires the toast and live-region announcement", async ({
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

  const statusRegion = page.locator('[role="status"][aria-live="polite"]');
  const toastByText = page.locator("[data-sonner-toast]", {
    hasText: /link copied to clipboard/i,
  });
  const liveWithCopy = page
    .locator("[aria-live]")
    .filter({ hasText: /link copied to clipboard/i });

  // Tab forward from the document body until focus lands on the Share button.
  // Capping at 50 Tabs prevents an infinite loop if the layout changes; in
  // practice the Share button is reached well before that.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let i = 0; i < 50; i++) {
    const onShare = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && el.getAttribute("aria-label")?.toLowerCase().includes("copy shareable link");
    });
    if (onShare) break;
    await page.keyboard.press("Tab");
  }
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/copy shareable link/i);

  // --- Activate with Enter ---
  await page.keyboard.press("Enter");

  await expect(toastByText).toHaveCount(1, { timeout: 3_000 });
  await expect(liveWithCopy.first()).toBeVisible();
  await expect(statusRegion).toHaveText(/link copied to clipboard/i);
  await expect(
    page.getByRole("button", { name: /^link copied to clipboard$/i }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/link copied to clipboard/i);

  // Let the 2s auto-dismiss complete so the next activation starts clean.
  await expect(toastByText).toHaveCount(0, { timeout: 6_000 });
  await expect(statusRegion).toHaveText("");
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");

  // Focus should still be on the Share button (auto-restore after dismiss).
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? ""))
    .toMatch(/copy shareable link/i);

  // --- Activate with Space ---
  await page.keyboard.press("Space");

  await expect(toastByText).toHaveCount(1, { timeout: 3_000 });
  await expect(liveWithCopy.first()).toBeVisible();
  await expect(statusRegion).toHaveText(/link copied to clipboard/i);
  await expect(
    page.getByRole("button", { name: /^link copied to clipboard$/i }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-pressed") ?? ""))
    .toBe("true");

  // And again, everything clears after auto-dismiss.
  await expect(toastByText).toHaveCount(0, { timeout: 6_000 });
  await expect(statusRegion).toHaveText("");
  await expect(shareBtn).toHaveAttribute("aria-pressed", "false");
});

test("Repeated Enter presses while the toast is visible never stack toasts or live-region announcements", async ({
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

  await shareBtn.focus();

  // Hammer Enter while the toast is still visible.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Enter");
  }

  const toastByText = page.locator("[data-sonner-toast]", {
    hasText: /link copied to clipboard/i,
  });
  const liveWithCopy = page
    .locator("[aria-live]")
    .filter({ hasText: /link copied to clipboard/i });
  const statusRegion = page.locator('[role="status"][aria-live="polite"]');

  // Single toast, single live-region container, single sr-only status node.
  await expect(toastByText).toHaveCount(1, { timeout: 3_000 });
  await expect(liveWithCopy).toHaveCount(1);
  await expect(statusRegion).toHaveCount(1);
  await expect(statusRegion).toHaveText(/^link copied to clipboard$/i);

  // Even after waiting briefly (so any queued duplicate toasts would surface),
  // the counts must remain at one.
  await page.waitForTimeout(500);
  await expect(toastByText).toHaveCount(1);
  await expect(liveWithCopy).toHaveCount(1);

  // After the 2s auto-dismiss everything clears back to baseline.
  await expect(toastByText).toHaveCount(0, { timeout: 6_000 });
  await expect(liveWithCopy).toHaveCount(0);
  await expect(statusRegion).toHaveText("");
});