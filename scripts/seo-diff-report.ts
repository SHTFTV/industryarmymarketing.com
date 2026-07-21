// Generate a diff report showing what changed in canonical tags,
// robots.txt, and sitemap.xml between the previous deploy snapshot and
// the current build. Writes:
//
//   .seo-snapshots/current.json  — snapshot of this build
//   seo-diff-report.md           — human-readable diff (uploaded by CI)
//   seo-diff-report.json         — machine-readable diff
//
// The "previous" snapshot is read from --baseline (default
// .seo-snapshots/previous.json). CI restores this from the last
// successful run's artifact before invoking the script.
//
// Usage:
//   bunx tsx scripts/seo-diff-report.ts
//   bunx tsx scripts/seo-diff-report.ts --baseline .seo-snapshots/previous.json

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const BASELINE = arg("--baseline", ".seo-snapshots/previous.json")!;
const CURRENT_OUT = arg("--out", ".seo-snapshots/current.json")!;
const MD_OUT = arg("--md", "seo-diff-report.md")!;
const JSON_OUT = arg("--json", "seo-diff-report.json")!;

type Snapshot = {
  generatedAt: string;
  robots: string;
  sitemap: { locs: string[]; count: number };
  canonicals: Record<string, string | null>;
};

function readIfExists(p: string): string | null {
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

function extractLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim()).sort();
}

function extractCanonicalFromHtml(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function walkPrerenderedHtml(): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  const distRoot = resolve("dist");
  if (!existsSync(distRoot)) return out;
  // BFS through dist looking for index.html files
  const stack = [distRoot];
  const { readdirSync, statSync } = require("fs") as typeof import("fs");
  while (stack.length) {
    const d = stack.pop()!;
    for (const entry of readdirSync(d)) {
      const p = `${d}/${entry}`;
      const s = statSync(p);
      if (s.isDirectory()) stack.push(p);
      else if (entry === "index.html") {
        const rel = p.slice(distRoot.length).replace(/\/index\.html$/, "") || "/";
        try {
          out[rel] = extractCanonicalFromHtml(readFileSync(p, "utf8"));
        } catch {
          out[rel] = null;
        }
      }
    }
  }
  return out;
}

function buildCurrent(): Snapshot {
  const robots = readIfExists(resolve("public/robots.txt")) ?? "";
  const sitemapXml =
    readIfExists(resolve("dist/sitemap.xml")) ??
    readIfExists(resolve("public/sitemap.xml")) ??
    "";
  const locs = sitemapXml ? extractLocs(sitemapXml) : [];
  const canonicals = walkPrerenderedHtml();
  return {
    generatedAt: new Date().toISOString(),
    robots,
    sitemap: { locs, count: locs.length },
    canonicals,
  };
}

function diffLines(a: string, b: string): { added: string[]; removed: string[] } {
  const A = new Set(a.split("\n"));
  const B = new Set(b.split("\n"));
  return {
    added: [...B].filter((x) => !A.has(x)),
    removed: [...A].filter((x) => !B.has(x)),
  };
}

function diffArrays(a: string[], b: string[]): { added: string[]; removed: string[] } {
  const A = new Set(a);
  const B = new Set(b);
  return {
    added: b.filter((x) => !A.has(x)),
    removed: a.filter((x) => !B.has(x)),
  };
}

