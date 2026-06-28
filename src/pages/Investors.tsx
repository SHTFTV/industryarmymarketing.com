import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";
import RevenueBreakdownChart from "@/components/RevenueBreakdownChart";

const stats = [
  { value: "80+", label: "Premium Trade Domains" },
  { value: "$10", label: "Per Listing / Territory / Post" },
  { value: "99.5%", label: "Uptime SLA" },
  { value: "BC", label: "HQ — PIPEDA Compliant" },
];

const streams = [
  { icon: "📍", title: "Territory Subscriptions", body: "Monthly recurring revenue from exclusive territory locks at $10/month. Churn is structurally low — cancelling means a competitor immediately claims the slot." },
  { icon: "📋", title: "Listing Fees", body: "One-time $10 setup per listing. Low barrier drives volume. As the network grows, listing fee revenue scales with contractor registrations across all domains." },
  { icon: "🔗", title: "Content & Backlinks", body: "$10 per guest post. No cap on volume per client. Content orders scale with client SEO budgets and drive compounding organic value on IAM's premium domains." },
  { icon: "📱", title: "App Sales", body: "Revenue from the IAM flagship app portfolio — Weddings.io, PlowWow, Kongtractors, Errands.io, Backhaul.io and the broader vertical stack. One-time purchases, in-app upgrades, and white-label licensing compound on top of the recurring base." },
];

const Investors = () => (
  <Layout>
    <Seo
      title="Investor Relations | Industry Army Marketing"
      description="IAM is building the largest exclusive-territory marketing network for trade contractors in Canada. 80+ premium trade domains, three recurring revenue streams, structural moat."
      path="/investors"
    />
    <PageHeader
      eyebrow="Investor Relations"
      title="The"
      highlight="Opportunity"
      description="IAM is building the largest exclusive-territory marketing network for trade contractors in Canada. Here's why that matters."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Thesis</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
          A Structural Moat <span className="text-primary text-glow">In Trade Marketing</span>
        </h2>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>Canada's $180B+ construction and trades industry operates almost entirely on word-of-mouth and generic directories. Google Ads costs for trade contractors in major Canadian cities have increased 300% in 5 years. HomeStars and similar platforms commoditize contractors into shared lead auctions.</p>
          <p>IAM solves a structural problem: contractors need exclusive, affordable, and verifiable digital territory. We've built the infrastructure to deliver it — and locked the domain assets that make it defensible.</p>
          <p>Our moat is the domain portfolio: 80+ premium .io, .tv, .ltd, and .ca trade domains acquired over 5 years. These cannot be replicated. Competitors cannot undo our domain ownership.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6 rounded-md bg-card border border-border text-center">
              <p className="font-display text-4xl text-primary text-glow">{s.value}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Revenue Model</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">Four Revenue Streams</h2>
        <FeatureGrid features={streams} />
      </div>
    </section>
    <RevenueBreakdownChart />
    <section className="py-12 border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Due Diligence</p>
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Technical Validation Memo — June 27, 2026</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6 text-sm leading-relaxed">
          Independent technology, asset, and revenue validation. Source-verified from deployment archives, WHOIS records, Atom &amp; GoDaddy appraisals, and operator-reported financials.
        </p>
        <a
          href="/validation/iam-technical-validation-2026-06-27.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition"
        >
          Read the Memo →
        </a>
      </div>
    </section>
    <CtaBanner
      title="Investor"
      highlight="Inquiries"
      description="We are selectively engaging with strategic investors and partners. Reach out directly for a pitch deck and financials. partnerships@industryarmymarketing.com"
      primaryLabel="Send Inquiry"
      primaryTo="/contact"
    />
  </Layout>
);

export default Investors;