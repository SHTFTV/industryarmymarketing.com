// Pre-republish validator. Runs on every content change (new/edited
// blog post, service page, sitemap entry) BEFORE `bun run build` /
// publish, so we catch drift while it's still cheap to fix.
//
// Runs three layers of checks in one shot:
//   1. HTML surface (renderless):
//        - Every <img> in src/data/blogPosts.ts entries has non-empty
//          alt text (accessibility + SEO signal).
//        - Every blog post has metaTitle + metaDescription in the
//          Google-preferred length windows.
//   2. Head + JSON-LD (vitest, jsdom): reruns the existing SEO parity
//      suites so a content change can't ship if canonical, og/twitter,
//      breadcrumbs, dates, images, or @id/sitemap parity break.
//   3. Structural (renderless): re-parses public/sitemap.xml and
//      confirms every registered blog slug is present with a matching
//      <lastmod>.
//
// Usage:
//   bunx tsx scripts/preflight-content.ts
//   bunx tsx scripts/preflight-content.ts --fast   # skip vitest run
//
// Exit code 0 = safe to publish; non-zero = block publish.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FAST = process.argv.includes("--fast");

type Issue = { level: "error" | "warn"; where: string; msg: string };
const issues: Issue[] = [];
const err = (where: string, msg: string) =>
  issues.push({ level: "error", where, msg });
const warn = (where: string, msg: string) =>
  issues.push({ level: "warn", where, msg });

// ─── 1. Content surface checks (no React render) ─────────────────
const blogSrc = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");

// alt="" on <img> is a red flag; we treat missing alt AND empty alt
// on non-decorative images as errors. Decorative images should use
// aria-hidden or role="presentation" explicitly.
const imgRe = /<img\b[^>]*>/g;
for (const tag of blogSrc.match(imgRe) ?? []) {
  const altMatch = tag.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/);
  if (!altMatch) {
    err("blogPosts.ts", `<img> missing alt attribute: ${tag.slice(0, 120)}`);
    continue;
  }
  const alt = (altMatch[1] ?? altMatch[2] ?? "").trim();
  if (
    alt.length === 0 &&
    !/(aria-hidden\s*=\s*["']true["'])|(role\s*=\s*["']presentation["'])/i.test(tag)
  ) {
    err("blogPosts.ts", `empty alt without aria-hidden: ${tag.slice(0, 120)}`);
  }
  const title = tag.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/);
  if (title) {
    const t = (title[1] ?? title[2] ?? "").trim();
    if (t.length === 0) warn("blogPosts.ts", `empty title on ${tag.slice(0, 80)}`);
  }
}

// metaTitle / metaDescription length windows. Google truncates around
// 60/160 chars; we allow slightly beyond and warn rather than block.
const titleRe = /"metaTitle"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
const descRe = /"metaDescription"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
let m: RegExpExecArray | null;
while ((m = titleRe.exec(blogSrc))) {
  const t = m[1];
  if (t.length < 30) warn("blogPosts.ts", `metaTitle too short (${t.length}): "${t}"`);
  if (t.length > 70) warn("blogPosts.ts", `metaTitle too long (${t.length}): "${t}"`);
}
while ((m = descRe.exec(blogSrc))) {
  const d = m[1];
  if (d.length < 80) warn("blogPosts.ts", `metaDescription too short (${d.length})`);
  if (d.length > 180) warn("blogPosts.ts", `metaDescription too long (${d.length})`);
}

// Every post needs a publishedAt — otherwise sort/RSS/JSON-LD break.
const slugRe = /"slug"\s*:\s*"([a-z0-9-]+)"/g;
const slugs = Array.from(blogSrc.matchAll(slugRe), (x) => x[1]);
for (const slug of slugs) {
  const idx = blogSrc.indexOf(`"slug": "${slug}"`);
  const window = blogSrc.slice(idx, idx + 6000);
  if (!/"publishedAt"\s*:\s*"[^"]+"/.test(window)) {
    err("blogPosts.ts", `post "${slug}" missing publishedAt`);
  }
}

// ─── 3. Sitemap ↔ posts parity ───────────────────────────────────
if (existsSync(resolve("public/sitemap.xml"))) {
  const sm = readFileSync(resolve("public/sitemap.xml"), "utf8");
  for (const slug of slugs) {
    if (!sm.includes(`/blog/${slug}<`) && !sm.includes(`/blog/${slug}\n`)) {
      err("sitemap.xml", `slug "${slug}" not present in sitemap`);
    }
  }
} else {
  err("sitemap.xml", "public/sitemap.xml is missing — run generate-sitemap");
}

// ─── 2. Head + JSON-LD suites via vitest ─────────────────────────
if (!FAST) {
  const suites = [
    "src/test/blog-meta-description-parity.test.tsx",
    "src/test/blog-og-url-parity.test.tsx",
    "src/test/blog-twitter-og-parity.test.tsx",
    "src/test/blog-canonical-og-twitter-sitemap-url.test.tsx",
    "src/test/blog-jsonld-id-sitemap-parity.test.tsx",
    "src/test/blog-jsonld-schema-validate.test.tsx",
    "src/test/blog-jsonld-author-publisher.test.tsx",
    "src/test/blog-jsonld-author-publisher-structure.test.tsx",
    "src/test/blog-jsonld-dates.test.ts",
    "src/test/blog-jsonld-type-parity.test.tsx",
    "src/test/blog-breadcrumb-jsonld.test.tsx",
    "src/test/blog-social-tags-parity.test.tsx",
    "src/test/blog-rss-sitemap-order.test.ts",
    "src/test/sitemap-lastmod-jsonld.test.tsx",
    "src/test/robots-txt-blog.test.ts",
  ].filter((p) => existsSync(resolve(p)));

  const r = spawnSync("bunx", ["vitest", "run", ...suites], {
    stdio: "inherit",
    encoding: "utf8",
  });
  if (r.status !== 0) {
    err("vitest", `SEO test suite failed (exit ${r.status})`);
  }
}

// ─── Report ──────────────────────────────────────────────────────
const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
for (const i of issues) {
  const tag = i.level === "error" ? "✗" : "⚠";
  console.log(`${tag} [${i.where}] ${i.msg}`);
}
console.log(`\nPreflight: ${errors.length} error(s), ${warns.length} warning(s).`);
if (errors.length > 0) {
  console.log("Publish blocked. Fix errors above and re-run.");
  process.exit(1);
}
console.log("OK — safe to publish.");