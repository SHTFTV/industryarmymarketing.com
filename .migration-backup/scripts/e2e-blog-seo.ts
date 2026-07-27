#!/usr/bin/env -S bun run
/**
 * E2E SEO check for the published IAM Perspective post.
 * Loads the URL in headless Chromium and asserts JSON-LD, OG, and
 * Twitter meta tags are present and correct.
 *
 * Usage:
 *   bun scripts/e2e-blog-seo.ts \
 *     [--url https://www.industryarmymarketing.com/blog/<slug>]
 */
import { chromium } from "playwright";

const SLUG = "iam-perspective-committed-people-not-capital";
const argUrl = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1];
const URL = argUrl ?? `https://www.industryarmymarketing.com/blog/${SLUG}`;

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const assert = (name: string, ok: boolean, detail?: string) =>
  checks.push({ name, ok, detail });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
const resp = await page.goto(URL, { waitUntil: "networkidle", timeout: 45_000 });
assert("HTTP 200", resp?.status() === 200, `status=${resp?.status()}`);

const getMeta = (sel: string) =>
  page.locator(`meta[${sel}]`).first().getAttribute("content");

const [title, canonical, ogTitle, ogDesc, ogType, ogUrl, ogImage,
  twCard, twTitle, twDesc, twImage] = await Promise.all([
  page.title(),
  page.locator('link[rel="canonical"]').first().getAttribute("href"),
  getMeta('property="og:title"'),
  getMeta('property="og:description"'),
  getMeta('property="og:type"'),
  getMeta('property="og:url"'),
  getMeta('property="og:image"'),
  getMeta('name="twitter:card"'),
  getMeta('name="twitter:title"'),
  getMeta('name="twitter:description"'),
  getMeta('name="twitter:image"'),
]);

assert("title present", !!title && !/lovable/i.test(title), title ?? "");
assert("canonical matches slug", !!canonical && canonical.endsWith(`/blog/${SLUG}`), canonical ?? "");
assert("og:title", !!ogTitle);
assert("og:description >= 40 chars", (ogDesc?.length ?? 0) >= 40);
assert("og:type=article", ogType === "article", ogType ?? "");
assert("og:url matches canonical", ogUrl === canonical, `og:url=${ogUrl}`);
assert("og:image is https image", !!ogImage && /^https:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(ogImage), ogImage ?? "");
assert("twitter:card=summary_large_image", twCard === "summary_large_image", twCard ?? "");
assert("twitter:title", !!twTitle);
assert("twitter:description", !!twDesc);
assert("twitter:image https", !!twImage && /^https:\/\//.test(twImage), twImage ?? "");

const jsonLdRaw = await page
  .locator('script[type="application/ld+json"]')
  .allTextContents();
let blog: any;
for (const raw of jsonLdRaw) {
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of list) if (node?.["@type"] === "BlogPosting") blog = node;
  } catch {
    assert("JSON-LD parses", false, raw.slice(0, 120));
  }
}
assert("BlogPosting JSON-LD present", !!blog);
if (blog) {
  assert("JSON-LD mainEntityOfPage matches slug",
    typeof blog.mainEntityOfPage === "string" && blog.mainEntityOfPage.endsWith(`/blog/${SLUG}`),
    blog.mainEntityOfPage);
  assert("JSON-LD headline present", !!blog.headline);
  assert("JSON-LD image is https", typeof blog.image === "string" && /^https:\/\//.test(blog.image));
  assert("JSON-LD datePublished valid", !!blog.datePublished && !Number.isNaN(Date.parse(blog.datePublished)));
  assert("JSON-LD publisher.name", !!blog.publisher?.name);
}

await browser.close();

const failed = checks.filter((c) => !c.ok);
for (const c of checks) {
  const mark = c.ok ? "✓" : "✗";
  console.log(`${mark} ${c.name}${c.detail ? `  — ${c.detail}` : ""}`);
}
console.log(`\n${failed.length === 0 ? "PASS" : "FAIL"}: ${checks.length - failed.length}/${checks.length} at ${URL}`);
process.exit(failed.length === 0 ? 0 : 1);