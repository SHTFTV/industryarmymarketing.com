// Post-deploy verifier: asserts the live site matches
// src/config/disambiguation.ts exactly. Two-phase:
//
//   1. Static fetch — GET /identity.txt and every configured route,
//      confirming the identity protocol lines are byte-exact and every
//      route serves the app bundle.
//   2. Playwright (headless Chromium) — drives the JS-rendered checks:
//      the DisambiguationNotice banner on each configured route and the
//      record page's canonical <link> + JSON-LD sameAs coverage.
//
// Usage:
//   BASE_URL=https://www.industryarmymarketing.com \
//     bunx tsx scripts/verify-live-deploy.ts
//
// Exits 0 when every check passes, non-zero on the first failing phase.

import { spawnSync } from "node:child_process";
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

const NOTICE_ROUTES = ["/", "/blog", "/legal", `/blog/${RECORD_SLUG}`];

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

async function checkRoutesReachable() {
  for (const path of NOTICE_ROUTES) {
    const url = `${BASE_URL}${path}`;
    console.log(`→ GET ${url}`);
    try {
      const html = await fetchText(url);
      // SPA: the bundle mounts <Layout> (which renders the banner) and
      // Helmet (which flushes the canonical). Verify the shell ships.
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

function runLivePlaywright(): number {
  console.log(
    `\n→ npx playwright test tests/live-verify.spec.ts (PLAYWRIGHT_BASE_URL=${BASE_URL})`,
  );
  const proc = spawnSync(
    "npx",
    ["playwright", "test", "tests/live-verify.spec.ts", "--reporter=list"],
    {
      stdio: "inherit",
      env: { ...process.env, PLAYWRIGHT_BASE_URL: BASE_URL },
    },
  );
  return proc.status ?? 1;
}

async function main() {
  console.log(`Verifying live deploy at ${BASE_URL}\n`);
  await checkIdentityTxt();
  await checkRoutesReachable();

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} static-fetch check(s) failed:`);
    for (const f of failures) {
      console.error(`  • ${f.check}`);
      console.error(`      expected: ${f.expected}`);
      console.error(`      actual:   ${f.actual}`);
    }
    process.exit(1);
  }
  console.log("\n✅ Static-fetch checks (identity.txt + reachability) passed.");

  const status = runLivePlaywright();
  if (status !== 0) {
    console.error("\n❌ Playwright live-verify spec failed.");
    process.exit(status);
  }
  console.log("\n✅ All post-deploy checks passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("verify-live-deploy crashed:", err);
  process.exit(1);
});