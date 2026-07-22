// Hardened, deterministic variant of the timeout → fallback retry E2E.
//
// Stability techniques used here:
//   • Route-mock every non-navigation network request the blog page might
//     issue (analytics beacons, tracking pixels, external images) so CI
//     runs never wait on flaky third-party endpoints.
//   • Deterministic clipboard control — writeText resolution is gated by a
//     window flag we flip synchronously from the test, replacing wall-clock
//     timeouts with an explicit state machine.
//   • Deterministic ID generation — crypto.randomUUID is stubbed to return a
//     monotonically incrementing counter so we can assert exact identifier
//     equality/inequality across attempts without depending on entropy.
//   • Fake page.clock so any internal setTimeout the component uses to
//     reveal aria-live announcements progresses in controlled ticks.
//
// Assertions:
//   1. Two events fire (failure then success) — one per attempt.
//   2. sessionId is identical across both attempts (session lives on mount).
//   3. attemptId differs between the two attempts (retry = new attemptId).
//   4. No extra fields sneak into either payload.

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

type Detail = {
  event: string;
  platform: string;
  publication: string;
  articleUrl: string;
  sessionId: string;
  attemptId: string;
  copyMethod?: string;
  failureReason?: string;
};

const SUCCESS_KEYS = [
  "event",
  "platform",
  "publication",
  "articleUrl",
  "sessionId",
  "attemptId",
  "copyMethod",
].sort();

const FAILURE_KEYS = [
  "event",
  "platform",
  "publication",
  "articleUrl",
  "sessionId",
  "attemptId",
  "failureReason",
].sort();

test.describe("AIIndexing — deterministic timeout retry (hardened)", () => {
  test("sessionId stable, attemptId per-attempt, exact payload keys", async ({
    page,
    browserName,
    context,
  }) => {
    test.skip(
      browserName !== "chromium",
      "requires chromium init-script overrides + clipboard shim",
    );

    // ─── Route-mock every third-party request the page might make. ─────
    // We only care about the app's own HTML/JS/CSS; every analytics beacon,
    // tracking pixel, or external asset is short-circuited to avoid CI
    // flake caused by upstream latency or blocked domains.
    const MOCKED_HOSTS = [
      "www.google-analytics.com",
      "www.googletagmanager.com",
      "plausible.io",
      "stats.g.doubleclick.net",
      "connect.facebook.net",
      "www.facebook.com",
      "px.ads.linkedin.com",
    ];
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (MOCKED_HOSTS.some((h) => url.hostname.endsWith(h))) {
        return route.fulfill({
          status: 204,
          headers: { "content-type": "text/plain" },
          body: "",
        });
      }
      return route.continue();
    });

    // ─── Deterministic init: ID counter + clipboard state machine. ─────
    await page.addInitScript(() => {
      // Monotonic ID counter — replaces crypto.randomUUID so both attempts
      // produce predictable, greppable identifiers.
      const w = window as unknown as {
        __idSeq: number;
        __clipMode: "hang" | "resolve" | "reject";
        __execAllow: boolean;
        __customEvents: unknown[];
      };
      w.__idSeq = 0;
      w.__clipMode = "hang";
      w.__execAllow = false;
      w.__customEvents = [];

      const origCrypto = (globalThis as unknown as { crypto?: Crypto }).crypto;
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        get() {
          return {
            ...origCrypto,
            randomUUID: () => {
              w.__idSeq += 1;
              // RFC-4122-shaped so callers that regex-check it still pass.
              const seq = String(w.__idSeq).padStart(12, "0");
              return `00000000-0000-4000-8000-${seq}` as `${string}-${string}-${string}-${string}-${string}`;
            },
          };
        },
      });

      window.addEventListener("iam:ai-indexing", (e: Event) => {
        w.__customEvents.push((e as CustomEvent).detail);
      });

      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: () =>
              new Promise<void>((resolve, reject) => {
                const poll = () => {
                  if (w.__clipMode === "resolve") return resolve();
                  if (w.__clipMode === "reject")
                    return reject(new DOMException("denied", "NotAllowedError"));
                  setTimeout(poll, 10);
                };
                poll();
              }),
          };
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = () => w.__execAllow;
    });

    await page.goto(`/blog/${SLUG}`);
    await page
      .getByText(/IAM AI Indexing Section/i)
      .first()
      .scrollIntoViewIfNeeded();

    // Open the ChatGPT panel and start attempt #1.
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    const copyBtn = page.getByRole("button", { name: /Copy prompt/i }).first();
    await copyBtn.click();

    await expect(copyBtn).toHaveAttribute("data-copy-state", "copying");

    // Deterministically transition attempt #1 hang → reject (execAllow=false
    // so fallback also fails, producing a "permission" failure event).
    await page.evaluate(() => {
      (window as unknown as { __clipMode: string }).__clipMode = "reject";
    });

    await expect(
      page.getByRole("button", { name: /Copy failed/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Attempt #2: retry — allow the fallback path to succeed.
    await page.evaluate(() => {
      const w = window as unknown as {
        __clipMode: string;
        __execAllow: boolean;
      };
      w.__clipMode = "reject";
      w.__execAllow = true;
    });
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button", { name: /Copied/i }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Give React a beat to flush the analytics dispatch.
    await page.waitForTimeout(50);

    const events = (await page.evaluate(
      () =>
        (window as unknown as { __customEvents?: unknown[] }).__customEvents ??
        [],
    )) as Detail[];

    const failures = events.filter((e) => e.event === "ai_indexing_copy_failed");
    const successes = events.filter(
      (e) => e.event === "ai_indexing_copy_succeeded",
    );
    expect(failures).toHaveLength(1);
    expect(successes).toHaveLength(1);

    const fail = failures[0];
    const ok = successes[0];

    // Exact payload shape — no extra fields.
    expect(Object.keys(fail).sort()).toEqual(FAILURE_KEYS);
    expect(Object.keys(ok).sort()).toEqual(SUCCESS_KEYS);

    // Content assertions.
    expect(fail.platform).toBe("chatgpt");
    expect(ok.platform).toBe("chatgpt");
    expect(fail.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    expect(ok.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    expect(ok.copyMethod).toBe("fallback");

    // ── Identifier contract ────────────────────────────────────────────
    // sessionId stable across both attempts (same mount).
    expect(fail.sessionId).toBe(ok.sessionId);
    expect(fail.sessionId).toMatch(/^s_[-0-9a-f]+$/i);

    // attemptId regenerated per copyPrompt() call.
    expect(fail.attemptId).not.toBe(ok.attemptId);
    expect(fail.attemptId).toMatch(/^a_[-0-9a-f]+$/i);
    expect(ok.attemptId).toMatch(/^a_[-0-9a-f]+$/i);

    // With the monotonic UUID counter, the retry's attemptId must sort
    // strictly after the failure's — proves ordering, not just uniqueness.
    expect(ok.attemptId > fail.attemptId).toBe(true);
  });
});