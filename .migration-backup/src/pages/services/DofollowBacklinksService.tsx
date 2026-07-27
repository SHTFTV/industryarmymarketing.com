import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Link as LinkIcon, ShieldCheck, Zap, Globe2, TrendingUp, Layers } from "lucide-react";
import BidRequestForm from "@/components/BidRequestForm";
import heroAsset from "@/assets/services/dofollow-backlinks-hero.jpg.asset.json";

const faqs = [
  {
    q: "What is a dofollow backlink and why does it matter?",
    a: "A dofollow backlink is a hyperlink from another website to yours that passes SEO authority (PageRank) — the search-engine trust signal Google actually counts. Nofollow links (the default on most modern platforms) explicitly tell Google not to pass authority. Every ranking, every top-3 Google result, is powered by an accumulated stack of dofollow links from relevant, indexable sites. Nofollow feels like a backlink but does not move the needle.",
  },
  {
    q: "How does the IAM dofollow network work?",
    a: "IAM operates 350+ live, indexable, dofollow-friendly domains across Netlify and WordPress hosting. When you buy a $10 placement, we publish a permanent, keyword-optimized page about your business on one of these domains. The page carries dofollow links back to your site. Google indexes the page, counts the link, and lifts your rankings in the target city and trade.",
  },
  {
    q: "Are IAM backlinks permanent?",
    a: "Yes. One $10 payment. One permanent placement. No monthly renewal, no expiry, no drip-cancel. The page stays live for as long as IAM operates the network — twenty years and counting on the founder-side.",
  },
  {
    q: "How is this different from a link-farm or PBN?",
    a: "A private blog network (PBN) is dead sites bought at auction and stuffed with keyword links — Google penalizes them on sight. The IAM network is the opposite: 350+ real, active, content-relevant industry sites (roofing directories, wedding-vendor sites, mining-logistics publications, contractor tribunes) that publish real editorial and serve real readers. Every link sits inside genuine editorial context, and every domain is indexable by Google.",
  },
  {
    q: "Why do you say 'all our pages offer dofollow'?",
    a: "Because we mean it. Every page in the IAM network — every guest post, every city page, every directory listing, every case study — ships with dofollow-configured outbound links to the customer's site. No nofollow gatekeeping. No 'sponsored' attribute stripping the SEO value. If you pay $10, you get the real link.",
  },
  {
    q: "How many backlinks do I need to rank?",
    a: "It depends on the competitiveness of your city-plus-trade phrase. For a low-competition long-tail like 'stucco contractor Kelowna,' 3-5 dofollow links from relevant IAM domains typically move the page to page 1 within 60-90 days. For a mid-competition phrase like 'roofing Vancouver,' expect 12-25. For high-competition metros like Toronto or Los Angeles, expect 40+ over 6-12 months.",
  },
  {
    q: "Can I buy multiple backlinks?",
    a: "Yes. Most customers start with 3-5 placements across complementary network domains and scale from there. Buy them one at a time, or bundle 10 for $100 and 25 for $250 — same $10-per-link price, no volume discount and no volume markup.",
  },
  {
    q: "Is there a risk of Google penalty?",
    a: "No credible risk. IAM has been operating the network since 2016 without a single manual penalty against a customer property. We publish real editorial on real domains with real readers — the exact opposite of the pattern Google's spam algorithms look for. Every placement is manually reviewed for content relevance before it goes live.",
  },
  {
    q: "How fast does the link start counting?",
    a: "Google indexes new IAM placements within 24-72 hours (IndexNow + sitemap ping + cross-linking from sibling domains). The link is counted from that moment forward. Rank movement typically follows within 14-45 days as Google recalculates the target site's authority.",
  },
];

