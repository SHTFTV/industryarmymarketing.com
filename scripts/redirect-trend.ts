// Aggregate historical redirect-chain-summary.json files (produced by the
// nightly workflow) and emit a trend/diff report showing which legacy
// redirects are changing over time.
//
// Usage:
//   bunx tsx scripts/redirect-trend.ts \
//     --history .redirect-history \
//     --out-md redirect-trend.md \
//     --out-json redirect-trend.json
//
// Each file under --history is expected to be a redirect-chain-summary.json
// (as produced by scripts/redirect-chain-validator.ts --summary). The
// filename should sort chronologically (e.g. 2026-07-19.json).

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";

type SummaryRule = {
  rule: string;
  ua: string;
  requested: string;
  expected: { hops: string[]; finalUrl: string };
  actual: { hops: number[]; finalUrl: string };
  ok: boolean;
  reasons: string[];
};
type Summary = {
  base: string;
  generatedAt: string;
  totals: { cases: number; passed: number; failed: number; crossUaMismatches: number };
  rules: SummaryRule[];
};

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const HISTORY = resolve(arg("--history", ".redirect-history")!);
const OUT_MD = arg("--out-md", "redirect-trend.md")!;
const OUT_JSON = arg("--out-json", "redirect-trend.json")!;
const MAX_RUNS = Number(arg("--max-runs", "30"));

function key(r: Pick<SummaryRule, "rule" | "ua" | "requested">) {
  return `${r.rule}\u241f${r.ua}\u241f${r.requested}`;
}

function loadHistory(): Array<{ label: string; summary: Summary }> {
  if (!existsSync(HISTORY)) return [];
  const files = readdirSync(HISTORY)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .slice(-MAX_RUNS);
  return files.map((f) => ({
    label: f.replace(/\.json$/, ""),
    summary: JSON.parse(readFileSync(join(HISTORY, f), "utf8")) as Summary,
  }));
}

function main() {
  const history = loadHistory();
  if (history.length === 0) {
    writeFileSync(OUT_MD, "# Redirect trend\n\n_No historical summaries found._\n");
    writeFileSync(OUT_JSON, JSON.stringify({ runs: [], changes: [] }, null, 2));
    console.log("redirect-trend: no history — wrote empty report");
    return;
  }

  // Track each rule/ua/path across runs.
  const timeline = new Map<string, Array<{ label: string; ok: boolean; finalUrl: string; hops: number[] }>>();
  const meta = new Map<string, Pick<SummaryRule, "rule" | "ua" | "requested" | "expected">>();
  for (const { label, summary } of history) {
    for (const r of summary.rules ?? []) {
      const k = key(r);
      if (!timeline.has(k)) timeline.set(k, []);
      timeline.get(k)!.push({ label, ok: r.ok, finalUrl: r.actual.finalUrl, hops: r.actual.hops });
      meta.set(k, { rule: r.rule, ua: r.ua, requested: r.requested, expected: r.expected });
    }
  }

  // A "change" is any rule whose (ok, finalUrl, hops-signature) differs
  // across two consecutive runs.
  const sig = (e: { ok: boolean; finalUrl: string; hops: number[] }) =>
    `${e.ok ? "OK" : "FAIL"}|${e.finalUrl}|${e.hops.join(",")}`;
  const changes: Array<{
    key: string;
    rule: string;
    ua: string;
    requested: string;
    expected: SummaryRule["expected"];
    transitions: Array<{ from: string; to: string; at: string }>;
  }> = [];
  for (const [k, entries] of timeline) {
    const transitions: Array<{ from: string; to: string; at: string }> = [];
    for (let i = 1; i < entries.length; i++) {
      const a = sig(entries[i - 1]);
      const b = sig(entries[i]);
      if (a !== b) transitions.push({ from: a, to: b, at: entries[i].label });
    }
    if (transitions.length) {
      const m = meta.get(k)!;
      changes.push({ key: k, ...m, transitions });
    }
  }

  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        runs: history.map((h) => ({ label: h.label, totals: h.summary.totals })),
        changes,
      },
      null,
      2,
    ),
  );

  const lines: string[] = [];
  lines.push("# Redirect trend");
  lines.push("");
  lines.push(`Runs analyzed: **${history.length}** (most recent: \`${history[history.length - 1].label}\`)`);
  lines.push("");
  lines.push("| Run | Cases | Passed | Failed | Cross-UA |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const { label, summary } of history) {
    const t = summary.totals;
    lines.push(`| \`${label}\` | ${t.cases} | ${t.passed} | ${t.failed} | ${t.crossUaMismatches} |`);
  }
  lines.push("");
  if (changes.length === 0) {
    lines.push("_No rule changes across runs — redirects are stable._");
  } else {
    lines.push(`## Rule changes (${changes.length})`);
    lines.push("");
    for (const c of changes) {
      lines.push(`### \`${c.rule}\` — ${c.ua} (\`${c.requested}\`)`);
      lines.push(`Expected: hops ${c.expected.hops.join(" → ")}, final \`${c.expected.finalUrl}\``);
      lines.push("");
      lines.push("| At | Before | After |");
      lines.push("| --- | --- | --- |");
      for (const t of c.transitions) {
        lines.push(`| \`${t.at}\` | \`${t.from}\` | \`${t.to}\` |`);
      }
      lines.push("");
    }
  }
  writeFileSync(OUT_MD, lines.join("\n"));
  console.log(`redirect-trend: ${history.length} run(s), ${changes.length} rule change(s) → ${OUT_MD}`);
}

main();