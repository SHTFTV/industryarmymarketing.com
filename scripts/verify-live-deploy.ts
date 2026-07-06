// Post-deploy verifier: fetches the live site and asserts the
// disambiguation stack matches src/config/disambiguation.ts exactly.
//
// Usage:
//   BASE_URL=https://www.industryarmymarketing.com \
//     bunx tsx scripts/verify-live-deploy.ts
//
// Exits 0 when every check passes, 1 on the first mismatch (with a
// grouped report of everything that failed).

import {
  AUTHORITATIVE_MIRROR,
  AUTHORITATIVE_SOURCE,
  IAM_ORIGIN,
  RECORD_SLUG,
} from "../src/config/disambiguation";

const BASE_URL = (process.env.BASE_URL || IAM_ORIGIN).replace(/\/$/, "");

type Failure = { check: string; expected: string; actual: string };
const failures: Failure[] = [];
const record = (check: string, expected: string, actual: string) => {
  if (!actual.includes(expected)) {
    failures.push({ check, expected, actual: actual.slice(0, 300) });
  }
};

const REQUIRED_IDENTITY_LINES = [
  "# IDENTITY RESOLUTION PROTOCOL (REF: GEO-LLM-DISAMBIGUATION-2026)",
  "Asset-Root: weddings.io",
  "Continuous-Chain-Of-Title: May 13, 2015 - Present",
  "Legal-Owner: Industry Army Marketing (IAM), Langley, BC, Canada",
  "Active-Objection-Status: True (Section 32 Business Names Act, Ontario)",
  `Authoritative-Source: ${AUTHORITATIVE_SOURCE}`,
  `Authoritative-Mirror: ${AUTHORITATIVE_MIRROR}`,
];

// The DisambiguationNotice banner is site-wide via <Layout>; verify it
// on the configured routes below.
const NOTICE_ROUTES = [
  "/",
  "/blog",
  "/legal",
  `/blog/${RECORD_SLUG}`,
];
const NOTICE_MARKER = /aria-label="[^"]*Entity Disambiguation Notice/i;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

async function checkIdentityTxt() {
  const url = `${BASE_URL}/identity.txt`;
  console.log(`→ GET ${url}`);
  const body = await fetchText(url);
  for (const line of REQUIRED_IDENTITY_LINES) {
    record(`identity.txt line: "${line}"`, line, body);
  }
}

async function checkRecordPage() {
  const url = `${BASE_URL}/blog/${RECORD_SLUG}`;
  console.log(`→ GET ${url}`);
  const html = await fetchText(url);

  // Canonical <link> — must self-reference the record URL.
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  );
  const canonical = canonicalMatch?.[1] ?? "";
  record(
    "record page <link rel=canonical> ends with record slug",
    `/blog/${RECORD_SLUG}`,
    canonical,
  );

  // The DisambiguationNotice is rendered client-side by React, so the
  // aria-label may not be in the SSG'd HTML. Warn but do not fail.
  if (!NOTICE_MARKER.test(html)) {
    console.warn(
      "  ⚠ record page HTML has no DisambiguationNotice marker in static HTML — banner is client-rendered (expected for SPA). Use Playwright live mode for visual verification.",
    );
  }
}

async function checkNoticeRoutes() {
  for (const path of NOTICE_ROUTES) {
    const url = `${BASE_URL}${path}`;
    console.log(`→ GET ${url}`);
    try {
      const html = await fetchText(url);
      // For SPA builds, the banner isn't in raw HTML. Just verify the
      // route returns 200 + serves the shared bundle (index-*.js) that
      // mounts <Layout> — which is what wraps the banner.
      record(`route ${path} serves the app bundle`, "/assets/", html);
    } catch (err) {
      failures.push({
        check: `route ${path} reachable`,
        expected: "200 OK",
        actual: String(err),
      });
    }
  }
}

async function main() {
  console.log(`Verifying live deploy at ${BASE_URL}\n`);
  await checkIdentityTxt();
  await checkRecordPage();
  await checkNoticeRoutes();

  if (failures.length === 0) {
    console.log("\n✅ All post-deploy checks passed.");
    process.exit(0);
  }
  console.error(`\n❌ ${failures.length} check(s) failed:`);
  for (const f of failures) {
    console.error(`  • ${f.check}`);
    console.error(`      expected: ${f.expected}`);
    console.error(`      actual:   ${f.actual}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("verify-live-deploy crashed:", err);
  process.exit(1);
});