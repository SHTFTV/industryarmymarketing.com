// Local CLI for the pricing guard.
//
//   npm run pricing-guard                # dev server, chromium
//   npm run pricing-guard -- --live      # hit prod origin
//   BASE_URL=https://staging.example.com npm run pricing-guard
//
// Runs `tests/no-forbidden-pricing.spec.ts` and produces the same
// `pricing-guard-report/` artifacts CI uploads (report.json, report.md,
// per-route full-page + snippet + annotated screenshots).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const wantsLive = args.includes("--live");
const passthrough = args.filter((a) => a !== "--live");

const env: NodeJS.ProcessEnv = { ...process.env };
if (wantsLive && !env.PLAYWRIGHT_BASE_URL && !env.BASE_URL) {
  env.PLAYWRIGHT_BASE_URL = "https://www.industryarmymarketing.com";
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
console.log(`  ${cmd} ${cmdArgs.join(" ")}\n`);

const result = spawnSync(cmd, cmdArgs, { stdio: "inherit", env });

const reportPath = join(process.cwd(), "pricing-guard-report", "report.md");
if (existsSync(reportPath)) {
  console.log(`\n📄 report: ${reportPath}`);
  const md = readFileSync(reportPath, "utf8");
  // Echo the summary block so the CLI matches CI's job summary output.
  const summary = md.split("\n").slice(0, 6).join("\n");
  console.log(summary);
  console.log(`   (full artifacts in pricing-guard-report/)`);
} else {
  console.log("\n(no pricing-guard-report/ produced — check test output above)");
}

process.exit(result.status ?? 1);