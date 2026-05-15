#!/usr/bin/env node
// CLI runner used by the workflow. Reads BUN_INSTALL_CACHE_DIR from env,
// validates + normalizes it via the shared module, and either:
//   - prints `::error title=Invalid input::<msg>` and exits 1 on failure
//   - appends `BUN_INSTALL_CACHE_DIR=<normalized>` to $GITHUB_ENV (when
//     non-blank) and exits 0 on success.
const fs = require('node:fs');
const { normalizeBunCacheDir } = require('./normalize-bun-cache-dir.cjs');

const raw = process.env.BUN_INSTALL_CACHE_DIR;
const result = normalizeBunCacheDir(raw);

if (!result.ok) {
  console.log(`::error title=Invalid input::${result.error}`);
  process.exit(1);
}

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
