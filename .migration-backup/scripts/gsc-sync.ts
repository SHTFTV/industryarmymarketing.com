// Search Console sync: (1) submit the current sitemap.xml, (2) re-check
// indexing status for the homepage and /blog after the legacy-redirects
// route table ships. Runs against the connector gateway so no OAuth
// dance is needed — the workspace's Google Search Console connection
// supplies the token via X-Connection-Api-Key.
//
// Env vars (auto-provisioned when the GSC connector is linked):
//   LOVABLE_API_KEY               — gateway auth
//   GOOGLE_SEARCH_CONSOLE_API_KEY — forwarded to Google as OAuth token
//
// Usage:
//   bunx tsx scripts/gsc-sync.ts
//   bunx tsx scripts/gsc-sync.ts --site https://industryarmymarketing.com/

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const LOVABLE_KEY = process.env.LOVABLE_API_KEY;
const GSC_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

if (!LOVABLE_KEY || !GSC_KEY) {
  console.error(
    "gsc-sync: missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY. Link the Google Search Console connector first.",
  );
  process.exit(2);
}

const args = process.argv.slice(2);
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const SITE = arg("--site", "https://industryarmymarketing.com/")!;
// Google requires the sitemap URL to live on the same host as the
// verified property. Derive the default sitemap from SITE so a
// www vs. non-www mismatch does not trigger a 400.
const defaultSitemap = new URL("/sitemap.xml", SITE).toString();
const SITEMAP = arg("--sitemap", defaultSitemap)!;
// Inspection URLs must live under the verified property (SITE).
const inspectBase = SITE.replace(/\/$/, "");
const INSPECT_URLS = [`${inspectBase}/`, `${inspectBase}/blog`];

const authHeaders = {
  Authorization: `Bearer ${LOVABLE_KEY}`,
  "X-Connection-Api-Key": GSC_KEY,
};

async function submitSitemap() {
  const encodedSite = encodeURIComponent(SITE);
  const encodedSitemap = encodeURIComponent(SITEMAP);
  const url = `${GATEWAY}/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`;
  const res = await fetch(url, { method: "PUT", headers: authHeaders });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`submit sitemap failed [${res.status}]: ${body}`);
  }
  console.log(`✓ submitted sitemap: ${SITEMAP}`);
}

type InspectionResult = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      lastCrawlTime?: string;
      googleCanonical?: string;
      userCanonical?: string;
    };
  };
};

async function inspect(u: string) {
  const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: u, siteUrl: SITE }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`✗ inspect ${u} [${res.status}]: ${body}`);
    return;
  }
  const parsed = JSON.parse(body) as InspectionResult;
  const s = parsed.inspectionResult?.indexStatusResult ?? {};
  console.log(
    `→ ${u}\n    verdict:        ${s.verdict ?? "?"}\n    coverage:       ${s.coverageState ?? "?"}\n    lastCrawl:      ${s.lastCrawlTime ?? "?"}\n    googleCanonical:${s.googleCanonical ?? "?"}\n    userCanonical:  ${s.userCanonical ?? "?"}`,
  );
}

async function main() {
  await submitSitemap();
  for (const u of INSPECT_URLS) await inspect(u);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});