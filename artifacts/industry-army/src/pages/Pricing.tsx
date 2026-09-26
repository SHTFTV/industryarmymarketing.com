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
  "Business registration and directory listing on one relevant industry hub site",
  "Business name, contact details, trade and service area",
  "$10 per year for registration on that hub site",
  "Open registration — multiple businesses can be listed in the same category",
  "City-page partnerships are a separate upgrade",
];

const exclusiveFeatures = [
  "City-page opportunity for selected partners in an agreed category and market",
  "Reserved for creators who contribute useful, original industry content",
  "Share real projects, photos, videos, articles and practical knowledge",
  "Help grow your industry hub and the wider IAM network",
  "Fit, content expectations, placement and pricing agreed before activation",
  "Application and review required — registration alone does not reserve a city page",
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
  "$10/year covers registration on one hub site. Additional hub registrations and other services are separate.",
  "Hub registration remains open when a city-page partnership is occupied or held for a future partner.",
  "City-page upgrades are held for the right-fit creators, with an emphasis on useful content and network growth.",
  "Applying does not reserve a city page, guarantee acceptance or activate an upgrade.",
  "City or neighborhood, category, content expectations, pricing and billing terms are agreed before activation.",
  "Any exclusivity applies to the agreed city-page placement, not every directory listing or Google search result.",
];

const faqs: { q: string; a: string }[] = [
  {
    q: "What does the $10/year registration cover?",
    a: "It covers your business registration and directory listing on one relevant industry hub site, including your business name, contact details, trade and service area. It is the entry-level plan; a city-page partnership is a separate upgrade.",
  },
  {
    q: "Does $10 register me across the entire network?",
    a: "No. The $10 annual fee is for registration on one hub site. Contact IAM if you want to register on additional hubs or discuss other marketing services.",
  },
  {
    q: "Who is the city-page upgrade for?",
    a: "We are holding city pages for the right-fit creators and businesses who can contribute useful project photos, videos, articles or industry knowledge and help grow their hub and the wider network. We review fit before offering the upgrade.",
  },
  {
    q: "Can I buy or reserve a city page immediately?",
    a: "City-page partnerships are by application and review. Paying the registration fee or submitting an application does not reserve a city page or guarantee acceptance. Tell us about your business, market and the content you can contribute.",
  },
  {
    q: "How much does the city-page upgrade cost?",
    a: "It has separate pricing. After reviewing fit, we discuss your market, scope and content contribution, then agree the price and billing terms before activation. The $10/year registration fee is not the city-page upgrade price.",
  },
  {
    q: "How does renewal work?",
    a: "Hub registration is $10 per year and renews annually. City-page partnerships have separate terms agreed before activation. If a partnership ends, an active hub registration can remain in place; future city-page partners still go through the fit review.",
  },
];

const comparisonRows: { feature: string; directory: string; exclusive: string }[] = [
  { feature: "Price", directory: "$10 / year per hub site", exclusive: "Separate quote after fit review" },
  { feature: "Purpose", directory: "Register your business on one industry hub", exclusive: "Develop a city-page partnership" },
  { feature: "Availability", directory: "Open registration", exclusive: "Held for the right-fit creators" },
  { feature: "Content contribution", directory: "Business listing details", exclusive: "Useful projects, photos, videos or articles; expectations agreed together" },
  { feature: "City-page placement", directory: "Separate upgrade", exclusive: "Scope and availability confirmed before activation" },
  { feature: "Selection", directory: "Choose a relevant hub site", exclusive: "Application and fit review" },
  { feature: "Billing", directory: "Annual", exclusive: "Separate terms agreed before activation" },
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
      title="Pricing — $10/year Hub Registration & City-Page Partnerships | IAM"
      description="Register on one hub site for $10/year. City-page partnerships are a separate upgrade for selected content creators, with scope and pricing agreed after a fit review."
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
      description="Join one relevant hub for $10 USD/year. We keep participation accessible because your expertise, project stories and useful contributions help the network grow. City-page partnerships and hands-on marketing services are separately scoped."
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
              Tier 1 · Hub Registration
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              Hub Site Registration
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-6xl text-primary">$10</span>
              <span className="text-muted-foreground">/ year</span>
            </div>
            <p className="text-muted-foreground mb-6">
              The entrance fee for registration on one relevant industry hub site.
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
              Right Fit First
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              <Star className="w-4 h-4 text-primary" />
              Tier 2 · City-Page Partnership
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              City-Page Partnership
            </h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-4xl text-primary">Contact us</span>
            </div>
            <p className="text-sm text-muted-foreground italic mb-4">
              Separate pricing — agreed after a fit review.
            </p>
            <p className="text-muted-foreground mb-6">
              City pages are held for creators who contribute useful content and help grow their hub and the wider network.
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
                Registration does not include or reserve a city page. We agree the
                market, scope, content expectations and price before activation.{" "}
                <span className="text-primary font-semibold">
                  Tell us what you create and how you can contribute.
                </span>
              </p>
            </div>
            <Button variant="hero" asChild className="w-full">
              <Link
                to="/apply/contractors"
                onClick={() =>
                  trackEvent("pricing_tier_click", {
                    tier: "exclusive",
                    cta: "Apply for a City Page",
                  })
                }
              >
                Apply for a City Page
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
              to="/apply/contractors"
              onClick={() =>
                trackEvent("pricing_contact_click", { location: "global_rules_footer" })
              }
            >
              Apply for a City Page
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
            Registration vs <span className="text-primary">City Page</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            One hub registration. A separate, selective city-page upgrade.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
          <table
            className="w-full text-sm"
            aria-label="Hub registration versus city-page partnership comparison"
          >
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold w-1/3">
                  Feature
                </th>
                <th scope="col" className="text-left p-4 font-display text-lg text-foreground">
                  Hub Registration
                  <div className="text-xs text-muted-foreground font-sans normal-case tracking-normal">$10 / year</div>
                </th>
                <th scope="col" className="text-left p-4 font-display text-lg text-primary">
                  City-Page Partnership
                  <div className="text-xs text-muted-foreground font-sans normal-case tracking-normal">By application · separate quote</div>
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
        <ul className="md:hidden space-y-3" aria-label="Hub registration versus city-page partnership comparison">
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
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Hub Registration</p>
                  <p className="text-foreground">{row.directory}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">City-Page Partnership</p>
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