function diffCanonicals(
  a: Record<string, string | null>,
  b: Record<string, string | null>,
): { added: string[]; removed: string[]; changed: Array<{ path: string; before: string | null; after: string | null }> } {
  const paths = new Set([...Object.keys(a), ...Object.keys(b)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ path: string; before: string | null; after: string | null }> = [];
  for (const p of paths) {
    const before = a[p];
    const after = b[p];
    if (before === undefined) added.push(p);
    else if (after === undefined) removed.push(p);
    else if (before !== after) changed.push({ path: p, before, after });
  }
  return { added: added.sort(), removed: removed.sort(), changed: changed.sort((x, y) => x.path.localeCompare(y.path)) };
}

function main() {
  const current = buildCurrent();
  mkdirSync(dirname(resolve(CURRENT_OUT)), { recursive: true });
  writeFileSync(resolve(CURRENT_OUT), JSON.stringify(current, null, 2));

  const baselineRaw = readIfExists(resolve(BASELINE));
  const baseline: Snapshot | null = baselineRaw ? (JSON.parse(baselineRaw) as Snapshot) : null;

  const md: string[] = [`# SEO diff report`, ``, `Generated: ${current.generatedAt}`, ``];
  const json: any = { generatedAt: current.generatedAt, hasBaseline: !!baseline };

  if (!baseline) {
    md.push(`_No baseline snapshot found at \`${BASELINE}\`. This run establishes the baseline._`);
    json.note = "no-baseline";
  } else {
    md.push(`Baseline: ${baseline.generatedAt}`, ``);

    // robots.txt
    const robots = diffLines(baseline.robots, current.robots);
    json.robots = robots;
    md.push(`## robots.txt`);
    if (robots.added.length === 0 && robots.removed.length === 0) md.push(`_No changes._`);
    else {
      for (const l of robots.removed) md.push(`- \`- ${l}\``);
      for (const l of robots.added) md.push(`- \`+ ${l}\``);
    }
    md.push(``);

    // sitemap.xml
    const sitemap = diffArrays(baseline.sitemap.locs, current.sitemap.locs);
    json.sitemap = { ...sitemap, before: baseline.sitemap.count, after: current.sitemap.count };
    md.push(`## sitemap.xml (${baseline.sitemap.count} → ${current.sitemap.count} entries)`);
    if (sitemap.added.length === 0 && sitemap.removed.length === 0) md.push(`_No changes._`);
    else {
      if (sitemap.removed.length) md.push(`**Removed (${sitemap.removed.length})**`);
      for (const l of sitemap.removed.slice(0, 100)) md.push(`- ~~${l}~~`);
      if (sitemap.removed.length > 100) md.push(`- …and ${sitemap.removed.length - 100} more`);
      if (sitemap.added.length) md.push(`**Added (${sitemap.added.length})**`);
      for (const l of sitemap.added.slice(0, 100)) md.push(`- ${l}`);
      if (sitemap.added.length > 100) md.push(`- …and ${sitemap.added.length - 100} more`);
    }
    md.push(``);

    // canonicals
    const canon = diffCanonicals(baseline.canonicals, current.canonicals);
    json.canonicals = canon;
    md.push(`## Canonical tags`);
    if (canon.added.length === 0 && canon.removed.length === 0 && canon.changed.length === 0) {
      md.push(`_No changes._`);
    } else {
      if (canon.changed.length) {
        md.push(`**Changed (${canon.changed.length})**`);
        for (const c of canon.changed.slice(0, 100))
          md.push(`- \`${c.path}\`: \`${c.before ?? "(none)"}\` → \`${c.after ?? "(none)"}\``);
        if (canon.changed.length > 100) md.push(`- …and ${canon.changed.length - 100} more`);
      }
      if (canon.added.length) {
        md.push(`**New pages (${canon.added.length})**`);
        for (const p of canon.added.slice(0, 100)) md.push(`- ${p}`);
        if (canon.added.length > 100) md.push(`- …and ${canon.added.length - 100} more`);
      }
      if (canon.removed.length) {
        md.push(`**Removed pages (${canon.removed.length})**`);
        for (const p of canon.removed.slice(0, 100)) md.push(`- ~~${p}~~`);
        if (canon.removed.length > 100) md.push(`- …and ${canon.removed.length - 100} more`);
      }
    }
    md.push(``);
  }

  writeFileSync(resolve(MD_OUT), md.join("\n"));
  writeFileSync(resolve(JSON_OUT), JSON.stringify(json, null, 2));
  console.log(`seo-diff-report: wrote ${MD_OUT}, ${JSON_OUT}, ${CURRENT_OUT}`);
}

main();