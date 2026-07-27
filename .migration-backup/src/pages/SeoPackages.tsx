import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import SeoPackageEstimator from "@/components/SeoPackageEstimator";
import { breadcrumbList } from "@/lib/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO_PACKAGES } from "@/data/seoPackages";
import PriceUsd from "@/components/PriceUsd";
import { Check, Clock, Target, Zap, ShieldCheck, RefreshCw, FileText, Lock } from "lucide-react";

const pillars = [
  { icon: "🏗️", name: "Trades & Construction", desc: "Roofing, framing, demolition, plumbing, HVAC, drywall, finishing, steel stud" },
  { icon: "🏠", name: "Real Estate", desc: "Listings, brokerages, mortgage, strata, property management, IDX sites" },
  { icon: "💍", name: "Weddings & Events", desc: "Venues, catering, photography, planning, florals, entertainment, corporate events" },
  { icon: "💼", name: "Finance & Professional", desc: "Insurance brokers, financial advisers, mortgage brokers, legal, accounting" },
  { icon: "🌿", name: "Cannabis", desc: "Licensed producers, dispensaries, CBD brands, compliance professionals, hemp" },
  { icon: "⚕️", name: "Health, Wealth & Home", desc: "Wellness, nutrition, fitness, home improvement, lifestyle, personal finance" },
  { icon: "🚗", name: "Automotive & Transport", desc: "Dealerships, mechanics, logistics, fleet operators, towing, mobile services" },
  { icon: "🌱", name: "Landscaping & Snow", desc: "Mowing, plowing, arborists, irrigation, growers, ranchers, brine & salting" },
  { icon: "⛏️", name: "Mining & Resources", desc: "Critical minerals, IR communications, mining media, resource exploration, IPOs" },
  { icon: "🏕️", name: "Hospitality & Recreation", desc: "Cabins, chalets, float homes, lodges, MMA & sports, tourism, recreation facilities" },
];

const faqs = [
  {
    q: "What makes IAM packages different from other link building services?",
    a: "Every IAM package includes exclusive placements across our proprietary 150+ domain portfolio — category-killer industry-specific domains in weddings, trades, real estate, finance, cannabis, and construction. These placements aren't available anywhere else. You're not just getting generic Web 2.0 links — you're getting anchor placements on domains that define their verticals.",
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
    a: "Yes. White label link reports are available on all packages. Contact us to discuss recurring agency arrangements. We do not appear on client-facing materials unless requested.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery is 14 days from order confirmation and receipt of target URL and keywords. Rush delivery is available on Boom and Bombs packages — contact us to discuss.",
  },
  {
    q: "How many revisions are included?",
    a: "Bullets includes 1 round, Boom includes 2 rounds, Bombs includes 3 rounds. Revisions cover anchor text, target URL, and content tone. All revisions happen before placements go live.",
  },
  {
    q: "What if a link drops or gets removed?",
    a: "We monitor all placements for 90 days. Any link that drops in that window is replaced free of charge with an equivalent DA placement on the same tier of domain.",
  },
  {
    q: "Can I order multiple packages for the same site?",
    a: "Yes. Many clients run Bullets monthly for maintenance and add a Boom or Bombs blast when targeting a new keyword cluster or launching a new page. We recommend spacing full Bombs packages 60–90 days apart for natural link velocity.",
  },
  {
    q: "Do you guarantee rankings?",
    a: "No — and neither does anyone honest. We guarantee delivery of every placement listed in your package, on real domains with real DA, with a full report. Rankings depend on on-page SEO, competition, and site quality factors outside a link package.",
  },
  {
    q: "What niches don't you serve?",
    a: "We do not build links for adult, gambling, pharmaceutical, or crypto pump-and-dump projects. Every other legal industry is welcome.",
  },
];

