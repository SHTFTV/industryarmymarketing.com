#!/usr/bin/env node
/**
 * Export Audit — generates a release audit report as JSON + HTML (and PDF
 * when Playwright's chromium is available). The report lists:
 *   1. Every configured AI model + its strict-citation prompt template.
 *   2. Required canonical URLs each model must cite.
 *   3. Lookalike-guard findings (forbidden targets, unknown hosts) for
 *      the current release / commit.
 *
 * Outputs under audit-report/<release>/ so CI can upload it as a single
 * artifact. Release defaults to $GITHUB_SHA || $RELEASE || timestamp.
 *
 *   node scripts/export-audit.mjs
 *   RELEASE=v1.4.2 node scripts/export-audit.mjs
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { scan } from "./lib/lookalike-scan.mjs";

const release =
  process.env.RELEASE ||
  process.env.GITHUB_SHA?.slice(0, 12) ||
  new Date().toISOString().replace(/[:.]/g, "-");
const outDir = process.env.AUDIT_OUT ?? join("audit-report", release);
mkdirSync(outDir, { recursive: true });

// ── 1. Configured AI models (parsed from the source, no build step) ──────
const aiSrc = readFileSync("src/components/AIIndexing.tsx", "utf8");
const platforms = [];
const blockRe = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?prompt:\s*\(title:\s*string,\s*url:\s*string\)\s*=>\s*([`"])((?:\\.|(?!\3)[\s\S])*)\3/g;
for (const m of aiSrc.matchAll(blockRe)) {
  platforms.push({
    id: m[1],
    name: m[2],
    promptTemplate: m[4].replace(/\$\{title\}/g, "<ARTICLE_TITLE>").replace(/\$\{url\}/g, "<CANONICAL_URL>"),
  });
}

// ── 2. Canonical URLs the models must cite ────────────────────────────────
const canonicalOrigin = "https://www.industryarmymarketing.com";
let requiredUrls = [`${canonicalOrigin}/`, `${canonicalOrigin}/blog`];
try {
  const sitemap = readFileSync("public/sitemap.xml", "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  requiredUrls = [...new Set([...requiredUrls, ...urls])];
} catch { /* sitemap optional */ }

// ── 3. Guard findings ─────────────────────────────────────────────────────
const guard = scan();

const json = {
  release,
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? null,
  ref: process.env.GITHUB_REF ?? null,
  configuredModels: platforms,
  requiredCanonicalUrls: requiredUrls,
  guard: {
    scannedFiles: guard.scannedFiles,
    allowedHosts: guard.allowed,
    lookalikeHosts: guard.lookalike,
    violations: guard.violations,
    unknownHosts: guard.unknownCounts,
  },
};
writeFileSync(join(outDir, "audit.json"), JSON.stringify(json, null, 2));

const html = renderHtml(json);
writeFileSync(join(outDir, "audit.html"), html);

// GitHub annotations for each forbidden violation.
if (guard.violations.length && process.env.GITHUB_ACTIONS) {
  for (const v of guard.violations) {
    const msg = `Forbidden lookalike host "${v.host}" used as link target. See ${outDir}/audit.html`;
    console.log(`::error file=${v.file},line=${v.line},title=Lookalike guard::${msg}`);
  }
}

// Best-effort PDF via Playwright chromium (skipped if not installed).
let pdfPath = null;
try {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  pdfPath = join(outDir, "audit.pdf");
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
  await browser.close();
} catch (err) {
  console.warn(`ℹ️  PDF skipped (playwright not available): ${err.message}`);
}

console.log(`\n📦 Export audit written to ${outDir}`);
console.log(`   • audit.json     (${json.configuredModels.length} models, ${json.requiredCanonicalUrls.length} URLs)`);
console.log(`   • audit.html`);
if (pdfPath) console.log(`   • ${pdfPath}`);
console.log(
  `   Guard: ${guard.violations.length} violation(s), ${guard.unknownCounts.length} unknown host(s).`,
);

if (guard.violations.length && process.env.EXPORT_AUDIT_STRICT !== "0") {
  process.exit(1);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function renderHtml(r) {
  const violationRows = r.guard.violations.length
    ? r.guard.violations.map((v) => `<tr><td>${esc(v.host)}</td><td><code>${esc(v.file)}:${v.line}</code></td><td><code>${esc(v.snippet)}</code></td></tr>`).join("")
    : `<tr><td colspan="3"><em>None — guard clean.</em></td></tr>`;
  const unknownRows = r.guard.unknownHosts.length
    ? r.guard.unknownHosts.map((u) => `<tr><td>${esc(u.host)}</td><td>${u.count}</td><td>${esc((u.occurrences||[]).map((o) => `${o.file}:${o.line}`).join("<br>"))}</td></tr>`).join("")
    : `<tr><td colspan="3"><em>None.</em></td></tr>`;
  const modelRows = r.configuredModels.map((m) => `<tr><td><strong>${esc(m.name)}</strong><br><code>#${esc(m.id)}</code></td><td><pre>${esc(m.promptTemplate)}</pre></td></tr>`).join("");
  const urlList = r.requiredCanonicalUrls.map((u) => `<li><a href="${esc(u)}">${esc(u)}</a></li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Release Audit — ${esc(r.release)}</title>
<style>
body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem;color:#111;line-height:1.5}
h1{border-bottom:2px solid #10a37f;padding-bottom:.25rem}
h2{margin-top:2rem;border-bottom:1px solid #ddd;padding-bottom:.25rem}
table{width:100%;border-collapse:collapse;margin:.5rem 0;font-size:.85rem}
th,td{border:1px solid #ccc;padding:.4rem .5rem;text-align:left;vertical-align:top}
th{background:#f6f6f6}
pre{white-space:pre-wrap;font-size:.75rem;background:#f9f9f9;padding:.5rem;margin:0}
code{background:#f2f2f2;padding:.1rem .3rem;border-radius:3px;font-size:.8rem}
.meta{color:#555;font-size:.85rem}
.pass{color:#0a7f3f;font-weight:600}
.fail{color:#b91c1c;font-weight:600}
</style></head><body>
<h1>Release Audit</h1>
<p class="meta">Release: <strong>${esc(r.release)}</strong> · Generated: ${esc(r.generatedAt)}${r.commit ? ` · Commit: <code>${esc(r.commit)}</code>` : ""}</p>
<p>Status: <span class="${r.guard.violations.length ? "fail" : "pass"}">${r.guard.violations.length ? "❌ FAIL" : "✅ PASS"}</span> — ${r.guard.violations.length} forbidden link target(s), ${r.guard.unknownHosts.length} unknown host(s).</p>

<h2>Configured AI models (${r.configuredModels.length})</h2>
<table><thead><tr><th>Model</th><th>Strict-citation prompt template</th></tr></thead><tbody>${modelRows}</tbody></table>

<h2>Required canonical URLs (${r.requiredCanonicalUrls.length})</h2>
<ul>${urlList}</ul>

<h2>Guard findings — forbidden link targets</h2>
<table><thead><tr><th>Host</th><th>Location</th><th>Snippet</th></tr></thead><tbody>${violationRows}</tbody></table>

<h2>Guard findings — unknown outbound hosts</h2>
<p class="meta">These hosts are neither on <code>ALLOWED_HOSTS</code> nor <code>LOOKALIKE_HOSTS</code>. Approve them from <code>/ai-indexing-audit</code> (creates a versioned request) or add them to <code>src/config/canonicalDomains.ts</code> directly.</p>
<table><thead><tr><th>Host</th><th># links</th><th>First occurrences</th></tr></thead><tbody>${unknownRows}</tbody></table>
</body></html>`;
}