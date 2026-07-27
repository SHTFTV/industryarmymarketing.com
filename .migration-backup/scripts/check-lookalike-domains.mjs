#!/usr/bin/env node
/**
 * Pre-publish guard: scans src/ and public/ for outgoing URLs and fails if
 * any resolve to a host that is not on the canonical allowlist or that
 * matches a forbidden lookalike host.
 *
 * Run: node scripts/check-lookalike-domains.mjs
 *
 * The allowlist / lookalike list live in src/config/canonicalDomains.ts and
 * are re-parsed here (not imported) so this script has zero TS/runtime deps.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { scan } from "./lib/lookalike-scan.mjs";

const strict = process.argv.includes("--strict"); // fail on unknown hosts too
const artifactPath = process.env.LOOKALIKE_ARTIFACT ?? "public/audit/lookalike-guard.json";

const report = scan();

// Always write a machine-readable artifact so CI can upload it and the
// audit UI (public/audit/unknown-hosts.json is written below) can consume it.
mkdirSync(dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, JSON.stringify(report, null, 2));

// Write a compact list of unknown hosts for the AI-indexing audit page.
mkdirSync("public/audit", { recursive: true });
writeFileSync(
  "public/audit/unknown-hosts.json",
  JSON.stringify(
    {
      generatedAt: report.generatedAt,
      hosts: report.unknownCounts,
    },
    null,
    2,
  ),
);

let failed = false;
if (report.violations.length) {
  console.error(
    `\n❌ Lookalike-domain guard failed — ${report.violations.length} link target(s) point at disavowed hosts:\n`,
  );
  for (const v of report.violations) {
    console.error(`  ${v.file}:${v.line}  [${v.host}]\n    > ${v.snippet}`);
  }
  failed = true;
}

if (report.unknownCounts.length) {
  console.warn(
    `\n⚠️  Unknown outbound hosts (not on ALLOWED_HOSTS). Approve via /ai-indexing-audit or edit src/config/canonicalDomains.ts:`,
  );
  for (const { host, count } of report.unknownCounts) {
    console.warn(`  ${host}  (${count} link${count > 1 ? "s" : ""})`);
  }
  console.warn("");
  if (strict) failed = true;
}

console.log(`\nReport artifact: ${artifactPath}`);
if (failed) process.exit(1);
console.log(
  `✅ Lookalike-domain guard passed. Allowed: ${report.allowed.length}. Forbidden: ${report.lookalike.length}. Scanned files: ${report.scannedFiles}.`,
);