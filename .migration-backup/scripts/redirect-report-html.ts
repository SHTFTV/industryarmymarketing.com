// Render redirect-chain-summary.json as a browsable HTML report so
// failures can be inspected by rule and hop without reading raw JSON.
//
// Usage:
//   bunx tsx scripts/redirect-report-html.ts \
//     --in redirect-chain-summary.json \
//     --out redirect-chain-report.html

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

type Rule = {
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
  rules: Rule[];
  inconsistent: string[];
};

const args = process.argv.slice(2);
const arg = (n: string, d?: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const IN = resolve(arg("--in", "redirect-chain-summary.json")!);
const OUT = resolve(arg("--out", "redirect-chain-report.html")!);

function esc(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function statusPill(codes: (number | string)[], ok: boolean) {
  return codes
    .map((c) => `<span class="pill ${ok ? "pill-ok" : "pill-fail"}">${esc(String(c))}</span>`)
    .join(" ");
}

function main() {
  const summary = JSON.parse(readFileSync(IN, "utf8")) as Summary;
  const { totals } = summary;
  const failed = summary.rules.filter((r) => !r.ok);
  const passed = summary.rules.filter((r) => r.ok);

  const ruleRow = (r: Rule) => `
    <tr class="${r.ok ? "row-ok" : "row-fail"}" data-ua="${esc(r.ua)}" data-status="${r.ok ? "ok" : "fail"}">
      <td>${r.ok ? "✅" : "❌"}</td>
      <td><code>${esc(r.rule)}</code></td>
      <td>${esc(r.ua)}</td>
      <td><code>${esc(r.requested)}</code></td>
      <td>${statusPill(r.expected.hops, true)}</td>
      <td>${statusPill(r.actual.hops, r.ok)}</td>
      <td><code>${esc(r.expected.finalUrl)}</code></td>
      <td><code>${esc(r.actual.finalUrl)}</code></td>
      <td>${r.reasons.length ? `<ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Redirect chain report — ${esc(summary.base)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; background: #0b0f14; color: #e6edf3; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  .muted { color: #8b98a5; font-size: 12px; }
  .cards { display: flex; gap: 12px; margin: 16px 0 24px; flex-wrap: wrap; }
  .card { background: #121820; border: 1px solid #1f2937; border-radius: 10px; padding: 12px 16px; min-width: 120px; }
  .card .n { font-size: 24px; font-weight: 600; }
  .card.ok .n { color: #34d399; }
  .card.fail .n { color: #f87171; }
  .toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
  input, select { background: #0b0f14; color: inherit; border: 1px solid #1f2937; border-radius: 6px; padding: 6px 10px; }
  table { width: 100%; border-collapse: collapse; background: #0f141b; border-radius: 10px; overflow: hidden; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #1f2937; vertical-align: top; text-align: left; }
  th { background: #121820; font-weight: 600; position: sticky; top: 0; }
  tr.row-fail { background: rgba(248, 113, 113, 0.06); }
  code { font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: #cdd9e5; }
  .pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font: 600 11px/1.6 ui-monospace, monospace; }
  .pill-ok { background: rgba(52,211,153,0.15); color: #34d399; }
  .pill-fail { background: rgba(248,113,113,0.15); color: #f87171; }
  ul { margin: 0; padding-left: 18px; }
  details { margin-top: 24px; }
</style>
</head>
<body>
  <h1>Redirect chain report</h1>
  <div class="muted">${esc(summary.base)} · generated ${esc(summary.generatedAt)}</div>

  <div class="cards">
    <div class="card"><div class="muted">Cases</div><div class="n">${totals.cases}</div></div>
    <div class="card ok"><div class="muted">Passed</div><div class="n">${totals.passed}</div></div>
    <div class="card fail"><div class="muted">Failed</div><div class="n">${totals.failed}</div></div>
    <div class="card"><div class="muted">Cross-UA mismatches</div><div class="n">${totals.crossUaMismatches}</div></div>
  </div>

  <div class="toolbar">
    <input id="q" type="search" placeholder="Filter by rule / path / UA…" />
    <select id="status">
      <option value="">All statuses</option>
      <option value="fail">Failing only</option>
      <option value="ok">Passing only</option>
    </select>
  </div>

  <table id="rules">
    <thead>
      <tr>
        <th></th><th>Rule</th><th>UA</th><th>Requested</th>
        <th>Expected hops</th><th>Actual hops</th>
        <th>Expected final</th><th>Actual final</th><th>Reasons</th>
      </tr>
    </thead>
    <tbody>
      ${[...failed, ...passed].map(ruleRow).join("")}
    </tbody>
  </table>

  ${summary.inconsistent?.length
    ? `<details open><summary>Cross-UA inconsistencies (${summary.inconsistent.length})</summary><ul>${summary.inconsistent
        .map((x) => `<li><code>${esc(x)}</code></li>`)
        .join("")}</ul></details>`
    : ""}

<script>
  const q = document.getElementById('q');
  const status = document.getElementById('status');
  const rows = [...document.querySelectorAll('#rules tbody tr')];
  function apply() {
    const s = q.value.toLowerCase(); const st = status.value;
    for (const r of rows) {
      const okMatch = !st || r.dataset.status === st;
      const txtMatch = !s || r.innerText.toLowerCase().includes(s);
      r.style.display = okMatch && txtMatch ? '' : 'none';
    }
  }
  q.addEventListener('input', apply); status.addEventListener('change', apply);
</script>
</body>
</html>`;
  writeFileSync(OUT, html);
  console.log(`redirect-report-html: wrote ${OUT} (${summary.rules.length} rules, ${failed.length} failing)`);
}

main();