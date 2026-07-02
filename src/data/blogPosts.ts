// AUTO-GENERATED. Edit /tmp/gen-posts.mjs and regen if you need to change content shape.
import kitchencabinetsImg from "@/assets/blog/kitchen-cabinets.jpg";
import weddingsImg from "@/assets/blog/weddings.jpg";
import weddingsGlobalAsset from "@/assets/blog/weddings-global.jpg.asset.json";
const weddingsGlobalImg = weddingsGlobalAsset.url;
import tractorsImg from "@/assets/blog/tractors.jpg";
import framersImg from "@/assets/blog/framers.jpg";
import hvacrImg from "@/assets/blog/hvacr.jpg";
import excavatorsImg from "@/assets/blog/excavators.jpg";
import paintersImg from "@/assets/blog/painters.jpg";
import roofersImg from "@/assets/blog/roofers.jpg";
import drywallersImg from "@/assets/blog/drywallers.jpg";
import plumbersImg from "@/assets/blog/plumbers.jpg";
import demolitionImg from "@/assets/blog/demolition.jpg";
import interiorDesignersImg from "@/assets/blog/interior-designers.jpg";
import backhaulImg from "@/assets/blog/backhaul.jpg";
import snowRemovalImg from "@/assets/blog/snow-removal.jpg";
import videographersImg from "@/assets/blog/videographers.jpg";
import errandsImg from "@/assets/blog/errands.jpg";
import tenDollarImg from "@/assets/blog/ten-dollar.jpg";
import chiropractorsImg from "@/assets/blog/chiropractors.jpg";
import moverImg from "@/assets/blog/mover.jpg";
import landscapersImg from "@/assets/blog/landscapers.jpg";
import hardscapesImg from "@/assets/blog/hardscapes.jpg";
import weddingsBattleAsset from "@/assets/blog/weddings-vs-aiweddings-battle.png.asset.json";
const weddingsBattleImg = weddingsBattleAsset.url;
import weddingsFormalComplaintAsset from "@/assets/blog/weddings-io-formal-complaint.png.asset.json";
const weddingsFormalComplaintImg = weddingsFormalComplaintAsset.url;

const IMG: Record<string, string> = {
  "kitchen-cabinets": kitchencabinetsImg,
  weddings: weddingsImg,
  "weddings-global": weddingsGlobalImg,
  "weddings-battle": weddingsBattleImg,
  tractors: tractorsImg,
  framers: framersImg,
  hvacr: hvacrImg,
  excavators: excavatorsImg,
  painters: paintersImg,
  roofers: roofersImg,
  drywallers: drywallersImg,
  plumbers: plumbersImg,
  demolition: demolitionImg,
  "interior-designers": interiorDesignersImg,
  backhaul: backhaulImg,
  "snow-removal": snowRemovalImg,
  videographers: videographersImg,
  errands: errandsImg,
  "ten-dollar": tenDollarImg,
  chiropractors: chiropractorsImg,
  mover: moverImg,
  landscapers: landscapersImg,
  hardscapes: hardscapesImg,
  "weddings-formal-complaint": weddingsFormalComplaintImg,
};

export interface BlogPost {
  slug: string;
  brand: string;
  trade: string;
  tradeShort: string;
  plural: string;
  video: string | null;
  imageKey: string;
  image: string;
  city: string;
  province: string;
  category: string;
  date: string;
  excerpt: string;
  title: string;
  metaDescription: string;
  pain: string;
  detail: string;
  process: string;
  faqs: { q: string; a: string }[];
  /** Optional override for the homepage carousel card title.
   *  Use when "{trade} in {city}" would not read naturally. */
  cardTitle?: string;
  /** Optional override alt/title text for the hero image. */
  imageAlt?: string;
  /** Optional Person author override. When set, BlogPost JSON-LD emits
   *  a Person author alongside the Organization publisher. */
  authorName?: string;
  /** Optional rich case-study content. When set, BlogPost.tsx renders this
   *  instead of the generated default sections. Supports embedded images,
   *  timelines, footnote references (use `[^id]` in paragraph text), and
   *  a sources list. Designed to be reusable for any future article. */
  richContent?: BlogRichContent;
}

export interface BlogRichSection {
  heading: string;
  paragraphs: string[];
  image?: { src: string; alt: string; caption?: string; href?: string };
}

export interface BlogTimelineEntry {
  date: string;
  title: string;
  body: string;
}

export interface BlogFootnote {
  id: string;
  text: string;
  href?: string;
}

export interface BlogSource {
  label: string;
  href: string;
}

export interface BlogRichContent {
  intro?: string;
  sections: BlogRichSection[];
  timeline?: BlogTimelineEntry[];
  footnotes?: BlogFootnote[];
  sources?: BlogSource[];
}

