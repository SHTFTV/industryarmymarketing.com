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
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const HOST = "www.industryarmymarketing.com";
const KEY = "2ca1481140c909a538c26cb669cf6be1";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
// Persistent delta state: URLs we've already submitted successfully.
// Kept out of the build output; committed so subsequent builds can diff.
const STATE_PATH = resolve(".indexnow-state.json");

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
  const allUrls = extractBlogUrls(xml);
  if (allUrls.length === 0) {
    console.log("[indexnow] no blog URLs to submit");
    return;
  }

  // Delta: only URLs not in the last successful run.
  let submitted = new Set();
  let lastRunAt = null;
  if (existsSync(STATE_PATH)) {
    try {
      const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
      submitted = new Set(state.submittedUrls ?? []);
      lastRunAt = state.lastRunAt ?? null;
    } catch (e) {
      console.warn(`[indexnow] state file unreadable, submitting all: ${e.message}`);
    }
  }
  const delta = allUrls.filter((u) => !submitted.has(u));
  if (delta.length === 0) {
    console.log(`[indexnow] no new URLs since ${lastRunAt ?? "first run"} (${allUrls.length} total known)`);
    return;
  }
  console.log(`[indexnow] delta: ${delta.length} new URLs (of ${allUrls.length}) since ${lastRunAt ?? "first run"}`);

  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: delta };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    console.log(`[indexnow] submitted ${delta.length} URLs → ${res.status} ${body || "ok"}`);
    if (res.status >= 200 && res.status < 300) {
      // Only mark as submitted on success; failed deltas will retry next build.
      const merged = new Set([...submitted, ...delta]);
      mkdirSync(dirname(STATE_PATH), { recursive: true });
      writeFileSync(
        STATE_PATH,
        JSON.stringify({
          lastRunAt: new Date().toISOString(),
          submittedUrls: Array.from(merged).sort(),
          lastDelta: delta,
          lastHttpStatus: res.status,
        }, null, 2) + "\n",
      );
    } else {
      console.warn(`[indexnow] non-2xx status; delta not marked as submitted (will retry next build)`);
    }
    // IndexNow returns 200/202 on success; 4xx is a configuration problem.
    // Never fail the build on IndexNow errors — the ping is best-effort.
  } catch (err) {
    console.warn(`[indexnow] ping failed (non-fatal): ${err instanceof Error ? err.message : err}`);
  }
}

main();