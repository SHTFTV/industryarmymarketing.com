#!/usr/bin/env node
/**
 * IndexNow ping — submits every blog URL from the freshly built sitemap
 * to Bing, Yandex, Seznam, and Naver in a single API call. No auth token
 * is required beyond the public key file at /{key}.txt.
 *
 * Google does not participate in IndexNow but the other engines pick up
 * new URLs within minutes; the ping is a strong crawl signal that
 * complements Google Search Console submission.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "www.industryarmymarketing.com";
const KEY = "2ca1481140c909a538c26cb669cf6be1";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

function extractBlogUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const url = m[1].trim();
    if (url.includes("/blog/") || url.endsWith("/blog")) urls.push(url);
  }
  return Array.from(new Set(urls));
}

async function main() {
  const sitemapPath = resolve("public/sitemap.xml");
  if (!existsSync(sitemapPath)) {
    console.log("[indexnow] no sitemap.xml, skipping");
    return;
  }
  const xml = readFileSync(sitemapPath, "utf8");
  const urlList = extractBlogUrls(xml);
  if (urlList.length === 0) {
    console.log("[indexnow] no blog URLs to submit");
    return;
  }

  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    console.log(`[indexnow] submitted ${urlList.length} URLs → ${res.status} ${body || "ok"}`);
    // IndexNow returns 200/202 on success; 4xx is a configuration problem.
    // Never fail the build on IndexNow errors — the ping is best-effort.
  } catch (err) {
    console.warn(`[indexnow] ping failed (non-fatal): ${err instanceof Error ? err.message : err}`);
  }
}

main();