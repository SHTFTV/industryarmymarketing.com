import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Inbox, Handshake, TrendingUp, MapPin, Clock } from "lucide-react";
import BidRequestForm from "@/components/BidRequestForm";
import heroAsset from "@/assets/services/lead-generation-hero.jpg.asset.json";

const FOCUS = "lead generation for contractors";

const faqs = [
  {
    q: "What is lead generation and how does Industry Army Marketing do it?",
    a: "Lead generation is the process of turning strangers into qualified prospects who ask about your service. At IAM we do it three ways at once: we rank you on Google for the exact 'city + trade' phrases buyers type, we place you inside a dofollow network of 350+ industry sites that feed real referral traffic, and we put you on live bids and RFP feeds so procurement inboxes come to you. Every $10 placement is engineered as a lead-gen asset — not a vanity ranking.",
  },
  {
    q: "How much does lead generation cost with IAM?",
    a: "Entry is $10 per placement. That is the flat rate for a permanent dofollow landing page on our network, indexed by Google, discoverable by AI, and wired to your contact channel. There is no per-lead surcharge, no monthly retainer, no 'shared lead' resale — the lead is yours the moment it lands.",
  },
  {
    q: "How is this different from HomeAdvisor, Angi, or Bark?",
    a: "Marketplaces resell the same lead to 4-6 competitors and charge $30-$120 per contact. We do not broker leads. We give you a permanent SEO asset — a real page on a real domain — that sends inbound calls, form fills, and RFP invites straight to your business. You own the pipeline, not us.",
  },
  {
    q: "How long until I see my first lead?",
    a: "Google typically indexes new IAM placements within 24-72 hours. Ranking for competitive city-plus-trade queries takes 30-90 days depending on niche difficulty. Direct-referral traffic from our network starts the day your page goes live, and RFP/bid syndication fires within one billing week.",
  },
  {
    q: "Do I get bids and RFPs, or just website clicks?",
    a: "Both. Web traffic converts through the landing page. On top of that, active listings are syndicated into commercial bid feeds, tender boards, and procurement portals in your trade — so buyers who never touch Google still find you.",
  },
  {
    q: "Which trades and cities are covered?",
    a: "1,300+ North American cities and every major trade — plumbing, HVAC, electrical, roofing, framing, demolition, excavation, painting, concrete, steel-stud, mining logistics, and service professionals like accountants, lawyers, and consultants. If you serve a market, we can build the lead-gen page for it.",
  },
  {
    q: "Is the lead exclusive to me?",
    a: "Yes. A prospect who lands on your IAM page contacts you, and only you. We do not sell that inquiry to competitors. Each city-plus-trade slot is single-occupant.",
  },
  {
    q: "Do you guarantee a certain number of leads?",
    a: "No honest SEO or lead-gen operator can — search demand is bounded by real query volume in your city. What we guarantee is placement, indexing, dofollow authority, and syndication. In markets where we have 12+ months of data, IAM lead-gen pages average 8-40 qualified contacts per month per city, depending on trade and population.",
  },
];

