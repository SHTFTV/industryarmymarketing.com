// JSON schema validator for redirect-chain-summary.json.
//
// CI-friendly: exits non-zero with a clear, line-item error list when
// the summary file is missing fields, has wrong types, or contains
// invalid status-hop data (e.g. negative HTTP statuses, non-integer
// codes, empty final URLs). No external deps — validation is inline.
//
// Usage:
//   bunx tsx scripts/validate-summary-schema.ts \
//     --in redirect-chain-summary.json
//   bunx tsx scripts/validate-summary-schema.ts --in ... --annotate

import { readFileSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const IN = resolve(arg("--in", "redirect-chain-summary.json")!);
const ANNOTATE = args.includes("--annotate");

const errors: string[] = [];
function fail(path: string, msg: string) {
  errors.push(`${path}: ${msg}`);
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isNonEmptyString(v: unknown): v is string {
  return isString(v) && v.length > 0;
}
function isInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v);
}
function isValidHttpStatus(v: unknown): v is number {
  return isInt(v) && v >= 100 && v <= 599;
}

function validate(root: unknown): void {
  if (!isObject(root)) return fail("$", "root must be an object");

  for (const k of ["base", "generatedAt"] as const) {
    if (!isNonEmptyString(root[k])) fail(`$.${k}`, "must be a non-empty string");
  }
  if (isString(root.generatedAt) && Number.isNaN(Date.parse(root.generatedAt))) {
    fail("$.generatedAt", "must be an ISO-8601 timestamp");
  }

  const totals = root.totals;
  if (!isObject(totals)) fail("$.totals", "must be an object");
  else {
    for (const k of ["cases", "passed", "failed", "crossUaMismatches"] as const) {
      if (!isInt(totals[k]) || (totals[k] as number) < 0)
        fail(`$.totals.${k}`, "must be a non-negative integer");
    }
    if (isInt(totals.passed) && isInt(totals.failed) && isInt(totals.cases)) {
      if ((totals.passed as number) + (totals.failed as number) !== (totals.cases as number))
        fail("$.totals", "passed + failed must equal cases");
    }
  }

  if (!Array.isArray(root.rules)) return fail("$.rules", "must be an array");
  root.rules.forEach((r, i) => {
    const p = `$.rules[${i}]`;
    if (!isObject(r)) return fail(p, "must be an object");
    if (!isNonEmptyString(r.rule)) fail(`${p}.rule`, "must be a non-empty string");
    if (!isNonEmptyString(r.ua)) fail(`${p}.ua`, "must be a non-empty string");
    if (!isNonEmptyString(r.requested)) fail(`${p}.requested`, "must be a non-empty string");
    if (typeof r.ok !== "boolean") fail(`${p}.ok`, "must be boolean");
    if (!Array.isArray(r.reasons)) fail(`${p}.reasons`, "must be an array");
    else r.reasons.forEach((x, j) => { if (!isString(x)) fail(`${p}.reasons[${j}]`, "must be string"); });
    if (typeof r.ok === "boolean") {
      const rlen = Array.isArray(r.reasons) ? r.reasons.length : -1;
      if (r.ok && rlen > 0) fail(`${p}`, "ok=true but reasons is non-empty");
      if (!r.ok && rlen === 0) fail(`${p}`, "ok=false but reasons is empty");
    }

    const exp = (r as Record<string, unknown>).expected;
    if (!isObject(exp)) fail(`${p}.expected`, "must be an object");
    else {
      if (!Array.isArray(exp.hops) || (exp.hops as unknown[]).length === 0)
        fail(`${p}.expected.hops`, "must be a non-empty array of hop patterns");
      else (exp.hops as unknown[]).forEach((h, j) => {
        if (!isNonEmptyString(h)) fail(`${p}.expected.hops[${j}]`, "must be a non-empty string like '301' or '301/302'");
        else if (!/^\d{3}(\/\d{3})*$/.test(h as string))
          fail(`${p}.expected.hops[${j}]`, `invalid hop pattern "${h}" — expected 3-digit codes joined by '/'`);
      });
      if (!isNonEmptyString(exp.finalUrl)) fail(`${p}.expected.finalUrl`, "must be a non-empty string");
      else if (!/^https?:\/\//.test(exp.finalUrl as string))
        fail(`${p}.expected.finalUrl`, "must start with http:// or https://");
    }

    const act = (r as Record<string, unknown>).actual;
    if (!isObject(act)) fail(`${p}.actual`, "must be an object");
    else {
      if (!Array.isArray(act.hops)) fail(`${p}.actual.hops`, "must be an array");
      else (act.hops as unknown[]).forEach((h, j) => {
        if (!isValidHttpStatus(h))
          fail(`${p}.actual.hops[${j}]`, `invalid HTTP status "${h}" — must be integer in [100,599]`);
      });
      if (!isNonEmptyString(act.finalUrl)) fail(`${p}.actual.finalUrl`, "must be a non-empty string");
    }
  });

  if ("inconsistent" in root && !Array.isArray(root.inconsistent))
    fail("$.inconsistent", "must be an array when present");
}

function main() {
  let raw: string;
  try { raw = readFileSync(IN, "utf8"); }
  catch (e) {
    console.error(`validate-summary-schema: cannot read ${IN}: ${(e as Error).message}`);
    process.exit(2);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch (e) {
    console.error(`validate-summary-schema: ${IN} is not valid JSON: ${(e as Error).message}`);
    if (ANNOTATE) console.log(`::error file=${IN},title=Invalid JSON::${(e as Error).message}`);
    process.exit(2);
  }
  validate(parsed);
  if (errors.length === 0) {
    console.log(`validate-summary-schema: PASS (${IN})`);
    return;
  }
  console.error(`validate-summary-schema: FAIL — ${errors.length} problem(s) in ${IN}`);
  for (const e of errors) console.error(`  ${e}`);
  if (ANNOTATE) {
    const msg = errors.slice(0, 20).join("\n").replace(/\n/g, "%0A");
    console.log(`::error file=${IN},title=redirect-chain-summary schema invalid::${msg}`);
  }
  process.exit(1);
}

main();