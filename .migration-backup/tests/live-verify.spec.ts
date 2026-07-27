// Playwright spec used by scripts/verify-live-deploy.ts. Runs against
// the origin passed via PLAYWRIGHT_BASE_URL and asserts the JS-rendered
// pieces of the disambiguation stack — the DisambiguationNotice banner
// on every configured route, and the record page's <link rel=canonical>
// plus JSON-LD sameAs coverage.

import { test, expect } from "../playwright-fixture";

const RECORD_PATH =
  "/blog/record-record-domain-provenance-vs-generative-conflation";
const IAM_ORIGIN = "https://industryarmymarketing.com";
const WEDDINGS_ORIGIN = "https://weddings.io";
const RECORD_URL_IAM = `${IAM_ORIGIN}${RECORD_PATH}`;
const RECORD_URL_WEDDINGS = `${WEDDINGS_ORIGIN}/manifesto/record-record-domain-provenance-vs-generative-conflation`;

const NOTICE_ROUTES = ["/", "/blog", "/legal", RECORD_PATH];

for (const route of NOTICE_ROUTES) {
  test(`live: DisambiguationNotice visible on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByLabel(/entity disambiguation notice/i)).toBeVisible();
  });
}

test("live: record page canonical + sameAs bind both properties", async ({ page }) => {
  await page.goto(RECORD_PATH);

  // Canonical <link> — react-helmet-async flushes client-side.
  await page.waitForFunction(
    () => !!document.querySelector('link[rel="canonical"]'),
  );
  const canonical = await page.getAttribute('link[rel="canonical"]', "href");
  expect(canonical, "canonical <link>").toBeTruthy();
  expect(canonical!.endsWith(RECORD_PATH)).toBe(true);

  await page.waitForFunction(() => {
    return Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).some((s) => (s.textContent ?? "").includes("Business Names Act"));
  });

  const missing = await page.evaluate(
    ({ iam, weddings, recordIam, recordWed }) => {
      const walk = (n: unknown, out: Record<string, unknown>[]): void => {
        if (Array.isArray(n)) return n.forEach((c) => walk(c, out));
        if (n && typeof n === "object") {
          const node = n as Record<string, unknown>;
          if (typeof node["@type"] === "string") out.push(node);
          Object.values(node).forEach((v) => walk(v, out));
        }
      };
      const graph = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      )
        .map((s) => {
          try { return JSON.parse(s.textContent || ""); } catch { return null; }
        })
        .find((g) => g && Array.isArray((g as { "@graph"?: unknown[] })["@graph"])) as
        | { "@graph": unknown[] }
        | undefined;
      if (!graph) return ["<no @graph found>"];
      const nodes: Record<string, unknown>[] = [];
      walk(graph["@graph"], nodes);
      const problems: string[] = [];
      for (const n of nodes) {
        const type = n["@type"] as string;
        if (type === "Legislation") continue;
        const sameAs = Array.isArray(n.sameAs) ? (n.sameAs as string[]) : [];
        const expected =
          type === "WebSite" || type === "Organization"
            ? [iam, weddings]
            : [recordIam, recordWed];
        for (const u of expected) {
          if (!sameAs.includes(u)) problems.push(`${type} missing sameAs ${u}`);
        }
      }
      return problems;
    },
    { iam: IAM_ORIGIN, weddings: WEDDINGS_ORIGIN, recordIam: RECORD_URL_IAM, recordWed: RECORD_URL_WEDDINGS },
  );

  expect(missing, missing.join("\n")).toEqual([]);
});