// Post-build verifier: reads public/sitemap.xml, samples blog URLs, and
// asserts every corresponding static file returns a full article body
// (canonical tag, BlogPosting JSON-LD, <h1>, article HTML) — not the SPA shell.
// Runs after the build to prevent silent regressions to zero-export output.

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const CANONICAL_HOST = "https://www.industryarmymarketing.com";
const SITEMAP = resolve("public/sitemap.xml");

if (!existsSync(SITEMAP)) {
  console.error("[postbuild-verify-blog] sitemap.xml missing");
  process.exit(1);
}

const xml = readFileSync(SITEMAP, "utf8");
const blogUrls = Array.from(xml.matchAll(/<loc>([^<]+\/blog\/[^<]+)<\/loc>/g))
  .map((m) => m[1])
  .filter((u) => !u.endsWith("/blog"));

if (blogUrls.length === 0) {
  console.error("[postbuild-verify-blog] sitemap has zero blog URLs — generator regression");
  process.exit(1);
}

// Sample: first, last, and a middle URL to catch systemic regressions cheaply.
const sample = Array.from(new Set([blogUrls[0], blogUrls[Math.floor(blogUrls.length / 2)], blogUrls[blogUrls.length - 1]]));
const errors: string[] = [];
const roots = ["public", "dist"].filter((r) => existsSync(resolve(r)));

for (const url of sample) {
  const slug = url.replace(`${CANONICAL_HOST}/blog/`, "").replace(/\/$/, "");
  for (const root of roots) {
    const filePath = resolve(root, "blog", slug);
    if (!existsSync(filePath)) {
      errors.push(`[${root}] missing static file for ${slug}`);
      continue;
    }
    const size = statSync(filePath).size;
    if (size < 1000) errors.push(`[${root}] ${slug} suspiciously small (${size} bytes)`);
    const body = readFileSync(filePath, "utf8");
    if (!body.includes(`<link rel="canonical" href="${CANONICAL_HOST}/blog/${slug}">`)) {
      errors.push(`[${root}] ${slug} missing canonical tag`);
    }
    if (!/"@type"\s*:\s*"BlogPosting"/.test(body)) {
      errors.push(`[${root}] ${slug} missing BlogPosting JSON-LD`);
    }
    if (!/<h1>/.test(body)) errors.push(`[${root}] ${slug} missing <h1>`);
    if (!/<article>/.test(body)) errors.push(`[${root}] ${slug} missing <article>`);
    // Guard against the SPA shell being served as the article response.
    if (/id="root"><\/div>/.test(body) && !/<article>/.test(body)) {
      errors.push(`[${root}] ${slug} looks like an empty SPA shell`);
    }
  }
}

if (errors.length) {
  console.error("[postbuild-verify-blog] FAILED:\n  " + errors.join("\n  "));
  process.exit(1);
}

console.log(`[postbuild-verify-blog] ok — ${sample.length} sample URLs across ${roots.length} root(s)`);