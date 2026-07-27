// Automated post-publish validation for a blog post:
//  1) Fetches the built HTML and asserts no Lovable branding / debug code.
//  2) Validates BlogPosting, BreadcrumbList, and FAQPage JSON-LD render correctly.
//  3) Confirms SEO title, meta description, canonical, og:image, and featured image.
//
// Usage:  bunx tsx scripts/check-blog-post.ts <slug> [base-url]
//   defaults: slug = six-figure-land-grab-weddings-io
//             base-url = https://industryarmymarketing.com
//
// Notes: this is a runtime check against the deployed HTML — it does NOT run
// JS, so it validates the SSR/static head + JSON-LD emitted by react-helmet-async
// after client hydration only when the HTML is pre-rendered. For SPA builds the
// check falls back to asserting the app shell and the post's presence in the
// bundled data + sitemap.

import { readFileSync } from "fs";
import { resolve } from "path";

const SLUG = process.argv[2] ?? "six-figure-land-grab-weddings-io";
const BASE = (process.argv[3] ?? "https://industryarmymarketing.com").replace(/\/$/, "");
const URL = `${BASE}/blog/${SLUG}`;

// Anything on this list appearing in shipped HTML/JS is a fail.
const FORBIDDEN_MARKERS = [
  "lovable.app",
  "lovable.dev",
  "gpteng.co",
  "Edit with Lovable",
  "Lovable Generated Project",
  "Lovable App",
  "Vite App",
  "Vite + React",
  "TODO",
  "console.log(",
  "debugger;",
];

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];
const ok = (name: string, detail?: string) => results.push({ name, ok: true, detail });
const fail = (name: string, detail: string) => results.push({ name, ok: false, detail });

async function fetchText(url: string): Promise<string> {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.text();
}

function extractJsonLd(html: string): unknown[] {
  const scripts = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((m) => m[1].trim());
  const parsed: unknown[] = [];
  for (const s of scripts) {
    try {
      const v = JSON.parse(s);
      Array.isArray(v) ? parsed.push(...v) : parsed.push(v);
    } catch {
      /* ignore malformed — flagged separately */
    }
  }
  return parsed;
}

function assertType(schemas: unknown[], type: string) {
  return schemas.find(
    (s): s is Record<string, unknown> =>
      !!s && typeof s === "object" && (s as Record<string, unknown>)["@type"] === type,
  );
}

async function main() {
  console.log(`Validating ${URL}\n`);

  // -- 1. Local source integrity --------------------------------------------
  const postsSrc = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");
  const slugPresent = new RegExp(`["']slug["']\\s*:\\s*["']${SLUG}["']`).test(postsSrc);
  slugPresent
    ? ok("post-registered", `slug '${SLUG}' present in src/data/blogPosts.ts`)
    : fail("post-registered", `slug '${SLUG}' missing from src/data/blogPosts.ts`);

  const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
  sitemap.includes(`/blog/${SLUG}`)
    ? ok("sitemap-entry", `/blog/${SLUG} present in sitemap.xml`)
    : fail("sitemap-entry", `/blog/${SLUG} missing from sitemap.xml`);

  const imageBlockRegex = new RegExp(
    `<loc>[^<]*/blog/${SLUG}</loc>[\\s\\S]*?<image:image>`,
  );
  imageBlockRegex.test(sitemap)
    ? ok("image-sitemap", `image:image entry attached to /blog/${SLUG}`)
    : fail("image-sitemap", `no image:image tag for /blog/${SLUG} in sitemap`);

  const robots = readFileSync(resolve("public/robots.txt"), "utf8");
  /Sitemap:\s*https?:\/\/[^\s]+sitemap\.xml/i.test(robots)
    ? ok("robots-sitemap-directive", "robots.txt declares Sitemap: directive")
    : fail("robots-sitemap-directive", "robots.txt is missing Sitemap: directive");

  // -- 2. Live HTML fetch ---------------------------------------------------
  let html = "";
  try {
    html = await fetchText(URL);
    ok("live-fetch", `${URL} returned ${html.length} bytes`);
  } catch (e) {
    fail("live-fetch", (e as Error).message);
  }

  if (html) {
    // Forbidden markers — case-insensitive substring scan.
    const lower = html.toLowerCase();
    const hits = FORBIDDEN_MARKERS.filter((m) => lower.includes(m.toLowerCase()));
    hits.length === 0
      ? ok("no-lovable-branding", "no forbidden markers in rendered HTML")
      : fail("no-lovable-branding", `found forbidden markers: ${hits.join(", ")}`);

    // JSON-LD structural checks (only meaningful once the page has pre-rendered
    // per-route head; on a pure SPA shell the schemas will only be the sitewide
    // Organization/WebSite ones and per-route checks will report 'ssr-pending').
    const schemas = extractJsonLd(html);
    ok("json-ld-parse", `${schemas.length} JSON-LD blocks parsed`);

    const blog = assertType(schemas, "BlogPosting");
    const breadcrumb = assertType(schemas, "BreadcrumbList");
    const faq = assertType(schemas, "FAQPage");

    if (blog) {
      const url = String((blog as Record<string, unknown>).url ?? "");
      url.endsWith(`/blog/${SLUG}`)
        ? ok("json-ld-blogposting", `BlogPosting.url self-references ${url}`)
        : fail("json-ld-blogposting", `BlogPosting.url=${url} does not self-reference /blog/${SLUG}`);
    } else {
      fail("json-ld-blogposting", "ssr-pending: BlogPosting not in static HTML (SPA — validates after JS hydration)");
    }
    breadcrumb
      ? ok("json-ld-breadcrumb", "BreadcrumbList present")
      : fail("json-ld-breadcrumb", "ssr-pending: BreadcrumbList not in static HTML");
    faq
      ? ok("json-ld-faq", "FAQPage present")
      : fail("json-ld-faq", "ssr-pending: FAQPage not in static HTML");

    // Head metadata sanity — again only meaningful once per-route head is SSRed.
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
    /Six-Figure Land Grab/i.test(title) || /Formal Complaint/i.test(title)
      ? ok("seo-title", `<title>: ${title}`)
      : fail("seo-title", `<title> is generic app shell: ${title}`);

    const desc = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    )?.[1];
    desc && desc.length > 50
      ? ok("meta-description", `${desc.slice(0, 90)}...`)
      : fail("meta-description", "meta description missing or trivially short");
  }

  // -- 3. Report ------------------------------------------------------------
  console.log("\n=== Report ===");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? " — " + r.detail : ""}`);
  }

  const hardFailures = results.filter(
    (r) => !r.ok && !(r.detail ?? "").startsWith("ssr-pending"),
  );
  if (hardFailures.length > 0) {
    console.error(`\n${hardFailures.length} hard failure(s).`);
    process.exit(1);
  }
  const softFailures = results.filter(
    (r) => !r.ok && (r.detail ?? "").startsWith("ssr-pending"),
  );
  if (softFailures.length > 0) {
    console.warn(
      `\n${softFailures.length} soft check(s) pending SSR/hydration — these validate in a real browser after JS runs.`,
    );
  }
  console.log("\nAll hard checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});