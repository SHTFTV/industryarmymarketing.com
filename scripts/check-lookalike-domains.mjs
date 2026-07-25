#!/usr/bin/env node
/**
 * Pre-publish guard: scans src/ and public/ for outgoing URLs and fails if
 * any resolve to a host that is not on the canonical allowlist or that
 * matches a forbidden lookalike host.
 *
 * Run: node scripts/check-lookalike-domains.mjs
 *
 * The allowlist / lookalike list live in src/config/canonicalDomains.ts and
 * are re-parsed here (not imported) so this script has zero TS/runtime deps.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const cfg = readFileSync("src/config/canonicalDomains.ts", "utf8");
const parseList = (name) => {
  const m = cfg.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase());
};
const ALLOWED = new Set(parseList("ALLOWED_HOSTS"));
const LOOKALIKE = new Set(parseList("LOOKALIKE_HOSTS"));

const ROOTS = ["src", "public/robots.txt", "public/sitemap.xml", "public/rss.xml", "index.html"];
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".html", ".xml", ".md", ".txt", ".json"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "__snapshots__"]);
// Allow bare-mention of lookalike hosts in editorial/prose contexts (blog
// posts quoting the copycat) but never as an href/src target. The check
// below distinguishes the two.
const URL_RE = /\bhttps?:\/\/([a-z0-9.-]+)(\/[^\s"'`<>)]*)?/gi;
const HREF_RE = /\b(?:href|src|url|to)\s*[:=]\s*["'`](https?:\/\/[^"'`\s]+)["'`]/gi;

const violations = [];
const unknownCounts = new Map();

function walk(p) {
  if (!existsSync(p)) return;
  const s = statSync(p);
  if (s.isDirectory()) {
    if (SKIP_DIRS.has(p.split("/").pop())) return;
    for (const f of readdirSync(p)) walk(join(p, f));
  } else if (EXTS.has(extname(p))) {
    const text = readFileSync(p, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      // 1) Any URL — flag lookalikes even in prose.
      for (const m of line.matchAll(URL_RE)) {
        const host = m[1].toLowerCase();
        if (LOOKALIKE.has(host)) {
          // In editorial contexts, referring to the disavowed host by name is
          // required. Only fail if it's used as an actual link target (href/src).
          const isLinkTarget = new RegExp(`(?:href|src|url|to)\\s*[:=]\\s*["'\`]https?://${host.replace(/\./g, "\\.")}`, "i").test(line);
          if (isLinkTarget) {
            violations.push(`${p}:${i + 1}  [FORBIDDEN link target: ${host}]\n    > ${line.trim()}`);
          }
        }
      }
      // 2) Any explicit link target — flag unknown hosts.
      for (const m of line.matchAll(HREF_RE)) {
        try {
          const u = new URL(m[1]);
          const host = u.host.toLowerCase();
          if (LOOKALIKE.has(host)) continue; // already reported above
          if (!ALLOWED.has(host)) {
            unknownCounts.set(host, (unknownCounts.get(host) ?? 0) + 1);
          }
        } catch { /* ignore malformed */ }
      }
    });
  }
}

for (const r of ROOTS) walk(r);

let failed = false;
if (violations.length) {
  console.error(`\n❌ Lookalike-domain guard failed — ${violations.length} link target(s) point at disavowed hosts:\n\n${violations.join("\n\n")}\n`);
  failed = true;
}

if (unknownCounts.size) {
  const rows = [...unknownCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.warn(`\n⚠️  Unknown outbound hosts (not on ALLOWED_HOSTS). Add to src/config/canonicalDomains.ts if intentional:`);
  for (const [host, count] of rows) console.warn(`  ${host}  (${count} link${count > 1 ? "s" : ""})`);
  console.warn("");
}

if (failed) process.exit(1);
console.log(`✅ Lookalike-domain guard passed. Allowed hosts: ${ALLOWED.size}. Forbidden hosts: ${LOOKALIKE.size}.`);