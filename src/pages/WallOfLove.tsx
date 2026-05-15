import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import TestimonialCard, { Testimonial } from "@/components/TestimonialCard";
import CtaBanner from "@/components/CtaBanner";

const reviews: Testimonial[] = [
  { quote: "Locked Surrey on roofers.io and had my first inquiry the same week. Three months in — my best quarter ever. IAM isn't magic, it's math. Exclusive territory means the leads are mine.", name: "Derek M.", role: "Roofer · Surrey, BC", source: "Google · EyeSpyr Verified" },
  { quote: "The I-Spy-R WhatsApp alerts are insane. I had a 1-star review at 11pm on a Friday and I responded within 4 minutes. Customer updated it to 4 stars by Saturday morning. That's the system working.", name: "Simone L.", role: "Electrician · Langley, BC", source: "HomeStars · EyeSpyr Verified" },
  { quote: "$10/month for Abbotsford on plumbers.ltd. I've been with HomeStars for years and was paying 10x that for shared leads. IAM territory is mine alone. Different product entirely.", name: "Raj P.", role: "Plumber · Abbotsford, BC", source: "Google · EyeSpyr Verified" },
  { quote: "We picked up two cities on excavators.tv and my phone hasn't stopped. Lead quality is the difference — these are people ready to hire, not tire-kickers from a shared directory.", name: "Tomasz K.", role: "Excavation · Coquitlam, BC", source: "Google · EyeSpyr Verified" },
  { quote: "EyeSpyr verification was the closer for me. My customers see the badge and they know they're not getting scammed. That trust signal is worth the territory cost on its own.", name: "Anita G.", role: "Painter · Burnaby, BC", source: "HomeStars · EyeSpyr Verified" },
  { quote: "Built my new site through IAM in 72 hours. Mobile-first, EyeSpyr badge front and centre, Wall of Love embedded. Form fills tripled in the first month versus my old WordPress site.", name: "Mike C.", role: "Sparky · Langley, BC", source: "Google · EyeSpyr Verified" },
];

const WallOfLove = () => (
  <Layout>
    <Seo
      title="Wall of Love — Verified Contractor Reviews | IAM"
      description="Real reviews from real contractors and their real customers. Powered by I-Spy-R. Every 5-star review displayed automatically — no cherry-picking, no gating."
      path="/wall-of-love"
    />
    <PageHeader
      eyebrow="IAM Review Showcase"
      title="Wall of"
      highlight="Love"
      description="Real reviews from real contractors and their real customers. Powered by I-Spy-R. Every 5-star review displayed automatically — no cherry-picking, no gating."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Verified Reviews</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">What Clients Say</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <TestimonialCard key={r.name} t={r} index={i} />
          ))}
        </div>
      </div>
    </section>
    <CtaBanner
      title="Earn Your"
      highlight="Wall."
      description="Lock your territory and watch the verified 5-star reviews roll in — automatically curated by I-Spy-R."
      primaryLabel="Run Free Scan"
      primaryTo="/scan-wizard"
    />
  </Layout>
);

export default WallOfLove;