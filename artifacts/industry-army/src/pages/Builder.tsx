import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";
import StepList from "@/components/StepList";
import CtaBanner from "@/components/CtaBanner";

const features = [
  { icon: "🛠️", title: "Built For You", body: "No templates, no page-builders, no drag-and-drop frustration. Our team builds your site from scratch — your brand, your services, your territory. Done in 72 hours." },
  { icon: "📱", title: "Mobile-First", body: "Over 80% of trade searches happen on mobile. Your IAM site is built mobile-first, loads fast on 4G, and converts visitors into phone calls and form submissions." },
  { icon: "🛡️", title: "EyeSpyr Integrated", body: "Your EyeSpyr verification badge appears prominently on your site. Customers who know the badge know they're dealing with a verified, legitimate contractor." },
  { icon: "🔗", title: "Territory Linked", body: "Your site connects directly to your exclusive territory listings on the IAM domain network. Every city page links back to your brand — multiplying your local SEO footprint." },
  { icon: "❤️", title: "Review Showcase", body: "Your Wall of Love — the IAM automated review display — is embedded directly in your site. New 5-star reviews appear automatically as they come in." },
  { icon: "🇨🇦", title: "Canada Hosted", body: "Hosted on Canadian infrastructure. PIPEDA-compliant, fast CDN delivery across BC and Canada, and 99.9% uptime SLA guaranteed." },
];

const steps = [
  { title: "Run your free scan", body: "We audit your existing online presence and send you a report with what your site needs." },
  { title: "Send us your info", body: "Business name, services, cities served, and any existing brand assets. We do the rest." },
  { title: "We build it in 72 hours", body: "Your team reviews a live preview. Final tweaks happen on a single shared link." },
  { title: "Ship and lock territory", body: "We push the site live, link it into the IAM network, and activate your EyeSpyr badge." },
];

const Builder = () => (
  <Layout>
    <Seo
      title="Site Builder — Live in 72 Hours | IAM"
      description="IAM builds and hosts a professional contractor website for you — EyeSpyr-verified, mobile-optimized, and integrated with your exclusive territory listings."
      path="/builder"
    />
    <PageHeader
      eyebrow="IAM Site Builder"
      title="Your Site."
      highlight="Your Brand."
      description="IAM builds and hosts a professional contractor website for you. EyeSpyr-verified, mobile-optimized, integrated with your exclusive territory listings. No tech skills needed."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">What You Get</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">A Site Built For Leads</h2>
        <FeatureGrid features={features} />
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Process</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">Live in 72 Hours</h2>
        <StepList steps={steps} />
      </div>
    </section>
    <CtaBanner
      title="Ready For Your"
      highlight="New Site?"
      description="Start with a free scan. We'll show you exactly what your new IAM site will fix."
      primaryLabel="Start With A Free Scan"
      primaryTo="/scan-wizard"
      secondaryLabel="See Pricing"
      secondaryTo="/pricing"
    />
  </Layout>
);

export default Builder;