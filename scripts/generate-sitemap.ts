// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { fetchPublishedBlogPosts } from "./lib/blog-source";
const BASE_URL = "https://industryarmymarketing.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const cities = ["vancouver", "surrey", "calgary", "edmonton", "toronto", "kelowna"];
const localCities = ["vancouver", "surrey", "langley"];
const niches = ["steel-stud", "mining-logistics"];
const contractorRoutes = readdirSync(resolve("src/data/contractors"))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.replace(/\.ts$/, ""))
  .map((name) => name.split("__"))
  .filter((parts): parts is [string, string] => parts.length === 2 && parts.every(Boolean))
  .map(([trade, city]) => `/contractors/${trade}/${city}`)
  .sort();

// Auto-derived from src/data/blogPosts.ts so new posts appear in the
// sitemap the next time predev/prebuild runs — no manual edits needed.
// We regex-parse instead of importing to avoid tsx choking on the .jpg
// asset imports that file uses through Vite's asset pipeline.
const blogPostsSource = readFileSync(
  resolve("src/data/blogPosts.ts"),
  "utf8",
);
let blogSlugs = Array.from(
  blogPostsSource.matchAll(/^\s*["']?slug["']?\s*:\s*["']([a-z0-9-]+)["']/gm),
  (m) => m[1],
);
if (blogSlugs.length === 0) {
  throw new Error("generate-sitemap: no blog slugs parsed from blogPosts.ts");
}

// Extract each post's `publishedAt` (ISO) so we can order sitemap entries
// newest-first, matching the RSS feed's ordering. This keeps the two
// surfaces byte-for-byte consistent for crawlers and prevents drift
// caught by src/test/blog-rss-sitemap-order.test.ts.
const blogPublishedAt: Record<string, string> = {};
for (const slug of blogSlugs) {
  const slugIdx = blogPostsSource.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) continue;
  const window = blogPostsSource.slice(slugIdx, slugIdx + 6000);
  const m = window.match(/"publishedAt"\s*:\s*"([^"]+)"/);
  if (m) blogPublishedAt[slug] = m[1];
}

// DB overlay is additive. Static blogPosts.ts remains the source of truth for
// shipped posts because those articles are already in the bundle and must stay
// discoverable even if the DB migration lags behind. Admin-created DB-only
// published posts are appended without filtering out static slugs.
const dbRows = await fetchPublishedBlogPosts();
if (dbRows) {
  const staticSlugSet = new Set(blogSlugs);
  for (const row of dbRows) {
    if (!staticSlugSet.has(row.slug)) blogSlugs.push(row.slug);
    if (!blogPublishedAt[row.slug]) blogPublishedAt[row.slug] = row.published_at;
  }
  console.log(`[sitemap] DB overlay applied (additive): ${blogSlugs.length} discoverable posts`);
} else {
  console.log(`[sitemap] DB overlay unavailable — using static blogPosts.ts`);
}

blogSlugs.sort((a, b) => {
  const ta = blogPublishedAt[a] ? Date.parse(blogPublishedAt[a]) : 0;
  const tb = blogPublishedAt[b] ? Date.parse(blogPublishedAt[b]) : 0;
  return tb - ta;
});

// Parse each blog post's human-readable `date: "Month YYYY"` and derive a
// YYYY-MM-01 lastmod for the sitemap, mirroring the exact derivation used
// by src/pages/BlogPost.tsx for the BlogPosting JSON-LD `dateModified` so
// crawlers see identical values in both surfaces.
const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};
const blogLastmod: Record<string, string> = {};
for (const slug of blogSlugs) {
  const slugIdx = blogPostsSource.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) continue;
  const window = blogPostsSource.slice(slugIdx, slugIdx + 4000);
  const m = window.match(/"date"\s*:\s*"([A-Za-z]+)\s+(\d{4})"/);
  if (!m) continue;
  const mm = MONTHS[m[1]];
  if (!mm) continue;
  blogLastmod[`/blog/${slug}`] = `${m[2]}-${mm}-01`;
}

