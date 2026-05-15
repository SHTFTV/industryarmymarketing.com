import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Lock, Check, Crown } from "lucide-react";
import { domains } from "@/data/domains";
import CityClaimForm from "@/components/CityClaimForm";

type CityRecord = {
  name: string;
  province: string;
  population: string;
  rate: string;
  intro: string;
  taken: string[]; // trades already claimed
  landmarks?: string;
};

const CITY_DATA: Record<string, CityRecord> = {
  vancouver: {
    name: "Vancouver",
    province: "British Columbia",
    population: "~675,000",
    rate: "$65/month",
    intro:
      "Vancouver is BC's most competitive trade market — high-rises in Yaletown, infill builds in Mount Pleasant, and a steady stream of West Side renovations. Whoever owns the search results owns the calendar.",
    landmarks: "Downtown · Kitsilano · Mount Pleasant · East Van · West Side",
    taken: ["Gas Fitting"],
  },
  surrey: {
    name: "Surrey",
    province: "British Columbia",
    population: "~568,000",
    rate: "$55/month",
    intro:
      "Surrey is the fastest-growing city in BC, with massive new construction across Cloverdale, South Surrey, and Newton. Every trade has runway — and almost every territory is still wide open.",
    landmarks: "Cloverdale · South Surrey · Newton · Guildford · Whalley",
    taken: [],
  },
  calgary: {
    name: "Calgary",
    province: "Alberta",
    population: "~1,340,000",
    rate: "$130/month",
    intro:
      "Calgary's residential and commercial pipeline keeps trades busy year-round. Inheriting a 20-year-old domain on day one means you skip the climb and start at the top of the SERP.",
    landmarks: "Beltline · Inglewood · Bridgeland · Bowness · Auburn Bay",
    taken: [],
  },
  edmonton: {
    name: "Edmonton",
    province: "Alberta",
    population: "~1,010,000",
    rate: "$100/month",
    intro:
      "Edmonton's mix of new builds, infill housing, and government work makes for steady demand across every trade. Lock your category before someone else does.",
    landmarks: "Whyte Ave · Strathcona · Oliver · Windermere · Sherwood Park",
    taken: [],
  },
  toronto: {
    name: "Toronto",
    province: "Ontario",
    population: "~2,930,000",
    rate: "$290/month",
    intro:
      "Canada's largest market — and the most expensive lead market in the country. One contractor per trade. The math on a single Toronto job pays for years of IAM territory.",
    landmarks: "King West · Leslieville · The Annex · Etobicoke · Scarborough",
    taken: [],
  },
  kelowna: {
    name: "Kelowna",
    province: "British Columbia",
    population: "~145,000",
    rate: "$10/month",
    intro:
      "Kelowna's Okanagan boom — luxury homes, vineyards, and waterfront builds — has trades booked solid. At minimum rate, this is the most overlooked deal in the network.",
    landmarks: "Lower Mission · Glenmore · Rutland · Lake Country · West Kelowna",
    taken: [],
  },
};

const TRADES = [
  "Roofing", "Plumbing", "Electrical", "HVAC", "Gas Fitting", "Drywall",
  "Painting", "Framing", "Excavation", "Foundations", "Concrete", "Steel Stud",
  "Demolition", "Remodeling", "Finish Carpentry", "General Contracting",
  "Landscaping", "Snow Removal", "Cleaning", "Moving",
];

const faqs = (city: string, rate: string) => [
  { q: `How much does contractor marketing cost in ${city}?`, a: `${city} is ${rate}. The rate is fixed for exclusive territory holders and calculated at $10 per 100,000 population — minimum $10/month.` },
  { q: `What does exclusive territory mean in ${city}?`, a: `One contractor per trade per city — permanently. No other roofer, plumber, or electrician can claim ${city} once you do. Your competition is locked out for as long as you stay.` },
  { q: "What domains will my listing live on?", a: "150+ premium industry domains — roofers.io, gasfitter.ca, sparkys.tv, plumbers.ltd, hvacr.tv, drywallers.io, painters.tv, excavators.tv, foundations.io and more. All 20+ years old." },
  { q: `How long before I see leads in ${city}?`, a: "Most contractors see lead flow within 30 to 60 days. IAM domains already rank — you skip the years it takes a new site to build authority." },
  { q: "Is there a contract?", a: `No contract. Cancel anytime. The moment you cancel, your ${city} territory opens to your competitors immediately.` },
];