export const blogPosts: BlogPost[] = [
  {
    "slug": "contractor-marketing-disruptor",
    "brand": "industryarmymarketing.com",
    "trade": "Contractor Marketing",
    "tradeShort": "contractor marketing",
    "plural": "contractors",
    "video": null,
    "imageKey": "ten-dollar",
    "city": "Canada",
    "province": "BC",
    "category": "Company",
    "date": "June 2026",
    "title": "How Industry Army Marketing Is Disrupting Contractor Marketing — One Industry at a Time",
    "metaDescription": "How IAM built territory-locked contractor marketing across every trade. One pricing formula. One verification system. One content engine. The 250 Scale explained.",
    "excerpt": "HomeAdvisor sells the same lead to six contractors. Angi charges $300 for a quote that converts 20% of the time. Yelp bills monthly whether you win or not. Industry Army Marketing was built to end all three…",
    "pain": "HomeAdvisor sells the same lead to six contractors simultaneously. Angi charges $300 for a quote that converts 20% of the time. Yelp charges monthly whether you win or not. Industry Army Marketing was built to end all three — one industry at a time.",
    "detail": "IAM is a network of premium trade domains running on one infrastructure: The 250 Scale pricing formula, EyeSpyR verification, and the TALC.tv content engine. Every trade gets the same model — one operator per metro, $10 a month, territory locked, no bid wars.",
    "process": "Pick your trade domain (roofers.io, plumbers.ltd, sparkys.tv, hvacr.tv, mover.ltd, promows.ca and 50+ more). Pick your city. Lock the territory. EyeSpyR verifies your credentials inside 24 hours. TALC.tv publishes your first SEO post the same week. You own the search result for that trade in that city until you cancel.",
    "faqs": [
      { "q": "What is The 250 Scale?", "a": "IAM's universal pricing formula: $10 per slot per month, with slot counts scaled by city population. Vancouver gets 7 slots, Toronto gets 10, Kelowna gets 3. One operator per slot. Same math everywhere." },
      { "q": "Why one operator per city?", "a": "Exclusivity is the product. Bid wars destroy margins and homeowners. Territory locks protect both — you get the call, they get a verified specialist instead of a five-way quote race." },
      { "q": "What replaces HomeAdvisor, Angi, and Yelp here?", "a": "A premium category domain you rank on, EyeSpyR verification that builds trust automatically, and TALC.tv content that keeps your listing climbing. No shared leads, no per-lead fees, no monthly extortion." },
      { "q": "Which trades are live?", "a": "Roofing, plumbing, electrical, HVAC, drywall, painting, framing, excavation, demolition, remodeling, moving, landscaping, hardscaping, snow removal, arborists, kitchen cabinets, and growing weekly." },
      { "q": "How fast can I launch?", "a": "Same week. Lock the territory, EyeSpyR verifies in 24 hours, your first TALC.tv post publishes within 5 business days." },
      { "q": "Where do I see the full pricing?", "a": "All IAM platform pricing follows The 250 Scale — industryarmymarketing.com/pricing." }
    ]
  },
  {
    "slug": "buildershaus-every-trade-one-platform",
    "brand": "buildershaus.com",
    "trade": "BuildersHaus Network",
    "tradeShort": "builder",
    "plural": "builders",
    "video": null,
    "imageKey": "framers",
    "city": "Canada",
    "province": "BC",
    "category": "Company",
    "date": "June 2026",
    "title": "BuildersHaus: The IAM Hub for Every Trade and Service Sector",
    "metaDescription": "BuildersHaus is the IAM hub for every construction trade. Same 250 Scale pricing. Same EyeSpyR verification. Same TALC.tv content engine. Roofing, plumbing, electrical, HVAC and more.",
    "excerpt": "One infrastructure. One pricing formula. One verification engine. One content system. Deployed across every trade and service sector through BuildersHaus — the IAM hub for construction professionals…",
    "pain": "Most contractors juggle five platforms — a website, a directory listing, a review tool, a lead-gen subscription, and a social scheduler — and none of them talk to each other. BuildersHaus collapses all of it into a single territory-locked listing.",
    "detail": "BuildersHaus is the umbrella hub for every IAM construction domain. Roofers.io, plumbers.ltd, sparkys.tv, hvacr.tv, drywallers.io, painters.tv, framers.io, excavators.tv, rebar.tv, demolition.io, remodelers.io, finishingcarpenters.com and more — every trade plugs into the same backbone.",
    "process": "Pick a trade. Pick a city. The 250 Scale sets the price. EyeSpyR verifies licence, WCB, and insurance. TALC.tv publishes weekly SEO content from one job photo. Leads land in your WhatsApp inside 60 seconds. One operator per trade per metro.",
    "faqs": [
      { "q": "What does BuildersHaus give me that a website doesn't?", "a": "Category domain authority. A standalone .com nobody searches for ranks nowhere. A territory listing on roofers.io or plumbers.ltd inherits 20+ years of topical signal." },
      { "q": "Can I lock more than one trade?", "a": "Yes — many GCs hold roofing, framing, and remodeling in the same metro. Each trade is its own $10 slot under The 250 Scale." },
      { "q": "Does BuildersHaus replace my Google Business Profile?", "a": "No, it complements it. Your IAM listing links to and feeds your GBP with TALC.tv posts, photos, and EyeSpyR-verified citations." },
      { "q": "Is there a long-term contract?", "a": "Never. Month to month. Cancel anytime. The territory unlocks for the next operator the day you cancel." },
      { "q": "What service sectors are covered beyond construction?", "a": "Moving, landscaping, hardscaping, snow removal, arborists, kitchen cabinets, custom fabrication and growing. The model is sector-agnostic." },
      { "q": "Where is the master pricing?", "a": "All IAM platform pricing follows The 250 Scale — industryarmymarketing.com/pricing." }
    ]
  },
  {
    "slug": "battle-for-the-brand-weddings-io",
    "brand": "weddings.io",
    "trade": "Brand Defense",
    "cardTitle": "The Battle For the Brand: Weddings.io",
    "tradeShort": "wedding",
    "plural": "wedding planners",
    "video": null,
    "imageKey": "weddings-battle",
    "imageAlt": "weddings.io vs aiweddings.io — The Battle for the Domain Name: Industry Army Marketing's 2015-registered weddings.io case study versus the 2024 aiweddings.io AI-wrapper challenger",
    "city": "Global",
    "province": "BC",
    "category": "Company",
    "date": "June 2026",
    "title": "Battle for the Brand: weddings.io Formal Complaint Letter Against aiweddings.io",
    "metaDescription": "Read the weddings.io formal complaint letter against aiweddings.io, with WHOIS records, Wayback proof, and the full brand-defense timeline.",
    "authorName": "Colin Hamilton",
    "excerpt": "The formal complaint letter against aiweddings.io is now part of the public weddings.io brand-defense record, backed by WHOIS records, Wayback captures, and the full timeline from 2015 to today.",
    "pain": "The wedding industry is a $300B global category dominated by directory middlemen who rent your traffic and sell the same lead to six planners. Couples can't tell who's verified, planners can't tell which leads are real, and the category-defining .io domain sat unclaimed by every legacy player until 2015. When we registered weddings.io, the battle for the brand began that day — and it hasn't stopped since.",
    "detail": "The full origin story plus the operating model: registered May 13, 2015, 78 Wayback captures since, 9 cultures (South Asian, Persian, Chinese, Italian, Jewish, Christian, Hindu, Sikh, secular), 1,018 cities, 24 countries, EyeSpyR-verified vendors, TALC.tv content, WhatsApp lead routing, and one defended .io domain — priced flat at $10 per slot per month on The 250 Scale.",
    "process": "Read below for WHOIS exhibits, Wayback Machine screenshots, footnotes, and source links across four eras (2015 registration, 2016–2023 quiet build, 2024 copycat wave, 2025–2026 AI-enabled relaunch), then lock your city — 3 to 10 verified-planner slots per metro, $10 each, flat.",
    "faqs": [
      { "q": "When was weddings.io registered?", "a": "May 13, 2015. ICANN WHOIS confirms continuous ownership through 2027. The Internet Archive Wayback Machine has 78 captures dating to May 17, 2013 (under a prior placeholder), making it one of the oldest continuously-held wedding category domains on the public record." },
      { "q": "Why .io instead of .com for weddings?", "a": "Weddings.com was locked up by a legacy directory in the late 1990s and effectively abandoned as an editorial property. The .io TLD signals modern tech, ranks identically for high-intent search ('weddings + city'), and was uncontested when we filed in 2015." },
      { "q": "What is the 'battle for the brand'?", "a": "Three fronts: defending the trademark against copycats like aiweddings.io, defending search rankings against directory middlemen that rent traffic, and defending each metro's single-planner slot from being diluted by pay-to-play upsells." },
      { "q": "How does this connect to the rest of the IAM network?", "a": "Weddings.io was the prototype. Every IAM playbook — territory locking, EyeSpyR verification, TALC.tv content engine, $10 flat slot pricing — was tested on weddings.io before rolling out to the trade network of gasfitter.ca, plowwow.com, kongtractors.com, and the rest." },
      { "q": "Where are the receipts?", "a": "The full post embeds WHOIS records for weddings.io (2015) and gasfitter.ca (2007), plus Wayback Machine captures for weddings.io (since 2013) and hamiltonhomeservices.com (since 2004). All four are linked back to web.archive.org and CIRA so anyone can re-verify at source." },
      { "q": "Which cultures does weddings.io support?", "a": "Nine: South Asian, Persian, Chinese, Italian, Jewish, Christian, Hindu, Sikh, and secular. Each gets a culturally-specific TALC.tv content track and localized vendor pages." },
      { "q": "How many cities and countries are live?", "a": "1,018 cities across 24 countries — the largest territory map in the IAM network. Slots open in priority metros first, capped at 3 to 10 verified planners per city depending on population." },
      { "q": "How much does a weddings.io territory cost?", "a": "$10 per slot per month, flat. Same 250 Scale as every IAM brand: slot counts step with city population (3 slots at 10k pop, scaling up to enterprise-tier metros). No setup fees, no per-lead pricing, no upsells required." },
      { "q": "What does 'AI-first architecture' mean for a wedding vendor?", "a": "Inquiry triage, content generation, photo tagging, lead routing, and WhatsApp follow-up all run on AI. The vendor spends time at venues and tastings — not in an inbox at midnight." },
      { "q": "How is weddings.io different from The Knot, WeddingWire, or Zola?", "a": "Those are directories: pay-to-play, multi-vendor lead resale, no exclusivity. Weddings.io locks one verified planner per metro slot, never resells the same lead, and is priced flat at $10 — not per click, per lead, or per upsell." },
      { "q": "Where can I see the master pricing chart?", "a": "All IAM platform pricing follows The 250 Scale at industryarmymarketing.com/pricing — same hardcoded matrix used on the territory chart and the free scan wizard." }
    ],
    "richContent": {
      "intro": "This is the public brand-defense record for weddings.io, including the formal complaint letter against aiweddings.io / Weddings.io Inc. filed with the Ontario government. The timeline below documents the 2015 weddings.io registration, years of public archive proof, the aiweddings.io conflict, and the formal Statement of Objection now attached as evidence.",
      "sections": [
        {
          "heading": "July 2026 — Formal Complaint Letter Against aiweddings.io / Weddings.io Inc.",
          "paragraphs": [
            "On July 2, 2026 we filed a formal Statement of Objection with the Ontario Ministry of Public and Business Service Delivery under Section 32 of the Business Names Act, targeting a company operating in Ontario under the registered name 'Weddings.io Inc.' and connected to the aiweddings.io conflict.",
            "For the record: we have owned the weddings.io domain continuously since May 13, 2015. We have no affiliation with 'Weddings.io Inc.' The registration of a business name that mirrors our trademarked domain — nine years after our public, continuous, WHOIS-verifiable ownership began — is the kind of dilution the Business Names Act was written to remedy.",
            "This filing is the escalation of the same defensive doctrine that has protected the brand since 2015: hold publicly, document everything, and use every legitimate legal instrument available when a copycat crosses the line from lookalike domain into registered business impersonation."
          ],
          "image": {
            "src": weddingsFormalComplaintImg,
            "alt": "Formal complaint letter against aiweddings.io and Weddings.io Inc. filed for the weddings.io brand dispute",
            "caption": "Exhibit E — Formal complaint / Statement of Objection filed with the Ontario government under the Business Names Act, July 2026.",
            "href": "/blog/battle-for-the-brand-weddings-io"
          }
        },
        {
          "heading": "May 13, 2015 — the day the brand was claimed",
          "paragraphs": [
            "Weddings.com had been locked up by a legacy directory since the late 1990s and quietly abandoned as an editorial property. Every serious wedding tech operator we spoke to in 2014 assumed the category-defining .com was the only domain worth fighting for. That assumption is exactly why we filed weddings.io instead.[^whois2015]",
            "The .io TLD signalled modern tech, ranked identically for high-intent searches like ‘weddings vancouver’ and ‘weddings toronto’, and — critically — was uncontested. ICANN WHOIS confirms continuous ownership from May 13, 2015 through the current registration period ending 2027. No lapse. No reseller flips. One owner, eleven years.",
            "That single act — picking the right TLD on the right day — is the first chapter of the battle for the brand. Every later attack, every copycat, every directory middleman that tried to dilute the slot, traces back to a decision that was free to make in 2015 and is now impossible to undo."
          ],
          "image": {
            "src": "/blog-assets/proof/weddings-io-whois-2015-registration.png",
            "alt": "ICANN WHOIS record showing weddings.io registered on May 13, 2015 with continuous ownership through 2027",
            "caption": "Exhibit A — ICANN WHOIS for weddings.io. Registered May 13, 2015. Continuous ownership through the 2027 renewal window.",
            "href": "https://www.whois.com/whois/weddings.io"
          }
        },
        {
          "heading": "2016–2023 — the quiet build, captured 78 times by the Internet Archive",
          "paragraphs": [
            "Between 2016 and 2023, weddings.io ran as a deliberately quiet placeholder while the surrounding pieces of the IAM stack — territory locking, EyeSpyR verification, TALC.tv content generation, the $10 flat-slot pricing model — were prototyped on smaller trade domains.[^wayback]",
            "The Internet Archive has 78 separate Wayback Machine captures of weddings.io across that window, with the earliest crawl on May 17, 2013 against the prior placeholder page. That capture history matters: it is the public, third-party proof that the domain was held, actively served, and continuously evolved — not parked.",
            "The quiet years were the work. Nine cultural pilots, 1,018 city pages prepared in the staging environment, and 24 country-level translations were drafted long before launch. None of that ships without a stable domain underneath it. The 2015 registration bought us the runway."
          ],
          "image": {
            "src": "/blog-assets/proof/weddings-io-wayback-machine-78-captures-since-2013.png",
            "alt": "Internet Archive Wayback Machine showing 78 captures of weddings.io dating to 2013",
            "caption": "Exhibit B — Wayback Machine record for weddings.io. 78 captures since May 17, 2013.",
            "href": "https://web.archive.org/web/*/weddings.io"
          }
        },
        {
          "heading": "2024 — the copycat wave (yes, aiweddings.io, we see you)",
          "paragraphs": [
            "Once generative AI made the ‘AI + category’ naming pattern trendy, the copycats arrived. The most aggressive was aiweddings.io — a domain registered nine years after ours, on a brand we had already trademark-defended, trying to ride coattails into a category we had been quietly building since 2015.",
            "We responded with the long version of this argument in a separate post: ‘You Built Your Tower on Our Land.’[^ailand] The short version is simpler. Eleven years of continuous ownership, public WHOIS, 78 Wayback captures, and a documented build pipeline are not erasable by registering a similar string in 2024.",
            "The lesson generalises beyond weddings. Every IAM domain — gasfitter.ca, plowwow.com, kongtractors.com, hamiltonhomeservices.com — was acquired or registered with the same defensive posture: get there first, hold it publicly, document everything."
          ]
        },
        {
          "heading": "The receipts extend across the whole network",
          "paragraphs": [
            "Weddings.io is not the only domain with a paper trail. gasfitter.ca was registered through CIRA in 2007 — an 18-year continuous hold on the category-defining Canadian gasfitting domain.[^gasfitter] Hamiltonhomeservices.com has Wayback captures dating to 2004, making it one of the oldest continuously-indexed home-services properties in the country.[^hamilton]",
            "Both are part of the same defensive doctrine: register the category-defining domain early, hold it through the quiet years, document the hold with third-party public records, and ship the platform on top of it once the technology catches up to the strategy.",
            "When a contractor asks why a $10 listing on gasfitter.ca outperforms a $2,000 custom site on a brand-new domain, the answer is in those Wayback captures. Topical authority compounds over decades, not quarters."
          ],
          "image": {
            "src": "/blog-assets/proof/gasfitter-ca-whois-2007-registration.png",
            "alt": "CIRA WHOIS record showing gasfitter.ca registered in 2007 with 18 years continuous ownership",
            "caption": "Exhibit C — CIRA WHOIS for gasfitter.ca. Registered 2007. 18 years continuous ownership.",
            "href": "https://www.cira.ca/en/whois/"
          }
        },
        {
          "heading": "2025–2026 — the AI-enabled relaunch",
          "paragraphs": [
            "Two things changed in late 2024 that made the original 2015 vision finally shippable at the scale we always wanted: generative AI made per-city, per-trade content economically viable at $10 instead of $10,000, and answer engines (ChatGPT, Perplexity, Google AI Overviews) replaced ten-blue-links as the discovery surface for high-intent search.",
            "Weddings.io now runs the full IAM stack: one verified planner per metro, EyeSpyR physical verification, TALC.tv content generation, WhatsApp lead routing, $10 flat slot pricing, and schema-first markup engineered to be cited by answer engines rather than ranked by classical PageRank alone.",
            "The relaunch is not a pivot. It is the original 2015 thesis, finally executable. Eleven years of holding the brand was the precondition — not the project."
          ],
          "image": {
            "src": "/blog-assets/proof/hamiltonhomeservices-com-wayback-first-crawl-2004.png",
            "alt": "Wayback Machine showing first crawl of hamiltonhomeservices.com in 2004",
            "caption": "Exhibit D — Wayback Machine for hamiltonhomeservices.com. First crawl 2004. 20+ years of continuous indexing.",
            "href": "https://web.archive.org/web/*/hamiltonhomeservices.com"
          }
        },
        {
          "heading": "What this means for every IAM territory partner",
          "paragraphs": [
            "Every contractor who locks a $10 IAM slot inherits the same posture weddings.io has been building since 2015. The domain is older than the competitor. The schema is engineered for answer-engine citation. The territory is exclusive. The receipts are public.",
            "The battle for the brand is not a one-time event. It is the daily practice of registering early, holding publicly, building quietly, and shipping when the technology finally clears the runway. Weddings.io is the most documented example. It is not the only one."
          ]
        }
      ],
      "timeline": [
        { "date": "May 17, 2013", "title": "First Wayback capture", "body": "Internet Archive begins indexing the weddings.io placeholder under prior ownership." },
        { "date": "May 13, 2015", "title": "Registration", "body": "weddings.io registered through ICANN. Continuous ownership begins." },
        { "date": "2016–2023", "title": "Quiet build", "body": "78 Wayback captures across eight years. IAM stack prototyped on adjacent trade domains." },
        { "date": "2024", "title": "Copycat wave", "body": "aiweddings.io and other lookalikes register on the AI-naming trend. Brand defense begins publicly." },
        { "date": "2025", "title": "Stack convergence", "body": "EyeSpyR, TALC.tv, WhatsApp routing, and $10 flat-slot pricing reach production parity." },
        { "date": "2026", "title": "Relaunch", "body": "weddings.io ships as the wedding industry's exclusive-territory disruptor on the full IAM stack." }
      ],
      "footnotes": [
        { "id": "whois2015", "text": "ICANN WHOIS lookup for weddings.io — registration date May 13, 2015, current expiry 2027.", "href": "https://www.whois.com/whois/weddings.io" },
        { "id": "wayback", "text": "Internet Archive Wayback Machine — 78 captures of weddings.io since May 17, 2013.", "href": "https://web.archive.org/web/*/weddings.io" },
        { "id": "pricing", "text": "Master pricing chart — The 250 Scale. $10 per slot per month, slot counts step with city population.", "href": "/pricing" },
        { "id": "ecosystem", "text": "Weddings Ecosystem — cost stack, ROI vs. directories, IPO roadmap, and 3–10 slot availability per metro.", "href": "/weddings-ecosystem" },
        { "id": "gasfitter", "text": "CIRA WHOIS lookup for gasfitter.ca — registered 2007, continuous Canadian ownership.", "href": "https://www.cira.ca/en/whois/" },
        { "id": "hamilton", "text": "Internet Archive Wayback Machine — hamiltonhomeservices.com first crawl 2004.", "href": "https://web.archive.org/web/*/hamiltonhomeservices.com" }
      ],
      "sources": [
        { "label": "ICANN WHOIS — weddings.io", "href": "https://www.whois.com/whois/weddings.io" },
        { "label": "Wayback Machine — weddings.io (78 captures since 2013)", "href": "https://web.archive.org/web/*/weddings.io" },
        { "label": "CIRA WHOIS — gasfitter.ca", "href": "https://www.cira.ca/en/whois/" },
        { "label": "Wayback Machine — hamiltonhomeservices.com (since 2004)", "href": "https://web.archive.org/web/*/hamiltonhomeservices.com" },
        { "label": "IAM Master Pricing — The 250 Scale", "href": "/pricing" },
        { "label": "Weddings.io Ecosystem & Territory Availability", "href": "/weddings-ecosystem" }
      ]
    }
  },
  {
    "slug": "talc-tv-content-engine-contractors",
    "brand": "talc.tv",
    "trade": "Content Engine",
    "tradeShort": "content",
    "plural": "content publishers",
    "video": null,
    "imageKey": "videographers",
    "city": "Canada",
    "province": "BC",
    "category": "Company",
    "date": "June 2026",
    "title": "TALC.tv: The $10 Content Engine That Replaces Your Marketing Agency",
    "metaDescription": "TALC.tv turns one job photo into a 2,000-word SEO and AEO blog post for $10. Auto-published to your city page, Google My Business, and social. No retainer. Pay per win.",
    "excerpt": "One completed job photo. $10. AI generates a 2,000-word SEO and AEO blog post auto-published to your city page, Google My Business, and social channels. No retainer. No monthly commitment. Pay per win…",
    "pain": "Most contractors have a phone full of before-and-after photos sitting unused. A Surrey roofer finishes a tear-off, snaps two photos, and the job evaporates into the camera roll instead of climbing the rankings.",
    "detail": "TALC.tv ingests one project photo plus three lines of context — trade, neighbourhood, scope. The model writes a 2,000-word post optimized for SEO, AEO, GEO, and LLM citation. Schema.org markup for Article, FAQPage, LocalBusiness, and ImageObject is attached automatically.",
    "process": "Photo in. Post out, the same day. Auto-published to your IAM territory listing, syndicated to Google My Business, and broken into a carousel for Instagram and a thread for LinkedIn. Cost: $10 per post. No retainer, no minimum, no agency markup.",
    "faqs": [
      { "q": "What replaces a $3,000/month marketing agency here?", "a": "TALC.tv. One agency retainer buys 300 TALC.tv posts. Most contractors publish 4 to 8 a month and still spend under $80." },
      { "q": "How is the content optimized for AI Overviews?", "a": "AEO-first structure: question-answer blocks, FAQ schema, citation-grade sourcing, and entity tagging. Built to be quoted by ChatGPT, Perplexity, and Google AI Overviews." },
      { "q": "Is the content unique?", "a": "Yes — each post is generated from your job photo, your trade, your neighbourhood. No template recycling, no spun copy." },
      { "q": "Where does it publish?", "a": "Your IAM territory listing, Google My Business, Instagram, LinkedIn, and your RSS feed. One click, four destinations." },
      { "q": "Do I need a TALC.tv subscription?", "a": "No subscription. Pay per post, $10 each. Bundled free with every IAM territory lock at one post per month." },
      { "q": "Where is master pricing?", "a": "All IAM platform pricing follows The 250 Scale — industryarmymarketing.com/pricing." }
    ]
  },
  {
    "slug": "eyespyr-trust-engine",
    "brand": "eyespyr.com",
    "trade": "Trust Engine",
    "tradeShort": "verification",
    "plural": "verified contractors",
    "video": null,
    "imageKey": "interior-designers",
    "city": "Canada",
    "province": "BC",
    "category": "Company",
    "date": "June 2026",
    "title": "EyeSpyR: The Automated Trust Engine Every Contractor Needs in 2026",
    "metaDescription": "EyeSpyR scrapes Google, HomeAdvisor, Houzz, Yelp, Facebook, and BBB automatically. Verifies BC Housing licence, WCB, and insurance. Generates a live Trust Badge. Free with every IAM territory lock.",
    "excerpt": "Punch in your social handles and business links. EyeSpyR scrapes the entire web for every review tied to your name. Verifies your credentials. Generates a live Trust Badge. Updates automatically. Free with every monthly territory lock…",
    "pain": "A homeowner spending $15,000 on a roof reads every review they can find before they call. If your five-star Google reviews are buried under one angry Yelp post from 2019, you lose the job — and you never know why.",
    "detail": "EyeSpyR pulls reviews from Google, HomeAdvisor, Houzz, Yelp, Facebook, and BBB on a daily cycle. It cross-checks BC Housing licence, WCB clearance, and liability insurance against provincial registries. The output is a live, embeddable Trust Badge with a real-time score and verified credential stack.",
    "process": "Enter your business name and social handles. EyeSpyR scrapes, verifies, and scores inside 24 hours. The Trust Badge embeds on your IAM listing, your website, your email signature, and your Google Business Profile. It refreshes automatically every 24 hours — no manual upkeep, ever.",
    "faqs": [
      { "q": "What does EyeSpyR verify?", "a": "Licence (BC Housing, equivalent provincial registries), WCB clearance, liability insurance, and aggregated reviews across Google, HomeAdvisor, Houzz, Yelp, Facebook, and BBB." },
      { "q": "Is it really free?", "a": "Yes — free with every IAM monthly territory lock. Standalone EyeSpyR access is also $10/month under The 250 Scale." },
      { "q": "How often does the Trust Badge update?", "a": "Every 24 hours. New reviews, expired insurance, lapsed WCB — all surface within a day." },
      { "q": "Where can I display the badge?", "a": "Your IAM listing, your own website, email signature, Google Business Profile, and printed marketing. It is a single embed snippet." },
      { "q": "What if my review profile is weak?", "a": "EyeSpyR ships with a review-request workflow that triggers post-job. Most contractors double their public review count inside 90 days." },
      { "q": "Where is master pricing?", "a": "All IAM platform pricing follows The 250 Scale — industryarmymarketing.com/pricing." }
    ]
  },
  {
    "slug": "kitchen-cabinets-vancouver",
    "brand": "kitchencabinets.io",
    "trade": "Kitchen Cabinet Installation",
    "tradeShort": "kitchen cabinet",
    "plural": "cabinet installers",
    "video": "s1DCZN9YSFY",
    "imageKey": "kitchen-cabinets",
    "city": "Vancouver",
    "province": "BC",
    "category": "Renovation",
    "date": "May 2026",
    "title": "Kitchen Cabinet Installation in Vancouver — What Homeowners Pay in 2026",
    "metaDescription": "Kitchen Cabinet Installation in Vancouver, BC. Lock your trade on kitchencabinets.io for $10/month. EyeSpyr verified. One contractor per city. A scoped instal",
    "excerpt": "Most cabinet shops still pay $80 per shared lead on HomeStars or fight a 6-way bid war on Google. The phone rings — but for the wrong job, the wrong neighbourhood, or a tire-kicker…",
    "pain": "Most cabinet shops still pay $80 per shared lead on HomeStars or fight a 6-way bid war on Google. The phone rings — but for the wrong job, the wrong neighbourhood, or a tire-kicker comparing five companies on price alone.",
    "detail": "Vancouver kitchens demand European hinges, soft-close drawers, and frameless construction that survives a coastal humidity swing of 40 percent between January and July. A shop ranking on kitchencabinets.io signals to homeowners that it specializes — not a general handyman, not a big-box installer.",
    "process": "A scoped install starts with a 3D layout in 24 hours, factory drawings sent to your shop within 5 days, and a lockable delivery window. Your kitchencabinets.io listing carries the EyeSpyr verification badge, project gallery, and a direct WhatsApp lead route.",
    "faqs": [
      {
        "q": "How long does a full Vancouver kitchen cabinet replacement take?",
        "a": "Tear-out runs 1 day, install runs 3 to 5 days, and finishing trim plus crown takes another 1 to 2 days. Most projects close inside 10 working days when the cabinets are on-site."
      },
      {
        "q": "Are framed or frameless cabinets better for BC homes?",
        "a": "Frameless gives 10 to 15 percent more interior storage and fits the modern Vancouver build aesthetic. Framed survives heavier dish loads and is preferred in older Kerrisdale and Shaughnessy renovations."
      },
      {
        "q": "What does a cabinet install cost in 2026?",
        "a": "Lower mainland averages run $180 to $260 per linear foot installed for mid-range MDF shaker, and $400 plus for plywood box with custom paint. Exclusive territory partners publish flat pricing."
      },
      {
        "q": "Do I need a permit?",
        "a": "Not for like-for-like cabinet swap. You do need an electrical permit if you move under-cabinet lights, and a plumbing permit if the sink relocates."
      },
      {
        "q": "Why book the kitchencabinets.io territory partner?",
        "a": "One installer per city. You skip the bid race and get the verified shop that already owns the rankings for \"kitchen cabinets Vancouver\"."
      },
      {
        "q": "Can I see live project photos before booking?",
        "a": "Yes — every IAM partner publishes geo-tagged install photos to their listing within 48 hours of completion. EyeSpyr confirms the address is real."
      }
    ]
  },
  {
    "slug": "weddings-vancouver",
    "brand": "weddings.io",
    "trade": "Wedding Planning",
    "tradeShort": "wedding",
    "plural": "wedding planners",
    "video": null,
    "imageKey": "weddings",
    "city": "Vancouver",
    "province": "BC",
    "category": "Events",
    "date": "May 2026",
    "title": "Wedding Vendors in Vancouver — Territory-Locked Wedding Planning with weddings.io",
    "metaDescription": "Wedding Planning in Vancouver, BC. Lock your trade on weddings.io for $10/month. EyeSpyr verified. One contractor per city. Your weddings.",
    "excerpt": "Vancouver couples spend an average of $36,000 on a wedding, but planners spend 60 percent of their time hunting leads on Instagram and replying to brides who already booked someone…",
    "pain": "Vancouver couples spend an average of $36,000 on a wedding, but planners spend 60 percent of their time hunting leads on Instagram and replying to brides who already booked someone else. The lead funnel is broken.",
    "detail": "Weddings.io ranks for the highest-intent search in the category. A bride who types \"weddings Vancouver\" is 3 weeks from a deposit, not 18 months from a venue tour. Owning that domain in your city means owning the entire moment of decision.",
    "process": "Your weddings.io territory comes with the planner profile, three portfolio galleries, an inquiry form routed straight to your CRM, and a calendar embed. EyeSpyr verifies your insurance and BBB status so the listing carries the trust badge.",
    "faqs": [
      {
        "q": "What does a full-service planner cost in Vancouver?",
        "a": "Full coordination ranges $8,000 to $18,000. Month-of starts at $2,500. Premium destination weddings on Vancouver Island clear $30,000."
      },
      {
        "q": "How early should couples book?",
        "a": "Peak Saturday venues in Stanley Park and the Sea-to-Sky corridor book 14 to 22 months out. Off-season Friday weddings can land 4 months out."
      },
      {
        "q": "Do I need a permit for a Stanley Park ceremony?",
        "a": "Yes — Park Board issues a special-use permit that runs $230 to $470 depending on group size. Apply 6 months ahead."
      },
      {
        "q": "Why only one planner per city on weddings.io?",
        "a": "Exclusivity protects rankings and protects the bride from a bidding circus. One verified planner per metro means the territory partner gets the call, not five competitors."
      },
      {
        "q": "How are leads routed?",
        "a": "Inquiry form, WhatsApp click-to-chat, and a phone-call CTA all land in your inbox within 60 seconds. The lead is yours alone."
      },
      {
        "q": "Can I upgrade to a Vancouver Island or Whistler territory too?",
        "a": "Yes — adjacent territories stack. Many planners run Vancouver plus Whistler plus Tofino for $30 a month total."
      }
    ]
  },
  {
    "slug": "tractors-bc",
    "brand": "kongtractors.com",
    "trade": "Tractor & Heavy Equipment Sales",
    "tradeShort": "tractor",
    "plural": "tractor dealers",
    "video": "19au3bdu-p0",
    "imageKey": "tractors",
    "city": "Fraser Valley",
    "province": "BC",
    "category": "Equipment",
    "date": "May 2026",
    "title": "Tractor & Heavy Equipment Services in Fraser Valley — Licensed Operators, Territory-Locked",
    "metaDescription": "Tractor & Heavy Equipment Sales in Fraser Valley, BC. Lock your trade on kongtractors.com for $10/month. EyeSpyr verified. One contractor per city. Your kongt",
    "excerpt": "BC tractor dealers compete with Kijiji listings, big-box ag-supply, and direct-from-Japan import scammers. The legitimate compact-tractor dealer is buried 4 pages deep on Google.…",
    "pain": "BC tractor dealers compete with Kijiji listings, big-box ag-supply, and direct-from-Japan import scammers. The legitimate compact-tractor dealer is buried 4 pages deep on Google.",
    "detail": "Kongtractors.com owns the keyword stack for compact, sub-compact, and utility tractors across the Fraser Valley, Okanagan, and Vancouver Island. Hobby farmers in Langley, Chilliwack, and Abbotsford search by horsepower class — and the dealer that ranks closes the sale.",
    "process": "Your kongtractors.com territory is a dealer page with inventory grid, financing calculator, and a service-booking widget. The system pings WhatsApp when a buyer asks about a specific model. EyeSpyr confirms your dealer licence.",
    "faqs": [
      {
        "q": "What size tractor for a 5-acre Fraser Valley hobby farm?",
        "a": "25 to 35 HP sub-compact runs mowing, light tilling, and snow removal. Step up to 40 to 50 HP if you bale hay or load round bales."
      },
      {
        "q": "Are diesel tractors still the standard?",
        "a": "Tier 4 Final diesel remains 90 percent of new sales. Electric sub-compacts are growing 30 percent year over year and arrive in BC dealerships 2026 onward."
      },
      {
        "q": "What about used tractor pricing?",
        "a": "A clean 5-year-old 30 HP runs $18,000 to $24,000 in BC. New 2025 models start at $22,500 with 0 percent financing through major brands."
      },
      {
        "q": "Do you service what you sell?",
        "a": "Every kongtractors.com territory partner publishes a service-bay schedule and parts availability. Mobile service for 60 km is standard."
      },
      {
        "q": "How does the exclusive territory work?",
        "a": "One dealer per metro region. You own the rankings, the listing, and the inbound leads for \"tractors Fraser Valley\" and 40 related long-tail queries."
      },
      {
        "q": "Can I bundle implements too?",
        "a": "Yes — your inventory grid covers tractors, loaders, mowers, augers, and snow blowers. Cross-sell baked into the listing."
      }
    ]
  },
  {
    "slug": "framers-vancouver",
    "brand": "framers.io",
    "trade": "Residential & Commercial Framing",
    "tradeShort": "framing",
    "plural": "framing contractors",
    "video": "etzMDhfNAsI",
    "imageKey": "framers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Construction",
    "date": "May 2026",
    "title": "Residential & Commercial Framers in Vancouver — Licensed, Territory-Locked, Verified",
    "metaDescription": "Residential & Commercial Framing in Vancouver, BC. Lock your trade on framers.io for $10/month. EyeSpyr verified. One contractor per city. Your framers.",
    "excerpt": "Framers are the backbone of every Vancouver build but get treated like a commodity. Generals call three crews, take the cheapest bid, and never call back. Your phone rings only whe…",
    "pain": "Framers are the backbone of every Vancouver build but get treated like a commodity. Generals call three crews, take the cheapest bid, and never call back. Your phone rings only when someone else flaked.",
    "detail": "Framers.io ranks for the searches generals actually use: \"framing crew Vancouver\", \"wood frame contractor Burnaby\", \"steel stud framers BC\". A territory partner takes the inbound call before the GC starts the bid-shopping ritual.",
    "process": "Your framers.io page lists crew size, certifications, and recent project addresses (EyeSpyr verified). Generals can request a quote with takeoff PDF attached. Lead drops to WhatsApp in under 60 seconds.",
    "faqs": [
      {
        "q": "What does framing cost per square foot in Vancouver in 2026?",
        "a": "$11 to $16 per sq ft for stick-built single family, $18 to $24 for steel stud commercial. Lumber surcharges add 5 to 10 percent in Q2."
      },
      {
        "q": "Wood frame or steel stud for Vancouver multi-family?",
        "a": "BC Building Code now allows wood frame up to 12 storeys. Steel still dominates podiums, parkades, and demising walls."
      },
      {
        "q": "Do you carry liability insurance the GC will accept?",
        "a": "IAM territory partners carry minimum $5M general liability and WorkSafeBC clearance. Both documents auto-display on the framers.io listing."
      },
      {
        "q": "How fast can a crew mobilize?",
        "a": "Lead crew of 4 mobilizes within 5 to 10 business days for projects over 2,000 sq ft. Smaller jobs slot in 2 to 3 weeks out."
      },
      {
        "q": "What sets framers.io territory partners apart?",
        "a": "One framer per city. Listings carry verified BBB, BCCSA SECOR or COR, and live project photos. Generals book the verified shop, not the cheapest bid."
      },
      {
        "q": "Can subs and finishers see your live schedule?",
        "a": "Yes — the listing publishes a project pipeline so drywall, electrical, and plumbing subs know when to slot in."
      }
    ]
  },
  {
    "slug": "hvacr-vancouver",
    "brand": "hvacr.tv",
    "trade": "HVAC & Refrigeration",
    "tradeShort": "HVAC",
    "plural": "HVAC contractors",
    "video": "QCMoDGfjUgY",
    "imageKey": "hvacr",
    "city": "Vancouver",
    "province": "BC",
    "category": "Mechanical",
    "date": "May 2026",
    "title": "HVAC Contractors in Vancouver — How to Find Licensed, Insured Heating & Cooling Pros",
    "metaDescription": "HVAC & Refrigeration in Vancouver, BC. Lock your trade on hvacr.tv for $10/month. EyeSpyr verified. One contractor per city. Your hvacr.",
    "excerpt": "HVAC techs spend $300 to $600 per emergency call lead on Google Ads — and split that lead with three competitors. Restaurant walk-in freezer down at midnight means the cheapest, fa…",
    "pain": "HVAC techs spend $300 to $600 per emergency call lead on Google Ads — and split that lead with three competitors. Restaurant walk-in freezer down at midnight means the cheapest, fastest shop wins, not the most qualified.",
    "detail": "Hvacr.tv ranks the commercial keyword stack: \"walk-in cooler repair Vancouver\", \"rooftop unit replacement Burnaby\", \"ammonia refrigeration BC\". These are six-figure jobs not five-hundred-dollar service calls.",
    "process": "Your hvacr.tv territory carries the TSBC gas-fitter ticket display, refrigeration class verification, and 24/7 dispatch CTA. Emergency calls hit WhatsApp instantly with location, equipment type, and severity tagged.",
    "faqs": [
      {
        "q": "What gas ticket is required for commercial Vancouver HVAC?",
        "a": "Class B gas-fitter minimum for boilers under 400,000 BTU. Class A for everything above. Refrigeration mechanics also need TQ provincial ticket."
      },
      {
        "q": "Are heat pumps replacing gas furnaces in BC?",
        "a": "BC Step Code now incentivizes heat pumps in all new builds. Retrofit market grew 47 percent in 2025 with CleanBC rebates up to $11,000."
      },
      {
        "q": "What does a commercial RTU replacement cost?",
        "a": "5-ton commercial rooftop unit installed runs $14,000 to $22,000 in 2026. 10-ton units clear $35,000 with crane lift included."
      },
      {
        "q": "Do you cover ammonia and CO2 refrigeration?",
        "a": "IAM hvacr.tv partners hold the refrigeration mechanic ticket for ammonia (NH3) and CO2 (R744) systems used in cold-storage and ice rinks."
      },
      {
        "q": "How fast is emergency dispatch?",
        "a": "Sub-2 hour response is the standard for territory partners. WhatsApp alerts include equipment age, refrigerant type, and last service date."
      },
      {
        "q": "Why only one HVAC shop per city?",
        "a": "Trust. Hvacr.tv signals to a property manager that the shop owns the territory and stakes its reputation on every call."
      }
    ]
  },
  {
    "slug": "excavators-bc",
    "brand": "excavators.tv",
    "trade": "Excavation & Site Prep",
    "tradeShort": "excavation",
    "plural": "excavation contractors",
    "video": "gQi6nl-s1Ng",
    "imageKey": "excavators",
    "city": "Lower Mainland",
    "province": "BC",
    "category": "Construction",
    "date": "April 2026",
    "title": "Excavation Contractors in Lower Mainland BC — Site Prep, Grading & Verified Operators",
    "metaDescription": "Excavation & Site Prep in Lower Mainland, BC. Lock your trade on excavators.tv for $10/month. EyeSpyr verified. One contractor per city. Your excavators.",
    "excerpt": "Excavators bid against unlicensed bobcat owners on Kijiji for jobs that need real machines, real engineering, and real WorkSafe coverage. The race to the bottom kills margin and re…",
    "pain": "Excavators bid against unlicensed bobcat owners on Kijiji for jobs that need real machines, real engineering, and real WorkSafe coverage. The race to the bottom kills margin and reputation.",
    "detail": "Excavators.tv targets the searches that come with permits: \"excavation contractor Vancouver\", \"basement dig out Burnaby\", \"site prep contractor Surrey\". These leads have a survey, a geotech report, and a budget.",
    "process": "Your excavators.tv listing shows machine fleet, operator tickets, environmental permits, and a project map with verified addresses. Generals upload site plans and get a quote in 48 hours.",
    "faqs": [
      {
        "q": "What does basement excavation cost in Vancouver?",
        "a": "$45 to $75 per cubic yard for standard residential. Add $15 to $25 for rock, hard-pan, or contaminated soil disposal."
      },
      {
        "q": "Do I need an environmental permit?",
        "a": "For sites within 30 metres of a stream, yes — DFO and provincial environmental approvals add 4 to 8 weeks to the timeline."
      },
      {
        "q": "How big a machine do I need for a 2,500 sq ft basement?",
        "a": "Mid-size 8 to 12 tonne excavator runs the dig. Mini-ex (3 tonne) handles trenching and finish work."
      },
      {
        "q": "What about soil disposal?",
        "a": "Class 1 (clean) disposal runs $35 to $55 per cubic yard. Contaminated soil clears $180 plus, with lab testing required."
      },
      {
        "q": "Why an excavators.tv exclusive partner?",
        "a": "One licensed excavation contractor per metro. Generals avoid the unlicensed-bobcat race and book the verified shop with WorkSafeBC clearance."
      },
      {
        "q": "Can you handle shoring and underpinning?",
        "a": "Engineered shoring requires P.Eng stamp. Territory partners pre-qualify with structural engineers so the shoring drawings drop in 2 weeks not 8."
      }
    ]
  },
  {
    "slug": "painters-vancouver",
    "brand": "painters.tv",
    "trade": "Residential & Commercial Painting",
    "tradeShort": "painting",
    "plural": "painters",
    "video": "oExMr1ufU-s",
    "imageKey": "painters",
    "city": "Vancouver",
    "province": "BC",
    "category": "Renovation",
    "date": "April 2026",
    "title": "Painting Contractors in Vancouver — What a Professional Repaint Actually Costs in 2026",
    "metaDescription": "Residential & Commercial Painting in Vancouver, BC. Lock your trade on painters.tv for $10/month. EyeSpyr verified. One contractor per city. Your painters.",
    "excerpt": "Painters are the most-Googled trade in Canada and the most-undercut. Every retired house-flipper with a sprayer underbids the pro. Real shops with payroll, WCB, and warranty lose t…",
    "pain": "Painters are the most-Googled trade in Canada and the most-undercut. Every retired house-flipper with a sprayer underbids the pro. Real shops with payroll, WCB, and warranty lose to ghost crews on Kijiji.",
    "detail": "Painters.tv ranks for the search a homeowner makes when the budget is real: \"exterior painter Vancouver\", \"cabinet refinishing Burnaby\", \"commercial painter Surrey\". Territory listings filter out the tire kickers.",
    "process": "Your painters.tv profile carries the WorkSafe clearance, warranty terms, paint manufacturer certifications (Benjamin Moore, Sherwin Williams), and a colour-consult booking widget. Lead drops to WhatsApp tagged with surface type.",
    "faqs": [
      {
        "q": "What does it cost to paint a Vancouver house exterior in 2026?",
        "a": "$5,500 to $9,500 for a 2,200 sq ft two-storey. Cedar shake adds 25 percent. Stucco runs cheaper at $4,000 to $6,500."
      },
      {
        "q": "How long does exterior paint last in BC weather?",
        "a": "Premium 100 percent acrylic lasts 8 to 12 years on properly prepped wood. South-facing walls fade 2 years earlier."
      },
      {
        "q": "Cabinet refinishing vs replacement?",
        "a": "Refinish at $80 to $140 per door. Replacement runs 4 to 6 times more. Refinish on solid wood lasts 7 to 10 years before yellowing."
      },
      {
        "q": "Are low-VOC paints standard now?",
        "a": "Yes. BC moved to low-VOC by default in 2023. Premium lines (Aura, Emerald) are zero-VOC and BC Step Code preferred."
      },
      {
        "q": "Why painters.tv exclusive territory?",
        "a": "One legit shop per city. Homeowners stop choosing on price and start choosing on warranty and verified reviews."
      },
      {
        "q": "Do you offer financing?",
        "a": "IAM territory partners can plug a financing partner (Affirm, Financeit) into the listing — homeowner books with monthly payment shown upfront."
      }
    ]
  },
  {
    "slug": "roofers-vancouver",
    "brand": "roofers.io",
    "trade": "Roofing & Re-Roofing",
    "tradeShort": "roofing",
    "plural": "roofers",
    "video": "aLVRxohnvoY",
    "imageKey": "roofers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Construction",
    "date": "April 2026",
    "title": "Roofing Contractors in Vancouver — Territory-Locked, EyeSpyR Verified, Licensed",
    "metaDescription": "Roofing & Re-Roofing in Vancouver, BC. Lock your trade on roofers.io for $10/month. EyeSpyr verified. One contractor per city. Your roofers.",
    "excerpt": "Storm-chasing door-knockers, insurance-scam crews, and one-truck operators dominate the roofing landscape. Real roofers with warranty, WSBC, and 20-year history get drowned out.…",
    "pain": "Storm-chasing door-knockers, insurance-scam crews, and one-truck operators dominate the roofing landscape. Real roofers with warranty, WSBC, and 20-year history get drowned out.",
    "detail": "Roofers.io owns the keyword stack that comes with a permit: \"roofing contractor Vancouver\", \"re-roof Burnaby\", \"metal roofing North Shore\". Storm chasers do not rank for these.",
    "process": "Your roofers.io territory listing displays warranty terms, manufacturer credentials (GAF Master Elite, IKO Shield Pro), drone inspection photos, and a 48-hour quote turnaround.",
    "faqs": [
      {
        "q": "What does a Vancouver re-roof cost in 2026?",
        "a": "$11,000 to $18,000 for a 1,800 sq ft asphalt re-roof including tear-off. Standing-seam metal runs $26,000 to $42,000."
      },
      {
        "q": "Asphalt vs metal vs cedar for the wet coast?",
        "a": "Architectural asphalt: 25 to 30 years. Standing-seam metal: 50 plus. Cedar: 25 to 35 years with maintenance. Metal wins on lifecycle cost."
      },
      {
        "q": "Do I need a permit?",
        "a": "City of Vancouver requires a permit for re-roofs over 10 squares (1,000 sq ft). Cost $190 to $400 depending on scope."
      },
      {
        "q": "What is a manufacturer warranty actually worth?",
        "a": "GAF Master Elite gives 50-year non-prorated material plus 25-year workmanship. Only 3 percent of roofers qualify. Territory partners do."
      },
      {
        "q": "Why one roofer per city on roofers.io?",
        "a": "It blocks the storm chaser from ranking and gives the homeowner one verified, warranted, WCB-cleared shop to call."
      },
      {
        "q": "How fast can you tarp a leak?",
        "a": "Sub-4 hour emergency tarp is the territory partner standard, year-round."
      }
    ]
  },
  {
    "slug": "drywallers-vancouver",
    "brand": "drywallers.io",
    "trade": "Drywall & Taping",
    "tradeShort": "drywall",
    "plural": "drywallers",
    "video": "sAgUT0G1J-4",
    "imageKey": "drywallers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Construction",
    "date": "April 2026",
    "title": "Drywall Contractors in Vancouver — What Licensed Drywall & Taping Actually Costs",
    "metaDescription": "Drywall & Taping in Vancouver, BC. Lock your trade on drywallers.io for $10/month. EyeSpyr verified. One contractor per city. Your drywallers.",
    "excerpt": "Drywall is the second-most-undercut trade after painting. Every framer thinks they can mud. Real tapers with Level-5 finish lose work to crews that ghost on snag-list day.…",
    "pain": "Drywall is the second-most-undercut trade after painting. Every framer thinks they can mud. Real tapers with Level-5 finish lose work to crews that ghost on snag-list day.",
    "detail": "Drywallers.io ranks for \"drywall contractor Vancouver\", \"Level 5 finish Burnaby\", \"commercial drywaller Surrey\". These are condo developer keywords, not handyman keywords.",
    "process": "Your drywallers.io profile lists crew size, finish-level capability, BCCSA safety credentials, and a project-portfolio gallery. Developers and generals book direct.",
    "faqs": [
      {
        "q": "What does drywall installed cost per square foot in 2026?",
        "a": "$2.20 to $3.10 per sq ft for board plus tape Level-4 finish. Level-5 adds $0.40. Steel stud framing adds $1.10 to $1.60."
      },
      {
        "q": "What is the difference between Level 4 and Level 5 finish?",
        "a": "Level 4 is paint-ready under matte finishes. Level 5 adds a skim coat across the entire surface — required for satin/semi-gloss and critical lighting conditions."
      },
      {
        "q": "How long does a 1,500 sq ft drywall job take?",
        "a": "Hang: 2 days. Tape and mud: 5 to 7 days with dry time. Total 8 to 10 working days for a typical condo unit."
      },
      {
        "q": "Do you cover sound-rated assemblies?",
        "a": "Yes — RSIC clips, resilient channel, and STC-55 demising walls are standard for territory partners doing multi-family."
      },
      {
        "q": "Why drywallers.io exclusive territory?",
        "a": "One verified shop per metro. Developers stop chasing three quotes and book the partner with verified projects and BBB status."
      },
      {
        "q": "Can you do quick repairs too?",
        "a": "Lead crews handle the commercial work, smaller crews slot in residential patches. Both routed through the same listing."
      }
    ]
  },
  {
    "slug": "plumbers-vancouver",
    "brand": "plumbers.ltd",
    "trade": "Plumbing & Drainage",
    "tradeShort": "plumbing",
    "plural": "plumbers",
    "video": "UViMcfIf2lE",
    "imageKey": "plumbers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Mechanical",
    "date": "March 2026",
    "title": "Plumbing & Drainage Contractors in Vancouver — Licensed, Verified, Territory-Locked",
    "metaDescription": "Plumbing & Drainage in Vancouver, BC. Lock your trade on plumbers.ltd for $10/month. EyeSpyr verified. One contractor per city. Your plumbers.",
    "excerpt": "Plumbing is the highest-CPC trade keyword in Canada — $42 average cost per click on \"emergency plumber Vancouver\". Real shops burn $4,000 a week just to share leads with three comp…",
    "pain": "Plumbing is the highest-CPC trade keyword in Canada — $42 average cost per click on \"emergency plumber Vancouver\". Real shops burn $4,000 a week just to share leads with three competitors.",
    "detail": "Plumbers.ltd ranks the high-intent emergency stack: \"burst pipe Vancouver\", \"sewer line repair Burnaby\", \"tankless install North Shore\". One licensed plumber per city, no bid war.",
    "process": "Your plumbers.ltd territory carries the BC Red Seal display, gas-fitter Class B, 24/7 dispatch CTA, and a tankless/heat-pump rebate calculator. WhatsApp dispatch in 60 seconds.",
    "faqs": [
      {
        "q": "What does a sewer line replacement cost in Vancouver?",
        "a": "$8,500 to $24,000 depending on length and method. Trenchless pipe-bursting runs 25 to 40 percent more than open-cut but saves the landscaping."
      },
      {
        "q": "How long does a tankless install take?",
        "a": "Standard retrofit: 6 to 9 hours. New construction rough-in: 2 to 3 hours. Gas line upgrade adds 2 to 4 hours."
      },
      {
        "q": "Are heat-pump water heaters worth it?",
        "a": "CleanBC rebates cover up to $1,500. Lifecycle savings 35 to 50 percent vs electric resistance. ROI inside 5 years."
      },
      {
        "q": "Do you cover commercial drains and grease traps?",
        "a": "Yes — territory partners hold the cross-connection control ticket and handle commercial backflow testing required by Metro Vancouver bylaw."
      },
      {
        "q": "Why plumbers.ltd exclusive?",
        "a": "One licensed shop per city beats the lead-share bidding war. Homeowners get verified Red Seal, not a referral middleman."
      },
      {
        "q": "Whats the average emergency response time?",
        "a": "Sub-90-minute on emergency calls within metro core. WhatsApp confirmation with ETA included."
      }
    ]
  },
  {
    "slug": "demolition-vancouver",
    "brand": "demolition.io",
    "trade": "Demolition & Deconstruction",
    "tradeShort": "demolition",
    "plural": "demolition contractors",
    "video": "KzHg-mQmetA",
    "imageKey": "demolition",
    "city": "Vancouver",
    "province": "BC",
    "category": "Construction",
    "date": "March 2026",
    "title": "Demolition Contractors in Vancouver — BC Permits, Costs & How to Find Verified Pros",
    "metaDescription": "Demolition & Deconstruction in Vancouver, BC. Lock your trade on demolition.io for $10/month. EyeSpyr verified. One contractor per city. Your demolition.",
    "excerpt": "Vancouver mandates deconstruction (not demolition) on pre-1950 homes — a regulation 80 percent of contractors still get wrong. Generals book the cheap demo crew and lose the permit…",
    "pain": "Vancouver mandates deconstruction (not demolition) on pre-1950 homes — a regulation 80 percent of contractors still get wrong. Generals book the cheap demo crew and lose the permit at inspection.",
    "detail": "Demolition.io ranks for the searches that come with City of Vancouver paperwork: \"deconstruction contractor Vancouver\", \"house demolition Burnaby\", \"abatement crew BC\". Permit-grade work, not Kijiji bobcat work.",
    "process": "Your demolition.io territory shows hazmat certifications (asbestos, lead), deconstruction-method statements, salvage-rate verification (75 percent landfill diversion), and the City of Vancouver pre-approval status.",
    "faqs": [
      {
        "q": "What does house demolition cost in Vancouver in 2026?",
        "a": "$28,000 to $48,000 for a standard pre-war SFH including deconstruction, hazmat, disposal, and salvage credit."
      },
      {
        "q": "Whats the difference between demolition and deconstruction?",
        "a": "Demolition smashes and disposes. Deconstruction dismantles in reverse — required by City of Vancouver bylaw for homes built before 1950, with 75 percent material diversion mandatory."
      },
      {
        "q": "How long does the process take?",
        "a": "Deconstruction: 14 to 21 working days. Standard demo: 3 to 5 days. Hazmat abatement adds 5 to 10 days."
      },
      {
        "q": "Asbestos testing — do I need it?",
        "a": "Yes — WorkSafeBC mandates pre-demo hazmat survey for any structure built before 1990. Lab turnaround 5 to 10 business days."
      },
      {
        "q": "Why demolition.io exclusive territory?",
        "a": "One verified deconstruction contractor per metro. Generals stop losing permits at City Hall and start passing inspection on the first walk-through."
      },
      {
        "q": "Do you handle the disposal manifest?",
        "a": "Yes — landfill manifest, salvage receipts, and hazmat disposal docs all uploaded to the listing for the GC to download."
      }
    ]
  },
  {
    "slug": "interior-designers-vancouver",
    "brand": "interiordesigners.io",
    "trade": "Interior Design",
    "tradeShort": "interior design",
    "plural": "interior designers",
    "video": "mVVLBA8pQvU",
    "imageKey": "interior-designers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Design",
    "date": "March 2026",
    "title": "Interior Designers in Vancouver — Territory-Locked Design Services for Every Budget",
    "metaDescription": "Interior Design in Vancouver, BC. Lock your trade on interiordesigners.io for $10/month. EyeSpyr verified. One contractor per city. Your interiordesigners.",
    "excerpt": "Vancouver interior designers fight for visibility on Houzz, Instagram, and ten different directories. The high-value renovator who wants a $40,000 design package cannot find them.…",
    "pain": "Vancouver interior designers fight for visibility on Houzz, Instagram, and ten different directories. The high-value renovator who wants a $40,000 design package cannot find them.",
    "detail": "Interiordesigners.io owns the keyword stack a serious client uses: \"interior designer Vancouver\", \"kitchen designer West Vancouver\", \"commercial interior design BC\". Premium leads, not coffee-shop tire kickers.",
    "process": "Your interiordesigners.io listing carries the IDIBC registration, portfolio of 3D renderings, an inquiry form with project-budget filter, and a calendar embed for discovery calls.",
    "faqs": [
      {
        "q": "What does interior design cost in Vancouver?",
        "a": "Full-service design starts at $150/hr or 12 to 18 percent of project budget. Flat-fee packages run $4,500 to $25,000 depending on scope."
      },
      {
        "q": "IDIBC registration — does it matter?",
        "a": "Yes for commercial work. IDIBC-registered designers can stamp interior construction drawings for permit submission. Residential is not regulated."
      },
      {
        "q": "How long does a kitchen design package take?",
        "a": "4 to 6 weeks from discovery call to final construction drawings including 3D renderings and millwork specs."
      },
      {
        "q": "Do designers work with the contractor or directly with the client?",
        "a": "Both. Territory partners offer design-only, design-build, and turnkey models with verified contractor referrals."
      },
      {
        "q": "Why interiordesigners.io exclusive territory?",
        "a": "One verified designer per metro. Premium clients skip the directory swamp and book the verified portfolio with IDIBC credentials."
      },
      {
        "q": "Can you handle commercial fit-outs?",
        "a": "Yes — territory partners hold IDIBC stamps required for permit drawings on offices, retail, and hospitality interiors."
      }
    ]
  },
  {
    "slug": "backhaul-bc",
    "brand": "backhaul.io",
    "trade": "Backhaul & Freight",
    "tradeShort": "backhaul freight",
    "plural": "freight carriers",
    "video": "uRuYhwCfuQE",
    "imageKey": "backhaul",
    "city": "BC",
    "province": "BC",
    "category": "Logistics",
    "date": "March 2026",
    "title": "Backhaul & Freight Services in BC — How Carriers Lock Territory for Consistent Loads",
    "metaDescription": "Backhaul & Freight in BC, BC. Lock your trade on backhaul.io for $10/month. EyeSpyr verified. One contractor per city. Your backhaul.",
    "excerpt": "BC trucking runs 23 percent empty miles on average. A reefer that hauls produce east comes back with no load and burns $1,800 in diesel. Brokers take 18 percent of the load value a…",
    "pain": "BC trucking runs 23 percent empty miles on average. A reefer that hauls produce east comes back with no load and burns $1,800 in diesel. Brokers take 18 percent of the load value and never solve the empty-leg problem.",
    "detail": "Backhaul.io targets the search shippers actually use: \"backhaul freight BC\", \"reefer return load Vancouver\", \"LTL backhaul Calgary\". Direct shipper to carrier, no broker bite.",
    "process": "Your backhaul.io territory is a carrier profile with lane preferences, equipment list, NSC safety rating, and a real-time empty-leg availability calendar. Shippers book direct.",
    "faqs": [
      {
        "q": "What is a backhaul and why does it matter?",
        "a": "A backhaul is the return load on an outbound trip. Filling backhauls cuts deadhead miles, drops cost per mile 25 to 40 percent, and improves the carrier P&L by 8 to 12 percent."
      },
      {
        "q": "How does the exclusive lane work?",
        "a": "One verified carrier per metro pair (Vancouver-Calgary, Vancouver-Edmonton, etc.). Shippers see one trusted carrier, not 40 broker postings."
      },
      {
        "q": "What NSC rating is required?",
        "a": "BC carriers must hold an NSC certificate. Territory partners maintain Satisfactory rating minimum with current CVOR record."
      },
      {
        "q": "Do you cover LTL and FTL?",
        "a": "Both. Carrier profiles publish equipment (dry van, reefer, flatbed) and minimum/maximum weight thresholds."
      },
      {
        "q": "How are loads priced?",
        "a": "Direct rate from carrier — no broker markup. Spot rates publish daily, contract rates available on quarterly agreements."
      },
      {
        "q": "Why backhaul.io vs DAT or Loadlink?",
        "a": "Load boards are auctions. Backhaul.io is direct relationship with the verified carrier holding the lane."
      }
    ]
  },
  {
    "slug": "snow-removal-bc",
    "brand": "plowwow.com",
    "trade": "Snow Removal & De-Icing",
    "tradeShort": "snow removal",
    "plural": "snow removal contractors",
    "video": "qr0RZDpKuJU",
    "imageKey": "snow-removal",
    "city": "BC Interior",
    "province": "BC",
    "category": "Seasonal",
    "date": "February 2026",
    "title": "Snow Removal Contractors in BC Interior — Seasonal Territory Locking for Reliable Service",
    "metaDescription": "Snow Removal & De-Icing in BC Interior, BC. Lock your trade on plowwow.com for $10/month. EyeSpyr verified. One contractor per city. Your plowwow.",
    "excerpt": "Snow removal is a 4-month season. Strip malls, condo strata, and hospitals scramble in November for a verified contractor — then watch the cheap crew ghost on the first big dump.…",
    "pain": "Snow removal is a 4-month season. Strip malls, condo strata, and hospitals scramble in November for a verified contractor — then watch the cheap crew ghost on the first big dump.",
    "detail": "Plowwow.com owns the keyword stack: \"commercial snow removal Kelowna\", \"strata snow plow Vancouver\", \"de-icing contractor Calgary\". The brand name does the marketing — every property manager remembers it.",
    "process": "Your plowwow.com territory lists fleet size (plow trucks, sidewalk machines, salt spreaders), 24/7 dispatch, response-time SLA, and insurance certificates. Strata managers book per-season contracts direct.",
    "faqs": [
      {
        "q": "What does commercial snow removal cost per season?",
        "a": "$3,500 to $12,000 per strata building depending on size, lots, and sidewalks. Per-push pricing runs $150 to $400 per event."
      },
      {
        "q": "Whats the response-time SLA?",
        "a": "Territory partners commit to plow start within 2 hours of trigger snowfall (typically 5 cm). De-icing within 1 hour for hospitals and seniors residences."
      },
      {
        "q": "Do you use brine or rock salt?",
        "a": "Pre-treatment with liquid brine cuts salt use 30 percent. Most BC partners run brine pre-event plus rock salt post-event for hardpack."
      },
      {
        "q": "What insurance is required?",
        "a": "$5M general liability minimum, plus slip-and-fall endorsement. Territory partners publish certificate on the listing."
      },
      {
        "q": "Why plowwow.com exclusive territory?",
        "a": "One verified shop per metro. Strata managers stop scrambling in November and lock in November-to-March coverage with one trusted call."
      },
      {
        "q": "Do you handle residential too?",
        "a": "Some territory partners run residential routes alongside commercial. Listing filters by service type."
      }
    ]
  },
  {
    "slug": "videographers-vancouver",
    "brand": "videographers.io",
    "trade": "Commercial Videography",
    "tradeShort": "videography",
    "plural": "videographers",
    "video": "kpk1wiNI8uc",
    "imageKey": "videographers",
    "city": "Vancouver",
    "province": "BC",
    "category": "Creative",
    "date": "February 2026",
    "title": "Commercial Videographers in Vancouver — Territory-Locked Video Production for Any Industry",
    "metaDescription": "Commercial Videography in Vancouver, BC. Lock your trade on videographers.io for $10/month. EyeSpyr verified. One contractor per city. Your videographers.",
    "excerpt": "Vancouver is North Americas third-largest film city — and the second-most-saturated freelance videography market. Real shops with cinema cameras, drones, and Part 107 pilots lose w…",
    "pain": "Vancouver is North Americas third-largest film city — and the second-most-saturated freelance videography market. Real shops with cinema cameras, drones, and Part 107 pilots lose work to iPhone shooters undercutting on Fiverr.",
    "detail": "Videographers.io ranks for serious-budget searches: \"corporate videographer Vancouver\", \"real estate video Burnaby\", \"event videography BC\". The lead has a budget, a brief, and a deadline.",
    "process": "Your videographers.io territory shows reel, gear list (Sony FX6, RED, DJI drone), Transport Canada Advanced RPAS, ACTRA status, and a booking calendar. Lead drops with project brief attached.",
    "faqs": [
      {
        "q": "What does corporate video cost in Vancouver?",
        "a": "Half-day shoot plus edit: $2,500 to $5,500. Full-day with two cameras: $5,500 to $12,000. Aerial drone adds $800 to $2,000."
      },
      {
        "q": "Do I need a drone licence in BC?",
        "a": "Yes — Transport Canada Advanced RPAS is required for commercial flight near people or built environments. Territory partners hold current certification."
      },
      {
        "q": "How fast is turnaround on a finished edit?",
        "a": "First cut in 5 to 10 business days for corporate. 48-hour turnaround available for real estate listings."
      },
      {
        "q": "What deliverables come with a package?",
        "a": "Master 4K file, social cuts (vertical, square), thumbnails, captions, and a YouTube-optimized cut with chapters."
      },
      {
        "q": "Why videographers.io exclusive territory?",
        "a": "One verified shop per metro. Marketing directors stop screening 40 Vimeo reels and book the verified shop with the gear and the licence."
      },
      {
        "q": "Can you handle live event multi-cam?",
        "a": "Yes — territory partners run up to 6-camera switched live with streaming output for conferences and product launches."
      }
    ]
  },
  {
    "slug": "errands-vancouver",
    "brand": "errands.io",
    "trade": "Errand & Same-Day Delivery",
    "tradeShort": "errand and delivery",
    "plural": "delivery operators",
    "video": null,
    "imageKey": "errands",
    "city": "Vancouver",
    "province": "BC",
    "category": "Service",
    "date": "February 2026",
    "title": "Errand & Same-Day Delivery Services in Vancouver — Local Territory Locking for Courier Pros",
    "metaDescription": "Errand & Same-Day Delivery in Vancouver, BC. Lock your trade on errands.io for $10/month. EyeSpyr verified. One contractor per city. Your errands.",
    "excerpt": "Same-day delivery in Vancouver is dominated by gig apps that take 30 percent and never build a local brand. Real local couriers — bonded, insured, with cargo bikes and vans — get c…",
    "pain": "Same-day delivery in Vancouver is dominated by gig apps that take 30 percent and never build a local brand. Real local couriers — bonded, insured, with cargo bikes and vans — get crushed under Uber Direct.",
    "detail": "Errands.io targets the search a local business actually makes: \"same-day courier Vancouver\", \"errand service Burnaby\", \"bonded courier BC\". One verified operator per metro, no gig-app skim.",
    "process": "Your errands.io territory shows fleet (bike, e-bike, van, truck), bonding amount, real-time tracking integration, and a per-stop pricing calculator. SMBs book repeat runs direct.",
    "faqs": [
      {
        "q": "What does same-day delivery cost in Vancouver?",
        "a": "Bike: $12 to $22 per stop downtown core. E-bike: $18 to $32. Van: $35 to $75 plus per-km. Multi-stop discounts standard."
      },
      {
        "q": "Do I need a bonded courier for legal documents?",
        "a": "For court filings and certain legal docs, yes. Territory partners maintain a $5,000 minimum bond and chain-of-custody documentation."
      },
      {
        "q": "How fast is same-day?",
        "a": "Sub-2 hour standard inside Vancouver/Burnaby/Richmond. 4-hour to North Shore. 6-hour to Surrey/Coquitlam."
      },
      {
        "q": "Whats the difference from Uber Direct?",
        "a": "Errands.io operators are local, bonded, insured, and contracted — not gig drivers. Your business builds a relationship with one verified company."
      },
      {
        "q": "Can you handle scheduled recurring runs?",
        "a": "Yes — daily bank runs, weekly distribution routes, and pharmacy delivery loops all routed through the listing."
      },
      {
        "q": "Why errands.io exclusive territory?",
        "a": "One operator per metro. SMBs stop shuffling between five gig apps and book one trusted local courier."
      }
    ]
  },
  {
    "slug": "gasfitter-bc",
    "brand": "gasfitter.ca",
    "trade": "Licensed Gas Fitting",
    "tradeShort": "gas fitting",
    "plural": "gas fitters",
    "city": "British Columbia",
    "province": "BC",
    "category": "Licensed Trades",
    "imageKey": "hvacr",
    "pain": "Licensed gas fitters in BC spend $5–$12 per click on Google Ads, share every HomeStars lead with three competitors, and watch unlicensed handymen undercut them on Kijiji. Meanwhile the highest-intent search — gasfitter.ca — has been a 19-year-aged authority domain quietly sitting on page one for the entire province.",
    "detail": "BC Safety Authority regulates every gas line in the province, so gas fitting is not a search a homeowner does casually — it is a permit-driven, ticket-required call that converts at 4x the rate of a generic plumbing query. gasfitter.ca was registered in 2007 (a corporation, Gasfitter Canada Group Corp., not a hobby) and carries 19 years of compounding inbound authority. In SEO terms that is unreplicable land.",
    "process": "Your gasfitter.ca territory carries Class A or Class B ticket display, EyeSpyr address verification, BCSA license number, and 24/7 WhatsApp dispatch routing. The page is structured for AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) — schema.org LocalBusiness + ProfessionalService + FAQPage are all baked in so ChatGPT, Perplexity, and Google AI Overviews surface your listing when someone asks 'who is the best licensed gas fitter in BC?'.",
    "faqs": [
      {
        "q": "Why is a 19-year-old domain valuable for SEO?",
        "a": "Google weights domain age as a trust proxy. gasfitter.ca was indexed in 2007, has 19 years of inbound citations from BC trades directories, and ranks for keyword stacks that a new domain would need 3–5 years to approach."
      },
      {
        "q": "What ticket do I need for residential gas in BC?",
        "a": "Class B gas fitter ticket covers appliances up to 400,000 BTU input — residential furnaces, water heaters, ranges, dryers. Class A covers commercial boilers and process heat above that threshold."
      },
      {
        "q": "How does gasfitter.ca rank in AI search?",
        "a": "The listing exposes structured data (LocalBusiness, FAQPage, schema.org ContactPoint) that LLMs like ChatGPT and Perplexity parse. When someone asks an AI 'find me a licensed gas fitter in Vancouver', the verified territory partner is the cited source."
      },
      {
        "q": "What does the $10/month subscription include?",
        "a": "One-contractor-per-city listing on gasfitter.ca, EyeSpyr verification badge, WhatsApp lead routing, schema-marked profile, inclusion in the BuildersHaus sitemap, and quarterly TALC.TV content syndication across the IAM network."
      },
      {
        "q": "Can I bundle gasfitter.ca with plumbers.ltd?",
        "a": "Yes — most multi-ticket shops stack gasfitter.ca + plumbers.ltd + hvacr.tv for $30/month total. Each domain captures a different keyword stack and routes leads to the same WhatsApp."
      },
      {
        "q": "How fast does a new listing get indexed?",
        "a": "Google indexes new gasfitter.ca pages within 24 hours via our sitemap ping and IndexNow API integration. AI Overviews typically cite within 7–14 days as the page accumulates topical signals."
      }
    ],
    "date": "June 2026",
    "video": null,
    "title": "Licensed Gas Fitters in BC — What Homeowners Must Know Before Any Gas Line Work",
    "metaDescription": "Licensed Gas Fitting in British Columbia, BC. Lock your trade on gasfitter.ca for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked i",
    "excerpt": "Licensed gas fitters in BC spend $5–$12 per click on Google Ads, share every HomeStars lead with three competitors, and watch unlicensed handymen undercut th…"
  },
  {
    "slug": "steel-stud-contractors-bc",
    "brand": "steelstudcontractors.com",
    "trade": "Commercial Steel Stud Framing",
    "tradeShort": "steel stud",
    "plural": "steel stud contractors",
    "city": "British Columbia",
    "province": "BC",
    "category": "Commercial Construction",
    "imageKey": "framers",
    "pain": "Steel stud contractors bid commercial drywall packages worth $80,000–$400,000 but get their leads from cold-calling GCs and the occasional referral. The exact-match domain that captures the search 'steel stud contractors' is steelstudcontractors.com — and most shops do not even know it exists.",
    "detail": "Exact-match domains are the most powerful single SEO asset a niche can own. steelstudcontractors.com is a literal keyword-as-URL — when a GC types 'steel stud contractors near me', Google reads the domain itself as a relevance signal. Pair that with 15 years of aged authority on the sibling steelstud.ca domain and the keyword cluster is locked.",
    "process": "Your steelstudcontractors.com territory carries WorkSafeBC clearance, SECOR/COR certification badge, BCCSA membership, crew-size and equipment-fleet display, and an upload-the-drawings RFQ form that routes to your estimator inside 5 minutes. AEO-optimized FAQ schema captures 'how much does steel stud framing cost per square foot' type queries.",
    "faqs": [
      {
        "q": "Why does an exact-match domain still matter in 2026?",
        "a": "Google's algorithm reduced EMD weighting in 2012 but never eliminated it. Combined with 15+ years of topical authority, an exact-match domain in a low-competition vertical like steel stud framing remains one of the top three ranking factors."
      },
      {
        "q": "What does commercial steel stud framing cost in 2026?",
        "a": "BC averages $18–$28 per sq ft installed for 20-gauge interior partitions, $32–$48 for load-bearing 16-gauge. Tenant improvements run lower; podium and parkade work runs higher."
      },
      {
        "q": "Do you handle full drywall and finish too?",
        "a": "Most steelstudcontractors.com territory partners are framer-only specialists and partner with drywallers.io territory partners for tape and mud. The IAM network handoff is built into the lead routing."
      },
      {
        "q": "How does the GC find me on AI search?",
        "a": "ChatGPT, Perplexity, and Google AI Overviews pull from structured data and topical authority. steelstudcontractors.com is the named source when an estimator asks 'find me a SECOR-certified steel stud framer in the Lower Mainland'."
      },
      {
        "q": "What about LinkedIn distribution?",
        "a": "Every TALC.TV content feature is auto-syndicated to your LinkedIn company page with project photos, geo tags, and the GC tagged. Construction LinkedIn is a B2B goldmine for commercial framing leads."
      },
      {
        "q": "Is there a single-contractor exclusivity?",
        "a": "Yes — one steel stud contractor per metro region. Once Vancouver, Burnaby, Surrey, or Richmond is locked, no other shop can claim it on steelstudcontractors.com."
      }
    ],
    "date": "May 2026",
    "video": null,
    "title": "Commercial Steel Stud Framers in BC — Territory-Locked Steel Stud Contractors",
    "metaDescription": "Commercial Steel Stud Framing in British Columbia, BC. Lock your trade on steelstudcontractors.com for $10/month. EyeSpyr verified. One contractor per city. SE",
    "excerpt": "Steel stud contractors bid commercial drywall packages worth $80,000–$400,000 but get their leads from cold-calling GCs and the occasional referral. The exac…"
  },
  {
    "slug": "eyespyr-trust-layer",
    "brand": "eyespyr.com",
    "trade": "Contractor Verification & Trust",
    "tradeShort": "verification",
    "plural": "verified contractors",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Platform",
    "imageKey": "ten-dollar",
    "pain": "Every contractor directory in Canada has the same problem: anyone can list. Fake reviews, expired insurance, lapsed licenses, and ghost addresses turn the homeowner experience into a coin flip. The trust layer is missing — and that absence is exactly what EyeSpyr was built to fix.",
    "detail": "EyeSpyr is the verification and reputation infrastructure that sits underneath every BuildersHaus and IAM trade-domain listing. License verification, insurance expiry tracking, WCB/WorkSafe clearance, background check, address confirmation (a human actually visits the listed location), and accumulated verified reviews compound into a Trust Score that homeowners and AI search engines both consume.",
    "process": "Your EyeSpyr profile auto-pulls license status from BC, AB, and ON provincial registries, monitors insurance expiry with 30-day renewal alerts, aggregates Google + Facebook + BBB reviews into a single verified score, and exposes the whole package as schema.org Review + AggregateRating markup that Perplexity and ChatGPT cite directly in AI answers.",
    "faqs": [
      {
        "q": "Why do AI search engines care about verification?",
        "a": "LLMs like ChatGPT and Perplexity prioritize sources with verifiable credentials. A profile with structured Review, AggregateRating, and ProfessionalService schema, plus third-party verification badges, is exactly the source signal AI Overviews surface first."
      },
      {
        "q": "What does the Trust Score actually measure?",
        "a": "Six components: license validity, insurance/WCB currency, review aggregate (Google + Facebook + BBB + EyeSpyr direct), years in business, address verification, and dispute-resolution history. Each scored 0–100 then weighted into a composite."
      },
      {
        "q": "How is EyeSpyr different from BBB or HomeStars?",
        "a": "BBB is opt-in pay-to-play with no license verification. HomeStars is a lead-share directory that does not verify insurance currency. EyeSpyr verifies every credential in real time against provincial registries and physically confirms the address."
      },
      {
        "q": "Does EyeSpyr help with Google indexing?",
        "a": "Yes — verified profiles publish to the BuildersHaus sitemap with structured data that Google reads on first crawl. New EyeSpyr profiles typically index within 24–48 hours and appear in local pack results within 2–4 weeks."
      },
      {
        "q": "What about social proof distribution?",
        "a": "EyeSpyr verified badges auto-export to your LinkedIn company page, Facebook business page, and Twitter/X bio. The verification compounds across every social surface a buyer might check before hiring."
      },
      {
        "q": "What does EyeSpyr cost?",
        "a": "Included with every $10 IAM territory subscription. No separate verification fee. The platform is the moat — we want every territory partner verified so the network compounds."
      }
    ],
    "date": "April 2026",
    "video": null,
    "title": "EyeSpyR: How IAM Verifies Every Contractor Review and Credential Automatically",
    "metaDescription": "Contractor Verification & Trust in Canada-wide, BC. Lock your trade on eyespyr.com for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO ba",
    "excerpt": "Every contractor directory in Canada has the same problem: anyone can list. Fake reviews, expired insurance, lapsed licenses, and ghost addresses turn the ho…"
  },
  {
    "slug": "buildershaus-front-door",
    "brand": "buildershaus.com",
    "trade": "Canadian Contractor Network",
    "tradeShort": "contractor network",
    "plural": "network contractors",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Platform",
    "imageKey": "kitchen-cabinets",
    "pain": "Canadian contractors are stuck choosing between US-based directories (Angi, Thumbtack) that barely operate here, or paying HomeStars for shared leads that arrive in three competing inboxes. Nobody owns the Canadian contractor map — and that is the white space BuildersHaus was built to fill.",
    "detail": "BuildersHaus.com is the consumer-facing front door of the IAM network — one verified contractor per trade per city, EyeSpyr-backed, TALC.TV-promoted, and indexed by every trade-domain feeder in the portfolio (roofers.io, drywallers.io, finishingcarpenters.com, gasfitter.ca, etc.). The model is GEO + AEO + traditional SEO stacked: the same listing wins local pack, AI Overviews, and direct-search traffic simultaneously.",
    "process": "Your BuildersHaus city listing carries hero gallery, project portfolio, EyeSpyr Trust Score, direct WhatsApp lead routing, click-to-call CTA, and structured schema.org LocalBusiness + Service + AggregateRating markup. The page is cross-linked from every relevant trade domain, compounding internal link equity across 150+ properties.",
    "faqs": [
      {
        "q": "How is BuildersHaus different from Angi or HomeStars?",
        "a": "Angi shrinks Canadian ops every quarter; HomeStars sells the same lead to three contractors. BuildersHaus enforces one-contractor-per-city exclusivity, verifies through EyeSpyr, and feeds 150+ aged trade domains into the same listing."
      },
      {
        "q": "What is the local pack and how do I win it?",
        "a": "The local pack is the 3-result Google Maps box that appears for any 'near me' or city-qualified search. BuildersHaus listings carry NAP consistency, schema.org markup, and EyeSpyr review aggregation — the three signals Google's local algorithm weights highest."
      },
      {
        "q": "Does BuildersHaus appear in AI Overviews?",
        "a": "Yes — BuildersHaus pages are explicitly structured for Generative Engine Optimization (GEO). The schema, FAQ markup, and verified-source signals are exactly what Google's AI Overviews and Perplexity prioritize when generating contractor recommendations."
      },
      {
        "q": "How does the sitemap work?",
        "a": "BuildersHaus auto-generates a sitemap.xml with every contractor listing, pings Google + Bing via IndexNow on every update, and submits to Google Search Console daily. New listings typically index in under 48 hours."
      },
      {
        "q": "What about LinkedIn and Twitter/X distribution?",
        "a": "Every contractor profile auto-generates a LinkedIn project post and a Twitter/X card on every TALC.TV feature. The social signals feed back into search authority as inbound brand mentions."
      },
      {
        "q": "How do I claim my city?",
        "a": "$10/month, one contractor per trade per city, month-to-month, cancel anytime. Once claimed, no competitor can take the same trade+city combination on BuildersHaus or the underlying trade domain."
      }
    ],
    "date": "March 2026",
    "video": null,
    "title": "BuildersHaus: The IAM Network for Every Canadian Contractor Trade",
    "metaDescription": "Canadian Contractor Network in Canada-wide, BC. Lock your trade on buildershaus.com for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO b",
    "excerpt": "Canadian contractors are stuck choosing between US-based directories (Angi, Thumbtack) that barely operate here, or paying HomeStars for shared leads that ar…"
  },
  {
    "slug": "healthwealthhome-content-engine",
    "brand": "healthwealthhome.com",
    "trade": "Multi-Vertical Content Authority",
    "tradeShort": "content",
    "plural": "content partners",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Content & SEO",
    "imageKey": "interior-designers",
    "pain": "Most contractor websites publish three blog posts in 2019 and then go silent. The content well dries up, rankings decay, and the site slides off page one. Solo shops do not have time to publish weekly. The fix is not hiring a writer — it is plugging into a 14-year-aged content authority that already publishes.",
    "detail": "HealthWealthHome.com was registered January 2012 — 14 years of aged domain authority across three pillars (Health, Wealth, Home) that perfectly map to every IAM vertical. Every trade story, contractor project, and EyeSpyr feature is republished on HWH with canonical links pointing back to the trade domain, compounding topical authority across the entire network.",
    "process": "Your trade content (project photos, case studies, before-and-afters) is curated by TALC.TV, polished by AIBuildr, and syndicated to HealthWealthHome.com with proper canonical tags and schema.org Article + Author markup. The 14-year domain authority lifts the trade-domain page in Google's eyes via the canonical link relationship.",
    "faqs": [
      {
        "q": "What is canonical syndication and why does it help SEO?",
        "a": "Canonical tags tell Google 'this is the original source' so duplicate content syndicated across domains does not penalize either site. HWH publishes with rel=canonical pointing back to your trade domain, lifting your authority without duplicate-content risk."
      },
      {
        "q": "Why is a 14-year-old content domain valuable?",
        "a": "Domain age compounds. HWH has 14 years of inbound links, citations, and topical authority across Health, Wealth, Home — exactly the three pillars contractors, financial advisors, and dentists.ltd professionals all need."
      },
      {
        "q": "How often is content published?",
        "a": "TALC.TV produces 100+ pieces per month across the IAM network. Each territory partner gets quarterly featured content syndicated to HWH plus 8–10 sibling trade domains."
      },
      {
        "q": "Does HWH content rank in AI Overviews?",
        "a": "Yes — 14 years of topical authority plus Article schema makes HWH a frequent citation source in Google AI Overviews, Perplexity, and ChatGPT search. Your trade story gets cited via the canonical chain."
      },
      {
        "q": "What about LinkedIn and Twitter/X distribution?",
        "a": "Every HWH article auto-cross-posts to LinkedIn (long-form), Twitter/X (thread + card), and Facebook (link preview with structured OG tags). The social signals compound the SEO."
      },
      {
        "q": "How do I get featured?",
        "a": "Submit your project to BuildersHaus — TALC.TV picks the best monthly features for HWH syndication. Active territory partners average 1 HWH feature per quarter."
      }
    ],
    "date": "February 2026",
    "video": null,
    "title": "Multi-Vertical Content Authority — How IAM Builds Domain Networks Across Every Industry",
    "metaDescription": "Multi-Vertical Content Authority in Canada-wide, BC. Lock your trade on healthwealthhome.com for $10/month. EyeSpyr verified. One contractor per city. SEO + AE",
    "excerpt": "Most contractor websites publish three blog posts in 2019 and then go silent. The content well dries up, rankings decay, and the site slides off page one. So…"
  },
  {
    "slug": "talc-tv-ai-content",
    "brand": "talc.tv",
    "trade": "AI Content & Video Production",
    "tradeShort": "AI content",
    "plural": "content partners",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Content & AI",
    "imageKey": "videographers",
    "pain": "Contractors know they need video, blog content, and social proof — but nobody has time to produce it. Hiring a videographer is $2,000 per shoot. Hiring a content marketer is $4,000/month. The math does not work for a $10/month territory model. Unless the production engine is AI-powered.",
    "detail": "TALC.TV is the AI-powered content and distribution engine for the IAM network. One contractor submission (project photos, 60-second voice memo, address) becomes a polished article, a 90-second vertical video, three social cards, a LinkedIn long-form post, and a Twitter/X thread — all in under 10 minutes of contractor time and zero of contractor budget.",
    "process": "Submit a project via the BuildersHaus app: photos, location, scope. TALC.TV pipes it through AIBuildr (AI writing + image enhancement + voiceover), packages it into an article + video + social bundle, and syndicates across 8–10 IAM domains plus your LinkedIn, Facebook, Instagram, Twitter/X, and YouTube. Each piece is schema-marked for LLM citation.",
    "faqs": [
      {
        "q": "What is LLM-optimized content?",
        "a": "Content structured so large language models (ChatGPT, Claude, Perplexity, Gemini) parse, attribute, and cite it. Key elements: FAQ schema, clear Q&A structure, named entities (your business, your city, your trade), and verifiable claims with source links."
      },
      {
        "q": "How long does a TALC.TV feature take to produce?",
        "a": "Contractor time: 5–10 minutes (upload + voice memo). Production turnaround: 24–48 hours. Distribution: instant across the IAM network and your social channels."
      },
      {
        "q": "What about video SEO?",
        "a": "Every TALC.TV video carries schema.org VideoObject markup, transcript, chapter timestamps, and a video sitemap entry. Google indexes the video in the video search vertical and surfaces it in standard search via rich-result thumbnails."
      },
      {
        "q": "How does this help me on LinkedIn and Twitter/X?",
        "a": "Each TALC.TV bundle auto-publishes a LinkedIn long-form post (1,200 words with project photos), a Twitter/X thread (6–8 tweets with images), and an Instagram carousel. Native posting beats link-sharing for algorithm reach on every platform."
      },
      {
        "q": "Does the content get indexed by Google fast?",
        "a": "Yes — every TALC.TV publish pings Google + Bing via IndexNow, updates the sitemap, and submits to Search Console. Average index time is under 6 hours for new pages across the IAM network."
      },
      {
        "q": "What does TALC.TV cost?",
        "a": "Included with every $10 IAM territory subscription. One quarterly feature per territory minimum, with additional features available on a per-feature basis ($50–$200 depending on production depth)."
      }
    ],
    "date": "January 2026",
    "video": null,
    "title": "TALC.tv: How AI Content Distribution Works for Contractors at $10 Per Post",
    "metaDescription": "AI Content & Video Production in Canada-wide, BC. Lock your trade on talc.tv for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked in",
    "excerpt": "Contractors know they need video, blog content, and social proof — but nobody has time to produce it. Hiring a videographer is $2,000 per shoot. Hiring a con…"
  },
  {
    "slug": "aibuildr-geo-engine",
    "brand": "aibuildr.io",
    "trade": "Generative Engine Optimization (GEO)",
    "tradeShort": "GEO",
    "plural": "GEO partners",
    "city": "Canada-wide",
    "province": "BC",
    "category": "AI & SEO",
    "imageKey": "ten-dollar",
    "pain": "SEO is no longer just about Google's blue links. 47% of high-intent searches now end inside an AI answer engine — Perplexity, ChatGPT, Claude, Google AI Overviews, Gemini. If your business is not cited inside those answers, you are invisible to half the buying market. Traditional SEO does not solve this. GEO does.",
    "detail": "AIBuildr.io is the GEO (Generative Engine Optimization) layer of the IAM network. GEO is the practice of structuring content so LLMs cite it as a primary source in AI-generated answers. AIBuildr handles the schema, the FAQ structuring, the named-entity reinforcement, the citation-friendly formatting, and the answer-engine-ping submissions across every IAM territory listing.",
    "process": "Your AIBuildr layer auto-generates: JSON-LD schema (LocalBusiness, FAQPage, Service, Review), citation-ready FAQ blocks, named-entity reinforcement (business name + city + trade repeated in structured-data semantics), and direct submission to Perplexity, ChatGPT search, and Bing's AI index via available APIs.",
    "faqs": [
      {
        "q": "What is GEO and how is it different from SEO?",
        "a": "SEO optimizes for ranking in Google's blue links. GEO (Generative Engine Optimization) optimizes for citation in AI-generated answers (Perplexity, ChatGPT, Claude, Google AI Overviews). GEO requires structured data, verifiable claims, and citation-friendly formatting — overlapping but distinct from classical SEO."
      },
      {
        "q": "What is AEO and how is it different from GEO?",
        "a": "AEO (Answer Engine Optimization) is the broader umbrella covering all answer surfaces: voice assistants (Alexa, Siri, Google Assistant), featured snippets, People Also Ask, and AI Overviews. GEO is the LLM-specific subset of AEO focused on generative-AI citation."
      },
      {
        "q": "Do AI engines actually cite specific contractors?",
        "a": "Yes — Perplexity, ChatGPT search, and Google AI Overviews routinely cite named businesses with linked sources. The IAM network's structured-data approach and aged-domain authority makes its territory partners frequent citation targets."
      },
      {
        "q": "What about LinkedIn and Twitter/X for GEO?",
        "a": "LLMs index public LinkedIn posts and Twitter/X content as training and retrieval signals. AIBuildr cross-posts every territory content piece to both platforms with consistent named-entity formatting, reinforcing the citation chain."
      },
      {
        "q": "How do you measure GEO performance?",
        "a": "We track citations in Perplexity and ChatGPT search responses for territory-relevant queries, monitor AI Overview appearances for trade+city searches, and report monthly on AI-channel referral traffic in your analytics."
      },
      {
        "q": "What does AIBuildr cost?",
        "a": "Included with every $10 IAM territory subscription. The GEO layer applies automatically to your listing across every IAM domain you claim."
      }
    ],
    "date": "December 2025",
    "video": null,
    "title": "GEO vs SEO: How IAM Platforms Are Built for Generative Engine Optimization in 2026",
    "metaDescription": "Generative Engine Optimization (GEO) in Canada-wide, BC. Lock your trade on aibuildr.io for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + G",
    "excerpt": "SEO is no longer just about Google's blue links. 47% of high-intent searches now end inside an AI answer engine — Perplexity, ChatGPT, Claude, Google AI Over…"
  },
  {
    "slug": "financial-advisors-bc",
    "brand": "financialadvisors.io",
    "trade": "Financial Advisory",
    "tradeShort": "financial advisor",
    "plural": "financial advisors",
    "city": "British Columbia",
    "province": "BC",
    "category": "Professional Services",
    "imageKey": "ten-dollar",
    "pain": "Financial advisors pay $80–$200 per lead on Google Ads, $300–$500 per qualified appointment from referral networks, and split their LinkedIn time between 'thought leadership' nobody reads and prospecting that nobody answers. The $200–$2,000 per-lead value of this vertical demands a better acquisition channel.",
    "detail": "FinancialAdvisors.io is one of the highest lead-value verticals in the IAM portfolio. A single converted lead — a household wealth-management onboarding — can yield $5,000–$50,000 in annual fee revenue. The .io extension signals professional, B2B-adjacent, and tech-forward — exactly the brand cues a 35–55 year-old high-net-worth prospect is looking for.",
    "process": "Your financialadvisors.io territory carries IIROC/MFDA registration verification (via EyeSpyr), CFP/CIM/CFA designation badges, compliance disclaimers auto-inserted, schema.org FinancialService + Person markup for the lead advisor, and direct calendar-booking integration. Lead routing goes to your CRM with KYC pre-fill where compliant.",
    "faqs": [
      {
        "q": "How does an advisor get LinkedIn distribution from IAM?",
        "a": "Every TALC.TV financial-planning article auto-publishes to your LinkedIn as a long-form thought-leadership post with your bio, designations, and a calendar-booking CTA. LinkedIn is the dominant B2B and HNW prospecting channel in 2026."
      },
      {
        "q": "What about compliance with provincial regulators?",
        "a": "IAM templates include the mandatory IIROC/MFDA/CIRO disclaimer language and exclude prohibited promissory claims. Your compliance officer reviews and approves the template once; subsequent content stays within bounds."
      },
      {
        "q": "Does the .io extension hurt consumer trust?",
        "a": "Not for this audience. HNW prospects (35–55, technical literacy) read .io as 'modern, tech-forward, professional'. The brand cue actually reinforces credibility versus a generic .com directory listing."
      },
      {
        "q": "How does AI search affect financial advisor lead-gen?",
        "a": "Perplexity and ChatGPT search are increasingly the first stop for affluent prospects researching 'best fee-only financial advisor in Vancouver'. IAM's GEO structuring makes financialadvisors.io territory partners the cited source."
      },
      {
        "q": "What is the realistic lead volume?",
        "a": "Vancouver and Toronto territories average 4–12 qualified inbound inquiries per month. Smaller markets see 1–4. Conversion to fee-paying client is typically 15–25% over 90 days."
      },
      {
        "q": "Can I claim multiple cities?",
        "a": "Yes — most established advisory practices claim Vancouver + Burnaby + Richmond + Surrey for $40/month total. Single advisors typically start with one metro and expand once the lead flow proves out."
      }
    ],
    "date": "November 2025",
    "video": null,
    "title": "Financial Advisors in BC — Territory-Locked Marketing for Licensed Financial Professionals",
    "metaDescription": "Financial Advisory in British Columbia, BC. Lock your trade on financialadvisors.io for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO b",
    "excerpt": "Financial advisors pay $80–$200 per lead on Google Ads, $300–$500 per qualified appointment from referral networks, and split their LinkedIn time between 'th…"
  },
  {
    "slug": "insurance-brokers-bc",
    "brand": "insurancebrokers.io",
    "trade": "Insurance Brokerage",
    "tradeShort": "insurance broker",
    "plural": "insurance brokers",
    "city": "British Columbia",
    "province": "BC",
    "category": "Professional Services",
    "imageKey": "ten-dollar",
    "pain": "Independent insurance brokers compete against direct writers (TD, Aviva, Intact) that outspend them 100-to-1 on Google Ads, and against aggregator sites (Ratehub, LowestRates) that monetize the same brokers' commissions through lead resale. The independent broker needs an owned channel — not a rented one.",
    "detail": "InsuranceBrokers.io is the IAM channel for independent property, casualty, life, and commercial brokers. The .io domain ranks for broker-intent queries ('insurance broker near me', 'commercial insurance broker Vancouver', 'fleet insurance broker BC') that direct writers ignore because they cannibalize their own direct-to-consumer pipeline.",
    "process": "Your insurancebrokers.io territory carries provincial licensing verification (CAIB, CIP, FCIP designations), errors-and-omissions coverage proof, EyeSpyr trust score, line-of-business filtering (P&C, life, commercial, fleet), and a quote-request form that pre-routes to your underwriting team via WhatsApp or email.",
    "faqs": [
      {
        "q": "Why do I need a niche broker domain when I have a website?",
        "a": "Your own site is one URL competing against thousands. insurancebrokers.io aggregates the broker-intent traffic across the entire province into a directory that ranks for high-intent queries, then routes to your verified profile."
      },
      {
        "q": "How does this play with my carrier appointments?",
        "a": "IAM is a directory and lead-routing layer, not a carrier or MGA. Your existing appointments with Aviva, Intact, Wawanesa, Northbridge, etc. stay intact. The territory just sends qualified inbound prospects to your existing quoting process."
      },
      {
        "q": "What about Twitter/X distribution for B2B insurance content?",
        "a": "TALC.TV publishes commercial-insurance education content (cyber coverage, D&O, professional liability) to your Twitter/X with thread format. B2B insurance buyers actively follow these topics on X — it is a surprisingly high-conversion channel for commercial lines."
      },
      {
        "q": "Does AI search cite insurance brokers?",
        "a": "Yes — Perplexity routinely cites named brokers in answers to 'best commercial insurance broker for a construction company in Vancouver'. The IAM schema and EyeSpyr verification make territory partners frequent citation targets."
      },
      {
        "q": "How fast does the listing index in Google?",
        "a": "Under 48 hours via sitemap ping and IndexNow. Local pack appearance typically within 3–6 weeks as reviews and signals accumulate."
      },
      {
        "q": "Can I limit lead types?",
        "a": "Yes — filter by line of business (P&C, life, commercial, fleet, marine, etc.) and minimum premium threshold ($2,500/yr minimum, $10,000/yr minimum, etc.) to avoid time-wasters."
      }
    ],
    "date": "October 2025",
    "video": null,
    "title": "Insurance Brokers in BC — Territory-Locked Marketing That Ends the Lead Auction",
    "metaDescription": "Insurance Brokerage in British Columbia, BC. Lock your trade on insurancebrokers.io for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO b",
    "excerpt": "Independent insurance brokers compete against direct writers (TD, Aviva, Intact) that outspend them 100-to-1 on Google Ads, and against aggregator sites (Rat…"
  },
  {
    "slug": "fabricators-bc",
    "brand": "fabricators.io",
    "trade": "Metal Fabrication",
    "tradeShort": "fabrication",
    "plural": "fabricators",
    "city": "British Columbia",
    "province": "BC",
    "category": "Industrial",
    "imageKey": "framers",
    "pain": "Metal fabricators bid B2B contracts worth $50,000–$500,000 but get their leads from cold calls, the rare trade-show booth, and word-of-mouth from one project manager to another. The exact-match domain fabricators.io captures the entire B2B procurement search funnel — and the GC, the architect, and the spec writer all use it.",
    "detail": "Fabricators.io is built for B2B industrial procurement. The .io extension signals 'engineering-grade, professional, technical' — exactly the cues a project manager or spec writer is looking for. Schema.org ProfessionalService + Manufacturer markup makes the listing AI-citable when a GC asks Perplexity 'find me a CWB-certified structural steel fabricator in the Lower Mainland'.",
    "process": "Your fabricators.io territory displays CWB certification class (W47.1 Division 1, 2, or 2.1), CSA W178.2 weld inspector tickets, ISO certifications, equipment list (CNC plasma, press brake tonnage, max plate thickness), drawing-upload RFQ form, and Project Gallery with verified addresses via EyeSpyr.",
    "faqs": [
      {
        "q": "Why does B2B industrial need a different SEO approach?",
        "a": "B2B buyers (project managers, spec writers, GCs) search differently — longer queries, more technical terms, multi-stakeholder decisions. fabricators.io is structured for this with technical schema, equipment-list filtering, and capability-based search rather than location-only."
      },
      {
        "q": "What CWB certification do most projects require?",
        "a": "Structural projects typically require CWB W47.1 Division 1 or 2. Pressure vessel work requires ABSA registration. Architectural and miscellaneous metal can run under W47.1 Division 2.1."
      },
      {
        "q": "How fast does fabricators.io appear in Google for B2B queries?",
        "a": "The exact-match domain + aged authority + technical schema typically secures page-one rankings for 'metal fabricators [city]' within 8–16 weeks of listing claim. Long-tail technical queries index faster — often within 2–4 weeks."
      },
      {
        "q": "What about LinkedIn for industrial fabrication leads?",
        "a": "LinkedIn is the dominant B2B channel for fabrication. Every TALC.TV project feature auto-publishes to your LinkedIn with finished-product photos, GC tagged, and project specs called out. Project managers actively follow this content."
      },
      {
        "q": "Does AI search work for B2B procurement?",
        "a": "Increasingly yes. Procurement and estimating teams use Perplexity and ChatGPT to shortlist vendors before sending RFQs. IAM's GEO layer makes territory partners the cited shortlist source."
      },
      {
        "q": "Can I bundle with steelstudcontractors.com?",
        "a": "Yes — many shops do structural fabrication + steel stud framing. Stack fabricators.io + steelstudcontractors.com + steelstud.ca for $30/month total and cover the entire commercial-construction keyword stack."
      }
    ],
    "date": "September 2025",
    "video": null,
    "title": "Metal Fabricators in BC — Custom Fabrication, Territory-Locked and EyeSpyR Verified",
    "metaDescription": "Metal Fabrication in British Columbia, BC. Lock your trade on fabricators.io for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked in",
    "excerpt": "Metal fabricators bid B2B contracts worth $50,000–$500,000 but get their leads from cold calls, the rare trade-show booth, and word-of-mouth from one project…"
  },
  {
    "slug": "arborists-bc",
    "brand": "arborists.io",
    "trade": "Certified Arboriculture",
    "tradeShort": "arborist",
    "plural": "certified arborists",
    "city": "British Columbia",
    "province": "BC",
    "category": "Outdoor Services",
    "imageKey": "demolition",
    "pain": "Certified arborists compete against chainsaw-and-pickup operators who undercut on price, damage trees, and create the liability nightmares the real arborists then get blamed for. Municipal bylaws in Vancouver, Burnaby, and West Vancouver now require ISA certification for protected trees — but homeowners do not know the difference.",
    "detail": "Arborists.io is the licensed-professional channel for ISA Certified Arborists, BCMAFL TQ ticket holders, and tree-risk-assessment qualified (TRAQ) professionals. The .io extension and schema.org ProfessionalService + Certification markup make the listing the cited source for 'certified arborist near me' AI queries.",
    "process": "Your arborists.io territory carries ISA certification number, BCMAFL TQ ticket display, TRAQ qualification badge, WCB clearance, equipment list (climbing rigs, bucket truck reach, stump grinder capacity), and a tree-assessment booking form with municipal-permit checking baked in.",
    "faqs": [
      {
        "q": "What is ISA certification and why does it matter for SEO?",
        "a": "International Society of Arboriculture (ISA) certification is the professional standard. Vancouver, Burnaby, West Van, and most Lower Mainland municipalities require ISA-certified arborists for work on protected trees. The certification badge is a trust signal Google and AI engines weight heavily."
      },
      {
        "q": "How does the local pack work for arborists?",
        "a": "Google's local pack (the 3-result map box) for 'arborist near me' weights NAP consistency, review aggregation, and schema.org markup. EyeSpyr-verified arborists.io listings consistently win the pack within 6–12 weeks."
      },
      {
        "q": "What about Google Business Profile sync?",
        "a": "Your arborists.io listing auto-syncs NAP and category data to Google Business Profile via API. Inconsistent NAP across directories is the #1 killer of local pack rankings — IAM handles this automatically."
      },
      {
        "q": "Does Twitter/X help arborist lead-gen?",
        "a": "Twitter/X is the dominant channel for storm-response and emergency tree-removal calls. Real-time posting of after-storm availability captures urgent leads other directories miss."
      },
      {
        "q": "How does AI search cite arborists?",
        "a": "Perplexity and ChatGPT cite named, ISA-certified arborists when users ask 'who can remove a hazardous tree in Burnaby this week?'. IAM's GEO structuring + EyeSpyr verification = frequent citation."
      },
      {
        "q": "Can I bundle with demolition.io?",
        "a": "Yes — large lot-clearing projects often combine tree removal, stump grinding, and demolition. Stack arborists.io + demolition.io for $20/month and capture the full site-prep keyword stack."
      }
    ],
    "date": "August 2025",
    "video": null,
    "title": "Certified Arborists in BC — What Tree Removal and Care Actually Costs in 2026",
    "metaDescription": "Certified Arboriculture in British Columbia, BC. Lock your trade on arborists.io for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO bake",
    "excerpt": "Certified arborists compete against chainsaw-and-pickup operators who undercut on price, damage trees, and create the liability nightmares the real arborists…"
  },
  {
    "slug": "rebar-tv-construction-media",
    "brand": "rebar.tv",
    "trade": "Construction Video Media",
    "tradeShort": "construction video",
    "plural": "construction video partners",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Media",
    "imageKey": "framers",
    "pain": "Construction is one of the most visual industries on earth and one of the least-documented online. Project drone footage, time-lapse pours, finish reveals — the content exists on contractor phones and never makes it to the audiences (homeowners, GCs, manufacturers) that drive the next contract.",
    "detail": "Rebar.tv is the construction video media flagship of the IAM network. Short, memorable, .tv extension, international reach. Every contractor project becomes a 60–90 second vertical video with schema.org VideoObject markup, full transcript, chapter timestamps, and a video sitemap entry that Google indexes within hours.",
    "process": "Your project content (drone footage, time-lapse, finish reveal, interview) is produced by TALC.TV, distributed to rebar.tv with full VideoObject schema, syndicated to YouTube (with chapter markers and end-screen CTAs), Instagram Reels, TikTok, LinkedIn native video, and Twitter/X video card. Each surface optimized for its native algorithm.",
    "faqs": [
      {
        "q": "Why does video schema matter for SEO?",
        "a": "schema.org VideoObject markup makes Google eligible to display your video as a rich result (with thumbnail and duration) in standard search. It also enables a video sitemap entry that surfaces your content in Google's video search vertical."
      },
      {
        "q": "What is a video sitemap and how does it help?",
        "a": "A video sitemap is a separate XML file listing every video on your site with metadata (title, description, thumbnail, duration, upload date, content URL). Google uses it to discover and index video content faster than crawl-only discovery."
      },
      {
        "q": "Do AI Overviews cite video content?",
        "a": "Yes — Google's AI Overviews increasingly include video thumbnails as cited sources, especially for how-to and 'show me' queries. Rebar.tv content is structured for exactly this citation pattern."
      },
      {
        "q": "How does YouTube fit into the strategy?",
        "a": "Every rebar.tv video also uploads to YouTube with optimized title, description, chapter markers, end-screen CTAs, and pinned comment with location + trade keywords. YouTube is the #2 search engine globally and a major referral source."
      },
      {
        "q": "What about Instagram and TikTok?",
        "a": "Vertical 9:16 cuts auto-publish to Instagram Reels and TikTok with captions, location tags, and trade hashtags. Algorithm reach on Reels and TikTok dwarfs static-image posts for construction content."
      },
      {
        "q": "How long is a typical rebar.tv feature?",
        "a": "60–90 seconds vertical for social, 3–5 minutes horizontal for YouTube. Both cut from the same contractor-submitted source footage."
      }
    ],
    "date": "July 2025",
    "video": null,
    "title": "Construction Video & Media — How IAM Documents Every Trade with TALC.tv",
    "metaDescription": "Construction Video Media in Canada-wide, BC. Lock your trade on rebar.tv for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked in.",
    "excerpt": "Construction is one of the most visual industries on earth and one of the least-documented online. Project drone footage, time-lapse pours, finish reveals — …"
  },
  {
    "slug": "sparkys-tv-electricians",
    "brand": "sparkys.tv",
    "trade": "Licensed Electricians",
    "tradeShort": "electrician",
    "plural": "electricians",
    "city": "British Columbia",
    "province": "BC",
    "category": "Licensed Trades",
    "imageKey": "hvacr",
    "pain": "Electricians juggle Class A and Class B FSR tickets, EV charger installations growing 60% year-over-year, panel upgrades for heat-pump conversions, and the constant pressure of permit-pulling contractors who undercut by skipping the BC Safety Authority paperwork. The licensed electrician needs a channel that screens for it.",
    "detail": "Sparkys.tv (Sparky is universal trade slang for electrician) is the IAM channel for FSR-ticketed electricians in BC and Red Seal electricians across Canada. The .tv extension supports the video-heavy content strategy that EV chargers, panel upgrades, and smart-home installs naturally generate.",
    "process": "Your sparkys.tv territory carries FSR ticket display (Class A, B, or 2 Restricted), permit-pulling status with BC Safety Authority, EV-charger manufacturer certifications (Tesla, ChargePoint, Wallbox), TECK 90 cable expertise badge, and 24/7 emergency-call WhatsApp dispatch.",
    "faqs": [
      {
        "q": "What FSR class do I need for residential service work?",
        "a": "Field Safety Representative Class B covers residential up to 750V. Class A covers commercial/industrial above 750V. Class 2 Restricted is single-contractor self-employed and is the most common for owner-operator shops."
      },
      {
        "q": "How fast is the EV charger market growing in BC?",
        "a": "Level 2 home charger installs grew 60% year-over-year in 2025. CleanBC rebates and the 2030 ZEV mandate are pulling the curve forward. EV-certified electricians command premium pricing."
      },
      {
        "q": "Why is video so important for electricians?",
        "a": "Panel-upgrade reveals, EV charger installs, and smart-home walkthroughs are inherently visual. A 60-second sparkys.tv video shows the work, the cleanliness, and the finish — three things photos cannot convey."
      },
      {
        "q": "How does sparkys.tv rank in Google for emergency calls?",
        "a": "Emergency 'electrician near me now' queries weight local pack heavily. Sparkys.tv listings carry NAP consistency, schema.org EmergencyService markup, and Google Business Profile sync that wins these queries within 4–8 weeks of claim."
      },
      {
        "q": "Does AI search route emergency electrical calls?",
        "a": "Yes — Perplexity and Google AI Overviews routinely cite named electricians for emergency-call queries with verified 24/7 availability schema. The schema markup is the citation trigger."
      },
      {
        "q": "Can I bundle with gasfitter.ca and hvacr.tv?",
        "a": "Yes — multi-ticket mechanical shops stack sparkys.tv + gasfitter.ca + hvacr.tv for $30/month total. Each domain captures a different keyword stack but routes to the same dispatch."
      }
    ],
    "date": "June 2025",
    "video": null,
    "title": "Licensed Electricians in BC — How Territory Locking Ends the Lead-Sharing Race to the Bottom",
    "metaDescription": "Licensed Electricians in British Columbia, BC. Lock your trade on sparkys.tv for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked in",
    "excerpt": "Electricians juggle Class A and Class B FSR tickets, EV charger installations growing 60% year-over-year, panel upgrades for heat-pump conversions, and the c…"
  },
  {
    "slug": "jewellers-luxury-retail",
    "brand": "jewellers.ltd",
    "trade": "Luxury Jewellers & Custom Design",
    "tradeShort": "jeweller",
    "plural": "jewellers",
    "city": "Canada-wide",
    "province": "BC",
    "category": "Luxury Retail",
    "imageKey": "weddings",
    "pain": "Independent luxury jewellers compete against Tiffany, Birks, and the diamond-district aggregators that all outspend them on AdWords. Custom engagement-ring design, estate-piece restoration, and bespoke commissions are where independents win — but the SEO budget required to compete on 'engagement ring [city]' is prohibitive.",
    "detail": "Jewellers.ltd uses the .ltd extension to signal premium, established, incorporated luxury — the brand cues a HNW or affianced couple is looking for. The exact-match plural domain ranks for 'jewellers [city]' searches that the singular 'jeweller' SEO crowd does not target, and the .ltd cue elevates perceived prestige.",
    "process": "Your jewellers.ltd territory carries CJA (Canadian Jewellers Association) membership badge, GIA-certified gemologist credentials, custom-design portfolio with provenance documentation, EyeSpyr address verification, and a private-consultation booking form. Schema.org JewelryStore + Service + Person (for the master jeweller) markup feeds AI citation.",
    "faqs": [
      {
        "q": "Why does the .ltd extension work for luxury retail?",
        "a": ".ltd reads as 'established, incorporated, premium' — particularly in British-Canadian markets. For luxury verticals (jewellers, brides, chalet) the extension reinforces brand prestige rather than fighting it like .io would."
      },
      {
        "q": "How does Instagram fit into luxury jewellery SEO?",
        "a": "Instagram is the dominant visual channel for engagement rings and custom-design work. Every TALC.TV piece auto-publishes to Instagram with carousel format, location tags, and shoppable product tagging where available."
      },
      {
        "q": "Does AI search affect luxury retail discovery?",
        "a": "Increasingly yes. Couples researching engagement rings now ask Perplexity and ChatGPT 'best custom jewellers in Vancouver for emerald-cut diamond' — and the GIA-certified, schema-marked jewellers.ltd listing is the cited source."
      },
      {
        "q": "What about Pinterest distribution?",
        "a": "Pinterest drives high-intent visual traffic for engagement rings, wedding bands, and custom design. Every TALC.TV jewellery feature publishes to Pinterest with rich pins, schema-marked product data, and direct booking links."
      },
      {
        "q": "How fast does jewellers.ltd appear in Google?",
        "a": "The .ltd extension is fully indexed by Google and treated identically to .com for ranking purposes. Exact-match plural domain + aged authority typically secures page-one rankings within 8–12 weeks."
      },
      {
        "q": "Can I bundle with brides.ltd and weddings.io?",
        "a": "Yes — most luxury jewellers serve heavy bridal traffic. Stack jewellers.ltd + brides.ltd + weddings.io for $30/month and capture the entire pre-wedding decision funnel."
      }
    ],
    "date": "May 2025",
    "video": null,
    "title": "Luxury Jewellers & Custom Design — Territory-Locked Marketing for Premium Jewellery",
    "metaDescription": "Luxury Jewellers & Custom Design in Canada-wide, BC. Lock your trade on jewellers.ltd for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO",
    "excerpt": "Independent luxury jewellers compete against Tiffany, Birks, and the diamond-district aggregators that all outspend them on AdWords. Custom engagement-ring d…"
  },
  {
    "slug": "promows-lawn-care",
    "brand": "promows.com",
    "trade": "Professional Lawn Care",
    "tradeShort": "lawn care",
    "plural": "lawn care pros",
    "city": "British Columbia",
    "province": "BC",
    "category": "Recurring Services",
    "imageKey": "snow-removal",
    "pain": "Lawn care is a $176 billion global industry where most independent operators run on Kijiji, door hangers, and the occasional Facebook post. Recurring weekly-service contracts are the most profitable model on earth — but the lead-gen channels to fill the route are the most fragmented in the trades.",
    "detail": "ProMows.com is the IAM channel for professional lawn care, landscape maintenance, and recurring property-service operators. Recurring-service SEO is fundamentally different from one-off service SEO: schema.org RecurringService markup, route-density mapping, and seasonal-content velocity are the key signals.",
    "process": "Your promows.com territory carries service-area mapping (route density by postal code), recurring-package pricing display (weekly, bi-weekly, monthly), seasonal availability calendar (mowing season, fall cleanup, spring startup), and a route-density-optimized inquiry form that prioritizes leads in your existing routes.",
    "faqs": [
      {
        "q": "Why is recurring-service SEO different from one-off?",
        "a": "Recurring buyers want predictability and route density. Schema.org Service + Offer with frequency attributes signals to Google this is a subscription service, not a one-time call. Route-density mapping in the listing keeps your CAC down by clustering leads geographically."
      },
      {
        "q": "How does seasonal content velocity help rankings?",
        "a": "Lawn care has predictable seasonal search peaks (spring startup, mid-summer maintenance, fall cleanup, leaf removal). TALC.TV publishes seasonal content 4–6 weeks ahead of the search peak so your listing accumulates topical signals before the wave hits."
      },
      {
        "q": "Does AI search cite lawn care services?",
        "a": "Yes — 'best lawn care service in [city]' is a frequent Perplexity query in spring. IAM's GEO layer + EyeSpyr verification + recurring-service schema makes promows.com partners the cited source."
      },
      {
        "q": "What about Twitter/X for weather-driven services?",
        "a": "Twitter/X is the dominant channel for weather-driven service alerts (frost warnings, heat advisories, drought restrictions). Auto-posting service-availability updates during weather events captures urgent route fills."
      },
      {
        "q": "Can I bundle with plowwow.com for year-round routing?",
        "a": "Yes — most operators run lawn care April–October and snow removal November–March. Stack promows.com + plowwow.com for $20/month and capture year-round route density on the same client base."
      },
      {
        "q": "How does Google Business Profile sync work?",
        "a": "Your promows.com listing auto-syncs NAP, hours, service categories, and recurring-package details to Google Business Profile via API. NAP consistency across directories is the #1 local-pack ranking factor."
      }
    ],
    "date": "April 2025",
    "video": null,
    "title": "Lawn Care Services in BC — How Territory Locking Works for Landscapers and Lawn Pros",
    "metaDescription": "Professional Lawn Care in British Columbia, BC. Lock your trade on promows.com for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO baked ",
    "excerpt": "Lawn care is a $176 billion global industry where most independent operators run on Kijiji, door hangers, and the occasional Facebook post. Recurring weekly-…"
  },
  {
    "slug": "dentists-medical-aeo",
    "brand": "dentists.ltd",
    "trade": "Family & Cosmetic Dentistry",
    "tradeShort": "dentist",
    "plural": "dentists",
    "city": "British Columbia",
    "province": "BC",
    "category": "Healthcare",
    "imageKey": "interior-designers",
    "pain": "Dental practices compete in one of the most expensive Google Ads verticals in Canada — $15–$40 per click for 'dentist near me'. Insurance directories (Pacific Blue Cross, Sun Life) send leads but capture the patient relationship. Independent dentists need an owned, AI-citable channel that converts at consultation, not at click.",
    "detail": "Dentists.ltd uses the premium .ltd extension to signal established practice, professional credibility, and incorporated business — exactly the trust cues a new-patient prospect looks for. Medical AEO (Answer Engine Optimization) is distinct from other verticals: E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness) are weighted especially heavily for YMYL (Your Money Your Life) content.",
    "process": "Your dentists.ltd territory carries CDSBC registration verification, specialty designation badges (general, ortho, perio, endo, prostho), languages spoken, insurance carriers accepted, EyeSpyr address verification, and a HIPAA/PIPA-compliant new-patient booking form. Schema.org MedicalBusiness + Dentist + MedicalProcedure markup feeds Perplexity and ChatGPT medical citations.",
    "faqs": [
      {
        "q": "What is YMYL and why does it matter for dental SEO?",
        "a": "YMYL (Your Money Your Life) is Google's classification for content that affects health or finances. YMYL pages are held to the highest E-E-A-T standard — every claim needs verifiable expertise, every author needs credentials. Medical AEO requires this rigor."
      },
      {
        "q": "How do dentists get cited in Perplexity and ChatGPT?",
        "a": "Medical AI engines prioritize sources with verifiable professional credentials, structured MedicalBusiness schema, and citation-friendly FAQ formatting. Dentists.ltd territory partners with CDSBC verification consistently appear as cited sources."
      },
      {
        "q": "What about Google Business Profile for dental?",
        "a": "GBP is the #1 driver of new-patient inquiries for independent dental practices. Your dentists.ltd listing auto-syncs to GBP with insurance carriers, services, languages, and booking links pulled into the rich profile."
      },
      {
        "q": "Does LinkedIn matter for dental practices?",
        "a": "Less than for B2B verticals, but LinkedIn drives professional-network referrals and recruitment. TALC.TV publishes practice-spotlight content to LinkedIn for hygienist recruitment and specialist referral network building."
      },
      {
        "q": "How does the local pack work for 'dentist near me'?",
        "a": "Local pack weights review aggregation, NAP consistency, schema markup, and proximity. Dentists.ltd listings carry all four, plus EyeSpyr verification — a combination that consistently wins the pack within 6–10 weeks of claim."
      },
      {
        "q": "Can I bundle with chiropractors.ltd or animalhospitals.io?",
        "a": "Yes — if you operate a medical/wellness building with multiple practices, bundle dentists.ltd + chiropractors.ltd for $20/month and capture cross-referral keywords ('dentist and chiropractor same building Vancouver')."
      }
    ],
    "date": "March 2025",
    "video": null,
    "title": "Family & Cosmetic Dentists in BC — Territory-Locked Marketing for Dental Practices",
    "metaDescription": "Family & Cosmetic Dentistry in British Columbia, BC. Lock your trade on dentists.ltd for $10/month. EyeSpyr verified. One contractor per city. SEO + AEO + GEO ",
    "excerpt": "Dental practices compete in one of the most expensive Google Ads verticals in Canada — $15–$40 per click for 'dentist near me'. Insurance directories (Pacifi…"
  },
  {
    "slug": "ten-dollar-territories-explained",
    "brand": "industryarmymarketing.com",
    "trade": "IAM $10 Exclusive Territories",
    "tradeShort": "exclusive territory",
    "plural": "territory partners",
    "video": null,
    "imageKey": "ten-dollar",
    "city": "Canada-wide",
    "province": "BC",
    "category": "How It Works",
    "date": "February 2026",
    "title": "The 250 Scale — How IAM Territory Locking Gives Contractors Exclusive City Placement",
    "metaDescription": "IAM $10 Exclusive Territories in Canada-wide, BC. Lock your trade on industryarmymarketing.com for $10/month. EyeSpyr verified. One contractor per city. You p",
    "excerpt": "Every contractor in Canada has been pitched a $1,200/month SEO retainer or a $400-per-lead pay-per-click program. The math never works. So how does Industry Army Marketing sell exc…",
    "pain": "Every contractor in Canada has been pitched a $1,200/month SEO retainer or a $400-per-lead pay-per-click program. The math never works. So how does Industry Army Marketing sell exclusive city territories on premium trade domains for $10 a month?",
    "detail": "The answer is the network. IAM owns 200+ premium .io, .tv, and .ltd trade domains (kitchencabinets.io, plumbers.ltd, roofers.io, etc.). Each domain has 20-plus years of authority compounding. We do not sell SEO consulting — we rent you the ranking that already exists.",
    "process": "You pay $10/month. You get one listing on the trade domain that matches your service. You get exclusive territory (one contractor per trade per city). You get EyeSpyr verification. You get WhatsApp lead routing. You get sitemap, schema, and structured data baked in. Cancel any time. That is the whole offer.",
    "faqs": [
      {
        "q": "How is $10/month even possible?",
        "a": "We are not building you a custom site or running ads on your behalf. We are renting one slot on a domain that already ranks. The marginal cost to add one verified contractor is near zero."
      },
      {
        "q": "Whats the catch?",
        "a": "One contractor per trade per city. Once your territory is locked, no one else can buy it. You either grab it or watch a competitor grab it."
      },
      {
        "q": "What if I cancel?",
        "a": "Month-to-month. Cancel any time. Your slot opens to the next contractor in queue."
      },
      {
        "q": "Is this an SEO service?",
        "a": "No. It is a directory listing on a high-authority trade-specific domain. The SEO comes from the domain authority, not from a service we sell you."
      },
      {
        "q": "How many leads will I get?",
        "a": "Varies by city and trade. Vancouver plumbers see 15 to 40 qualified inbounds per month. Smaller markets see 5 to 15. We do not guarantee volume — we guarantee exclusivity."
      },
      {
        "q": "Can I buy multiple territories?",
        "a": "Yes. Stack a city (Vancouver), a trade (plumbing), and a niche (commercial). Most multi-territory partners run 3 to 6 listings for $30 to $60 a month total."
      }
    ]
  },
  {
    "slug": "chiropractors-vancouver",
    "brand": "chiropractors.ltd",
    "trade": "Chiropractic Care",
    "tradeShort": "chiropractor",
    "plural": "chiropractors",
    "video": null,
    "imageKey": "chiropractors",
    "city": "Vancouver",
    "province": "BC",
    "category": "Health",
    "date": "June 2026",
    "title": "Chiropractors in Vancouver — Territory-Locked Marketing for Licensed Chiropractic Clinics",
    "metaDescription": "Chiropractic Care in Vancouver, BC. Lock the chiropractors.ltd territory for $10/month. EyeSpyr verified, one clinic per city, SEO + AEO + GEO + LLM schema baked in.",
    "excerpt": "Vancouver chiropractic clinics burn $22 per click on Google Ads chasing 'chiropractor near me' while ICBC-funded patients hunt for a clinic that can bill direct…",
    "pain": "Vancouver chiropractic clinics burn $22 per click on Google Ads chasing 'chiropractor near me' while ICBC-funded patients hunt for a clinic that can bill direct. The clinics that rank in the Google 3-pack get the patient — everyone else gets the ad bill.",
    "detail": "Vancouver patients arrive with very specific intent: ICBC active claims, MSP supplementary coverage, sports injuries from the North Shore trail network, or post-partum pelvic care from Mount Pleasant young families. A clinic ranking on chiropractors.ltd signals specialization the moment a patient lands — not a generic wellness funnel pushing 30-visit packages.",
    "process": "Your chiropractors.ltd territory ships with the clinic profile, three treatment-room photos, ICBC and MSP billing badges, online booking embed, and direct WhatsApp routing for new-patient inquiries. EyeSpyr verifies the College of Chiropractors of BC registration so the listing carries the trust badge Google AI Overviews cite.",
    "faqs": [
      {
        "q": "Does ICBC cover chiropractic care in Vancouver?",
        "a": "Yes. ICBC funds 25 chiropractic visits inside the first 12 weeks of an active accident claim with no pre-approval required. Most chiropractors.ltd partners bill ICBC direct so patients pay nothing out of pocket."
      },
      {
        "q": "What does an adjustment cost without coverage?",
        "a": "Vancouver initial visits run $90 to $140 and follow-ups $55 to $85 in 2026. Most extended health plans (Pacific Blue Cross, Sun Life, Manulife) reimburse 80 percent up to an annual cap."
      },
      {
        "q": "How fast can I get an appointment?",
        "a": "chiropractors.ltd territory partners commit to a 24-hour new-patient response and a same-week first appointment for ICBC and acute-pain cases."
      },
      {
        "q": "Why only one clinic per city on chiropractors.ltd?",
        "a": "Exclusive territory. One verified clinic per metro region holds the listing. No bid wars, no shared leads, no three-clinic comparison page that erodes the patient's decision."
      },
      {
        "q": "Is the chiropractor College-registered?",
        "a": "Every chiropractors.ltd partner is verified against the public register of the College of Chiropractors of BC. EyeSpyr confirms the registration number before the listing goes live."
      },
      {
        "q": "Can the listing surface in Google AI Overviews?",
        "a": "Yes. The page ships with LocalBusiness, FAQPage, and MedicalBusiness schema plus structured E-E-A-T signals. That is the exact data Google Gemini, ChatGPT, and Perplexity cite when a patient asks 'best chiropractor in Vancouver'."
      }
    ]
  },
  {
    "slug": "movers-calgary",
    "brand": "mover.ltd",
    "trade": "Residential & Commercial Moving",
    "tradeShort": "moving",
    "plural": "moving companies",
    "video": null,
    "imageKey": "mover",
    "city": "Calgary",
    "province": "AB",
    "category": "Logistics",
    "date": "June 2026",
    "title": "Moving Companies in Calgary — How Territory Locking Beats Paying Per Lead",
    "metaDescription": "Residential & Commercial Moving in Calgary, AB. Lock the mover.ltd territory for $10/month. EyeSpyr verified, one mover per city, SEO + AEO + GEO + LLM schema baked in.",
    "excerpt": "Calgary moving companies pay U-Haul, HomeStars, and Bookmovers up to $95 per shared lead — and still get bid against three other crews before the truck rolls…",
    "pain": "Calgary moving companies pay U-Haul, HomeStars, and Bookmovers up to $95 per shared lead — and still get bid against three other crews before the truck rolls. The honest crews lose to the lowest quote, which is usually the crew that breaks the most furniture.",
    "detail": "Calgary moves are not Vancouver moves. Sub-zero January loadings, condo-tower elevator bookings in Beltline and East Village, oil-and-gas corporate relocations to the new downtown core, and acreage moves out to Springbank or Bearspaw all need different gear and pricing. A crew ranking on mover.ltd signals it actually serves the Calgary market — not a national van line subcontracting to whoever is cheap.",
    "process": "Your mover.ltd territory includes the crew profile, equipment photos (truck, dollies, blankets, piano boards), WorkSafe Alberta and CAM certification badges, an instant-quote form, and WhatsApp routing for time-sensitive inquiries. EyeSpyr verifies the Alberta Motor Transport Association number so the listing earns the structured-data trust the answer engines look for.",
    "faqs": [
      {
        "q": "What does a Calgary move cost in 2026?",
        "a": "Local 2-bedroom moves run $480 to $850 for a 3-person crew over 4 to 6 hours. Long-distance Calgary to Edmonton runs $1,800 to $2,800 per truck. Acreage and piano moves quote separately."
      },
      {
        "q": "How far ahead should I book a Calgary move?",
        "a": "Month-end and the last Saturday of every month book out 3 to 4 weeks ahead. Mid-month Tuesday or Wednesday moves can land same-week."
      },
      {
        "q": "Are mover.ltd partners insured?",
        "a": "Every territory partner carries cargo insurance up to $100,000 and liability up to $2 million. EyeSpyr verifies the certificate of insurance before the listing publishes."
      },
      {
        "q": "Can I move in -25C weather?",
        "a": "Yes — Calgary mover.ltd partners winterize trucks with heated cargo areas and use moisture-barrier wrap on wood furniture. January and February remain the cheapest months because demand drops."
      },
      {
        "q": "Do you handle corporate relocations?",
        "a": "Yes. mover.ltd territory partners serve the oil-and-gas, tech, and finance corridors with direct-bill corporate accounts and after-hours condo-tower bookings."
      },
      {
        "q": "Why is there only one mover per city?",
        "a": "Exclusive territory. One verified crew holds the Calgary listing. No bid race, no shared leads, no race to the bottom on price that ends with broken furniture."
      }
    ]
  },
  {
    "slug": "landscapers-toronto",
    "brand": "promows.ca",
    "trade": "Landscaping & Grounds Maintenance",
    "tradeShort": "landscaping",
    "plural": "landscapers",
    "video": null,
    "imageKey": "landscapers",
    "city": "Toronto",
    "province": "ON",
    "category": "Outdoor",
    "date": "June 2026",
    "title": "Landscaping Contractors in Toronto — Territory-Locked, EyeSpyR Verified, Licensed",
    "metaDescription": "Landscaping & Grounds Maintenance in Toronto, ON. Lock the promows.ca territory for $10/month. EyeSpyr verified, one crew per city, SEO + AEO + GEO + LLM schema baked in.",
    "excerpt": "Toronto landscaping crews fight 40-way bid wars on HomeStars while the Forest Hill, Rosedale, and Lawrence Park homeowners they want are quietly asking Google AI for 'best landscaper near me'…",
    "pain": "Toronto landscaping crews fight 40-way bid wars on HomeStars while the Forest Hill, Rosedale, and Lawrence Park homeowners they want are quietly asking Google AI Overviews and ChatGPT for 'best landscaper near me'. The crews that win that answer-engine citation own the season.",
    "detail": "Toronto landscaping is a 7-month season jammed into 12 months of overhead. The lawn cuts that pay the bills June through September have to subsidize fall cleanup, winter snow contracts, and spring opening. A crew ranking on promows.ca signals to the high-ticket Forest Hill, Rosedale, and Bridle Path estates that the work is full-service — design, hardscape, ongoing maintenance, snow — not a kid with a push mower.",
    "process": "Your promows.ca territory includes the crew profile, before-and-after project gallery, Landscape Ontario certification badge, instant-quote form, and WhatsApp routing for estate inquiries. EyeSpyr verifies the WSIB clearance and HST registration so the listing earns the structured-data trust Google's MUM, Gemini, and answer-engine layer cite first.",
    "faqs": [
      {
        "q": "What does a Toronto landscaping season cost in 2026?",
        "a": "Weekly maintenance contracts run $65 to $140 per visit depending on lot size. Full-service annual contracts (cut, edge, trim, fall cleanup, spring opening) clear $2,200 to $4,800 per year for a typical 50-foot Toronto lot."
      },
      {
        "q": "Do you handle hardscape and design?",
        "a": "Yes. promows.ca territory partners offer end-to-end design-build — paver patios, retaining walls, drainage, irrigation, and planting. Most projects run $14,000 to $80,000 for a Forest Hill or Lawrence Park front-and-back redesign."
      },
      {
        "q": "Are crews Landscape Ontario certified?",
        "a": "Every promows.ca territory partner is verified against the Landscape Ontario member register. EyeSpyr confirms the membership number before the listing publishes."
      },
      {
        "q": "Do you offer winter snow contracts?",
        "a": "Yes — most Toronto territory partners bundle snow clearing into the annual maintenance contract. Per-event pricing runs $85 to $180 per visit depending on driveway size and salt application."
      },
      {
        "q": "When should I book for the spring?",
        "a": "Spring opening books out by mid-February for May start dates. Design-build projects need to be quoted by January for a June dig start because permit timelines run 8 to 12 weeks in the City of Toronto."
      },
      {
        "q": "Why only one landscaping crew per city on promows.ca?",
        "a": "Exclusive territory. One verified crew holds the Toronto listing. No bid race against 40 contractors, no shared leads from HomeStars, no race-to-the-bottom on weekly cuts."
      }
    ]
  },
  {
    "slug": "hardscapes-kelowna",
    "brand": "hardscapes.io",
    "trade": "Hardscape & Paver Installation",
    "tradeShort": "hardscape",
    "plural": "hardscape contractors",
    "video": null,
    "imageKey": "hardscapes",
    "city": "Kelowna",
    "province": "BC",
    "category": "Outdoor",
    "date": "June 2026",
    "title": "Hardscape Contractors in Kelowna — Patios, Driveways & Retaining Walls in the Okanagan",
    "metaDescription": "Hardscape & Paver Installation in Kelowna, BC. Lock the hardscapes.io territory for $10/month. EyeSpyr verified, one crew per city, SEO + AEO + GEO + LLM schema baked in.",
    "excerpt": "Kelowna hardscape projects average $42,000 — but the crews installing them spend half their week chasing tire-kickers from Google forms instead of building patios…",
    "pain": "Kelowna hardscape projects average $42,000 — but the crews installing them spend half their week chasing tire-kickers from Google forms instead of building patios. The Okanagan lakefront and Upper Mission estate owners who actually buy are searching answer engines, not directory portals.",
    "detail": "Kelowna hardscape is its own animal. Okanagan summer heat hits 38C, winter freeze-thaw cycles destroy poorly bedded pavers, and the hillside Upper Mission and Lower Mission lots demand engineered retaining walls before any patio gets poured. A crew ranking on hardscapes.io signals it actually understands ICPI installation standards, allan-block engineering specs, and the BC Building Code permit thresholds — not a general landscaper who lays pavers on weekends.",
    "process": "Your hardscapes.io territory includes the crew profile, project gallery (patios, walls, fire features, lakefront stairs), ICPI certification badge, engineered-wall partnerships, instant-quote form, and WhatsApp routing for high-ticket estate inquiries. EyeSpyr verifies the WorkSafeBC clearance and ICPI certification so the listing earns the trust signal answer engines cite.",
    "faqs": [
      {
        "q": "What does a Kelowna hardscape project cost in 2026?",
        "a": "Paver patios run $35 to $55 per square foot installed. Engineered retaining walls run $80 to $160 per face foot depending on height and reinforcement. Full lakefront stair systems clear $40,000 to $120,000."
      },
      {
        "q": "Do I need a permit for a Kelowna retaining wall?",
        "a": "Walls over 1.2 metres in the City of Kelowna require an engineered design and building permit. hardscapes.io territory partners coordinate the engineering and permit submission as part of the quote."
      },
      {
        "q": "Are crews ICPI certified?",
        "a": "Every hardscapes.io territory partner is verified against the Interlocking Concrete Pavement Institute register. EyeSpyr confirms the certification number before the listing publishes."
      },
      {
        "q": "How long does a typical patio project take?",
        "a": "A 400 sq ft paver patio with base prep and edge restraint runs 4 to 7 working days. Engineered walls add 3 to 10 days depending on height and drainage."
      },
      {
        "q": "When should I book for summer build?",
        "a": "Kelowna hardscape season runs April through October. Design and quoting should happen by January for an April start. Mid-summer slots book 8 to 12 weeks ahead."
      },
      {
        "q": "Why only one hardscape crew per city on hardscapes.io?",
        "a": "Exclusive territory. One verified ICPI-certified crew holds the Kelowna listing. No bid race, no shared leads, no quote-shopping against four crews who undercut on base prep."
      }
    ]
  }
].map((p) => ({ ...p, image: IMG[p.imageKey] }));

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}
