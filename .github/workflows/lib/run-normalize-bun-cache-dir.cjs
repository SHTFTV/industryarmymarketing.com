#!/usr/bin/env node
// CLI runner used by the workflow. Reads BUN_INSTALL_CACHE_DIR from env,
// validates + normalizes it via the shared module, and:
//   - on failure: prints `::error title=Invalid input::<msg>` and exits 1.
//   - on success: writes the following to $GITHUB_OUTPUT
//       bun_cache_dir_normalized=<value or empty>
//       bun_cache_dir_resolved=<value or default ~/.bun/install/cache>
//     ...always exports BUN_INSTALL_CACHE_DIR=<resolved> to $GITHUB_ENV so
//     Bun honors the path, and `mkdir -p` the resolved directory.
const fs = require('node:fs');
const path = require('node:path');
const { normalizeBunCacheDir } = require('./normalize-bun-cache-dir.cjs');

const raw = process.env.BUN_INSTALL_CACHE_DIR;
const result = normalizeBunCacheDir(raw);

if (!result.ok) {
  console.log(`::error title=Invalid input::${result.error}`);
  process.exit(1);
}

const home = process.env.HOME || '';
const defaultDir = path.join(home, '.bun/install/cache');
const resolved = result.value === '' ? defaultDir : result.value;

const ghOutput = process.env.GITHUB_OUTPUT;
const ghEnv = process.env.GITHUB_ENV;
if (!ghOutput || !ghEnv) {
  console.error('GITHUB_OUTPUT and GITHUB_ENV must be set');
  process.exit(1);
}

fs.appendFileSync(
  ghOutput,
  `bun_cache_dir_normalized=${result.value}\n` +
    `bun_cache_dir_resolved=${resolved}\n`,
);
fs.appendFileSync(ghEnv, `BUN_INSTALL_CACHE_DIR=${resolved}\n`);
fs.mkdirSync(resolved, { recursive: true });

console.log(
  result.value === ''
    ? `bun_cache_dir=<default> → ${resolved} ✓`
    : `bun_cache_dir='${result.value}' → ${resolved} ✓`,
);
