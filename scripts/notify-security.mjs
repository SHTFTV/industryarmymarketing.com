#!/usr/bin/env node
/**
 * Notify Slack (and/or GitHub) when the security scanner reports NEW findings
 * vs. the previous baseline (public/security/findings-history.json).
 *
 * Env:
 *   SLACK_WEBHOOK_URL     — optional Incoming Webhook
 *   GITHUB_TOKEN          — optional token with issues:write
 *   GITHUB_REPOSITORY     — owner/repo (Actions-provided)
 *   GITHUB_RUN_ID         — Actions run id
 *   GITHUB_SERVER_URL     — https://github.com
 *   SECURITY_REPORT       — path to scanner JSON (default /tmp/security-scan-report.json)
 *   FINDINGS_URL          — public URL to /security-findings page
 *
 * Exits 0 always — it is a notifier, not a gate.
 */
import { readFileSync, existsSync } from "node:fs";

const reportPath = process.env.SECURITY_REPORT ?? "/tmp/security-scan-report.json";
if (!existsSync(reportPath)) {
  console.log(`notify-security: no report at ${reportPath}; nothing to do.`);
  process.exit(0);
}
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const findings = report.findings ?? [];

let baselineIds = new Set();
try {
  const hist = JSON.parse(readFileSync("public/security/findings-history.json", "utf8"));
  baselineIds = new Set((hist.findings ?? []).map((f) => f.internal_id));
} catch { /* first run — everything is new */ }

const newFindings = findings.filter((f) => !baselineIds.has(f.rule));
if (!newFindings.length) {
  console.log("notify-security: no new findings vs baseline; no notification sent.");
  process.exit(0);
}

const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;
const findingsPage = process.env.FINDINGS_URL || "https://www.industryarmymarketing.com/security-findings";

const bullets = newFindings.slice(0, 10)
  .map((f) => `• [\`${f.rule}\`] (${f.severity}) ${f.message}`)
  .join("\n");

const title = `🛡️ Security scanner detected ${newFindings.length} NEW finding(s)`;
const body = [
  `**${title}**`,
  bullets,
  runUrl ? `CI artifact: ${runUrl}` : null,
  `Audit trail: ${findingsPage}`,
].filter(Boolean).join("\n\n");

const webhook = process.env.SLACK_WEBHOOK_URL;
if (webhook) {
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body }),
    });
    console.log(`notify-security: slack POST ${res.status}`);
  } catch (e) {
    console.warn("notify-security: slack post failed:", e?.message ?? e);
  }
} else {
  console.log("notify-security: SLACK_WEBHOOK_URL not set; skipping slack.");
}

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
if (token && repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ title, body, labels: ["security", "automated"] }),
    });
    console.log(`notify-security: github issue POST ${res.status}`);
  } catch (e) {
    console.warn("notify-security: github issue create failed:", e?.message ?? e);
  }
}

console.log(body);
process.exit(0);