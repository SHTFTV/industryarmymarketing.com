import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";
import SeoBanner from "@/components/SeoBanner";
import { Button } from "@/components/ui/button";

export interface LocalCityData {
  city: string;
  slug: string;
  province: string;
  population: string;
  blurb: string;
  neighbourhoods: string[];
}

const valueProps = [
  { icon: "🔒", title: "Exclusive Territory", body: "You're the only contractor in your trade on each IAM domain in your city. Competitors are physically locked out." },
  { icon: "⚡", title: "20+ Year Authority", body: "Inherit the SEO weight of premium domains acquired and built over more than two decades." },
  { icon: "🛡️", title: "EyeSpyr Verified", body: "Customers see the verification badge before they call. Trust is pre-loaded into the lead." },
  { icon: "📡", title: "I-Spy-R Alerts", body: "WhatsApp alerts for negative reviews, sentiment dips, and competitor activity in under 5 minutes." },
];

const versus = {
  them: [
    "Shared lead pools — bidding against 3+ competitors for the same customer",
    "Google Ads costs up 300% in 5 years — and rising",
    "Agency retainers $1,000–$5,000/month with no exclusivity",
    "6–12 month contracts",
    "No reputation monitoring — bad reviews surface late",
    "They work with your competitors too",
  ],
  us: [
    "Exclusive territory — you're the only one on the domain in your city",
    "Flat $10/month per territory — no per-population markup",
    "$10 listing, $10 guest post, $10 territory — that's the entire pricing",
    "Month-to-month. Cancel anytime",
    "I-Spy-R sentiment alerts in <5 minutes via WhatsApp",
    "One contractor, one trade, one city — full stop",
  ],
};

const LocalCity = ({ data }: { data: LocalCityData }) => (
  <Layout>
    <Seo
      title={`Contractor Marketing ${data.city} ${data.province} — Exclusive Territory | IAM`}
      description={`Stop sharing leads in ${data.city}. Lock exclusive advertising rights on ${data.city}'s top trade domains. One contractor per trade. EyeSpyr verified. $10/month.`}
      path={`/local/${data.slug}`}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: `Industry Army Marketing — ${data.city}`,
        areaServed: { "@type": "City", name: data.city },
        address: { "@type": "PostalAddress", addressRegion: data.province, addressCountry: "CA" },
        priceRange: "$10",
        url: `https://industryarmymarketing.com/local/${data.slug}`,
      }}
    />
    <SeoBanner alt={`Contractor SEO & AEO marketing in ${data.city}`} />
    <PageHeader
      eyebrow={`${data.city}, ${data.province} · Population ${data.population}`}
      title={`Contractor Marketing`}
      highlight={data.city}
      description={data.blurb}
    >
      <div className="flex flex-wrap gap-4">
        <Button variant="hero" size="lg" asChild>
          <Link to="/scan-wizard">Check {data.city} Availability</Link>
        </Button>
        <Button variant="heroOutline" size="lg" asChild>
          <Link to="/pricing">See Pricing</Link>
        </Button>
      </div>
    </PageHeader>
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Why IAM in {data.city}</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">
          Lock Out <span className="text-primary text-glow">Competitors</span>
        </h2>
        <FeatureGrid features={valueProps} columns={2} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Coverage</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
          Neighbourhoods We Cover
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {data.neighbourhoods.map((n) => (
            <div key={n} className="p-3 rounded-md bg-card border border-border text-center text-foreground/90 text-sm">
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">IAM vs. Everyone Else</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">
          Why Agencies and Directories <span className="text-primary text-glow">Fail You</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-display text-2xl text-foreground mb-4">Agencies & Directories</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {versus.them.map((t) => (
                <li key={t} className="flex gap-2"><span className="text-destructive">✗</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-card border border-primary/40">
            <h3 className="font-display text-2xl text-primary text-glow mb-4">Industry Army Marketing</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {versus.us.map((t) => (
                <li key={t} className="flex gap-2"><span className="text-primary">✓</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
    <CtaBanner
      title={`Lock ${data.city}.`}
      highlight="Today."
      description={`Run a free scan and we'll confirm which trade territories are still open in ${data.city}.`}
      primaryLabel={`Check ${data.city} Availability`}
      primaryTo="/scan-wizard"
    />
  </Layout>
);

export default LocalCity;