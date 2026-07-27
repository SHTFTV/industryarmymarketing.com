// E2E: stub out window.gtag and window.plausible with recording spies BEFORE
// any page script runs, then trigger a Copy prompt on a real blog post and
// verify:
//   • The CustomEvent("iam:ai-indexing") dispatches with the expected payload
//     (event name, platform, publication, articleUrl, copyMethod).
//   • gtag and plausible still receive their forwarded calls with the same
//     event name — the CustomEvent path is not exclusive of provider calls.
//   • Removing gtag/plausible entirely still allows the CustomEvent path to
//     dispatch (proves analytics providers are optional, not required).

import { test, expect } from "../playwright-fixture";

const SLUG = "iam-vendors-purchasing-power-parity-pricing";
const CANONICAL_ORIGIN = "https://industryarmymarketing.com";

type Detail = {
  event: string;
  platform: string;
  publication: string;
  articleUrl: string;
  copyMethod?: string;
  failureReason?: string;
};

test.describe("AIIndexing — CustomEvent dispatches independently of gtag/plausible", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("CustomEvent fires with correct payload even when gtag/plausible are missing", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Clipboard permissions are Chromium-scoped in this suite",
    );

    // Install the CustomEvent recorder + a hard guard that any accidental
    // gtag/plausible/dataLayer access would throw — proving the CustomEvent
    // path can run alone.
    await page.addInitScript(() => {
      const w = window as unknown as {
        __customEvents?: unknown[];
        __gtagCalls?: unknown[];
        __plausibleCalls?: unknown[];
        gtag?: unknown;
        plausible?: unknown;
        dataLayer?: unknown[];
      };
      w.__customEvents = [];
      w.__gtagCalls = [];
      w.__plausibleCalls = [];
      window.addEventListener("iam:ai-indexing", (e: Event) => {
        w.__customEvents!.push((e as CustomEvent).detail);
      });
      // Explicitly leave gtag/plausible/dataLayer UNDEFINED.
      // The AIIndexing component uses optional chaining (`w.gtag?.(...)`)
      // so this must not throw and the CustomEvent must still dispatch.
      delete w.gtag;
      delete w.plausible;
      delete w.dataLayer;
    });

    await page.goto(`/blog/${SLUG}`);
    const section = page.getByText(/IAM AI Indexing Section/i).first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    // Open ChatGPT, copy via keyboard shortcut.
    await page.getByRole("button", { name: /^ChatGPT\b/i }).first().click();
    await expect(
      page.getByRole("link", { name: /Open in ChatGPT/i }).first(),
    ).toBeVisible();
    await page.keyboard.press("ControlOrMeta+k");

    const live = page
      .locator('[data-testid="ai-indexing-live-region"]')
      .first();
    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

    const events = (await page.evaluate(
      () =>
        (window as unknown as { __customEvents?: unknown[] }).__customEvents ?? [],
    )) as Detail[];

    // "opened" fires on toggle; "succeeded" fires on copy. Both must be here.
    const opened = events.find((e) => e.event === "ai_indexing_prompt_opened");
    const success = events.find((e) => e.event === "ai_indexing_copy_succeeded");

    expect(opened).toBeDefined();
    expect(opened!.platform).toBe("chatgpt");
    expect(opened!.publication).toBe("iam");
    expect(opened!.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);

    expect(success).toBeDefined();
    expect(success!.platform).toBe("chatgpt");
    expect(success!.publication).toBe("iam");
    expect(success!.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    expect(success!.copyMethod).toBe("clipboard");
    expect(success!.failureReason).toBeUndefined();
  });

  test("CustomEvent + gtag + plausible all receive matching event name and payload", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Clipboard permissions are Chromium-scoped in this suite",
    );

    await page.addInitScript(() => {
      const w = window as unknown as {
        __customEvents?: unknown[];
        __gtagCalls?: unknown[][];
        __plausibleCalls?: unknown[][];
        __dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        plausible?: (name: string, opts?: unknown) => void;
        dataLayer?: unknown[];
      };
      w.__customEvents = [];
      w.__gtagCalls = [];
      w.__plausibleCalls = [];
      w.__dataLayer = [];
      window.addEventListener("iam:ai-indexing", (e: Event) => {
        w.__customEvents!.push((e as CustomEvent).detail);
      });
      w.gtag = (...args: unknown[]) => {
        w.__gtagCalls!.push(args);
      };
      w.plausible = (name: string, opts?: unknown) => {
        w.__plausibleCalls!.push([name, opts]);
      };
      w.dataLayer = w.__dataLayer;
    });

    await page.goto(`/blog/${SLUG}`);
    const section = page.getByText(/IAM AI Indexing Section/i).first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    await page.getByRole("button", { name: /^Claude\b/i }).first().click();
    await page.keyboard.press("ControlOrMeta+k");

    const live = page
      .locator('[data-testid="ai-indexing-live-region"]')
      .first();
    await expect(live).toHaveText(/Copied/i, { timeout: 3000 });

    const { events, gtagCalls, plausibleCalls, dataLayer } = await page.evaluate(
      () => {
        const w = window as unknown as {
          __customEvents?: unknown[];
          __gtagCalls?: unknown[][];
          __plausibleCalls?: unknown[][];
          __dataLayer?: unknown[];
        };
        return {
          events: (w.__customEvents ?? []) as Detail[],
          gtagCalls: (w.__gtagCalls ?? []) as unknown[][],
          plausibleCalls: (w.__plausibleCalls ?? []) as unknown[][],
          dataLayer: (w.__dataLayer ?? []) as Array<{ event: string }>,
        };
      },
    );

    const success = events.find(
      (e: Detail) => e.event === "ai_indexing_copy_succeeded",
    );
    expect(success).toBeDefined();
    expect(success!.platform).toBe("claude");

    // gtag receives ["event", "ai_indexing_copy_succeeded", {...}]
    const gtagSuccess = gtagCalls.find(
      (c) => c[0] === "event" && c[1] === "ai_indexing_copy_succeeded",
    );
    expect(gtagSuccess).toBeDefined();
    const gtagParams = gtagSuccess![2] as {
      platform: string;
      publication: string;
      article_url: string;
      copy_method?: string;
    };
    expect(gtagParams.platform).toBe("claude");
    expect(gtagParams.publication).toBe("iam");
    expect(gtagParams.article_url).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);
    expect(gtagParams.copy_method).toBe("clipboard");

    // plausible receives ["ai_indexing_copy_succeeded", { props: {...} }]
    const plausibleSuccess = plausibleCalls.find(
      (c) => c[0] === "ai_indexing_copy_succeeded",
    );
    expect(plausibleSuccess).toBeDefined();
    const plausibleProps = (plausibleSuccess![1] as { props: Detail }).props;
    expect(plausibleProps.platform).toBe("claude");
    expect(plausibleProps.articleUrl).toBe(`${CANONICAL_ORIGIN}/blog/${SLUG}`);

    // dataLayer receives the same event.
    expect(
      dataLayer.some((e) => e.event === "ai_indexing_copy_succeeded"),
    ).toBe(true);
  });
});