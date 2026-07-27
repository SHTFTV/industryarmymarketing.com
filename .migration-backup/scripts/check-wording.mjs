#!/usr/bin/env node
// Site-wide release check for stale/incorrect wording.
// Fails (exit 1) if any forbidden phrase appears in src/ or index.html.
// Run before release: `node scripts/check-wording.mjs`
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const FORBIDDEN = [
  { re: /\b828\s+(canadian\s+)?cit/i, msg: "'828 ... cities' — use 'Worldwide Coverage'" },
  { re: /\bcanadian\s+cities\b/i, msg: "'Canadian Cities' — use 'Worldwide Cities'" },
  { re: /\b800\+?\s+cities\b/i, msg: "Hardcoded city count — use 'Worldwide'" },
  { re: /\bevery\s+canadian\s+city\b/i, msg: "'every Canadian city' — use 'every city worldwide'" },
  { re: /\ball\s+\d{2,4}\s+canadian\s+cit/i, msg: "Hardcoded Canadian city count" },
];

const ROOTS = ["src", "index.html"];
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".html", ".md", ".mdx"]);

const hits = [];
function walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) walk(join(p, f));
  } else if (EXTS.has(extname(p))) {
    const text = readFileSync(p, "utf8");
    text.split("\n").forEach((line, i) => {
      for (const { re, msg } of FORBIDDEN) {
        if (re.test(line)) hits.push(`  ${p}:${i + 1}  [${msg}]\n    > ${line.trim()}`);
      }
    });
  }
}
for (const r of ROOTS) if (existsSync(r)) walk(r);

if (hits.length) {
  console.error(`\n❌ Wording check failed — ${hits.length} issue(s):\n\n${hits.join("\n\n")}\n`);
  process.exit(1);
}
console.log("✅ Wording check passed — no forbidden phrases found.");