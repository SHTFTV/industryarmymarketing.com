import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Crown, ShieldCheck, Trophy, Lock, ArrowUpRight } from "lucide-react";
import BidRequestForm from "@/components/BidRequestForm";
import heroAsset from "@/assets/services/affordable-seo-hero.jpg.asset.json";

const faqs = [
  {
    q: "What does $10 actually buy at IAM?",
    a: "It buys one of two things: a $10 business listing on the IAM directory (open to any legitimate service business, indexed by Google, dofollow, permanent), or a $10 city-plus-trade slot on the IAM dofollow network (single-occupant, reserved for power partners who prove they show up online). One is entry-level. The other is a limited resource.",
  },
  {
    q: "How is the $10 business listing different from the $10 city slot?",
    a: "The listing is open enrollment — pay $10, get placed, done. The city slot is gated: we only sell one per trade per city, and we only sell it to a business that can prove active online presence (a real website, real reviews, real social, real work history). Once a slot is taken it is taken until the holder gives it up. That is why the $10 slot is described as 'extremely hard to get' — because there are only ~1,300 of each trade to hand out across North America.",
  },
  {
    q: "What is a 'power partner'?",
    a: "A power partner is a business that has already invested in its own online presence — a real site, a real portfolio, a real review footprint, and a real willingness to promote its own work publicly. We hold city slots for power partners because their content actively lifts every other operator in the IAM network. Best of the best only.",
  },
  {
    q: "How do I qualify for a $10 city slot?",
    a: "Three checks. One: your business is real, licensed where required, and operating in the city you want. Two: you have a live website or a plan to launch one (IAM Web Development can build it). Three: you have at least a minimal online presence — a Google Business Profile, a social account, some third-party reviews. If you clear all three, the slot is yours for $10 as long as it is available.",
  },
  {
    q: "Why is it so cheap?",
    a: "Because the underlying infrastructure is already built and paid for. IAM has been operating the dofollow network since 2016 and the marketing engine since 2005. Marginal cost per placement is near zero. We could charge $500 like every other agency and pocket the difference — instead we charge $10 and use volume to build network authority. Everyone in the network benefits from that authority.",
  },
  {
    q: "What is Eyespyr and why is it an upsell?",
    a: "Eyespyr is our competitor monitoring tool. It watches every business in your city that ranks for your keywords, and reports weekly on their new backlinks, new content, and new ranking movements. It is an upsell because most $10 customers do not need it — they need the placement. But once you are ranking, Eyespyr is how you stay ranking.",
  },
  {
    q: "What TALC upsells are available?",
    a: "TALC.tv social syndication ($10 per placement or $99/month standalone), TALC dofollow amplification (auto-cross-links your placement from every network sibling for $10 one-time), and TALC content refresh (quarterly rewrite of your landing page for $10 per pass). All optional. All flat-priced.",
  },
  {
    q: "What is the catch?",
    a: "There is no catch on price. There is a slot-availability catch — if a competitor claimed your city-plus-trade slot last year, it is gone until they give it up. There is an EEAT catch — we will not accept a listing from a business we cannot verify. And there is a network-fit catch — some trades (adult, gambling, MLM) we do not accept at any price.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If your placement is not indexed by Google within 14 days of launch we refund the $10 in full, no argument. If the slot you paid for turns out to be already taken, we refund and offer adjacent cities. Fair is fair.",
  },
];