const LeadGeneration = () => {
  const path = "/services/lead-generation";
  const image = heroAsset.url;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Lead Generation for Contractors and Service Professionals",
      serviceType: "Lead Generation",
      provider: { "@type": "Organization", name: "Industry Army Marketing", url: "https://www.industryarmymarketing.com" },
      areaServed: { "@type": "Country", name: ["United States", "Canada"] },
      offers: { "@type": "Offer", price: "10.00", priceCurrency: "USD", url: `https://www.industryarmymarketing.com${path}` },
      description: "Permanent SEO-driven lead generation for contractors: dofollow city pages, RFP and bid syndication, and exclusive inbound inquiries starting at $10.",
      image: `https://www.industryarmymarketing.com${image}`,
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.industryarmymarketing.com/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://www.industryarmymarketing.com/services" },
        { "@type": "ListItem", position: 3, name: "Lead Generation", item: `https://www.industryarmymarketing.com${path}` },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title="Lead Generation for Contractors — $10 Exclusive Leads | IAM"
        description="Lead generation for contractors and service pros. Permanent dofollow city pages, live RFP and bid syndication, exclusive inbound inquiries. Starting at $10 — no shared leads, no per-lead fees."
        path={path}
        image={image}
        imageAlt="Lead generation pipeline — glowing network of leads converging into a contractor's inbox"
        jsonLd={jsonLd}
      />
      <PageHeader
        eyebrow="Service · Lead Generation"
        title="Lead Generation"
        highlight="That Actually Delivers Leads"
        description="We put you in front of buyers actively searching for your trade — and inside the bid feeds where procurement teams pick vendors. $10 per placement. Exclusive. Permanent. Yours."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Start Generating Leads — $10</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/how-it-works">See How It Works</Link></Button>
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 max-w-4xl py-16 space-y-14">
        <motion.img
          src={image}
          alt="Lead generation pipeline — glowing network feeding a contractor's inbox with bids, RFPs, and dollar signs"
          width={1024}
          height={1024}
          className="w-full rounded-lg border border-border shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">What lead generation actually means at IAM</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Most "lead generation" companies are lead brokers. They buy traffic in bulk, run it through a
            form, and resell the same phone number to four or five contractors racing to call first. You
            know the model — HomeAdvisor, Angi, Bark, Networx — because you have paid the invoices. The
            leads are shared, the margins are thin, and the moment you stop paying, the pipeline stops.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Industry Army Marketing does the opposite. We do not broker anyone else's traffic. We build
            you a permanent SEO asset — a real page on a real domain inside our 350+ dofollow network —
            that ranks for the exact <em>city + trade</em> phrases a buyer types when they are ready to
            hire. The page is indexed by Google, discovered by ChatGPT and Perplexity, and syndicated
            into commercial bid feeds so procurement officers can request quotes without ever touching a
            search engine. Every inquiry lands in your inbox alone.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One flat placement fee — <strong className="text-primary">$10</strong> — buys a lifetime
            asset. No monthly retainer. No per-lead surcharge. No shared inquiry. That is the entire
            pricing sentence, and we mean it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">How every IAM service is a lead-gen engine</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Ask any IAM customer what they bought and they will say something specific — a backlink, a
            city page, a social push, a website. Ask them what it actually did and the answer is always
            the same: <em>the phone started ringing.</em> That is not accidental. Every product we ship
            is designed as a lead-generation surface first and a marketing asset second.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Target, title: "SEO Domination → keyword-intent leads", body: "Ranking for 'roofing Vancouver' or 'HVAC contractor Calgary' is not a vanity metric — it is a buyer with cash and a problem, typing at 9pm. We win the query, the query becomes a click, the click becomes a form fill." },
              { icon: Handshake, title: "Dofollow Backlinks → referral leads", body: "Every one of our 350+ network domains is dofollow and content-relevant. A contractor featured on a hosting review site pulls hosting shoppers; on a wedding-vendor site, wedding buyers. The link ranks and the readers arrive pre-qualified." },
              { icon: Inbox, title: "RFP & Bid syndication → procurement leads", body: "Active placements are pushed into public tender boards, municipal bid feeds, and private procurement portals in your trade. Buyers who never touch Google still find you — through the channels they already use to source vendors." },
              { icon: TrendingUp, title: "Social Media (TALC.tv + Sprinkling) → warm leads", body: "One push, six+ platforms. TALC-powered syndication drops your service into X, Instagram, TikTok, YouTube Shorts, LinkedIn, and Threads on cadence — building a warm audience that converts on the second or third impression." },
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
          <h2 className="font-display text-3xl md:text-4xl mb-4">The lead-gen lifecycle, step by step</h2>
          <ol className="space-y-4 text-muted-foreground leading-relaxed list-decimal pl-6">
            <li><strong className="text-foreground">Intake.</strong> You tell us your trade, your cities, your service radius, and your contact channel (phone, email, SMS, CRM webhook).</li>
            <li><strong className="text-foreground">Slot check.</strong> Each city-plus-trade slot is single-occupant. We confirm your target market is open. If a competitor already owns it, we tell you and offer adjacent cities.</li>
            <li><strong className="text-foreground">Page build.</strong> We produce a 1,500-2,500 word landing page on a matching network domain, with focus keyword, LSI variants, local schema, and calls-to-action that route inquiries to your channel.</li>
            <li><strong className="text-foreground">Indexing push.</strong> Page is submitted to Google, Bing, IndexNow, and cross-linked from the IAM sitemap. Typical index time: 24-72 hours.</li>
            <li><strong className="text-foreground">Syndication.</strong> Page metadata is pushed into the TALC.tv social network and the IAM bid-feed layer within 7 days of launch.</li>
            <li><strong className="text-foreground">Ranking.</strong> Dofollow backlinks from sibling network sites accelerate rank climbs. Most placements hit page 1 for at least one focus phrase within 30-90 days.</li>
            <li><strong className="text-foreground">Delivery.</strong> Leads route to you exclusively. We do not touch them, resell them, or gate them behind a dashboard.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Where we generate leads (GEO coverage)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Lead generation is a local game. A homeowner in Surrey, BC will not hire a plumber based in
            Toronto no matter how good the ad. That is why IAM is built on a city-first architecture —
            one page per trade per city, each ranking in its own market.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {["Vancouver, BC","Surrey, BC","Langley, BC","Calgary, AB","Edmonton, AB","Toronto, ON","Ottawa, ON","Montreal, QC","Winnipeg, MB","Halifax, NS","Seattle, WA","Portland, OR","San Francisco, CA","Los Angeles, CA","San Diego, CA","Phoenix, AZ","Denver, CO","Dallas, TX","Houston, TX","Austin, TX","Chicago, IL","Atlanta, GA","Miami, FL","New York, NY"].map((c) => (
              <div key={c} className="p-3 rounded bg-card border border-border flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" />{c}</div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-4">Plus 1,300+ more North American cities. If your market is not listed, ask — we probably already have the domain.</p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Why IAM leads convert (EEAT)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Industry Army Marketing has been building SEO and lead-gen infrastructure for the trades and
            service-professional sector since 2005 — over 20 years of accumulated network authority.
            The dofollow network launched in 2016 and now spans 350+ live, indexable domains across
            Netlify and WordPress hosting. We have shipped placements for plumbers, electricians,
            roofers, HVAC contractors, mining logistics operators, steel-stud framers, wedding vendors,
            accountants, and consultants across every province in Canada and 42 US states.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The founder-operator model matters: no offshore call center, no "SEO specialist" reading
            from a script. Every placement is reviewed by a human who has personally shipped hundreds
            of ranking pages. That is why our leads convert — because the pages that produce them are
            written by someone who understands both the trade and the search intent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-xl text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center py-10 border-t border-border">
          <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl mb-3">Ready to be the one who gets the call?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Pick your city, pick your trade, pay $10 once. We handle the rest.</p>
          <Button variant="hero" size="lg" asChild><Link to="/contact">Claim Your City — $10</Link></Button>
        </section>

        <section className="pt-4">
          <BidRequestForm
            service="lead-generation"
            serviceLabel="Lead Generation"
            heading="Submit your lead-gen bid request"
            subheading="Tell us your city, trade, and target radius. Every inquiry is tagged to Lead Generation and routed to a human within one business day."
          />
        </section>
      </article>
    </Layout>
  );
};

export default LeadGeneration;