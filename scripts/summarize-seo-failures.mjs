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
  lines.push("");
  lines.push("| Slug | Check | Expected | Actual | File |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const f of failures.slice(0, 40)) {
    const esc = (s) => (s ? String(s).replace(/\|/g, "\\|").replace(/\n/g, " ") : "");
    lines.push(
      `| ${esc(f.slug ?? "—")} | ${esc(f.name)} | ${esc(f.expected ?? "—")} | ${esc(f.actual ?? f.message)} | \`${esc(f.file)}\` |`,
    );
  }
  if (failures.length > 40) {
    lines.push("");
    lines.push(`_…and ${failures.length - 40} more. See workflow logs for the full list._`);
  }
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