const AffordableSeo = () => {
  const path = "/services/affordable-seo";
  const image = heroAsset.url;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Affordable SEO — $10 Business Listing and City Slot Program",
      serviceType: "Search Engine Optimization",
      provider: { "@type": "Organization", name: "Industry Army Marketing", url: "https://www.industryarmymarketing.com" },
      description: "Enterprise-grade SEO at $10 per placement. Open $10 business listing plus a gated $10 city-plus-trade slot reserved for verified power partners across North America.",
      image: `https://www.industryarmymarketing.com${image}`,
      offers: [
        { "@type": "Offer", name: "Business Listing", price: "10.00", priceCurrency: "USD", description: "Open $10 directory listing, permanent dofollow" },
        { "@type": "Offer", name: "City-plus-Trade Slot", price: "10.00", priceCurrency: "USD", description: "Gated single-occupant city slot, reserved for power partners" },
      ],
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
        { "@type": "ListItem", position: 3, name: "Affordable SEO", item: `https://www.industryarmymarketing.com${path}` },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title="Affordable SEO — $10 Business Listings & Power-Partner Slots | IAM"
        description="Two entry points, one price. $10 for an open business listing on the IAM directory, or $10 for a gated single-occupant city-plus-trade slot reserved for verified power partners. Enterprise SEO infrastructure at directory prices."
        path={path}
        image={image}
        imageAlt="A glowing $10 chip on a vault pedestal surrounded by elite ranking insignia"
        jsonLd={jsonLd}
      />
      <PageHeader
        eyebrow="Service · Affordable SEO"
        title="Affordable SEO"
        highlight="$10. Two Doors In."
        description="Door one: the $10 business listing — open to any legitimate operator. Door two: the $10 city-plus-trade slot — single-occupant, gated, reserved for power partners. Same price. Different game."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Claim a $10 Placement</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/dofollow-backlinks">See the Network</Link></Button>
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 max-w-4xl py-16 space-y-14">
        <motion.img
          src={image}
          alt="A glowing $10 coin on a pedestal inside a vault, surrounded by elite ranking insignia and dog tags"
          width={1024}
          height={1024}
          className="w-full rounded-lg border border-border shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Two ways in, both cost $10</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every SEO agency in North America charges $1,000-$5,000 a month for what Industry Army
            Marketing delivers for $10 — one time. Not a typo, not a loss leader. $10 flat, permanent,
            dofollow, indexed. The number has been the same since the network launched in 2016 and it
            will still be $10 next year, because the point of IAM was never to be cheap. It was to be
            <em> honest.</em> Enterprise SEO infrastructure is not expensive to run once it exists.
            Charging $2,000/month for a $10 job was the industry's mistake, not our template.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            So we opened two doors at the same price, and let the customer pick which game they are
            playing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Door one: the $10 business listing</h2>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-10 h-10 text-primary" />
              <div>
                <h3 className="font-display text-2xl">Open Business Listing</h3>
                <p className="text-sm text-muted-foreground">Pay $10. Get placed. Done.</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The IAM directory is open enrollment. If you are a real business — licensed where the
              law requires, operating in a real city, doing real work — you can claim a $10 permanent
              directory listing today. Google indexes it. AI answer engines cite it. It is dofollow.
              It never expires. There is no renewal, no monthly fee, no upsell you cannot decline.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is the entry point. It is not exclusive and it is not gated. It is meant to be
              affordable to any operator who takes their business seriously enough to spend a coffee's
              worth of money on a permanent web asset.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Door two: the $10 power-partner slot</h2>
          <div className="p-6 rounded-lg bg-primary/5 border border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-10 h-10 text-primary" />
              <div>
                <h3 className="font-display text-2xl">City-plus-Trade Slot</h3>
                <p className="text-sm text-muted-foreground">Single-occupant. Extremely hard to get. Best of the best only.</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The second door is a different animal. There is exactly one <em>city + trade</em> slot
              per market on the IAM network — one "roofing Vancouver", one "HVAC Calgary", one
              "excavation Halifax". Once someone holds it, nobody else in that trade can buy it in
              that city. Not next week. Not next year. Not for any amount of money above $10 — because
              the point of the slot is exclusivity, not pricing.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve these slots for <strong className="text-primary">power partners</strong>: the
              best of the best in each city, the ones who already show up online — real site, real
              portfolio, real reviews, real social. Not because we are gatekeeping for its own sake,
              but because a network is only as strong as its weakest link. A city slot given to a
              ghost business drags down every other business in the network. So we pick who we sell
              to. It is $10 to the ones who qualify, and unavailable at any price to the ones who
              don't.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {[
                { icon: ShieldCheck, title: "Real business", body: "Licensed, insured, operating in the target city." },
                { icon: Trophy, title: "Real online presence", body: "Website, Google Business Profile, reviews, active social." },
                { icon: Lock, title: "Slot available", body: "Nobody currently holds this city-plus-trade combination." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="p-4 rounded bg-card border border-border">
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-display text-lg mb-1">{title}</div>
                  <p className="text-xs text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Eyespyr + TALC upsells (optional)</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every $10 placement stands on its own. But the customers who move fastest layer three
            optional accelerators on top:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Eyespyr Competitor Monitoring", body: "Weekly diff on every competitor in your city — new backlinks, new content, ranking moves. So you always know who is chasing your slot." },
              { title: "TALC.tv Social Syndication", body: "Your placement is fanned out across X, Instagram, TikTok, YouTube Shorts, LinkedIn, Threads and more, on a sprinkled cadence. $10 per placement." },
              { title: "TALC Content Refresh", body: "Quarterly rewrite of your landing page — fresh copy, updated schema, new photos. Keeps the placement ranking as competitors move. $10 per pass." },
            ].map((u) => (
              <div key={u.title} className="p-6 rounded-lg bg-card border border-border">
                <ArrowUpRight className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display text-lg mb-2">{u.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Why $10 is honest pricing (EEAT)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            IAM has been building SEO infrastructure since 2005 and operating the current dofollow
            network since 2016. The domains are paid for, the CMS is paid for, the hosting is paid
            for, the network authority accrues automatically. Adding one more placement to the network
            has a marginal cost of a few cents in compute and a few minutes of human review. Charging
            $2,000 a month for it would be extraction, not service. Charging $10 is the honest number
            that keeps the lights on and pays a fair wage to the humans who ship placements.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The marketing revolution is not artificial scarcity or synthetic complexity. It is the
            realization that most of the SEO industry has been overcharging for a commodity for two
            decades, and someone finally decided to price it at cost plus a fair margin.
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

        <section className="text-center py-10 border-t border-border">
          <Coins className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl mb-3">$10. One coin. Two doors.</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Pick the door that fits your business. We will tell you honestly if the city slot is available before you pay.</p>
          <Button variant="hero" size="lg" asChild><Link to="/contact">Claim a $10 Placement</Link></Button>
        </section>

        <section className="pt-4">
          <BidRequestForm
            service="affordable-seo"
            serviceLabel="Affordable SEO"
            heading="Submit your $10 placement request"
            subheading="Tell us the city and trade. We check slot availability, confirm the door (open listing or power-partner slot), and reply with next steps."
          />
        </section>
      </article>
    </Layout>
  );
};

export default AffordableSeo;