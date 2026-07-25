#!/usr/bin/env node
/**
 * Notify Slack and/or GitHub when the lookalike-domain guard fails or when
 * new unknown outbound hosts are detected in a release.
 *
 * Env:
 *   SLACK_WEBHOOK_URL   — Incoming Webhook URL (optional; skipped if unset)
 *   GITHUB_TOKEN        — token with `issues: write` on the repo (optional)
 *   GITHUB_REPOSITORY   — "owner/repo" (auto-set by Actions)
 *   GITHUB_RUN_ID       — Actions run id (used to link artifact)
 *   GITHUB_SERVER_URL   — https://github.com
 *   AUDIT_ARTIFACT_URL  — explicit link to the release-audit artifact
 *   RELEASE             — release tag / commit
 *
 * Reads public/audit/lookalike-guard.json (produced by
 * check-lookalike-domains.mjs). Exits 0 even on failure — it is a notifier,
 * not a gate.
 */
import { readFileSync, existsSync } from "node:fs";

const artifactPath = process.env.LOOKALIKE_ARTIFACT ?? "public/audit/lookalike-guard.json";
if (!existsSync(artifactPath)) {
  console.log(`notify-guard: no artifact at ${artifactPath}; nothing to do.`);
  process.exit(0);
}

const report = JSON.parse(readFileSync(artifactPath, "utf8"));
const violations = report.violations ?? [];
const unknown = report.unknownCounts ?? [];
const release = process.env.RELEASE || process.env.GITHUB_SHA?.slice(0, 12) || "local";

const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;
const artifactUrl = process.env.AUDIT_ARTIFACT_URL || runUrl;

// Nothing worth alerting on.
if (!violations.length && !unknown.length) {
  console.log("notify-guard: guard clean, no unknown hosts — no notification sent.");
  process.exit(0);
}

const status = violations.length ? "❌ FAILED" : "⚠️ UNKNOWN HOSTS";
const title = `Lookalike-domain guard — ${status} (${release})`;
const bulletViolations = violations.slice(0, 10).map((v) => `• \`${v.host}\` at ${v.file}:${v.line}`).join("\n");
const bulletUnknown = unknown.slice(0, 10).map((u) => `• \`${u.host}\` (${u.count} link${u.count > 1 ? "s" : ""})`).join("\n");

const body = [
  `**${title}**`,
  violations.length ? `\n**Forbidden targets (${violations.length}):**\n${bulletViolations}` : "",
  unknown.length ? `\n**Unknown outbound hosts (${unknown.length}):**\n${bulletUnknown}` : "",
  artifactUrl ? `\n**Audit artifact:** ${artifactUrl}` : "",
].filter(Boolean).join("\n");

// ─── Slack ───────────────────────────────────────────────────
if (process.env.SLACK_WEBHOOK_URL) {
  try {
    const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: title,
        blocks: [
          { type: "header", text: { type: "plain_text", text: title } },
          { type: "section", text: { type: "mrkdwn", text: body.slice(0, 2900) } },
          ...(artifactUrl
            ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open audit artifact" }, url: artifactUrl }] }]
            : []),
        ],
      }),
    });
    console.log(`notify-guard: slack ${res.status}`);
  } catch (err) {
    console.error(`notify-guard: slack failed — ${err.message}`);
  }
} else {
  console.log("notify-guard: SLACK_WEBHOOK_URL not set; skipping Slack.");
}

// ─── GitHub issue comment ────────────────────────────────────
if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const auth = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" };
  try {
    // Prefer PR comment when running on a pull_request event.
    const prNumber = process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\//)?.[1];
    if (prNumber) {
      const r = await fetch(`${api}/issues/${prNumber}/comments`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      console.log(`notify-guard: PR #${prNumber} comment ${r.status}`);
    } else if (violations.length) {
      // On main branch failures, open (or reuse) a tracking issue.
      const list = await fetch(`${api}/issues?state=open&labels=lookalike-guard`, { headers: auth });
      const issues = list.ok ? await list.json() : [];
      if (issues.length) {
        const r = await fetch(`${api}/issues/${issues[0].number}/comments`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        console.log(`notify-guard: appended to issue #${issues[0].number} ${r.status}`);
      } else {
        const r = await fetch(`${api}/issues`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ title, body, labels: ["lookalike-guard"] }),
        });
        console.log(`notify-guard: opened issue ${r.status}`);
      }
    }
  } catch (err) {
    console.error(`notify-guard: github failed — ${err.message}`);
  }
} else {
  console.log("notify-guard: GITHUB_TOKEN not set; skipping GitHub.");
}