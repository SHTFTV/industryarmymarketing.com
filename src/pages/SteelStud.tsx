import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import CtaBanner from "@/components/CtaBanner";

const features = [
  { icon: "📍", title: "Exclusive Territory", body: "One steel stud framing contractor per city. Your listing locks out all competitors in your market area. First come, first served." },
  { icon: "🔍", title: "Trade-Specific SEO", body: "steelstud.ca ranks for 'steel stud framing [city]' searches. Your profile is the result they find first." },
  { icon: "🛡️", title: "EyeSpyr Verified", body: "Every contractor is verified through the I-Spy-R system. Your EyeSpyr badge tells customers you're the real deal." },
  { icon: "🔗", title: "Do-Follow Backlinks", body: "Your listing on steelstud.ca sends SEO authority back to your own website. $10 per guest post, unlimited." },
  { icon: "📞", title: "Direct Contact: Colin", body: "604-761-1518 · colin@steelstud.ca. Direct line. No call centres." },
  { icon: "🔓", title: "No Contract", body: "Month-to-month. Cancel anytime. Flat $10/month per territory across the IAM network — no per-population markup." },
];

const cities = [
  "Vancouver","Surrey","Burnaby","Richmond","Langley","Abbotsford","Kelowna","Kamloops","Prince George","Victoria","Nanaimo","Chilliwack","Coquitlam","Port Moody","Mission","Delta","North Van","West Van","New West","Maple Ridge",
];

const SteelStud = () => (
  <Layout>
    <Seo
      title="Steel Stud Framing Contractors BC — steelstud.ca | IAM"
      description="The only directory exclusively for steel stud framing contractors in British Columbia. EyeSpyr verified. One contractor per city."
      path="/niches/steel-stud"
    />
    <PageHeader
      eyebrow="steelstud.ca · IAM Network"
      title="Steel Stud Framing"
      highlight="BC"
      description="The only directory exclusively for steel stud framing contractors in British Columbia. EyeSpyr verified. One contractor per city."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Why steelstud.ca</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">The Framer's Home Turf</h2>
        <FeatureGrid features={features} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">BC Territory Map</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">Check Your City</h2>
        <p className="text-muted-foreground text-sm mb-8">Run a free scan to claim your city — availability is first-come, first-served.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cities.map((c) => (
            <div key={c} className="p-3 rounded-md bg-card border border-border text-center text-foreground/90 text-sm hover:border-primary/40 transition-colors">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
    <CtaBanner
      title="Lock Your"
      highlight="Framing City."
      description="Run the free scan, confirm availability, and get your steelstud.ca listing live."
      primaryLabel="Run Free Scan"
      primaryTo="/scan-wizard"
    />
  </Layout>
);

export default SteelStud;