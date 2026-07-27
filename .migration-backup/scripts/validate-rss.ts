// Validates public/rss.xml against common RSS 2.0 requirements.
// Surfaces errors during build by exiting non-zero with a clear report.

import { readFileSync } from "fs";
import { resolve } from "path";

const path = resolve("public/rss.xml");
const xml = readFileSync(path, "utf8");
const errors: string[] = [];
const warnings: string[] = [];

function need(re: RegExp, where: string, label: string) {
  if (!re.test(where)) errors.push(`Missing required ${label}`);
}

// ---- Top-level shape
if (!/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>/.test(xml.trim())) {
  errors.push("XML declaration must be <?xml version=\"1.0\" encoding=\"UTF-8\"?>");
}
if (!/<rss[^>]+version="2\.0"/.test(xml)) errors.push("<rss> must declare version=\"2.0\"");
if (!/xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/.test(xml)) {
  warnings.push("Missing xmlns:atom — required for <atom:link rel=\"self\">");
}

// ---- Channel
const channelMatch = xml.match(/<channel>([\s\S]*?)<\/channel>/);
if (!channelMatch) {
  errors.push("Missing <channel>");
} else {
  const channel = channelMatch[1];
  need(/<title>[^<]+<\/title>/, channel, "channel <title>");
  need(/<link>https?:\/\/[^<]+<\/link>/, channel, "channel <link> (absolute URL)");
  need(/<description>[^<]+<\/description>/, channel, "channel <description>");
  need(/<language>[a-z]{2}(-[a-z]{2})?<\/language>/i, channel, "channel <language>");
  need(/<lastBuildDate>[^<]+<\/lastBuildDate>/, channel, "channel <lastBuildDate>");
  need(
    /<atom:link[^>]+rel="self"[^>]+type="application\/rss\+xml"[^>]*\/>/,
    channel,
    "channel <atom:link rel=\"self\">",
  );

  // <image> block
  const imageMatch = channel.match(/<image>([\s\S]*?)<\/image>/);
  if (!imageMatch) {
    errors.push("Missing channel <image> block");
  } else {
    const image = imageMatch[1];
    need(/<url>https?:\/\/[^<]+<\/url>/, image, "image <url>");
    need(/<title>[^<]+<\/title>/, image, "image <title>");
    need(/<link>https?:\/\/[^<]+<\/link>/, image, "image <link>");
  }

  // lastBuildDate RFC-822
  const lbd = channel.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);
  if (lbd && Number.isNaN(Date.parse(lbd[1]))) {
    errors.push(`channel <lastBuildDate> is not a valid RFC-822 date: "${lbd[1]}"`);
  }

  // ---- Items
  const items = [...channel.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (items.length === 0) errors.push("Feed contains zero <item> entries");

  const guids = new Set<string>();
  items.forEach((item, idx) => {
    const where = `item[${idx}]`;
    const title = item.match(/<title>([^<]+)<\/title>/);
    if (!title) errors.push(`${where}: missing <title>`);
    const link = item.match(/<link>(https?:\/\/[^<]+)<\/link>/);
    if (!link) errors.push(`${where}: missing absolute <link>`);
    const desc = item.match(/<description>([\s\S]*?)<\/description>/);
    if (!desc) errors.push(`${where}: missing <description>`);

    // GUID
    const guid = item.match(/<guid(?:\s+isPermaLink="(true|false)")?>([^<]+)<\/guid>/);
    if (!guid) {
      errors.push(`${where}: missing <guid>`);
    } else {
      const value = guid[2];
      if (guids.has(value)) errors.push(`${where}: duplicate GUID "${value}"`);
      guids.add(value);
      if (guid[1] === "true" && !/^https?:\/\//.test(value)) {
        errors.push(`${where}: <guid isPermaLink="true"> must be an absolute URL`);
      }
    }

    // pubDate RFC-822
    const pub = item.match(/<pubDate>([^<]+)<\/pubDate>/);
    if (!pub) {
      errors.push(`${where}: missing <pubDate>`);
    } else if (Number.isNaN(Date.parse(pub[1]))) {
      errors.push(`${where}: <pubDate> is not a valid RFC-822 date: "${pub[1]}"`);
    }

    // Enclosure
    const enc = item.match(
      /<enclosure\s+url="(https?:\/\/[^"]+)"\s+length="(\d+)"\s+type="([^"]+)"\s*\/>/,
    );
    if (!enc) {
      errors.push(`${where}: missing or malformed <enclosure url length type />`);
    } else {
      if (Number(enc[2]) <= 0) errors.push(`${where}: enclosure length must be > 0`);
      if (!/^\w+\/[\w.+-]+$/.test(enc[3])) {
        errors.push(`${where}: enclosure type "${enc[3]}" is not a MIME type`);
      }
    }
  });
}

const total = (xml.match(/<item>/g) || []).length;
if (warnings.length) {
  for (const w of warnings) console.warn(`rss.xml warning: ${w}`);
}
if (errors.length) {
  console.error(`\nrss.xml validation FAILED (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`rss.xml validated (${total} items, 0 errors${warnings.length ? `, ${warnings.length} warnings` : ""})`);