// Runs before `vite dev` and `vite build`; writes public/rss.xml from blogPosts.ts.

import { readFileSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fetchPublishedBlogPosts } from "./lib/blog-source";

const BASE_URL = "https://industryarmymarketing.com";
const OG_IMAGE_PATH = "/og-image.jpg";
const OG_IMAGE_URL = `${BASE_URL}${OG_IMAGE_PATH}`;
const OG_IMAGE_BYTES = statSync(resolve(`public${OG_IMAGE_PATH}`)).size;
const src = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");

// Each post is a JSON-style object literal; pull the fields we need.
// Match only top-level post fields (4-space indent), not nested richContent fields.
const grab = (key: string) =>
  [...src.matchAll(new RegExp(`^    "${key}":\\s*"([^"]+)"`, "gm"))].map((m) => m[1]);
const slugs = grab("slug");
const titles = grab("title");
const descs = grab("metaDescription");
const excerpts = grab("excerpt");
const dates = grab("date");
const categories = grab("category");
const slugMatches = [...src.matchAll(/^    "slug":\s*"([^"]+)"/gm)];

if (
  slugs.length !== titles.length ||
  slugs.length !== descs.length ||
  slugs.length !== excerpts.length ||
  slugs.length !== dates.length ||
  slugs.length !== categories.length
) {
  throw new Error(
    `RSS field counts mismatch: slugs=${slugs.length} titles=${titles.length} descs=${descs.length} excerpts=${excerpts.length} dates=${dates.length} cats=${categories.length}`,
  );
}

function publishedAtForPost(index: number): string | undefined {
  const start = slugMatches[index]?.index ?? 0;
  const end = slugMatches[index + 1]?.index ?? src.length;
  return src.slice(start, end).match(/^    "publishedAt":\s*"([^"]+)"/m)?.[1];
}

function sortTime(slug: string, publishedAt: string | undefined): number {
  if (!publishedAt) throw new Error(`RSS: post "${slug}" missing publishedAt.`);
  const t = Date.parse(publishedAt);
  if (!Number.isFinite(t)) {
    throw new Error(`RSS: post "${slug}" has invalid publishedAt "${publishedAt}".`);
  }
  return t;
}

function toRfc822(t: number): string {
  return new Date(t).toUTCString();
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const posts = slugs
  .map((slug, i) => {
    const publishedAt = publishedAtForPost(i);
    return {
      slug,
      title: titles[i],
      description: descs[i] || excerpts[i],
      date: dates[i],
      category: categories[i],
      publishedAt,
      sourceIndex: i,
      sortTime: sortTime(slug, publishedAt),
    };
  })
  .sort((a, b) => b.sortTime - a.sortTime || b.sourceIndex - a.sourceIndex);

// DB overlay is additive. Static blogPosts.ts remains the source of truth for
// shipped posts because those articles must stay discoverable even if the DB
// migration lags behind. Admin-created DB-only published posts are appended.
const dbRows = await fetchPublishedBlogPosts();
let filteredPosts = posts;
if (dbRows) {
  const staticSlugSet = new Set(posts.map((p) => p.slug));
  for (const row of dbRows) {
    if (staticSlugSet.has(row.slug)) continue;
    const d = (row.data ?? {}) as Record<string, unknown>;
    const t = Date.parse(row.published_at);
    if (!Number.isFinite(t)) {
      console.warn(`[rss] Skipping DB-only post with invalid published_at: ${row.slug}`);
      continue;
    }
    filteredPosts.push({
      slug: row.slug,
      title: row.title,
      description: (d.metaDescription as string) || (d.excerpt as string) || row.title,
      date: (d.date as string) || new Date(t).toISOString().slice(0, 10),
      category: (d.category as string) || "Blog",
      publishedAt: row.published_at,
      sourceIndex: filteredPosts.length,
      sortTime: t,
    });
  }
  filteredPosts.sort((a, b) => b.sortTime - a.sortTime || b.sourceIndex - a.sourceIndex);
  console.log(`[rss] DB overlay applied (additive): ${filteredPosts.length} discoverable items`);
} else {
  console.log(`[rss] DB overlay unavailable — using static blogPosts.ts`);
}

const items = filteredPosts
  .map((post) => {
    const link = `${BASE_URL}/blog/${post.slug}`;
    return [
      `    <item>`,
      `      <title>${esc(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${toRfc822(post.sortTime)}</pubDate>`,
      `      <category>${esc(post.category)}</category>`,
      `      <description>${esc(post.description)}</description>`,
      `      <enclosure url="${OG_IMAGE_URL}" length="${OG_IMAGE_BYTES}" type="image/jpeg" />`,
      `    </item>`,
    ].join("\n");
  })
  .join("\n");

const now = new Date().toUTCString();
const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
  `  <channel>`,
  `    <title>Industry Army Marketing — Intel Blog</title>`,
  `    <link>${BASE_URL}/blog</link>`,
  `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
  `    <description>2,000-word guides on exclusive $10 territory marketing for trade contractors and service pros across Canada.</description>`,
  `    <language>en-ca</language>`,
  `    <lastBuildDate>${now}</lastBuildDate>`,
  `    <generator>Industry Army Marketing build pipeline</generator>`,
  `    <image>`,
  `      <url>${OG_IMAGE_URL}</url>`,
  `      <title>Industry Army Marketing — Intel Blog</title>`,
  `      <link>${BASE_URL}/blog</link>`,
  `    </image>`,
  items,
  `  </channel>`,
  `</rss>`,
].join("\n");

writeFileSync(resolve("public/rss.xml"), xml);
console.log(`rss.xml written (${filteredPosts.length} items)`);