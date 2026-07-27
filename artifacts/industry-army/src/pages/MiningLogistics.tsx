import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";

const network = [
  { icon: "📰", title: "The Mining Minute", body: "Daily intelligence briefings on Canadian critical mineral development, mine openings, logistics contracts, and heavy haul opportunities. theminingminute.com." },
  { icon: "⛏️", title: "Critical Minerals Hub", body: "Coverage of Canada's top critical mineral sectors: lithium, cobalt, nickel, copper, rare earths, talc. BC, Yukon, NWT, Ontario. criticalminerals.info." },
  { icon: "🎬", title: "Mining Shorts", body: "Short-form video and content on mining news, junior resource companies, and logistics developments. Built for investors, operators, and the supply chain. miningshorts.com." },
];

const value = [
  { icon: "🧠", title: "Lead Classification", body: "AI-powered separation of news from logistics leads. Your team sees opportunities, not noise." },
  { icon: "⚡", title: "WhatsApp Alerts", body: "New logistics contracts and mine openings delivered to your phone in <5 minutes via I-Spy-R." },
  { icon: "🔒", title: "Exclusive Listing", body: "One logistics or heavy haul operator per region, per specialty. First-come, first-served." },
  { icon: "🌐", title: "Network Reach", body: "7 dedicated mining domains reaching investors, operators, and procurement teams daily." },
];

const MiningLogistics = () => (
  <Layout>
    <Seo
      title="Mining & Heavy Haul — Logistics Intelligence | IAM"
      description="IAM's intelligence network for Canada's critical minerals sector. Logistics leads, mining news, and exclusive territory advertising for heavy haul and resource contractors."
      path="/niches/mining-logistics"
    />
    <PageHeader
      eyebrow="MiningMinute · Critical Minerals Network"
      title="Mining &"
      highlight="Heavy Haul"
      description="IAM's intelligence network for Canada's critical minerals sector. Logistics leads, mining news, and exclusive territory advertising for heavy haul and resource contractors."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Mining Network</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">Critical Minerals Intel</h2>
        <FeatureGrid features={network} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">For Logistics & Heavy Haul</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">Own Your Lane</h2>
        <p className="text-muted-foreground max-w-3xl mb-10 leading-relaxed">
          The critical minerals boom is creating unprecedented demand for heavy haul, specialized logistics, and industrial supply chain services across Canada. Our MiningMinute NLP engine classifies mining news in real time — separating logistics money leads from general news so your team only sees actionable intelligence.
        </p>
        <FeatureGrid features={value} />
      </div>
    </section>
    <CtaBanner
      title="The Resource Sector"
      highlight="Needs Your Fleet."
      description="Claim your mining logistics territory before the competition finds IAM."
      primaryLabel="Get Your Territory"
      primaryTo="/contact"
    />
  </Layout>
);

export default MiningLogistics;