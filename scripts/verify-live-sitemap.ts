// Fetches the live sitemap and verifies it contains every expected indexable
// route as an absolute URL under SITE_URL.
//
// Usage: bunx tsx scripts/verify-live-sitemap.ts

const SITE_URL = "https://industryarmymarketing.com";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

const cities = ["vancouver", "surrey", "calgary", "edmonton", "toronto", "kelowna"];

const expectedPaths: string[] = [
  "/",
  "/how-it-works",
  "/pricing",
  "/contractors",
  "/service-professionals",
  "/backlinks",
  "/dofollow-backlinks",
  "/industries",
  "/contact",
  ...cities.map((c) => `/cities/${c}`),
];

async function main() {
  console.log(`Fetching ${SITEMAP_URL} ...`);
  const res = await fetch(SITEMAP_URL, { redirect: "follow" });

  if (!res.ok) {
    console.error(`✗ HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const finalUrl = res.url;
  if (finalUrl !== SITEMAP_URL) {
    console.warn(`⚠ Redirected to ${finalUrl}`);
  }

  const xml = await res.text();
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());

  if (locs.length === 0) {
    console.error("✗ No <loc> entries found in sitemap.");
    process.exit(1);
  }

  console.log(`Found ${locs.length} <loc> entries.\n`);

  const expectedAbsolute = expectedPaths.map((p) => `${SITE_URL}${p === "/" ? "/" : p}`);
  const missing: string[] = [];
  const relative: string[] = [];
  const wrongHost: string[] = [];

  for (const exp of expectedAbsolute) {
    if (!locs.includes(exp)) missing.push(exp);
  }

  for (const loc of locs) {
    if (!/^https?:\/\//i.test(loc)) {
      relative.push(loc);
    } else if (!loc.startsWith(`${SITE_URL}/`) && loc !== SITE_URL) {
      wrongHost.push(loc);
    }
  }

  let ok = true;

  if (missing.length) {
    ok = false;
    console.error(`✗ Missing ${missing.length} expected URL(s):`);
    missing.forEach((u) => console.error(`   - ${u}`));
  } else {
    console.log(`✓ All ${expectedAbsolute.length} expected URLs present.`);
  }

  if (relative.length) {
    ok = false;
    console.error(`✗ ${relative.length} <loc> entries are not absolute URLs:`);
    relative.forEach((u) => console.error(`   - ${u}`));
  } else {
    console.log("✓ All <loc> entries are absolute URLs.");
  }

  if (wrongHost.length) {
    ok = false;
    console.error(`✗ ${wrongHost.length} <loc> entries point to a different host:`);
    wrongHost.forEach((u) => console.error(`   - ${u}`));
  } else {
    console.log(`✓ All <loc> entries use ${SITE_URL}.`);
  }

  const extras = locs.filter((l) => !expectedAbsolute.includes(l));
  if (extras.length) {
    console.log(`\nℹ ${extras.length} extra URL(s) in sitemap (not in expected list):`);
    extras.forEach((u) => console.log(`   - ${u}`));
  }

  console.log();
  if (!ok) {
    console.error("Sitemap verification FAILED.");
    process.exit(1);
  }
  console.log("Sitemap verification PASSED.");
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});