const SeoPackages = () => (
  <Layout>
    <Seo
      title="Bullets. Boom. Bombs. — SEO Link Building Packages | IAM"
      description="Three tiers of authority-building SEO link packages — each includes exclusive placements across the IAM 150+ domain industry network. No duplicate domains. No spun content. 14-day delivery."
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
            itemListElement: SEO_PACKAGES.map((p) => ({
              "@type": "Offer",
              name: `${p.name} — ${p.tagline}`,
              price: String(p.price),
              priceCurrency: "USD",
              url: `https://industryarmymarketing.com/seo-packages/${p.slug}`,
            })),
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
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

    {/* Trust bar */}
    <section className="py-8 border-b border-border">
      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {[
          "Unique domains only",
          "500+ word original articles",
          "Google E-E-A-T compliant",
          "No spun content",
          "90-day link replacement",
          "White-label available",
        ].map((t) => (
          <span key={t} className="text-sm text-primary font-semibold">✓ {t}</span>
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
          {SEO_PACKAGES.map((p) => (
            <div
              key={p.slug}
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
                <PriceUsd usd={p.price} suffix=" / one-time" />
              </div>
              <p className="text-sm text-muted-foreground">{p.summary}</p>
              <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-border">
                <div>
                  <div className="font-display text-lg text-primary">{p.deliverables}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Placements</div>
                </div>
                <div>
                  <div className="font-display text-lg text-primary">{p.timelineDays}d</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Delivery</div>
                </div>
                <div>
                  <div className="font-display text-lg text-primary">{p.revisions}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Revisions</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Link Building</div>
                <ul className="space-y-2">
                  {p.linkBuilding.slice(0, 6).map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {p.linkBuilding.length > 6 && (
                    <li className="text-xs text-muted-foreground italic pl-6">
                      + {p.linkBuilding.length - 6} more placements
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">IAM Network</div>
                <ul className="space-y-2">
                  {p.iam.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                <Clock className="w-4 h-4" /> {p.timelineDays} day delivery
              </div>
              <div className="space-y-2">
                <Button variant={p.featured ? "hero" : "outline"} className="w-full" asChild>
                  <Link to={`/seo-packages/${p.slug}`}>See Full {p.name} Details →</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href={`mailto:colin@industryarmymarketing.com?subject=${p.name} Package Order`}>
                    Order {p.name} · <PriceUsd usd={p.price} showList={false} />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Package Estimator */}
    <SeoPackageEstimator />

    {/* Comparison table */}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          Side-by-Side <span className="text-primary">Comparison</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Deliverables, timelines, and revisions across all three tiers.
        </p>

        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Feature</th>
                {SEO_PACKAGES.map((p) => (
                  <th
                    key={p.slug}
                    className={`px-6 py-4 text-center ${p.featured ? "text-primary" : ""}`}
                  >
                    <div className="text-lg">{p.icon}</div>
                    <div className="font-display text-xl text-foreground mt-1">{p.name}</div>
                    <div className="text-[10px] tracking-widest">{p.tagline}</div>
                    {p.featured && (
                      <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
                        MOST POPULAR
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { label: "Price (one-time)", get: (p: typeof SEO_PACKAGES[number]) => (
                  <span className="font-display text-2xl text-primary"><PriceUsd usd={p.price} /></span>
                ) },
                { label: "Total placements", get: (p) => `${p.deliverables}` },
                { label: "Delivery time", get: (p) => `${p.timelineDays} days` },
                { label: "Revisions included", get: (p) => `${p.revisions} round${p.revisions === 1 ? "" : "s"}` },
                { label: "Mini blog / satellite posts", get: (p) => p.linkBuilding.find((l) => l.includes("satellite"))?.split(" ")[0] ?? "—" },
                { label: "Web 2.0 properties", get: (p) => p.linkBuilding.find((l) => l.includes("web 2.0"))?.split(" ")[0] ?? "—" },
                { label: "Article submissions", get: (p) => p.linkBuilding.find((l) => l.includes("article submissions"))?.split(" ")[0] ?? "—" },
                { label: "EDU / GOV profiles", get: (p) => p.linkBuilding.find((l) => l.includes("EDU / GOV"))?.split(" ")[0] ?? "—" },
                { label: "PBN posts (DA 50+)", get: (p) => {
                  const m = p.linkBuilding.find((l) => l.includes("PBN"));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "Techbullion posts", get: (p) => {
                  const m = p.linkBuilding.find((l) => l.includes("Techbullion"));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "Google News PR", get: (p) => {
                  const m = p.linkBuilding.find((l) => /Google News/i.test(l));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "IAM industry verticals", get: (p) => {
                  const m = p.iam.find((l) => /IAM industry vertical/.test(l));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "IAM .io placements", get: (p) => {
                  const m = p.iam.find((l) => /\.io domain/.test(l));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "IAM .tv / .ltd placements", get: (p) => {
                  const m = p.iam.find((l) => /\.tv or \.ltd/.test(l));
                  return m ? m.split(" ")[0] : "—";
                } },
                { label: "IAM .com placement", get: (p) => (p.iam.some((l) => /\.com placement/.test(l)) ? "✓" : "—") },
                { label: "weddings.io / roofers.io anchor", get: (p) => (p.iam.some((l) => /weddings\.io/.test(l)) ? "✓" : "—") },
                { label: "Tier 2 drip duration", get: (p) => {
                  if (p.tier2.some((l) => /60/.test(l))) return "60 days";
                  if (p.tier2.some((l) => /30/.test(l))) return "30 days";
                  return "Standard";
                } },
                { label: "Domain exclusivity", get: () => "✓" },
                { label: "90-day link guarantee", get: () => "✓" },
                { label: "White-label reports", get: () => "✓" },
                { label: "Rush delivery available", get: (p) => (p.slug === "bullets" ? "—" : "✓") },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="px-6 py-3 font-medium text-foreground">{row.label}</td>
                  {SEO_PACKAGES.map((p) => (
                    <td
                      key={p.slug}
                      className={`px-6 py-3 text-center text-muted-foreground ${
                        p.featured ? "bg-primary/5" : ""
                      }`}
                    >
                      {row.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border bg-card/60">
                <td className="px-6 py-4"></td>
                {SEO_PACKAGES.map((p) => (
                  <td key={p.slug} className={`px-6 py-4 ${p.featured ? "bg-primary/5" : ""}`}>
                    <div className="flex flex-col gap-2">
                      <Button variant={p.featured ? "hero" : "outline"} size="sm" asChild>
                        <Link to={`/seo-packages/${p.slug}`}>See {p.name} →</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:colin@industryarmymarketing.com?subject=${p.name} Package Order`}>
                          Order <PriceUsd usd={p.price} showList={false} />
                        </a>
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Prefer a personalized proposal? <a href="#estimator" className="text-primary underline">Run the estimator</a> and download a PDF tailored to your inputs.
        </p>
      </div>
    </section>

    {/* Deliverables & Timelines detail */}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          Deliverables & <span className="text-primary">Timelines</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Every package runs on the same 14-day standard. Here's exactly what fires, when.
        </p>

        <div className="space-y-12">
          {SEO_PACKAGES.map((p) => (
            <div key={p.slug} className="rounded-lg border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{p.icon}</span>
                    <h3 className="font-display text-3xl text-foreground">{p.name}</h3>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{p.tagline}</span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{p.summary}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl text-primary"><PriceUsd usd={p.price} /></div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.deliverables} placements</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Full Deliverables
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                    {[...p.linkBuilding, ...p.iam].map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> 14-Day Timeline
                  </h4>
                  <ol className="relative border-l-2 border-primary/30 pl-5 space-y-4">
                    {p.timeline.map((t) => (
                      <li key={t.day}>
                        <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-primary" />
                        <div className="text-xs uppercase tracking-widest text-primary font-bold">{t.day}</div>
                        <div className="text-sm text-muted-foreground mt-1">{t.step}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" asChild>
                  <Link to={`/seo-packages/${p.slug}`}>Full {p.name} Page →</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:colin@industryarmymarketing.com?subject=${p.name} Package Order`}>
                    Order · <PriceUsd usd={p.price} showList={false} />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Trust / What's Included */}
    <section className="py-20 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          What's <span className="text-primary">Included in Every Package</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          The same standards apply whether you fire Bullets or drop Bombs.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, t: "Domain Exclusivity", d: "No IAM domain placed for a competing client in your niche during the same cycle." },
            { icon: RefreshCw, t: "Free Revisions", d: "1–3 rounds by tier. Anchor text, target URL, and content tone adjustments pre-publish." },
            { icon: Clock, t: "14-Day Delivery", d: "Standard turnaround from order confirmation to full link report. Rush available on Boom/Bombs." },
            { icon: FileText, t: "Full Link Report", d: "Every live URL, anchor text, DA, and placement domain — CSV + PDF, white-label available." },
            { icon: Zap, t: "Tier 2 Drip Amplification", d: "Every primary link gets Tier 2 juice, indexer, and pinging to accelerate authority transfer." },
            { icon: Lock, t: "90-Day Link Guarantee", d: "Any link that drops within 90 days is replaced free with an equivalent DA placement." },
            { icon: Check, t: "500+ Word Originals", d: "No spun content. E-E-A-T compliant. Written for each placement's domain and audience." },
            { icon: Target, t: "IAM Network Access", d: "Category-killer industry domains you cannot get anywhere else. Included in every tier." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-5 rounded-lg border border-border bg-card">
              <Icon className="w-6 h-6 text-primary mb-3" />
              <div className="font-semibold text-foreground mb-1">{t}</div>
              <div className="text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* IAM Network */}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          The IAM <span className="text-primary">Industry Network</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
          Every package includes placements across IAM's private portfolio of 150+ industry domain hubs — category-specific properties across trades, real estate, weddings, finance, construction, cannabis, and services. Niche-matched. Not listed publicly.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.name} className="p-5 rounded-lg border border-border bg-card">
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="font-semibold text-foreground mb-1">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-20 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Answers to what agencies and contractors ask before ordering.
        </p>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 rounded-lg border border-border bg-card open:border-primary/40">
              <summary className="font-semibold text-foreground cursor-pointer flex justify-between items-start gap-4 list-none">
                <span>{f.q}</span>
                <span className="text-primary text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA */}
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