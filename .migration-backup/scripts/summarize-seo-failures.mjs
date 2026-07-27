#!/usr/bin/env node
/**
 * Parse Vitest JSON report(s) and emit a compact Markdown summary of failing
 * SEO checks: post slug (when present in the describe hierarchy), the failing
 * assertion, and expected vs actual. Written for CI PR comments — output is
 * both printed to stdout and appended to $GITHUB_STEP_SUMMARY when set.
 *
 * Usage: node scripts/summarize-seo-failures.mjs <report.json> [more.json ...]
 */
import { readFileSync, appendFileSync, existsSync } from "node:fs";

const MARKER = "<!-- seo-failures-comment -->";
const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("usage: summarize-seo-failures.mjs <vitest-report.json> [...]");
  process.exit(2);
}

/**
 * @typedef {{ file: string; suite: string; name: string; slug?: string; message: string; expected?: string; actual?: string }} Failure
 */

/** @param {string} text */
const extractSlug = (text) => {
  const m = text.match(/post:\s*([a-z0-9][a-z0-9-]*)/i);
  return m ? m[1] : undefined;
};

/** @param {string} msg */
const extractExpectedActual = (msg) => {
  const exp = msg.match(/Expected:?\s*(.+?)(?:\n|$)/i);
  const act = msg.match(/Received:?\s*(.+?)(?:\n|$)/i);
  return { expected: exp?.[1]?.trim(), actual: act?.[1]?.trim() };
};

/** @type {Failure[]} */
const failures = [];

for (const path of inputs) {
  if (!existsSync(path)) {
    console.error(`skipping missing report: ${path}`);
    continue;
  }
  let report;
  try {
    report = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`could not parse ${path}: ${(e && e.message) || e}`);
    continue;
  }
  const testResults = report.testResults ?? report.results ?? [];
  for (const file of testResults) {
    const filePath = file.name ?? file.testFilePath ?? file.filepath ?? "(unknown)";
    const assertions = file.assertionResults ?? file.tests ?? [];
    for (const a of assertions) {
      if (a.status !== "failed") continue;
      const suite = Array.isArray(a.ancestorTitles) ? a.ancestorTitles.join(" › ") : (a.suiteName ?? "");
      const name = a.title ?? a.fullName ?? a.name ?? "(unnamed)";
      const rawMsg = (a.failureMessages ?? [a.error?.message ?? ""]).filter(Boolean).join("\n");
      const { expected, actual } = extractExpectedActual(rawMsg);
      const slug = extractSlug(`${suite} ${name}`);
      const firstLine = rawMsg.split("\n").find((l) => l.trim().length > 0) ?? "";
      failures.push({
        file: filePath.replace(process.cwd() + "/", ""),
        suite,
        name,
        slug,
        message: firstLine.slice(0, 240),
        expected,
        actual,
      });
    }
  }
}

const lines = [];
lines.push(MARKER);
lines.push("### SEO checks");
if (failures.length === 0) {
  lines.push("");
  lines.push("✅ All SEO checks passed.");
} else {
  lines.push("");
  lines.push(`❌ **${failures.length} failing SEO check(s).**`);

  // Group by slug so reviewers see every failing assertion for each post
  // in one row without scrolling through repeats.
  const bySlug = new Map();
  for (const f of failures) {
    const key = f.slug ?? "(no slug)";
    if (!bySlug.has(key)) bySlug.set(key, []);
    bySlug.get(key).push(f);
  }

  lines.push("");
  lines.push("| Slug | Failing assertion | Expected | Actual | File |");
  lines.push("| --- | --- | --- | --- | --- |");
  const esc = (s) => (s ? String(s).replace(/\|/g, "\\|").replace(/\n/g, " ") : "");
  let printed = 0;
  outer: for (const [slug, items] of bySlug) {
    for (const f of items) {
      if (printed >= 60) break outer;
      lines.push(
        `| \`${esc(slug)}\` | ${esc(f.name)} | ${esc(f.expected ?? "—")} | ${esc(f.actual ?? f.message)} | \`${esc(f.file)}\` |`,
      );
      printed++;
    }
  }
  if (failures.length > printed) {
    lines.push("");
    lines.push(`_…and ${failures.length - printed} more. See workflow logs for the full list._`);
  }
}

// Direct artifact links — populated by the workflow so reviewers can jump
// straight from the PR comment to the uploaded logs and reports.
const runUrl = process.env.RUN_URL;
const artifactLinks = [];
if (process.env.VITEST_REPORT_URL) artifactLinks.push(`[vitest report](${process.env.VITEST_REPORT_URL})`);
if (process.env.PLAYWRIGHT_LOG_URL) artifactLinks.push(`[Playwright E2E log](${process.env.PLAYWRIGHT_LOG_URL})`);
if (process.env.OG_IMAGE_LOG_URL) artifactLinks.push(`[OG image check log](${process.env.OG_IMAGE_LOG_URL})`);
if (artifactLinks.length > 0 || runUrl) {
  lines.push("");
  lines.push("**Artifacts**");
  if (artifactLinks.length > 0) lines.push(artifactLinks.map((l) => `- ${l}`).join("\n"));
  if (runUrl) lines.push(`- [Workflow run](${runUrl})`);
}

const body = lines.join("\n");
console.log(body);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, body + "\n");
}

// Write the comment body to a file so the workflow can pass it to
// actions/github-script without shell-escaping trouble.
if (process.env.SEO_COMMENT_OUT) {
  appendFileSync(process.env.SEO_COMMENT_OUT, body);
}

process.exit(failures.length > 0 ? 1 : 0);