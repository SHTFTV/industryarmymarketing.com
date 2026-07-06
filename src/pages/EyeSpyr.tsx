import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";

const pillars = [
  { icon: "🏢", title: "Business Verification", body: "We cross-reference your BC or Canadian business license, GST/HST registration, and confirm your physical service area. No shell companies. No fake addresses." },
  { icon: "⭐", title: "Review Audit", body: "We analyze your review profile across Google, HomeStars, Facebook, and Yelp. Fake reviews, review gating, or suspicious patterns flag your account for manual review." },
  { icon: "🌐", title: "Website & Online Health", body: "We check your website for HTTPS, mobile responsiveness, speed, and content quality. A score below 4.5 holds your listing until issues are resolved." },
  { icon: "📍", title: "Location Confirmation", body: "We verify you actually operate in the city you're claiming. Territory fraud — claiming a city you don't serve — results in immediate suspension." },
  { icon: "📞", title: "Contact Validation", body: "Phone numbers, emails, and contact methods are tested. Dead lines, fake contact info, or call centres impersonating local businesses are disqualified." },
  { icon: "🔄", title: "Ongoing Monitoring", body: "Verification isn't one-and-done. I-Spy-R monitors your score continuously. If it drops below 4.5, we notify you before your listing is affected." },
];

const tiers = [
  { range: "4.5 – 5.0", label: "VERIFIED — Listed & Active", tone: "text-primary" },
  { range: "4.0 – 4.4", label: "REVIEW NEEDED — Issues Flagged", tone: "text-yellow-400" },
  { range: "Below 4.0", label: "NOT ELIGIBLE — Requires Remediation", tone: "text-destructive" },
];

const EyeSpyr = () => (
  <Layout>
    <Seo
      title="EyeSpyr Verification — The Industry's Trust Standard | IAM"
      description="EyeSpyr is IAM's proprietary contractor verification system. Cross-referenced business licence, reviews, web health, and location data. The badge can only be earned."
      path="/eyespyr"
    />
    <PageHeader
      eyebrow="Verification Standard"
      title="Eye"
      highlight="Spyr"
      description="The trust badge that separates real contractors from scams. Every IAM network member earns it. No one can buy it."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Four Pillars</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">What We Check</h2>
        <FeatureGrid features={pillars} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Scoring</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">The 5.0 Scale</h2>
        <div className="space-y-3">
          {tiers.map((t) => (
            <div key={t.range} className="flex items-center justify-between p-5 rounded-md bg-card border border-border">
              <span className="font-display text-2xl text-foreground">{t.range}</span>
              <span className={`text-sm uppercase tracking-widest ${t.tone}`}>{t.label}</span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
          Most legitimate contractors score between 4.3 and 4.9 on their first scan. Run a free scan to see exactly where you stand.
        </p>
      </div>
    </section>
    <CtaBanner
      title="Earn Your"
      highlight="Badge Today."
      description="Start with a free EyeSpyr scan. Takes 60 seconds. No credit card required."
      primaryLabel="Run Free Scan"
      primaryTo="/scan-wizard"
    />
  
      {/* EyeSpyR Pricing */}
      <div className="mt-8 p-6 border border-green-500/20 rounded-xl bg-green-500/5">
        <p className="text-xs uppercase tracking-widest text-green-400 mb-3">EyeSpyR Pricing</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-400">FREE</div>
            <div className="text-xs text-muted-foreground mt-1">with all monthly territory locks ($10/mo+)</div>
            <div className="text-sm text-muted-foreground mt-2">Full review scraping · credential verification · live Trust Badge · auto-monitoring</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">$10/year</div>
            <div className="text-xs text-muted-foreground mt-1">for guest post contributors</div>
            <div className="text-sm text-muted-foreground mt-2">Green checkmark on posts · review monitoring · credential verification</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Annual baseline ($10/year listing): EyeSpyR locked — upgrade to monthly to activate.</p>
      </div>

    </Layout>
);

export default EyeSpyr;