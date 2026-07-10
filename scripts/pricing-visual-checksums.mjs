#!/usr/bin/env node
// Compute and verify checksums for the /pricing visual baseline set, grouped
// by Playwright project (chromium / webkit / firefox).
//
// Usage:
//   node scripts/pricing-visual-checksums.mjs           # print checksums + files
//   node scripts/pricing-visual-checksums.mjs --check   # CI gate: exit 1 if any
//                                                       # engine is missing a
//                                                       # required snapshot
//   node scripts/pricing-visual-checksums.mjs --json    # machine-readable
//
// The set-checksum is sha256 over `<filename>\0<file-sha256>\n` lines sorted
// by filename — stable regardless of directory-listing order and sensitive
// to any add / remove / content change.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const SNAP_DIR = resolve("tests/pricing-visual.spec.ts-snapshots");
const ENGINES = ["chromium", "webkit", "firefox"];

// Must match the snapshot names in tests/pricing-visual.spec.ts.
const REQUIRED_SNAPSHOTS = [
  "pricing-mobile-comparison",
  "pricing-faq-closed",
  "pricing-faq-open",
  "pricing-faq-open-mobile",
];

// Playwright names snapshots `<name>-<project>-<platform>.png`. We match by
// engine via `-<engine>-` and by required name via prefix.
function listForEngine(engine) {
  if (!existsSync(SNAP_DIR)) return [];
  return readdirSync(SNAP_DIR)
    .filter((f) => f.endsWith(".png") && f.includes(`-${engine}-`))
    .sort();
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function setChecksum(files) {
  const h = createHash("sha256");
  for (const f of files) {
    const bytes = readFileSync(join(SNAP_DIR, f));
    h.update(`${f}\0${sha256(bytes)}\n`);
  }
  return h.digest("hex");
}

function missingSnapshots(engine, files) {
  const missing = [];
  for (const name of REQUIRED_SNAPSHOTS) {
    const hit = files.some((f) => f.startsWith(`${name}-${engine}-`));
    if (!hit) missing.push(name);
  }
  return missing;
}

function build() {
  const result = {};
  for (const engine of ENGINES) {
    const files = listForEngine(engine);
    result[engine] = {
      count: files.length,
      files,
      missing: missingSnapshots(engine, files),
      set_sha256: files.length ? setChecksum(files) : null,
    };
  }
  return result;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const asJson = args.has("--json");
  const check = args.has("--check");
  const report = build();

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    for (const engine of ENGINES) {
      const r = report[engine];
      console.log(`\n[${engine}] ${r.count} snapshot(s)`);
      console.log(`  set_sha256: ${r.set_sha256 ?? "(none — no baselines)"}`);
      if (r.missing.length) {
        console.log(`  missing:    ${r.missing.join(", ")}`);
      }
      for (const f of r.files) console.log(`    - ${f}`);
    }
  }

  if (check) {
    const broken = ENGINES.filter(
      (e) => report[e].count === 0 || report[e].missing.length > 0,
    );
    if (broken.length) {
      console.error(
        `\n✖ Missing pricing visual baselines for: ${broken.join(", ")}`,
      );
      console.error(
        `  Seed them via the "Pricing visual baselines (seed)" workflow,\n` +
          `  download the artifact(s), and commit the PNGs into\n` +
          `  tests/pricing-visual.spec.ts-snapshots/.`,
      );
      process.exit(1);
    }
    console.log("\n✓ All required pricing visual baselines present.");
  }
}

main();