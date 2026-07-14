import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Code2, Gauge, Network, Check, ShieldCheck } from "lucide-react";
import heroAsset from "@/assets/services/web-development-hero.jpg.asset.json";

const tiers = [
  {
    name: "Skirmish",
    price: "$499",
    tag: "One-page tactical launcher",
    bullets: [
      "Single-page conversion site",
      "Mobile-first, sub-second load",
      "Contact form + SMS/email routing",
      "Basic on-page SEO + schema",
      "Ships in 5-7 business days",
    ],
  },
  {
    name: "Advance",
    price: "$1,499",
    tag: "Multi-page conversion machine",
    highlight: true,
    bullets: [
      "Up to 8 pages (home, services, cities, blog seed, about, contact, legal, thank-you)",
      "Blog engine with RSS + sitemap",
      "Local SEO schema on every page",
      "Analytics + conversion tracking",
      "1 round of revisions, 14-day build",
    ],
  },
  {
    name: "Flagship",
    price: "$3,999",
    tag: "Full-network operator site",
    bullets: [
      "Unlimited pages, custom design system",
      "City-page generator (up to 25 cities)",
      "Booking or quote workflow",
      "Full analytics + CRM webhook",
      "3 rounds of revisions, 30-day build",
      "Priority support for 90 days",
    ],
  },
];

const faqs = [
  {
    q: "What does IAM web development actually build?",
    a: "Fast, modern React and static-generated websites. No WordPress, no bloated page builders, no plugin sprawl. Every site ships with clean code, sub-second load times, mobile-first design, on-page SEO, structured data, and a conversion path wired to your inbox or CRM.",
  },
  {
    q: "Why not WordPress?",
    a: "WordPress is a 22-year-old CMS carrying every legacy decision it ever made. It is slow to load, expensive to secure, and requires monthly plugin maintenance. Our sites run on the modern web stack (React, Vite, Tailwind, static hosting) so they load in under a second, cost nothing to host, and cannot be broken by a plugin update at 3am.",
  },
  {
    q: "How much does a website cost?",
    a: "Three tiers: Skirmish at $499 for a single-page launcher, Advance at $1,499 for a multi-page conversion machine, Flagship at $3,999 for a full-network operator site with a city-page generator and booking workflow. All-in pricing — no monthly platform fee, no hidden hosting bill.",
  },
  {
    q: "Do I have to join the IAM network?",
    a: "No. Joining the network is optional and free. If you join, your site is cross-linked from 350+ dofollow domains, syndicated through TALC.tv, and eligible for shared ranking momentum. If you do not join, you still get a beautifully built site that is yours forever. Your call.",
  },
  {
    q: "What is included in every tier?",
    a: "Custom design, mobile-first responsive layout, on-page SEO (title, meta, canonical, og tags, JSON-LD), sitemap and robots.txt, contact form or booking widget with SMS or email routing, analytics wiring, and a live launch on a domain you own.",
  },
  {
    q: "Are there upsells I should know about?",
    a: "Yes — three optional add-ons: Eyespyr competitor monitoring, TALC.tv social syndication, and the IAM dofollow backlink network at $10 per placement. None are required. Each pays for itself in leads within the first quarter for most trades.",
  },
  {
    q: "Do I own the code and the domain?",
    a: "Yes to both. You own the domain (we help you register or transfer if needed). You own the built site. If you ever leave IAM, the site goes with you — we hand over the repository and deploy config.",
  },
  {
    q: "How fast is fast?",
    a: "Skirmish and Advance builds routinely score 95-100 on Google Lighthouse for Performance. Time-to-first-byte under 200ms, largest contentful paint under 1.2s on 4G. Speed is a ranking factor and a conversion factor — we do not compromise on it.",
  },
];

