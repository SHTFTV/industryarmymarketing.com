// Runs before `vite dev` and `vite build`; writes public/rss.xml from blogPosts.ts.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://industryarmymarketing.com";
const src = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");

// Each post is a JSON-style object literal; pull the fields we need.
const slugs = [...src.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]);
const titles = [...src.matchAll(/"title":\s*"([^"]+)"/g)].map((m) => m[1]);
const descs = [...src.matchAll(/"metaDescription":\s*"([^"]+)"/g)].map((m) => m[1]);
const excerpts = [...src.matchAll(/"excerpt":\s*"([^"]+)"/g)].map((m) => m[1]);
const dates = [...src.matchAll(/"date":\s*"([^"]+)"/g)].map((m) => m[1]);
const categories = [...src.matchAll(/"category":\s*"([^"]+)"/g)].map((m) => m[1]);

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

function toRfc822(date: string): string {
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

const items = slugs
  .map((slug, i) => {
    const link = `${BASE_URL}/blog/${slug}`;
    return [
      `    <item>`,
      `      <title>${esc(titles[i])}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${toRfc822(dates[i])}</pubDate>`,
      `      <category>${esc(categories[i])}</category>`,
      `      <description>${esc(descs[i] || excerpts[i])}</description>`,
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
  items,
  `  </channel>`,
  `</rss>`,
].join("\n");

writeFileSync(resolve("public/rss.xml"), xml);
console.log(`rss.xml written (${slugs.length} items)`);