for (const slug of blogSlugs) {
  const path = `/blog/${slug}`;
  if (!blogLastmod[path] && blogPublishedAt[slug]) {
    blogLastmod[path] = blogPublishedAt[slug].slice(0, 10);
  }
}

// Static HTML case-study / long-form pages are listed individually in
// `entries` below (they need custom priorities + image tags).

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.7" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/contractors", changefreq: "monthly", priority: "0.8" },
  { path: "/service-professionals", changefreq: "monthly", priority: "0.8" },
  { path: "/backlinks", changefreq: "monthly", priority: "0.8" },
  { path: "/dofollow-backlinks", changefreq: "weekly", priority: "0.7" },
  { path: "/guest-post", changefreq: "weekly", priority: "0.8" },
  { path: "/industries", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/scan-wizard", changefreq: "monthly", priority: "0.9" },
  { path: "/network", changefreq: "monthly", priority: "0.8" },
  { path: "/eyespyr", changefreq: "monthly", priority: "0.8" },
  { path: "/builder", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/investors", changefreq: "monthly", priority: "0.5" },
  { path: "/dashboard", changefreq: "monthly", priority: "0.5" },
  { path: "/legal", changefreq: "monthly", priority: "0.5" },
  { path: "/seo-packages", changefreq: "weekly", priority: "0.9" },
  { path: "/seo-packages/bullets", changefreq: "monthly", priority: "0.8" },
  { path: "/seo-packages/boom", changefreq: "monthly", priority: "0.8" },
  { path: "/seo-packages/bombs", changefreq: "monthly", priority: "0.8" },
  { path: "/services/lead-generation", changefreq: "monthly", priority: "0.9" },
  { path: "/services/web-development", changefreq: "monthly", priority: "0.9" },
  { path: "/services/social-media", changefreq: "monthly", priority: "0.9" },
  { path: "/services/affordable-seo", changefreq: "monthly", priority: "0.9" },
  { path: "/services/dofollow-backlinks", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/aiweddings-tower-on-our-land", changefreq: "monthly", priority: "0.8" },
  { path: "/blog/iam-perspective-committed-people-not-capital", changefreq: "monthly", priority: "0.8" },
  ...niches.map((n) => ({ path: `/niches/${n}`, changefreq: "monthly" as const, priority: "0.7" })),
  ...localCities.map((c) => ({ path: `/local/${c}`, changefreq: "monthly" as const, priority: "0.7" })),
  ...cities.map((c) => ({
    path: `/cities/${c}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  ...contractorRoutes.map((path) => ({
    path,
    changefreq: "monthly" as const,
    priority: "0.6",
  })),
  ...blogSlugs.map((s) => ({
    path: `/blog/${s}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
];

const serviceImages: Record<string, { loc: string; caption: string; title: string }> = {
  "/services/lead-generation": {
    loc: `${BASE_URL}/__l5e/assets-v1/0307501f-9361-47d3-a234-fb01b87a65af/lead-generation-hero.jpg`,
    caption: "Lead generation pipeline — glowing network of leads converging into a contractor's inbox",
    title: "Lead Generation for Contractors — Industry Army Marketing",
  },
  "/services/web-development": {
    loc: `${BASE_URL}/__l5e/assets-v1/a7d18561-ff63-45c9-ad07-708a6514a20d/web-development-hero.jpg`,
    caption: "Modern high-performance contractor website on a laptop with a Lighthouse 100 score",
    title: "Web Development for Contractors — Industry Army Marketing",
  },
  "/services/social-media": {
    loc: `${BASE_URL}/__l5e/assets-v1/1cf5b1ea-f7e7-40fc-9856-d2837ca3386a/social-media-hero.jpg`,
    caption: "TALC.tv broadcast tower fanning signals to ten social platforms",
    title: "Social Media Syndication via TALC.tv — Industry Army Marketing",
  },
  "/services/affordable-seo": {
    loc: `${BASE_URL}/__l5e/assets-v1/0ed29c46-022d-45ba-87b6-9c1237593ff9/affordable-seo-hero.jpg`,
    caption: "A glowing $10 chip on a vault pedestal surrounded by elite ranking insignia",
    title: "Affordable SEO — $10 Business Listings and Power-Partner Slots",
  },
  "/services/dofollow-backlinks": {
    loc: `${BASE_URL}/__l5e/assets-v1/418ee436-136a-4d8f-b26d-e1462d17741c/dofollow-backlinks-hero.jpg`,
    caption: "Neon green dofollow link chains connecting a network of servers to a #1 Google ranking",
    title: "Dofollow Backlinks — $10 Permanent Placements from the IAM 350+ Network",
  },
};

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      blogLastmod[e.path] ? `    <lastmod>${blogLastmod[e.path]}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      serviceImages[e.path]
        ? `    <image:image>\n      <image:loc>${serviceImages[e.path].loc}</image:loc>\n      <image:caption>${serviceImages[e.path].caption}</image:caption>\n      <image:title>${serviceImages[e.path].title}</image:title>\n    </image:image>`
        : e.path === "/blog/brand-defense-global-territory"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/02af8a33-6818-4513-9a62-86ecc08b3910/weddings-io-hero.jpg</image:loc>\n      <image:caption>weddings.io WHOIS verification — IAM brand defense</image:caption>\n      <image:title>weddings.io domain WHOIS record — registered May 13 2015 — Industry Army Marketing brand defense case study</image:title>\n    </image:image>`
        : e.path === "/blog/battle-for-the-brand-weddings-io"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/5e8614a6-5da3-4243-b3e9-6f5bad84bd9c/weddings-vs-aiweddings-battle.png</image:loc>\n      <image:caption>weddings.io vs aiweddings.io — The Battle for the Domain Name (IAM case study)</image:caption>\n      <image:title>weddings.io vs aiweddings.io: The Battle for the Domain Name — Industry Army Marketing brand defense case study featured image</image:title>\n    </image:image>`
        : e.path === "/blog/six-figure-land-grab-weddings-io"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/0a5a3168-64b3-409f-a773-56a39f6e04b8/six-figure-land-grab-weddings-io.png</image:loc>\n      <image:caption>Six-figure .io domain land grab — weddings.io category-killer defense vs aiweddings.io and Weddings.io Inc.</image:caption>\n      <image:title>The Six-Figure Land Grab Nobody Planned — weddings.io featured image (Industry Army Marketing)</image:title>\n    </image:image>`
        : e.path === "/blog/formal-complaint-weddings-io-inc"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/049bfe5d-1aba-4b6d-99ba-5e1dd85a298e/weddings-io-formal-complaint.png</image:loc>\n      <image:caption>Formal complaint / Statement of Objection filed with Ontario government against 'Weddings.io Inc.'</image:caption>\n      <image:title>We've Filed a Formal Complaint Regarding 'Weddings.io Inc.' — Industry Army Marketing featured image</image:title>\n    </image:image>`
        : e.path === "/blog/wedding-platform-controversy-domain-dispute-seo"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/6b002842-33da-43fb-a520-93a6d46988ca/weddings-io-seo-command-center.png</image:loc>\n      <image:caption>weddings.io SEO Command Center — organic traffic, keyword rankings, backlinks, domain authority; independent alternative to The Knot and WeddingWire under FTC scrutiny</image:caption>\n      <image:title>Wedding Platform Controversy: How a Domain Dispute Became the Best SEO Campaign We Never Planned — weddings.io featured image</image:title>\n    </image:image>`
        : e.path === "/blog/ai-hallucinations-real-business-problem"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/c39ef7c1-cab8-49e4-92a5-7ce7b04ff28b/ai-hallucinations-go-legal.jpg</image:loc>\n      <image:caption>AI hallucinations go legal — glitching holographic AI ghost being handed a Statement of Objection legal document in a dark courtroom; the legal and regulatory response to AI misattribution of premium .io domain assets</image:caption>\n      <image:title>AI Hallucinations Are a Real Business Problem — featured editorial hero</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/02784f37-7da8-45c9-a41e-f99d2fa389e7/ai-hallucination-who-owns-weddings-io.png</image:loc>\n      <image:caption>AI hallucination — Gemini fabricates a fictional dual-entity corporate structure for weddings.io (BC 'Root Domain' + imaginary Ontario 'AI Platform' division)</image:caption>\n      <image:title>AI Hallucinations Are a Real Business Problem — weddings.io hallucination case study screenshot 1 of 4</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/67050502-6876-4aac-97e6-0521b75652dd/ai-hallucination-brand-confusion.png</image:loc>\n      <image:caption>AI hallucination — Gemini invents a full feature stack (AI Wedding Planner, Vendor Matching, Guest Management, Pro tiers) to justify the fictional corporate structure</image:caption>\n      <image:title>AI Hallucinations Are a Real Business Problem — weddings.io hallucination case study screenshot 2 of 4</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/c538cefd-1924-4999-87b3-1502431ccd05/ai-hallucination-app-store-confusion.png</image:loc>\n      <image:caption>AI hallucination — Gemini warns about 'App Store Confusion' between entities it invented itself</image:caption>\n      <image:title>AI Hallucinations Are a Real Business Problem — weddings.io hallucination case study screenshot 3 of 4</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/bcfaf7d7-e6de-4f6c-8bb0-1e137f54e76b/ai-hallucination-gemini-weddings-io.png</image:loc>\n      <image:caption>AI hallucination — Gemini's initial confident response to the 'weddings.io' prompt with fabricated dual-entity platform</image:caption>\n      <image:title>AI Hallucinations Are a Real Business Problem — weddings.io hallucination case study screenshot 4 of 4</image:title>\n    </image:image>`
        : e.path === "/blog/weddings-io-entity-conflation-case-study"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/c5c5b9c4-d6be-4ad7-b792-0c33cd820b19/weddings-io-entity-conflation.jpg</image:loc>\n      <image:caption>Weddings.io v. aiweddings.io — entity conflation case study featured image. Two distinct entities, one contested category-defining .io domain, Statement of Objection filed under the Ontario Business Names Act.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Case Study Featured Image (Industry Army Marketing)</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/c5cb58a8-efe6-403f-a60c-b9ce2cb0062c/weddings-io-conflation-ai-overview.png</image:loc>\n      <image:caption>Exhibit A — Google AI Overview panel describing 'Weddings.io' as an AI-native wedding planning SaaS platform IAM does not operate. Captured July 4, 2026.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Exhibit A (Google AI Overview)</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/9f380524-f12d-4d82-94e3-ff5d9b790106/weddings-io-conflation-google-maps.png</image:loc>\n      <image:caption>Exhibit B — Google Search + Google Maps knowledge panel rendering an unrelated Toronto storefront under the display heading 'Weddings.IO'. Captured July 4, 2026.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Exhibit B (Google Maps knowledge panel misattribution)</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/64bafdd4-2f45-40bb-b517-ab365bd1e736/weddings-io-conflation-tailored-results.png</image:loc>\n      <image:caption>Exhibit C — Google AI Overview's own explanation of why it surfaced the Ontario Party ahead of the actual .io registrant. Captured July 4, 2026.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Exhibit C (AI Overview self-explanation)</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/5a966e11-ea46-4808-a916-6030577cf40e/weddings-io-conflation-root-domain.png</image:loc>\n      <image:caption>Exhibit D — the correct root-domain answer, returned by the same AI system that produced the incorrect default. Captured July 4, 2026.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Exhibit D (correct root-domain answer)</image:title>\n    </image:image>\n    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/673281f8-99f0-4a09-86c3-1f141ce64b01/weddings-io-conflation-flagged-review.png</image:loc>\n      <image:caption>Exhibit E — AI system acknowledgement, on the record, that the two entities must be architecturally separated with no cross-wired metadata. Captured July 5, 2026.</image:caption>\n      <image:title>Weddings.io Entity Conflation — Exhibit E (flagged for human review)</image:title>\n    </image:image>`
        : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);