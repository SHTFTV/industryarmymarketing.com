// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import contractorSlugs from "./contractor-slugs.json" with { type: "json" };

const BASE_URL = "https://industryarmymarketing.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const cities = ["vancouver", "surrey", "calgary", "edmonton", "toronto", "kelowna"];
const localCities = ["vancouver", "surrey", "langley"];
const niches = ["steel-stud", "mining-logistics"];
const trades = ["plumbing","roofing","electrical","hvac","framing","demolition","excavation","painting"];

const blogSlugs = [
  "kitchen-cabinets-vancouver",
  "weddings-vancouver",
  "tractors-bc",
  "framers-vancouver",
  "hvacr-vancouver",
  "excavators-bc",
  "painters-vancouver",
  "roofers-vancouver",
  "drywallers-vancouver",
  "plumbers-vancouver",
  "demolition-vancouver",
  "interior-designers-vancouver",
  "backhaul-bc",
  "snow-removal-bc",
  "videographers-vancouver",
  "errands-vancouver",
  "gasfitter-bc",
  "steel-stud-contractors-bc",
  "eyespyr-trust-layer",
  "buildershaus-front-door",
  "healthwealthhome-content-engine",
  "talc-tv-ai-content",
  "aibuildr-geo-engine",
  "financial-advisors-bc",
  "insurance-brokers-bc",
  "fabricators-bc",
  "arborists-bc",
  "rebar-tv-construction-media",
  "sparkys-tv-electricians",
  "jewellers-luxury-retail",
  "promows-lawn-care",
  "dentists-medical-aeo",
  "ten-dollar-territories-explained",
  "chiropractors-vancouver",
  "movers-calgary",
  "landscapers-toronto",
  "hardscapes-kelowna",
];

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
  { path: "/case-studies/brand-defense-global-territory", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/aiweddings-tower-on-our-land", changefreq: "monthly", priority: "0.8" },
  { path: "/contractor-marketing/", changefreq: "weekly", priority: "0.9" },
  ...trades.map((t) => ({
    path: `/contractor-marketing/${t}/`,
    changefreq: "weekly" as const,
    priority: "0.8",
  })),
  ...niches.map((n) => ({ path: `/niches/${n}`, changefreq: "monthly" as const, priority: "0.7" })),
  ...localCities.map((c) => ({ path: `/local/${c}`, changefreq: "monthly" as const, priority: "0.7" })),
  ...cities.map((c) => ({
    path: `/cities/${c}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  ...blogSlugs.map((s) => ({
    path: `/blog/${s}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  ...(contractorSlugs as string[]).map((s) => ({
    path: `/contractor-marketing/${s}/`,
    changefreq: "monthly" as const,
    priority: "0.6",
  })),
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.path === "/case-studies/brand-defense-global-territory"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/02af8a33-6818-4513-9a62-86ecc08b3910/weddings-io-hero.jpg</image:loc>\n      <image:caption>weddings.io WHOIS verification — IAM brand defense</image:caption>\n      <image:title>weddings.io domain WHOIS record — registered May 13 2015 — Industry Army Marketing brand defense case study</image:title>\n    </image:image>`
        : e.path === "/blog/battle-for-the-brand-weddings-io"
        ? `    <image:image>\n      <image:loc>${BASE_URL}/__l5e/assets-v1/5e8614a6-5da3-4243-b3e9-6f5bad84bd9c/weddings-vs-aiweddings-battle.png</image:loc>\n      <image:caption>weddings.io vs aiweddings.io — The Battle for the Domain Name (IAM case study)</image:caption>\n      <image:title>weddings.io vs aiweddings.io: The Battle for the Domain Name — Industry Army Marketing brand defense case study featured image</image:title>\n    </image:image>`
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