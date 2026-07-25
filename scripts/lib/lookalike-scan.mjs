// Shared scanner used by check-lookalike-domains.mjs and export-audit.mjs.
// Returns { allowed, lookalike, violations, unknownCounts, scannedFiles }.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

export function loadHostLists(cfgPath = "src/config/canonicalDomains.ts") {
  const cfg = readFileSync(cfgPath, "utf8");
  const parse = (name) => {
    const m = cfg.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
    if (!m) return [];
    return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase());
  };
  return { allowed: parse("ALLOWED_HOSTS"), lookalike: parse("LOOKALIKE_HOSTS") };
}

const ROOTS = ["src", "public/robots.txt", "public/sitemap.xml", "public/rss.xml", "index.html"];
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".html", ".xml", ".md", ".txt", ".json"]);
const SKIP = new Set(["node_modules", "dist", ".git", "__snapshots__"]);
const URL_RE = /\bhttps?:\/\/([a-z0-9.-]+)(\/[^\s"'`<>)]*)?/gi;
const HREF_RE = /\b(?:href|src|url|to)\s*[:=]\s*["'`](https?:\/\/[^"'`\s]+)["'`]/gi;

export function scan({ roots = ROOTS } = {}) {
  const { allowed, lookalike } = loadHostLists();
  const ALLOWED = new Set(allowed);
  const LOOKALIKE = new Set(lookalike);
  const violations = [];
  const unknown = new Map(); // host -> [{file,line}]
  let scannedFiles = 0;

  const walk = (p) => {
    if (!existsSync(p)) return;
    const s = statSync(p);
    if (s.isDirectory()) {
      if (SKIP.has(p.split("/").pop())) return;
      for (const f of readdirSync(p)) walk(join(p, f));
    } else if (EXTS.has(extname(p))) {
      scannedFiles++;
      const text = readFileSync(p, "utf8");
      text.split("\n").forEach((line, i) => {
        for (const m of line.matchAll(URL_RE)) {
          const host = m[1].toLowerCase();
          if (LOOKALIKE.has(host)) {
            const isTarget = new RegExp(
              `(?:href|src|url|to)\\s*[:=]\\s*["'\`]https?://${host.replace(/\./g, "\\.")}`,
              "i",
            ).test(line);
            if (isTarget) {
              violations.push({ file: p, line: i + 1, host, snippet: line.trim().slice(0, 240) });
            }
          }
        }
        for (const m of line.matchAll(HREF_RE)) {
          try {
            const host = new URL(m[1]).host.toLowerCase();
            if (LOOKALIKE.has(host) || ALLOWED.has(host)) continue;
            const arr = unknown.get(host) ?? [];
            arr.push({ file: p, line: i + 1 });
            unknown.set(host, arr);
          } catch { /* ignore */ }
        }
      });
    }
  };
  for (const r of roots) walk(r);

  const unknownCounts = [...unknown.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([host, hits]) => ({ host, count: hits.length, occurrences: hits.slice(0, 5) }));

  return {
    allowed: [...ALLOWED],
    lookalike: [...LOOKALIKE],
    violations,
    unknownCounts,
    scannedFiles,
    generatedAt: new Date().toISOString(),
  };
}