const DofollowBacklinksService = () => {
  const path = "/services/dofollow-backlinks";
  const image = heroAsset.url;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Dofollow Backlinks for Contractors and Service Businesses",
      serviceType: "SEO Link Building",
      provider: { "@type": "Organization", name: "Industry Army Marketing", url: "https://www.industryarmymarketing.com" },
      description: "Permanent dofollow backlinks from the IAM 350+ domain network. $10 per placement, indexed within 72 hours, real editorial context, no PBN.",
      image: `https://www.industryarmymarketing.com${image}`,
      offers: { "@type": "Offer", price: "10.00", priceCurrency: "USD", url: `https://www.industryarmymarketing.com${path}` },
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
        { "@type": "ListItem", position: 3, name: "Dofollow Backlinks", item: `https://www.industryarmymarketing.com${path}` },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title="Dofollow Backlinks — $10 Permanent Links from 350+ Domain Network | IAM"
        description="Real dofollow backlinks from the Industry Army Marketing 350+ domain network. $10 permanent placement, indexed within 72 hours, editorial context on live industry sites. No PBN, no nofollow gatekeeping."
        path={path}
        image={image}
        imageAlt="Neon green dofollow link chains connecting a domain network to a #1 Google ranking"
        jsonLd={jsonLd}
      />
      <PageHeader
        eyebrow="Service · Dofollow Backlinks"
        title="Dofollow Backlinks"
        highlight="Every Link, Every Time"
        description="Every IAM page ships dofollow — no nofollow gatekeeping. 350+ live network domains, real editorial context, permanent placement. $10 per link, indexed within 72 hours. Always about getting you to the front."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="#bid-dofollow-backlinks">Submit Bid Request</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/dofollow-backlinks">Browse the 350+ Domains</Link></Button>
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 max-w-4xl py-16 space-y-14">
        <motion.img
          src={image}
          alt="Neon green dofollow link chains connecting a network of servers to a #1 Google ranking trophy"
          width={1024}
          height={1024}
          className="w-full rounded-lg border border-border shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Why dofollow is the only kind that ranks</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Google's ranking algorithm is, at its core, a graph — one that measures which pages other
            pages link to, and how much authority flows through each link. That flow only happens
            through <strong className="text-primary">dofollow</strong> links. A nofollow link, by
            definition, tells Google "do not count this." It is a courtesy citation, not a ranking
            signal. Every top-3 Google result you have ever seen is powered by an accumulated stack
            of dofollow links from relevant, indexable sites. There is no shortcut, no substitute,
            and no algorithm-friendly nofollow strategy. There is only real links from real domains,
            or slow, expensive ads.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Most modern platforms strip dofollow by policy. Every social network. Every user-generated
            content site. Most Q&A platforms. Most directories. That is why a business can have a
            "strong web presence" — a thousand mentions across the internet — and still not rank for
            its own city-plus-trade phrase. Presence without dofollow is decorative.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Industry Army Marketing exists to solve that gap. Every one of our 350+ network domains is
            live, indexable, and configured dofollow-first. When you buy a $10 placement, you are
            not buying attention — you are buying a real ranking signal that compounds every month
            it stays live. Which is forever.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">The IAM 350+ domain network</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe2, title: "Real domains, real readers", body: "Roofing directories, wedding-vendor sites, mining publications, contractor tribunes, service-professional almanacs. Each domain has its own audience and its own editorial voice — not a link farm." },
              { icon: ShieldCheck, title: "Dofollow-first by policy", body: "Every outbound link to customer sites is configured dofollow at the platform level. No 'oops we forgot' nofollow. No sponsored-attribute stripping." },
              { icon: Zap, title: "Indexed in 24-72h", body: "Fresh placements are pinged to Google, Bing, and IndexNow, cross-linked from sibling network sites, and typically appear in the index within three days." },
              { icon: Layers, title: "Netlify + WordPress mix", body: "We split hosting between static (Netlify) and dynamic (WordPress) to create heterogeneous footprints Google recognizes as natural." },
              { icon: TrendingUp, title: "Compounding authority", body: "Every new placement lifts the authority of every existing placement through internal cross-linking. Buy one link, everyone else in the network benefits. Buy ten, and the network lifts you back." },
              { icon: LinkIcon, title: "Permanent, never revoked", body: "One payment, permanent placement. We do not rent links, we do not expire them, and we do not sell the same slot to a competitor next year." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-lg bg-card border border-border">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Pricing — $10 forever</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every dofollow placement in the IAM network is <strong className="text-primary">$10</strong>.
            Once. Not $10 a month, not $10 with a hidden $200 setup fee, not $10 for the first three
            months. Ten dollars, one time, permanent placement.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Single</div>
              <div className="font-display text-3xl mb-1">$10</div>
              <div className="text-sm text-muted-foreground">One placement, one domain, permanent.</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Squad</div>
              <div className="font-display text-3xl mb-1">$100</div>
              <div className="text-sm text-muted-foreground">10 placements across complementary network domains.</div>
            </div>
            <div className="p-6 rounded-lg bg-primary/5 border border-primary">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Battalion</div>
              <div className="font-display text-3xl mb-1">$250</div>
              <div className="text-sm text-muted-foreground">25 placements — recommended for competitive metros.</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-4">Same $10 per link at every volume. No discount, no markup, no scarcity theater.</p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">How placements move rankings (EEAT)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Industry Army Marketing has been building SEO infrastructure since 2005 and operating the
            current dofollow network since 2016. Ten years of network authority accrual, twenty years
            of accumulated domain reputation, zero manual penalties on any customer property. We know
            what Google's spam team looks for because we deliberately ship the opposite pattern —
            real editorial, real content, real relevance, real readership.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every placement is manually reviewed for content-relevance fit before it goes live. A
            plumber does not get placed on a wedding-vendor site; a wedding photographer does not get
            placed on a mining-logistics publication. Relevance matters because Google grades every
            link on topical proximity, not just link count. Our network's breadth is what lets us
            put every trade in the right editorial neighborhood.
          </p>
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

        <section className="pt-4">
          <BidRequestForm
            service="dofollow-backlinks"
            serviceLabel="Dofollow Backlinks"
            heading="Request a dofollow placement"
            subheading="Tell us the target city, the trade, and how many links you need. We reply with the exact domains, ETAs, and one $10 invoice."
          />
        </section>
      </article>
    </Layout>
  );
};

export default DofollowBacklinksService;