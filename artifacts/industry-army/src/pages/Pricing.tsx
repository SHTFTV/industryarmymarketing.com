import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { SITE_URL } from "@/components/Seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const directoryFeatures = [
  "Get listed in the platform directory",
  "EyeSpyR verified rating — pulled from 22+ independent sources, never self-reported",
  "Automatic review requests after every completed job via TALC",
  "Fully searchable by couples and clients",
  "No exclusivity — multiple vendors per category per market permitted",
  "Available to everyone regardless of market size or location",
];

const exclusiveFeatures = [
  "ONE vendor per category per market — strictly enforced, no exceptions",
  "Your listing appears above every directory vendor in every search and transaction",
  "Featured placement across the entire platform",
  "EyeSpyR verified rating",
  "TALC automatic review trigger after every job",
  "Your market, your category, yours alone",
];

const culturalCategories = [
  "Traditional / Western",
  "South Asian",
  "Jewish",
  "Chinese",
  "Latin / Hispanic / South American",
  "Middle Eastern",
  "African",
  "Filipino",
  "Other (contact us to expand)",
];

const industries: { heading: string; body: string }[] = [
  {
    heading: "Trades & Construction",
    body: "Roofers, Framers, Drywall, Flooring, Painters, Electricians, Plumbers, HVAC, Concrete, Landscaping, Fencing, Decking, Windows & Doors, Insulation, Siding, and more.",
  },
  {
    heading: "Home Services",
    body: "Cleaning, Lawn Care, Snow Removal, Handyman, Moving, Junk Removal, Pest Control, and more.",
  },
  {
    heading: "Wedding & Events",
    body: "Wedding Planners, Caterers, Videographers, Photographers, Florists, DJs, Venues, Hair & Makeup, Officiants, and more.",
  },
  {
    heading: "Real Estate",
    body: "Brokers, Agents, Property Managers.",
  },
];

const globalRules = [
  "Directory ($10/year) is always open — any vendor can list regardless of whether exclusive slots are taken.",
  "Exclusive vendor always appears above all directory listings — every search, every transaction, no exceptions.",
  "Exclusive slots are strictly enforced — zero double-booking permitted under any circumstances.",
  "TALC fires automatically on job completion for all tiers.",
  "EyeSpyR ratings are always pulled from 22+ verified independent sources — never self-reported.",
  "Monthly exclusive pricing is population/market based — contact us for your market rate.",
];

const faqs: { q: string; a: string }[] = [
  {
    q: "What's included in the $10/year Directory Listing?",
    a: "A full directory profile on the platform, EyeSpyR verified rating (pulled from 22+ independent sources), automatic TALC review requests after every completed job, and full searchability by clients — available to every trade in every market.",
  },
  {
    q: "What's included in Exclusive Market Ownership?",
    a: "One vendor per category per market — no competitors in your slot. Your listing appears above every directory vendor in every search and transaction, plus featured placement, EyeSpyR verified rating, and TALC auto-review triggers.",
  },
  {
    q: "Are there any limits on directory listings?",
    a: "No. The Directory tier is always open regardless of whether the exclusive slot for your category is taken. Multiple vendors per category per market are permitted at the directory level.",
  },
  {
    q: "How is Exclusive pricing determined?",
    a: "Exclusive monthly pricing is based on market population. Larger markets command higher monthly rates. Contact us with your city and category and we'll confirm your specific rate within 24 hours.",
  },
  {
    q: "How does billing and renewal work?",
    a: "Directory Listings are billed $10/year and renew annually. Exclusive Market Ownership is billed monthly at your market's rate and renews month-to-month while your slot is active. You can cancel Exclusive anytime — the slot returns to the market when your term ends.",
  },
  {
    q: "What happens if I let my Exclusive slot lapse?",
    a: "Your listing reverts to the Directory tier (if active) and the exclusive slot opens for another vendor in your category and market. Exclusive slots are strictly enforced — no double-booking under any circumstances.",
  },
];

