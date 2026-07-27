export type SeoPackageSlug = "bullets" | "boom" | "bombs";

export type SeoPackage = {
  slug: SeoPackageSlug;
  name: string;
  icon: string;
  tagline: string;
  price: number;
  featured?: boolean;
  summary: string;
  bestFor: string[];
  deliverables: number; // total link placements
  timelineDays: number;
  revisions: number;
  linkBuilding: string[];
  iam: string[];
  tier2: string[];
  timeline: { day: string; step: string }[];
};

export const SEO_PACKAGES: SeoPackage[] = [
  {
    slug: "bullets",
    name: "Bullets",
    icon: "🔫",
    tagline: "Entry-Level Authority",
    price: 85,
    summary:
      "The starter volley. Ideal for a single target URL that needs a clean, diversified authority push and a foothold on the IAM network.",
    bestFor: [
      "Brand-new websites building a first authority layer",
      "Single service pages targeting 1–3 keywords",
      "Local contractors under 100K population cities",
      "Agencies testing IAM quality before scaling up",
    ],
    deliverables: 83,
    timelineDays: 14,
    revisions: 1,
    linkBuilding: [
      "2 mini blog / satellite posts",
      "10 high DA web 2.0 properties",
      "10 article submissions",
      "5 forum article posts",
      "20 high DA trusted profiles",
      "10 wiki media submissions",
      "10 high DA bookmarks",
      "10 niche blog comments",
      "5 Quora answers",
      "1 Google News PR",
    ],
    iam: [
      "1 IAM industry vertical placement (your niche)",
      "industryarmymarketing.com mention",
    ],
    tier2: [
      "Blog comment link juice",
      "Bookmark link juice",
      "Instant link indexer",
      "Drip feed pinging",
    ],
    timeline: [
      { day: "Day 1", step: "Order confirmed. Target URL + 3–5 keywords locked in." },
      { day: "Day 2–4", step: "Original 500+ word articles written for satellite posts and Web 2.0s." },
      { day: "Day 5–9", step: "Web 2.0s, articles, forums, profiles, bookmarks, and wiki placements deployed." },
      { day: "Day 10–12", step: "IAM industry vertical placement + Google News PR go live." },
      { day: "Day 13–14", step: "Tier 2 drip fires. Full link report delivered." },
    ],
  },
  {
    slug: "boom",
    name: "Boom",
    icon: "💥",
    tagline: "Mid-Tier Authority",
    price: 285,
    featured: true,
    summary:
      "The workhorse package. Real editorial placements, EDU/GOV profiles, PBN posts, and 4 IAM network domains — enough to move rankings on competitive terms.",
    bestFor: [
      "Established sites pushing into competitive terms",
      "Multi-page campaigns (2–5 URLs)",
      "Cities 100K–1M population",
      "Agencies running monthly recurring authority",
    ],
    deliverables: 168,
    timelineDays: 14,
    revisions: 2,
    linkBuilding: [
      "4 mini blog / satellite posts",
      "20 high DA web 2.0 properties",
      "20 article submissions",
      "10 forum article posts",
      "30 high DA trusted profiles",
      "15 wiki media submissions",
      "20 high DA bookmarks",
      "7 EDU / GOV profiles",
      "15 niche blog comments",
      "10 Quora answers",
      "10 crowd marketing links",
      "1 EDU blog post",
      "1 Apsense post",
      "1 Briefingwire PR post",
      "1 general niche post DA 60+",
      "1 niche PBN post DA 50+",
      "1 Techbullion post",
    ],
    iam: [
      "3 IAM industry verticals (your niche + 2 related)",
      "industryarmymarketing.com post",
      "1 IAM .io domain placement",
      "1 IAM .tv or .ltd domain placement",
    ],
    tier2: [
      "Full Tier 2 link juice package",
      "Social network profiles",
      "Static links",
      "Referrer links",
      "Instant link indexer",
      "Drip feed pinging 30 days",
    ],
    timeline: [
      { day: "Day 1", step: "Order confirmed. Target URLs, keyword clusters, and anchor mix approved." },
      { day: "Day 2–5", step: "Original editorial content drafted for PBN, EDU, Techbullion, and Apsense placements." },
      { day: "Day 6–9", step: "Web 2.0s, articles, forums, EDU/GOV profiles, wiki, and bookmarks deployed." },
      { day: "Day 10–12", step: "3 IAM verticals + .io + .tv/.ltd placements go live. Briefingwire PR fires." },
      { day: "Day 13–14", step: "Tier 2 drip starts (30 days). Link report delivered." },
    ],
  },
  {
    slug: "bombs",
    name: "Bombs",
    icon: "💣",
    tagline: "Full Arsenal",
    price: 585,
    summary:
      "Everything in Boom, doubled. Six IAM verticals, .io + .tv/.ltd + .com placements, and a weddings.io or roofers.io anchor when your niche matches. Reserved for real assaults.",
    bestFor: [
      "Category-killer launches and rebrands",
      "Sites targeting national or metro >1M keywords",
      "New product/service line pushes",
      "Agencies delivering a full-arsenal quarterly campaign",
    ],
    deliverables: 372,
    timelineDays: 14,
    revisions: 3,
    linkBuilding: [
      "8 mini blog / satellite posts",
      "40 high DA web 2.0 properties",
      "40 article submissions",
      "20 forum article posts",
      "50 high DA trusted profiles",
      "25 wiki media submissions",
      "30 high DA bookmarks",
      "15 EDU / GOV profiles",
      "25 niche blog comments",
      "20 Quora answers",
      "20 crowd marketing links",
      "2 EDU blog posts",
      "2 Apsense posts",
      "2 Briefingwire PR posts",
      "2 general niche posts DA 60+",
      "2 niche PBN posts DA 50+",
      "2 Techbullion posts",
      "1 Google News wire PR",
    ],
    iam: [
      "6 IAM industry verticals across the network",
      "industryarmymarketing.com featured post",
      "2 IAM .io domain placements",
      "2 IAM .tv or .ltd domain placements",
      "1 IAM .com placement (loveourlistings / plowwow / buildershaus)",
      "weddings.io or roofers.io anchor placement (niche dependent)",
    ],
    tier2: [
      "Full Tier 2 link juice package doubled",
      "60-day drip feed pinging",
      "Instant indexer — all links",
      "Referrer + static link amplification",
    ],
    timeline: [
      { day: "Day 1", step: "Strategy call. Multi-page targets, anchor mix, IAM vertical selection locked in." },
      { day: "Day 2–6", step: "Editorial content for 8 satellite posts, EDU posts, Techbullion, PBN, and IAM features drafted." },
      { day: "Day 7–10", step: "Full deployment: Web 2.0s, articles, forums, EDU/GOV, wiki, bookmarks." },
      { day: "Day 11–13", step: "6 IAM verticals + 2 .io + 2 .tv/.ltd + .com + niche anchor placements go live." },
      { day: "Day 14", step: "Google News wire PR fires. 60-day Tier 2 drip begins. Full report delivered." },
    ],
  },
];

export function recommendPackage(input: {
  budget: number;
  competition: "low" | "medium" | "high";
  targetUrls: number;
  cityPopulation: number;
}): SeoPackageSlug {
  const { budget, competition, targetUrls, cityPopulation } = input;

  // Score each package
  let score = { bullets: 0, boom: 0, bombs: 0 };

  if (budget >= 585) score.bombs += 3;
  else if (budget >= 285) score.boom += 3;
  else score.bullets += 3;

  if (competition === "high") score.bombs += 2;
  else if (competition === "medium") score.boom += 2;
  else score.bullets += 2;

  if (targetUrls >= 5) score.bombs += 2;
  else if (targetUrls >= 2) score.boom += 2;
  else score.bullets += 1;

  if (cityPopulation >= 1_000_000) score.bombs += 2;
  else if (cityPopulation >= 100_000) score.boom += 2;
  else score.bullets += 1;

  // Never recommend above budget
  if (budget < 285) return "bullets";
  if (budget < 585) {
    return score.boom >= score.bullets ? "boom" : "bullets";
  }
  const max = Math.max(score.bullets, score.boom, score.bombs);
  if (score.bombs === max) return "bombs";
  if (score.boom === max) return "boom";
  return "bullets";
}