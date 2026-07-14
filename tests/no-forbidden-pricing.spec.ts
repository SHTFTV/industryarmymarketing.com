import { existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import {
  FORBIDDEN_ON_TERRITORY_SURFACES,
  FORBIDDEN_PATTERNS,
  PUBLIC_ROUTES_TO_SCAN,
  RULE_LABEL,
  isSeoPackagesRoute,
} from "../src/config/pricing";

// Whole-site sweep. Fails the build if any public route (other than
// the allowlisted SEO Packages routes in src/config/pricing.ts) leaks
// the removed Bullets/Boom/Bombs block or the $85/$285/$585 one-time
// prices. On failure, writes a diagnostic artifact under
// `pricing-guard-report/` with each URL, the exact matched text, and
// element + full-page screenshots of the offending region.
//
// The forbidden strings, regex patterns, allowed routes, and route
// list are ALL defined in src/config/pricing.ts — this spec has no
// pricing knowledge of its own.

const REPORT_DIR = join(process.cwd(), "pricing-guard-report");
const REPORT_JSON = join(REPORT_DIR, "report.json");
const REPORT_MD = join(REPORT_DIR, "report.md");

type Match = {
  kind: "substring" | "regex";
  name: string;
  matchedText: string;
  contextBefore: string;
  contextAfter: string;
  fullPageScreenshot: string;
  snippetScreenshot: string | null;
};

type RouteReport = {
  route: string;
  url: string;
  status: number | null;
  scanned: boolean;
  skippedReason?: string;
  matches: Match[];
};

function ensureReportDir() {
  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
}

function context(text: string, index: number, len: number) {
  const before = text.slice(Math.max(0, index - 60), index);
  const after = text.slice(index + len, index + len + 60);
  return { contextBefore: before, contextAfter: after };
}

// Accumulate one report per test run.
const runReport: RouteReport[] = [];

test.beforeAll(() => {
  ensureReportDir();
  // Reset report on first run.
  writeFileSync(REPORT_JSON, JSON.stringify({ generatedAt: null, routes: [] }, null, 2));
});

test.afterAll(() => {
  const anyFailed = runReport.some((r) => r.matches.length > 0);
  writeFileSync(
    REPORT_JSON,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), ok: !anyFailed, routes: runReport },
      null,
      2,
    ),
  );
  const md: string[] = [];
  md.push(`# Pricing guard report`);
  md.push(``);
  md.push(`- Overall: ${anyFailed ? "❌ FAIL" : "✅ PASS"}`);
  md.push(`- Routes scanned: ${runReport.filter((r) => r.scanned).length}`);
  md.push(`- Routes skipped (SEO Packages allowlist): ${runReport.filter((r) => !r.scanned).length}`);
  md.push(``);
  for (const r of runReport) {
    if (r.matches.length === 0) continue;
    md.push(`## ❌ ${r.route}`);
    md.push(``);
    md.push(`URL: \`${r.url}\``);
    md.push(``);
    for (const m of r.matches) {
      md.push(`- **[${m.kind}] ${m.name}** matched \`${m.matchedText}\``);
      md.push(`  - context: …${m.contextBefore}**${m.matchedText}**${m.contextAfter}…`);
      md.push(`  - full-page screenshot: \`${m.fullPageScreenshot}\``);
      if (m.snippetScreenshot) md.push(`  - snippet screenshot: \`${m.snippetScreenshot}\``);
    }
    md.push(``);
  }
  writeFileSync(REPORT_MD, md.join("\n"));
});

for (const route of PUBLIC_ROUTES_TO_SCAN) {
  test(`no forbidden pricing on ${route}`, async ({ page }, testInfo) => {
    // Route allowlist: SEO Packages routes are permitted to render the
    // Bullets/Boom/Bombs product block. Record & skip.
    if (isSeoPackagesRoute(route)) {
      runReport.push({
        route,
        url: route,
        status: null,
        scanned: false,
        skippedReason: "SEO Packages allowlist",
        matches: [],
      });
      test.skip(true, `${route} is in SEO_PACKAGES_ALLOWED_ROUTES`);
      return;
    }

    const response = await page.goto(route, { waitUntil: "networkidle" });
    const status = response?.status() ?? null;
    const bodyText = await page.locator("body").innerText();

    const record: RouteReport = {
      route,
      url: page.url(),
      status,
      scanned: true,
      matches: [],
    };

    const routeSlug = route.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "root";

    async function captureMatch(
      kind: "substring" | "regex",
      name: string,
      matchedText: string,
      index: number,
    ) {
      const { contextBefore, contextAfter } = context(bodyText, index, matchedText.length);
      const fullPath = join(REPORT_DIR, `${routeSlug}_${record.matches.length}_full.png`);
      const snippetPath = join(
        REPORT_DIR,
        `${routeSlug}_${record.matches.length}_snippet.png`,
      );
      await page.screenshot({ path: fullPath, fullPage: true }).catch(() => undefined);
      let snippetWritten: string | null = null;
      // Best-effort element screenshot of the offending text.
      try {
        const loc = page.getByText(matchedText, { exact: false }).first();
        if ((await loc.count()) > 0) {
          await loc.scrollIntoViewIfNeeded();
          await loc.screenshot({ path: snippetPath });
          snippetWritten = snippetPath;
        }
      } catch {
        snippetWritten = null;
      }
      record.matches.push({
        kind,
        name,
        matchedText,
        contextBefore,
        contextAfter,
        fullPageScreenshot: fullPath,
        snippetScreenshot: snippetWritten,
      });
    }

    // 1) Exact substring bans.
    for (const forbidden of FORBIDDEN_ON_TERRITORY_SURFACES) {
      const idx = bodyText.indexOf(forbidden);
      if (idx !== -1) {
        await captureMatch("substring", forbidden, forbidden, idx);
      }
    }

    // 2) Regex bans.
    for (const p of FORBIDDEN_PATTERNS) {
      const re = new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(bodyText)) !== null) {
        await captureMatch("regex", p.name, m[0], m.index);
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }

    // Positive smoke assertion on `/` so a redirect or blank page can't
    // fake a pass.
    if (route === "/") {
      expect(bodyText, `Expected "${RULE_LABEL}" on ${route}`).toContain(RULE_LABEL);
    }

    runReport.push(record);

    if (record.matches.length > 0) {
      // Attach artifacts to the Playwright HTML report too.
      for (const m of record.matches) {
        await testInfo.attach(`match:${m.name}`, {
          body: `${m.kind} "${m.matchedText}" at …${m.contextBefore}[${m.matchedText}]${m.contextAfter}…`,
          contentType: "text/plain",
        });
      }
      const summary = record.matches
        .map((m) => `[${m.kind}] ${m.name} → "${m.matchedText}"`)
        .join("; ");
      throw new Error(`Forbidden pricing on ${route}: ${summary}`);
    }
  });
}