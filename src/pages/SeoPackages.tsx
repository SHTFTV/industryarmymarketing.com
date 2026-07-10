import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { breadcrumbList } from "@/lib/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Clock, Target, Zap } from "lucide-react";

type Pkg = {
  name: string;
  icon: string;
  tagline: string;
  price: number;
  featured?: boolean;
  linkBuilding: string[];
  iam: string[];
  tier2: string[];
};

const packages: Pkg[] = [
  {
    name: "Bullets",
    icon: "🔫",
    tagline: "Entry-Level Authority",
    price: 85,
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
    iam: ["1 IAM industry vertical (your niche)", "industryarmymarketing.com mention"],
    tier2: ["Blog comment link juice", "Bookmark link juice", "Instant link indexer", "Drip feed pinging"],
  },
  {
    name: "Boom",
    icon: "💥",
    tagline: "Mid-Tier Authority",
    price: 285,
    featured: true,
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
  },
  {
    name: "Bombs",
    icon: "💣",
    tagline: "Full Arsenal",
    price: 585,
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
  },
];

const pillars = [
  { icon: "🏗️", name: "Trades & Construction", desc: "Roofing, framing, demolition, plumbing, HVAC, drywall, finishing, steel stud" },
  { icon: "🏠", name: "Real Estate", desc: "Listings, brokerages, mortgage, strata, property management, IDX sites" },
  { icon: "💍", name: "Weddings & Events", desc: "Venues, catering, photography, planning, florals, entertainment, corporate events" },
  { icon: "💼", name: "Finance & Professional", desc: "Insurance brokers, financial advisers, mortgage brokers, legal, accounting" },
  { icon: "🌿", name: "Cannabis", desc: "Licensed producers, dispensaries, CBD brands, compliance professionals, hemp" },
  { icon: "⚕️", name: "Health, Wealth & Home", desc: "Wellness, nutrition, fitness, home improvement, lifestyle, personal finance" },
  { icon: "🚗", name: "Automotive & Transport", desc: "Dealerships, mechanics, logistics, fleet operators, towing, mobile services, backhaul" },
  { icon: "🌱", name: "Landscaping & Snow", desc: "Mowing, plowing, arborists, irrigation, growers, ranchers, brine & salting" },
  { icon: "⛏️", name: "Mining & Resources", desc: "Critical minerals, IR communications, mining media, resource exploration, IPOs" },
  { icon: "🏕️", name: "Hospitality & Recreation", desc: "Cabins, chalets, float homes, lodges, MMA & sports, tourism, recreation facilities" },
];

const faqs = [
  {
    q: "What makes IAM packages different from other link building services?",
    a: "Every IAM package includes exclusive placements across our proprietary 150+ domain portfolio — category-killer industry-specific domains in weddings, trades, real estate, finance, cannabis, and construction. These placements aren't available anywhere else.",
  },
  {
    q: "Are the articles original or spun?",
    a: "Original. Every article submitted as part of a Bullets, Boom, or Bombs package is 500+ words of original content written specifically for the placement domain. We do not use content spinning software. Google E-E-A-T guidelines are respected on every piece.",
  },
  {
    q: "Do you use the same domains for multiple clients?",
    a: "No. IAM network placements are not shared. A domain used for your placement in a given month is not simultaneously placed with a competing client in the same niche. Domain exclusivity is part of what makes the network valuable.",
  },
  {
    q: "Is white label available for agencies?",
    a: "Yes. White label link reports are available on all packages. Contact us to discuss white label arrangements for recurring agency orders. We do not appear on client-facing materials unless requested.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery is 14 days from order confirmation and receipt of target URL and keywords. Rush delivery is available on Boom and Bombs packages.",
  },
  {
    q: "Can I order multiple packages for the same site?",
    a: "Yes. Many clients run Bullets monthly for maintenance and add a Boom or Bombs blast when targeting a new keyword cluster or launching a new page. We recommend spacing full Bombs packages 60–90 days apart for natural link velocity.",
  },
];

