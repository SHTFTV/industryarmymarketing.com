// Local CLI for the pricing guard.
//
//   npm run pricing-guard                          # dev server, chromium, all routes
//   npm run pricing-guard -- --live                # hit prod origin
//   npm run pricing-guard -- --mode packages       # only SEO Packages routes
//   npm run pricing-guard -- --mode territory      # only territory routes
//   npm run pricing-guard -- --routes /,/pricing   # scan just these paths
//   npm run pricing-guard -- --routes-file routes.txt  # one path per line
//   npm run pricing-guard -- --annotations on      # force GitHub annotations
//   npm run pricing-guard -- --annotations off     # suppress annotations even in CI
//   npm run pricing-guard -- --baseline-path prev/report.json  # override baseline
//   npm run pricing-guard -- --fail-new            # exit non-zero only on NEW matches
//   BASE_URL=https://staging.example.com npm run pricing-guard
//
// Runs `tests/no-forbidden-pricing.spec.ts` and produces the same
// `pricing-guard-report/` artifacts CI uploads (report.json, report.md,
// summary.json, per-route full-page + snippet + annotated screenshots,
// plus previous.json for baseline diffing).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, isAbsolute, resolve } from "node:path";

const argv = process.argv.slice(2);
function takeFlag(name: string): boolean {
  const i = argv.indexOf(name);
  if (i === -1) return false;
  argv.splice(i, 1);
  return true;
}
function takeOption(name: string): string | null {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  const value = argv[i + 1];
  if (value === undefined) {
    console.error(`✗ ${name} requires a value`);
    process.exit(2);
  }
  argv.splice(i, 2);
  return value;
}

const wantsLive = takeFlag("--live");
const failNew = takeFlag("--fail-new");
const modeArg = takeOption("--mode");
const routesArg = takeOption("--routes");
const routesFileArg = takeOption("--routes-file");
const annotationsArg = takeOption("--annotations");
const baselinePathArg = takeOption("--baseline-path");
const passthrough = argv;

const env: NodeJS.ProcessEnv = { ...process.env };
if (wantsLive && !env.PLAYWRIGHT_BASE_URL && !env.BASE_URL) {
  env.PLAYWRIGHT_BASE_URL = "https://www.industryarmymarketing.com";
}

if (modeArg) {
  const m = modeArg.toLowerCase();
  if (m !== "packages" && m !== "territory" && m !== "all") {
    console.error(`✗ --mode must be one of: packages | territory | all (got "${modeArg}")`);
    process.exit(2);
  }
  env.PRICING_GUARD_MODE = m;
}

// Merge --routes and --routes-file. File is one path per line;
// blank lines and `#` comments are ignored.
const collectedRoutes: string[] = [];
if (routesArg) collectedRoutes.push(...routesArg.split(",").map((s) => s.trim()).filter(Boolean));
if (routesFileArg) {
  const p = isAbsolute(routesFileArg) ? routesFileArg : resolve(process.cwd(), routesFileArg);
  if (!existsSync(p)) {
    console.error(`✗ --routes-file not found: ${p}`);
    process.exit(2);
  }
  const lines = readFileSync(p, "utf8")
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, "").trim())
    .filter(Boolean);
  collectedRoutes.push(...lines);
}
if (collectedRoutes.length > 0) {
  env.PRICING_GUARD_ROUTES = Array.from(new Set(collectedRoutes)).join(",");
}

if (baselinePathArg) {
  const p = isAbsolute(baselinePathArg) ? baselinePathArg : resolve(process.cwd(), baselinePathArg);
  if (!existsSync(p)) {
    console.error(`✗ --baseline-path not found: ${p}`);
    process.exit(2);
  }
  env.PRICING_GUARD_BASELINE_PATH = p;
}

if (annotationsArg) {
  const a = annotationsArg.toLowerCase();
  if (a !== "on" && a !== "off") {
    console.error(`✗ --annotations must be "on" or "off" (got "${annotationsArg}")`);
    process.exit(2);
  }
  env.PRICING_GUARD_ANNOTATIONS = a;
}

const cmd = "npx";
const cmdArgs = [
  "playwright",
  "test",
  "tests/no-forbidden-pricing.spec.ts",
  "--project=chromium",
  "--reporter=list",
  ...passthrough,
];

console.log(
  `▶︎ pricing-guard against ${env.PLAYWRIGHT_BASE_URL || env.BASE_URL || "local dev server"}`,
);
console.log(
  `  mode=${env.PRICING_GUARD_MODE ?? "all"}  routes=${env.PRICING_GUARD_ROUTES ?? "*"}  annotations=${env.PRICING_GUARD_ANNOTATIONS ?? "auto"}`,
);
if (env.PRICING_GUARD_BASELINE_PATH) {
  console.log(`  baseline=${env.PRICING_GUARD_BASELINE_PATH}`);
}
if (failNew) console.log(`  fail-new=on (exit non-zero only for newly introduced matches)`);
console.log(`  ${cmd} ${cmdArgs.join(" ")}\n`);

const result = spawnSync(cmd, cmdArgs, { stdio: "inherit", env });

const reportPath = join(process.cwd(), "pricing-guard-report", "report.md");
if (existsSync(reportPath)) {
  console.log(`\n📄 report: ${reportPath}`);
  const md = readFileSync(reportPath, "utf8");
  // Echo the summary block so the CLI matches CI's job summary output.
  const summary = md.split("\n").slice(0, 10).join("\n");
  console.log(summary);
  console.log(`   (full artifacts in pricing-guard-report/)`);
} else {
  console.log("\n(no pricing-guard-report/ produced — check test output above)");
}

// --fail-new: consult summary.json and override the exit code so the
// CLI passes when every failing match already existed in the baseline.
if (failNew) {
  const summaryPath = join(process.cwd(), "pricing-guard-report", "summary.json");
  if (!existsSync(summaryPath)) {
    console.error(`✗ --fail-new: summary.json missing at ${summaryPath}`);
    process.exit(result.status ?? 1);
  }
  try {
    const s = JSON.parse(readFileSync(summaryPath, "utf8"));
    const newFail = s?.totals?.matchesNewFail ?? 0;
    const newWarn = s?.totals?.matchesNewWarn ?? 0;
    console.log(
      `\n▶︎ --fail-new: newly introduced fail=${newFail}, warn=${newWarn} (baseline=${s?.baselinePath ?? "n/a"})`,
    );
    process.exit(newFail > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ --fail-new: could not parse summary.json — ${(err as Error).message}`);
    process.exit(result.status ?? 1);
  }
}

process.exit(result.status ?? 1);