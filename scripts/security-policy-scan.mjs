#!/usr/bin/env node
// Lightweight security scanner run in CI on every PR.
// Fails the build when a new forbidden pattern is introduced in
// Supabase migrations (permissive SELECT policies, missing GRANTs on
// public tables, or reintroduction of previously-fixed findings).

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
function changedMigrations() {
  // On PRs / CI, restrict "new" checks to migrations touched vs. main.
  try {
    const base = process.env.GITHUB_BASE_REF
      ? `origin/${process.env.GITHUB_BASE_REF}`
      : "origin/main";
    const out = execSync(`git diff --name-only --diff-filter=AM ${base}...HEAD`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(
      out
        .split("\n")
        .filter((p) => p.startsWith("supabase/migrations/") && p.endsWith(".sql"))
        .map((p) => p.replace("supabase/migrations/", "")),
    );
  } catch {
    return null; // fall back to "no scope" — treat every file as pre-existing
  }
}

const MIGRATIONS = join(process.cwd(), "supabase", "migrations");
const HISTORY = join(process.cwd(), "public", "security", "findings-history.json");
const REPORT = "/tmp/security-scan-report.json";

const findings = [];

function scanMigrations() {
  const files = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const combined = files
    .map((f) => readFileSync(join(MIGRATIONS, f), "utf8"))
    .join("\n\n");

  const changed = changedMigrations();

  // 1. Forbid reintroduction of the fixed host_allowlist_requests SELECT true policy
  const permissiveAllowlist =
    /CREATE POLICY[^;]*host_allowlist_requests[\s\S]*?FOR SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i;
  const dropOldAllowlist =
    /DROP POLICY[^;]*"Authenticated can view allowlist audit log"/i;
  if (permissiveAllowlist.test(combined) && !dropOldAllowlist.test(combined)) {
    findings.push({
      severity: "high",
      rule: "host_allowlist_requests_public_select",
      message:
        "Permissive SELECT USING (true) on host_allowlist_requests was reintroduced. Restrict to admins via has_role().",
    });
  }

  // 2. Generic guard: any new public-schema table must GRANT within the same migration
  for (const f of files) {
    // Only block on brand-new tables introduced in this PR;
    // legacy migrations without GRANTs are pre-existing and already deployed.
    if (changed && !changed.has(f)) continue;
    const sql = readFileSync(join(MIGRATIONS, f), "utf8");
    const createMatches = [...sql.matchAll(/CREATE TABLE\s+public\.(\w+)/gi)];
    for (const m of createMatches) {
      const table = m[1];
      const grantRe = new RegExp(`GRANT[^;]+\\bpublic\\.${table}\\b`, "i");
      if (!grantRe.test(sql)) {
        findings.push({
          severity: "high",
          rule: "missing_grant_on_public_table",
          message: `Migration ${f} creates public.${table} without a GRANT statement in the same migration.`,
        });
      }
    }
  }

  // 3. Any FOR SELECT USING (true) policy on any table = warning
  const permissiveGeneric =
    /CREATE POLICY[^;]+FOR SELECT[\s\S]*?USING\s*\(\s*true\s*\)/gi;
  const perms = [...combined.matchAll(permissiveGeneric)];
  if (perms.length > 0) {
    findings.push({
      severity: "warn",
      rule: "permissive_select_policy",
      message: `${perms.length} permissive SELECT USING (true) policy(ies) found across migrations — confirm each is scoped to a fully public table.`,
    });
  }
}

function crossCheckHistory() {
  try {
    const history = JSON.parse(readFileSync(HISTORY, "utf8"));
    const fixedIds = new Set(
      (history.findings ?? []).filter((f) => f.status === "fixed").map((f) => f.internal_id),
    );
    for (const f of findings) {
      if (fixedIds.has(f.rule)) {
        f.regression = true;
        f.severity = "high";
        f.message = `[REGRESSION] Previously-fixed finding "${f.rule}" appears to be reintroduced. ${f.message}`;
      }
    }
  } catch {
    // history file optional
  }
}

scanMigrations();
crossCheckHistory();

const report = {
  generated_at: new Date().toISOString(),
  finding_count: findings.length,
  findings,
};
writeFileSync(REPORT, JSON.stringify(report, null, 2));

const blocking = findings.filter((f) => f.severity === "high");
if (blocking.length > 0) {
  console.error("❌ Security scan failed:");
  for (const f of blocking) console.error(` - [${f.rule}] ${f.message}`);
  process.exit(1);
}

if (findings.length > 0) {
  console.warn("⚠️  Security scan warnings:");
  for (const f of findings) console.warn(` - [${f.rule}] ${f.message}`);
}
console.log(`✅ Security scan passed (${findings.length} non-blocking findings).`);