const titleCase = (s: string) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const slug = (city ?? "vancouver").toLowerCase();
  const data: CityRecord =
    CITY_DATA[slug] ?? {
      name: titleCase(slug),
      province: "Canada",
      population: "—",
      rate: "$10+/month",
      intro: `${titleCase(
        slug
      )} is open territory. Every trade is unclaimed today. Be the first contractor in your category and lock everyone else out — permanently.`,
      taken: [],
    };

  const openTrades = TRADES.filter((t) => !data.taken.includes(t));
  const faqList = faqs(data.name, data.rate);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Layout>
      <Seo
        title={`${data.name} Contractor Marketing | ${data.rate} Exclusive Territory`}
        description={`Lock your trade in ${data.name}, ${data.province}. ${openTrades.length}+ trades open today. ${data.rate}. One contractor per trade per city — permanent.`}
        path={`/cities/${slug}`}
        jsonLd={faqJsonLd}
      />
      <PageHeader
        eyebrow={`${data.name}, ${data.province} · IAM Territory`}
        title={`Own Your Trade In`}
        highlight={data.name}
        description={data.intro}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/contact">Claim {data.name} — {data.rate}</Link>
          </Button>
          <Button variant="heroOutline" asChild>
            <a href="tel:6047611518">Call 604-761-1518</a>
          </Button>
        </div>
      </PageHeader>

      {/* Stats strip */}
      <section className="py-12 border-b border-border bg-card/40">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: data.population, l: "Population" },
            { v: data.rate, l: "Monthly Rate" },
            { v: `${openTrades.length}+`, l: "Trades Open" },
            { v: "20+", l: "Years Authority" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl text-primary text-glow">{s.v}</div>
              <div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why this city */}
      {data.landmarks && (
        <section className="py-16 bg-background border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <MapPin className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div>
                <h2 className="font-display text-3xl text-foreground mb-2">
                  Where {data.name} Searches For You
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We dominate local search across {data.name}'s busiest neighbourhoods —{" "}
                  <span className="text-foreground">{data.landmarks}</span> — and every postal code in between.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Available trades */}
      <section className="py-20 gradient-tactical">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Live Availability · {data.name}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Trades <span className="text-primary">Available Today</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">
              First come, first served. When a trade is locked, it's gone for good.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {TRADES.map((t, i) => {
              const taken = data.taken.includes(t);
              return (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-md border ${
                    taken
                      ? "border-border bg-secondary/40 text-muted-foreground line-through"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  } transition-colors`}
                >
                  <span className="text-sm font-semibold">{t}</span>
                  {taken ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domain previews */}
      <section className="py-20 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Your URL Preview</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              {data.name} <span className="text-primary">Territory URLs</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {domains.slice(0, 9).map((d, i) => (
              <motion.div
                key={d.domain}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-mono text-primary truncate">{d.domain}/{slug}</div>
                  <div className="text-foreground text-sm mt-1">{data.name} {d.niche}</div>
                </div>
                <span className="text-xs uppercase tracking-widest text-primary border border-primary/40 rounded px-2 py-1 shrink-0">
                  Open
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 gradient-tactical">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">{data.name} FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">Direct Answers</h2>
          </div>
          <div className="space-y-4">
            {faqList.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-lg bg-card border border-border"
              >
                <h3 className="font-display text-xl text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prefilled claim form */}
      <CityClaimForm cityName={data.name} cityRate={data.rate} takenTrades={data.taken} />

      {/* Final CTA */}
      <section className="py-24 bg-background border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container mx-auto px-4 max-w-3xl text-center relative">
          <Crown className="w-10 h-10 text-primary mx-auto mb-5 text-glow" />
          <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight">
            Be The Only <span className="text-primary text-glow">{data.name}</span> Pro In Your Trade
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto">
            One quick call locks your category in {data.name}. {data.rate}. Cancel anytime — but nobody else can take your spot while you hold it.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">Claim {data.name} Now</Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="tel:6047611518" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 604-761-1518
              </a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="mailto:colin@industryarmymarketing.com" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Colin
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CityPage;