const SeoPackages = () => (
  <Layout>
    <Seo
      title="Bullets. Boom. Bombs. — SEO Link Building Packages | IAM"
      description="Three tiers of authority-building SEO link packages — each includes exclusive placements across the IAM 150+ domain industry network. No duplicate domains. No spun content."
      path="/seo-packages"
      jsonLd={[
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "SEO Packages", path: "/seo-packages" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Bullets Boom Bombs SEO Link Building Packages",
          provider: {
            "@type": "Organization",
            name: "Industry Army Marketing",
            url: "https://industryarmymarketing.com",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "SEO Link Building Packages",
            itemListElement: packages.map((p) => ({
              "@type": "Offer",
              name: `${p.name} — ${p.tagline}`,
              price: String(p.price),
              priceCurrency: "USD",
            })),
          },
        },
      ]}
    />
    <PageHeader
      eyebrow="Industry Army Marketing · SEO Packages"
      title="Bullets. Boom."
      highlight="Bombs."
      description="Three tiers of authority-building link packages — each one includes exclusive placements across the IAM industry network. No duplicate domains. No spun content. No shared footprints."
    />

    {/* Stats */}
    <section className="py-10 border-y border-primary/20 bg-primary/5">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          ["150+", "IAM network domains"],
          ["DA 40–70", "Average link authority"],
          ["14 days", "Delivery standard"],
          ["0", "Duplicate domains per client"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="font-display text-3xl md:text-4xl text-primary">{n}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Packages */}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          Choose Your <span className="text-primary">Package</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Every package includes exclusive placements across IAM's industry-specific domain network — links your competitors can't get anywhere else.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-lg border p-8 flex flex-col gap-5 bg-card ${
                p.featured ? "border-primary shadow-[0_0_32px_hsl(var(--primary)/0.15)]" : "border-border"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className="font-display text-4xl text-foreground">{p.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{p.tagline}</div>
              </div>
              <div className="font-display text-4xl text-primary">
                ${p.price}
                <span className="text-sm text-muted-foreground font-sans font-normal"> / one-time</span>
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Link Building</div>
                <ul className="space-y-2">
                  {p.linkBuilding.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">IAM Network Placements</div>
                <ul className="space-y-2">
                  {p.iam.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Tier 2 Drip</div>
                <ul className="space-y-2">
                  {p.tier2.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" /> 14 day delivery
              </div>
              <Button variant={p.featured ? "hero" : "outline"} className="w-full mt-auto" asChild>
                <a href={`mailto:colin@industryarmymarketing.com?subject=${p.name} Package Order`}>Order {p.name}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* IAM Network */}
    <section className="py-20 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          The IAM <span className="text-primary">Industry Network</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
          Every package includes placements across IAM's private portfolio of 150+ industry domain hubs — category-specific properties across trades, real estate, weddings, finance, construction, cannabis, and services. Niche-matched. Not listed publicly.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[["150+", "Industry domain hubs"], ["19 years", "Building the network"], ["Growing", "New hubs monthly"], ["Private", "Not publicly listed"]].map(([n, l]) => (
            <div key={l} className="p-5 rounded-lg border border-primary/25 bg-primary/5 text-center">
              <div className="font-display text-2xl text-primary">{n}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {pillars.map((p) => (
            <div key={p.name} className="p-5 rounded-lg border border-border bg-card">
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="font-semibold text-foreground mb-1">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="font-display text-2xl text-primary mb-2">Sitting on a category-killer domain?</div>
            <p className="text-muted-foreground text-sm">
              IAM acquires long-standing, niche-specific domain assets to grow the network. If you own a premium industry domain — aged, established, category-defining — we want to talk.
            </p>
          </div>
          <Button variant="hero" asChild>
            <a href="mailto:colin@industryarmymarketing.com?subject=Domain Acquisition Inquiry">Talk to us →</a>
          </Button>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Simple process. No login required. No software. Just real links built by real people on real sites.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            ["Order your package", "Email us your package choice, target URL, and 3–5 keywords."],
            ["We build the links", "Original 500+ word articles for each placement. No spun content. E-E-A-T compliant."],
            ["IAM network placements", "Niche-matched placements go live across the IAM domain portfolio."],
            ["Tier 2 drip fires", "Link juice amplification, pinging, and indexer services run automatically."],
            ["Report delivered", "Full link report with every live URL delivered within 14 days."],
          ].map(([t, d], i) => (
            <div key={t} className="relative p-5 rounded-lg border border-border bg-card">
              <div className="absolute -top-3 left-5 w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                {i + 1}
              </div>
              <div className="font-semibold text-foreground mt-3 mb-1">{t}</div>
              <div className="text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-20 bg-card/40 border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-10">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="p-6 rounded-lg border border-border bg-card">
              <div className="font-semibold text-foreground mb-2">{f.q}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-primary/5 border-y border-primary/20 text-center">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">Ready to Deploy?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Send us your target URL and 3–5 keywords. We'll confirm your package and get started within 24 hours.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <a href="mailto:colin@industryarmymarketing.com?subject=SEO Package Order — Bullets Boom Bombs">Email to Order</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default SeoPackages;