const WebDevelopment = () => {
  const path = "/services/web-development";
  const image = heroAsset.url;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Web Development for Contractors and Service Businesses",
      serviceType: "Web Development",
      provider: { "@type": "Organization", name: "Industry Army Marketing", url: "https://www.industryarmymarketing.com" },
      description: "Fast, modern React and static-generated websites for contractors, trades, and service professionals. Three tiers from $499 to $3,999. Optional network membership.",
      image: `https://www.industryarmymarketing.com${image}`,
      offers: tiers.map((t) => ({ "@type": "Offer", name: t.name, price: t.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.industryarmymarketing.com/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://www.industryarmymarketing.com/services" },
        { "@type": "ListItem", position: 3, name: "Web Development", item: `https://www.industryarmymarketing.com${path}` },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title="Web Development for Contractors — 3 Tiers, No WordPress | IAM"
        description="Fast, modern React websites for contractors and service pros. Three tiers: Skirmish $499, Advance $1,499, Flagship $3,999. Sub-second load, on-page SEO baked in, optional network membership."
        path={path}
        image={image}
        imageAlt="Modern high-performance contractor website on a laptop with a Lighthouse 100 score"
        jsonLd={jsonLd}
      />
      <PageHeader
        eyebrow="Service · Web Development"
        title="Web Development"
        highlight="Built to Rank, Built to Convert"
        description="No bloated WordPress. No monthly platform fees. Just fast, modern, conversion-focused websites priced flat — starting at $499. Optional entry into the IAM dofollow network on launch."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Start a Build — $499</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/network">See the Network</Link></Button>
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 max-w-4xl py-16 space-y-14">
        <motion.img
          src={image}
          alt="High-performance modern contractor website loading in under a second, displayed on a laptop"
          width={1024}
          height={1024}
          className="w-full rounded-lg border border-border shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Websites that earn their hosting bill</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Most contractor websites lose the sale before the phone rings. They load slowly, they look
            like they were built in 2011, they run on a WordPress stack with seven plugins fighting each
            other, and half the time the contact form silently fails. Google notices. Buyers notice.
            You lose the lead to whichever competitor answered fastest.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Industry Army Marketing builds the opposite kind of site. Modern React, static-generated
            HTML, deployed to a global CDN. Sub-second load times. Mobile-first design. On-page SEO,
            structured data, and clean semantic HTML baked in from the first commit. A contact form
            that actually delivers, wired to your phone or CRM.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Three tiers. Flat pricing. No monthly platform fee, no plugin subscriptions, no surprise
            renewal invoice. You own the code, you own the domain, and if you ever leave IAM the site
            goes with you.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Three tiers, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`p-6 rounded-lg border ${t.highlight ? "border-primary bg-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.2)]" : "border-border bg-card"}`}
              >
                <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">{t.name}</div>
                <div className="font-display text-4xl mb-1">{t.price}</div>
                <div className="text-sm text-muted-foreground mb-4">{t.tag}</div>
                <ul className="space-y-2 text-sm">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-4 text-center">All tiers include hosting setup guidance, domain configuration, and 30 days of post-launch bug fixes.</p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Join the network — or don't</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every IAM web build ships with an optional invitation to join the Industry Army Marketing
            dofollow network. If you accept, your new site is cross-linked from 350+ live network
            domains, seeded with backlinks from day one, and eligible for TALC.tv social syndication
            across X, Instagram, TikTok, YouTube, LinkedIn, and Threads. Network members also unlock
            the $10 city-slot placement program.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you decline, nothing changes about your site — it stays fast, SEO-clean, and 100% yours.
            The network is a growth accelerator, not a lock-in. Your call, and you can join later.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Optional upsells (Eyespyr + TALC)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <ShieldCheck className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl mb-2">Eyespyr Competitor Monitoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Track every competitor in your city — their rankings, their backlinks, their content velocity. Weekly diff reports so you always know who is moving on your keywords.</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <Network className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl mb-2">TALC.tv Social Syndication</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">One push, six+ platforms. Your services, promos, and blog posts syndicated across X, Instagram, TikTok, YouTube Shorts, LinkedIn, and Threads on autopilot.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">The IAM build stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "React + Vite", body: "Modern component architecture, hot-reload dev, tree-shaken production bundles under 100kb." },
              { icon: Gauge, title: "Static + CDN", body: "Pre-rendered HTML deployed to Netlify or Cloudflare — no runtime server to slow down, no plugin to crash." },
              { icon: Code2, title: "SEO baked-in", body: "Per-page title, meta, canonical, Open Graph, JSON-LD schema, sitemap, RSS. Nothing bolted on." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-lg bg-card border border-border">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-xl mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center py-10 border-t border-border">
          <h2 className="font-display text-3xl md:text-4xl mb-3">Ship a site that actually earns.</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Pick a tier. We build. You launch. Optional network entry on the way out.</p>
          <Button variant="hero" size="lg" asChild><Link to="/contact">Start Your Build</Link></Button>
        </section>
      </article>
    </Layout>
  );
};

export default WebDevelopment;