const comparisonRows: { feature: string; directory: string; exclusive: string }[] = [
  { feature: "Price", directory: "$10 / year", exclusive: "Monthly · market-based" },
  { feature: "Directory listing", directory: "Yes", exclusive: "Yes" },
  { feature: "Vendors per category / market", directory: "Unlimited", exclusive: "One — you" },
  { feature: "Placement above directory", directory: "No", exclusive: "Yes — every search" },
  { feature: "Featured placement platform-wide", directory: "No", exclusive: "Yes" },
  { feature: "EyeSpyR verified rating (22+ sources)", directory: "Yes", exclusive: "Yes" },
  { feature: "TALC auto review requests", directory: "Yes", exclusive: "Yes" },
  { feature: "Market exclusivity", directory: "No", exclusive: "Strictly enforced" },
  { feature: "Billing cadence", directory: "Annual", exclusive: "Monthly" },
  { feature: "Cancel anytime", directory: "Yes (renews yearly)", exclusive: "Yes (month-to-month)" },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const seoPackagesItemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Industry Army Marketing SEO Packages",
  itemListElement: SEO_PACKAGES.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/seo-packages/${p.slug}`,
    name: `${p.name} — ${p.tagline}`,
  })),
};

const Pricing = () => (
  <Layout>
    <Seo
      title="Pricing — $10/yr Directory & Exclusive Market Ownership | IAM"
      description="Two tiers. $10/year Directory Listing open to every trade. Exclusive Market Ownership — one vendor per category per market, priced by population. Contact IAM for your rate."
      path="/pricing"
      jsonLd={[
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]),
        faqSchema,
        seoPackagesItemList,
      ]}
    />
    <PricingAnalytics />
    <PageHeader
      eyebrow="Simple Pricing"
      title="Simple Pricing."
      highlight="Serious Results."
      description="One low-cost entry point for every trade. One exclusive spot per market for those who want to own it."
    />

    {/* Two-tier grid */}
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-border bg-card p-8 flex flex-col"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              <Shield className="w-4 h-4 text-primary" />
              Tier 1 · Directory Listing
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              Directory Listing
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-6xl text-primary">$10</span>
              <span className="text-muted-foreground">/ year</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Open to every trade, every category, every city.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {directoryFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="rounded border border-border bg-secondary/40 p-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Who this is for</p>
              <p className="text-sm text-foreground">
                Any trades professional who wants to be found — roofers, framers,
                drywall, flooring, painters, electricians, plumbers, landscapers,
                wedding vendors, and every other trade category on the platform.
                If you do the work, you belong here.
              </p>
            </div>
            <Button variant="heroOutline" asChild className="w-full">
              <Link
                to="/contact?tier=directory"
                onClick={() =>
                  trackEvent("pricing_tier_click", {
                    tier: "directory",
                    cta: "Get Listed",
                  })
                }
              >
                Get Listed
              </Link>
            </Button>
          </motion.div>

          {/* Tier 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-lg border border-primary bg-surface-elevated shadow-[0_0_20px_hsl(var(--primary)/0.2)] p-8 flex flex-col"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded">
              Own Your Market
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              <Star className="w-4 h-4 text-primary" />
              Tier 2 · Exclusive Market Ownership
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              Exclusive Market Ownership
            </h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-4xl text-primary">Contact us</span>
            </div>
            <p className="text-sm text-muted-foreground italic mb-4">
              Monthly rate — based on your market size.
            </p>
            <p className="text-muted-foreground mb-6">
              Own your category in your market. No competitors. Just you.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {exclusiveFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="rounded border border-primary/30 bg-background/60 p-4 mb-6">
              <p className="text-sm text-foreground">
                Pricing is based on market population. Larger markets command
                higher monthly rates.{" "}
                <span className="text-primary font-semibold">
                  Contact IAM for your specific market rate.
                </span>
              </p>
            </div>
            <Button variant="hero" asChild className="w-full">
              <Link
                to="/contact?tier=exclusive"
                onClick={() =>
                  trackEvent("pricing_tier_click", {
                    tier: "exclusive",
                    cta: "Contact Us for Your Market Rate",
                  })
                }
              >
                Contact Us for Your Market Rate
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>

    {/* SEO Packages */}
    <section
      id="seo-packages"
      aria-labelledby="seo-packages-heading"
      className="py-16 md:py-20 bg-background border-t border-border"
      data-testid="seo-packages-section"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            SEO Packages
          </p>
          <h2
            id="seo-packages-heading"
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Bullets. Boom. <span className="text-primary">Bombs.</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Three authority-building packages that push rankings on the pages you
            already have. Pair any package with a Directory or Exclusive listing.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEO_PACKAGES.map((pkg) => (
            <div
              key={pkg.slug}
              data-testid={`seo-package-card-${pkg.slug}`}
              className={`rounded-lg border ${
                pkg.featured
                  ? "border-primary bg-surface-elevated shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  : "border-border bg-card"
              } p-8 flex flex-col relative`}
            >
              {pkg.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded">
                  Most Popular
                </div>
              )}
              <div className="text-3xl mb-2" aria-hidden="true">
                {pkg.icon}
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-foreground mb-1">
                {pkg.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                {pkg.tagline}
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display text-5xl text-primary">
                  ${pkg.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  · {pkg.deliverables} placements · {pkg.timelineDays} days
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                {pkg.summary}
              </p>
              <Button
                variant={pkg.featured ? "hero" : "heroOutline"}
                asChild
                className="w-full"
              >
                <Link
                  to={`/seo-packages/${pkg.slug}`}
                  onClick={() =>
                    trackEvent("pricing_tier_click", {
                      tier: `seo_${pkg.slug}`,
                      cta: "Get Started",
                      source: "pricing_seo_packages",
                    })
                  }
                >
                  Get Started
                </Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/seo-packages"
            className="text-primary text-sm uppercase tracking-widest hover:underline"
          >
            Compare all SEO packages →
          </Link>
        </div>
      </div>
    </section>

    {/* Market definitions */}
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Market Scope</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            How Markets Are <span className="text-primary">Defined</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground mb-2">Standard Markets</h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Towns & Mid-Size Cities</p>
            <p className="text-foreground">
              Exclusivity is scoped to the <strong className="text-primary">full city</strong>.
              One exclusive vendor per category per city.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground mb-2">Major Cities</h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Toronto · Los Angeles · New York · Chicago · Vancouver · etc.
            </p>
            <p className="text-foreground">
              Major cities are broken into <strong className="text-primary">neighborhoods, boroughs, and districts</strong>.
              Exclusivity is scoped to the neighborhood level — one exclusive
              vendor per category per neighborhood. More exclusive slots
              available, and hyper-local ownership for vendors who want it.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Platform-specific rules */}
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Platform Rules</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Platform-Specific <span className="text-primary">Exclusivity</span>
          </h2>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground mb-1">weddings.io — Wedding Industry</h3>
            <p className="text-foreground mb-4">
              Wedding Planners and Caterers carry an additional layer of
              exclusivity: exclusive by{" "}
              <strong className="text-primary">neighborhood/city + cultural category</strong>.
              A city can have multiple exclusive wedding planner slots
              simultaneously — one per cultural category. A South Asian wedding
              planner is not competing with a Jewish wedding planner for the
              same exclusive slot.
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Available cultural categories</p>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              {culturalCategories.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              All other wedding vendor categories are exclusive by city or
              neighborhood only: Videographers, Photographers, Florists, DJs,
              Hair & Makeup, Officiants, Venues.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground mb-1">
              promows.com — Local Services
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Lawn · Snow · Maintenance · Cleaning · Handyman
            </p>
            <p className="text-foreground">
              Exclusivity scoped to <strong className="text-primary">neighborhood only</strong>.
              These trades are hyper-local — vendors don't cross city zones.
              One exclusive vendor per category per neighborhood.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground mb-1">realestatebroke.io — Real Estate</h3>
            <p className="text-foreground">
              Exclusivity scoped to <strong className="text-primary">neighborhood only</strong>.
              One exclusive real estate broker per neighborhood.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Industries */}
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Open to All Trades</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Industries <span className="text-primary">We Serve</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Not exhaustive — we're open to every trade and actively expanding.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {industries.map((i) => (
            <div key={i.heading} className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-xl text-primary mb-2">{i.heading}</h3>
              <p className="text-foreground text-sm leading-relaxed">{i.body}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-foreground mt-8 max-w-2xl mx-auto">
          We are open to all industries and trades. If your category isn't
          listed,{" "}
          <Link
            to="/contact"
            className="text-primary underline underline-offset-4"
            onClick={() =>
              trackEvent("pricing_contact_click", { location: "industries_expand" })
            }
          >
            contact us
          </Link>
          {" "}— we are actively expanding.
        </p>
      </div>
    </section>

    {/* Global rules */}
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Fine Print</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Global <span className="text-primary">Rules</span>
          </h2>
        </div>
        <ul className="space-y-3">
          {globalRules.map((r) => (
            <li key={r} className="flex items-start gap-3 rounded border border-border bg-card p-4">
              <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground text-sm">{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link
              to="/contact"
              onClick={() =>
                trackEvent("pricing_contact_click", { location: "global_rules_footer" })
              }
            >
              Contact Us for Your Market Rate
            </Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Side-by-side comparison */}
    <section
      id="tier-comparison"
      className="py-16 md:py-20 bg-background border-t border-border"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            Side by Side
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Directory vs <span className="text-primary">Exclusive</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Same platform. Different level of ownership.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
          <table
            className="w-full text-sm"
            aria-label="Directory versus Exclusive tier comparison"
          >
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold w-1/3">
                  Feature
                </th>
                <th scope="col" className="text-left p-4 font-display text-lg text-foreground">
                  Directory
                  <div className="text-xs text-muted-foreground font-sans normal-case tracking-normal">$10 / year</div>
                </th>
                <th scope="col" className="text-left p-4 font-display text-lg text-primary">
                  Exclusive
                  <div className="text-xs text-muted-foreground font-sans normal-case tracking-normal">Contact for market rate</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <th
                    scope="row"
                    className="text-left align-top p-4 text-foreground font-medium"
                  >
                    {row.feature}
                  </th>
                  <td className="align-top p-4 text-foreground/90">{row.directory}</td>
                  <td className="align-top p-4 text-foreground/90">{row.exclusive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked list */}
        <ul className="md:hidden space-y-3" aria-label="Directory versus Exclusive tier comparison">
          {comparisonRows.map((row) => (
            <li
              key={row.feature}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {row.feature}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Directory</p>
                  <p className="text-foreground">{row.directory}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Exclusive</p>
                  <p className="text-foreground">{row.exclusive}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-16 md:py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">FAQ</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            What's included, limits, and how billing works.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger
                className="text-left font-display text-lg text-foreground"
                onClick={() =>
                  trackEvent("pricing_faq_open", { question: f.q })
                }
              >
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/90 text-sm leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link
              to="/contact"
              onClick={() =>
                trackEvent("pricing_contact_click", { location: "faq_footer" })
              }
            >
              Still have questions? Contact us
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

const PricingAnalytics = () => {
  useEffect(() => {
    trackEvent("pricing_view", {});
  }, []);
  return null;
};

export default Pricing;