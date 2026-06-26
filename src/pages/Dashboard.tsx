import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";
import { ADDONS } from "@/data/pricingMatrix";

const pillars = [
  { icon: "❤️", title: "Wall of Love", body: "Auto-hydrating 5-star review showcase. Every verified review displays in real time. Powered by EyeSpyr — no manual curation required." },
  { icon: "📊", title: "Sentiment Tracker", body: "Every review and mention scored in real time. Scores below 0.45 trigger an immediate WhatsApp alert — the fastest response window in the industry." },
  { icon: "🔍", title: "Competitor Spy", body: "Track competitor activity in your city and trade. Know when new reviews drop, when pricing changes, or when a competitor enters your territory." },
  { icon: "📈", title: "Brand Reading", body: "Aggregate brand health score updated daily. Trend lines show momentum over 7, 30, and 90-day windows. Spot problems before customers do." },
  { icon: "🏆", title: "EyeSpyr Score", body: "Your live score out of 5.0. Drops below 4.5 trigger an automatic QualityGuard review. Score history shows your improvement trajectory." },
  { icon: "📍", title: "Territory Status", body: "Confirm all city territories are active. See subscription status, renewal dates, and territory coverage map for every city you've locked." },
];

const alerts = [
  { sev: "IMMEDIATE", desc: "Sentiment ≤ 0.45 — <5 min WhatsApp", tone: "text-destructive" },
  { sev: "HIGH", desc: "Sentiment 0.46–0.60 — <30 min WhatsApp", tone: "text-yellow-400" },
  { sev: "STANDARD", desc: "New review, any sentiment — <4 hr email", tone: "text-primary" },
  { sev: "LOW", desc: "Competitor activity — Daily report", tone: "text-muted-foreground" },
];

const addons = [
  { name: "Position #1 Feature", price: `+${ADDONS.position1FeaturePercent * 100}% / mo`, body: "Pin your listing to the top of your city + trade page. Billed monthly at half of your active slot cost." },
  { name: "High-Authority Backlink Pack", price: `$${ADDONS.backlinkPackOneTime.toFixed(2)} one-time`, body: "Curated dofollow backlinks from aged IAM network domains. One flat fee, permanent placement." },
  { name: "TALC.tv Visual Blast", price: `$${ADDONS.talcVisualBlastPerPost.toFixed(2)} / post`, body: "Pay-as-you-go visual content blast to TALC.tv + your city page + GMB. Submit a project photo, we publish." },
  { name: "Hall Visualizer (EyeSpyr)", price: `$${ADDONS.hallVisualizerPerRender.toFixed(2)} / render`, body: "Render a verified showcase visualization. Pay-as-you-go per render. No monthly minimum." },
];

const Dashboard = () => (
  <Layout>
    <Seo
      title="I-Spy-R Dashboard — Client Reputation Portal | IAM"
      description="Your real-time reputation command centre. Monitor your EyeSpyr score, reviews, competitor activity, and territory status — all in one place."
      path="/dashboard"
    />
    <PageHeader
      eyebrow="Client Portal"
      title="I-Spy-R"
      highlight="Dashboard"
      description="Your real-time reputation command centre. Monitor your EyeSpyr score, reviews, competitor activity, and territory status — all in one place."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Dashboard Preview</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">The Four Pillars</h2>
        <FeatureGrid features={pillars} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Alert System</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">Real-Time Alerts</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The I-Spy-R alert engine fires WhatsApp messages to your phone in under 5 minutes when sentiment goes negative. No checking dashboards manually. No delayed email digests. Instant awareness, instant response capability.
        </p>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.sev} className="flex items-center justify-between gap-4 p-5 rounded-md bg-card border border-border">
              <span className={`font-display text-xl ${a.tone}`}>{a.sev}</span>
              <span className="text-muted-foreground text-sm text-right">{a.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Dashboard Add-Ons</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">Purchasable Upsells</h2>
        <p className="text-muted-foreground mb-10 text-sm">Flat pricing. No surprises. Buy directly inside your dashboard.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {addons.map((a) => (
            <div key={a.name} className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="font-display text-2xl text-foreground">{a.name}</h3>
                <span className="font-display text-xl text-primary text-glow whitespace-nowrap">{a.price}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <CtaBanner
      title="Clients"
      highlight="Only"
      description="The I-Spy-R Dashboard is included with every active IAM exclusive territory subscription. Not a client yet? Start with a free scan."
      primaryLabel="Get Access — Run Free Scan"
      primaryTo="/scan-wizard"
    />
  </Layout>
);

export default Dashboard;