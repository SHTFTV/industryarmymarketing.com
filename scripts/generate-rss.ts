// Runs before `vite dev` and `vite build`; writes public/rss.xml from blogPosts.ts.

import { readFileSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";

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

const months: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr",
  May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

const monthIndex: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3,
  May: 4, June: 5, July: 6, August: 7,
  September: 8, October: 9, November: 10, December: 11,
};

function publishedAtForPost(index: number): string | undefined {
  const start = slugMatches[index]?.index ?? 0;
  const end = slugMatches[index + 1]?.index ?? src.length;
  return src.slice(start, end).match(/^    "publishedAt":\s*"([^"]+)"/m)?.[1];
}

function sortTime(date: string, publishedAt?: string): number {
  if (publishedAt) {
    const t = Date.parse(publishedAt);
    if (Number.isFinite(t)) return t;
  }

  const [mName, yStr] = date.split(" ");
  return Date.UTC(Number(yStr) || 1970, monthIndex[mName] ?? 0, 1, 9, 0, 0);
}

function toRfc822(date: string, publishedAt?: string): string {
  if (publishedAt) {
    const t = Date.parse(publishedAt);
    if (Number.isFinite(t)) return new Date(t).toUTCString();
  }

  const [mName, yStr] = date.split(" ");
  const m = months[mName] ?? "Jan";
  const y = yStr ?? new Date().getFullYear().toString();
  return `Mon, 01 ${m} ${y} 09:00:00 +0000`;
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
      sortTime: sortTime(dates[i], publishedAt),
    };
  })
  .sort((a, b) => b.sortTime - a.sortTime || b.sourceIndex - a.sourceIndex);

const items = posts
  .map((post) => {
    const link = `${BASE_URL}/blog/${post.slug}`;
    return [
      `    <item>`,
      `      <title>${esc(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${toRfc822(post.date, post.publishedAt)}</pubDate>`,
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
console.log(`rss.xml written (${slugs.length} items)`);