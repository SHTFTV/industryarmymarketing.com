#!/usr/bin/env node
// CLI runner used by the workflow. Reads BUN_INSTALL_CACHE_DIR from env,
// validates + normalizes it via the shared module, and:
//   - on failure: prints `::error title=Invalid input::<msg>` and exits 1.
//   - on success: appends `BUN_INSTALL_CACHE_DIR=<value>` to $GITHUB_ENV
//     (when non-blank) AND appends `bun_cache_dir_normalized=<value>` to
//     $GITHUB_OUTPUT for downstream steps. When the input is blank, the
//     output is the empty string and downstream steps should fall back to
//     the default cache directory.
const fs = require('node:fs');
const { normalizeBunCacheDir } = require('./normalize-bun-cache-dir.cjs');

const raw = process.env.BUN_INSTALL_CACHE_DIR;
const result = normalizeBunCacheDir(raw);

if (!result.ok) {
  console.log(`::error title=Invalid input::${result.error}`);
  process.exit(1);
}

const ghOutput = process.env.GITHUB_OUTPUT;
if (!ghOutput) {
  console.error('GITHUB_OUTPUT is not set');
  process.exit(1);
}
fs.appendFileSync(ghOutput, `bun_cache_dir_normalized=${result.value}\n`);

if (result.value === '') {
  console.log("bun_cache_dir=<default> ✓");
  process.exit(0);
}

const ghEnv = process.env.GITHUB_ENV;
if (!ghEnv) {
  console.error('GITHUB_ENV is not set');
  process.exit(1);
}
fs.appendFileSync(ghEnv, `BUN_INSTALL_CACHE_DIR=${result.value}\n`);
console.log(`bun_cache_dir='${result.value}' ✓`);
