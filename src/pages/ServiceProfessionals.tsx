import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { emoji: "🧹", name: "Cleaners", domain: "cleaners.io" },
  { emoji: "🚛", name: "Movers", domain: "movers.io" },
  { emoji: "🌿", name: "Landscapers", domain: "landscapers.ca" },
  { emoji: "🌨️", name: "Snow Removal", domain: "plowwow.com" },
  { emoji: "🌱", name: "Lawn Care", domain: "promows.com" },
  { emoji: "🛋️", name: "Decorators", domain: "decorator.tv" },
  { emoji: "✨", name: "Interior Designers", domain: "interiordesigners.io" },
  { emoji: "📸", name: "Videographers", domain: "videographers.io" },
  { emoji: "🍽️", name: "Caterers", domain: "caterers.tv" },
  { emoji: "💍", name: "Wedding Planners", domain: "weddings.io" },
  { emoji: "🔑", name: "Real Estate", domain: "loveourlistings.com" },
  { emoji: "⚖️", name: "Legal", domain: "lawyersadvice.co" },
  { emoji: "💆", name: "Massage Therapy", domain: "massagetherapy.tv" },
  { emoji: "🌱", name: "Naturopaths", domain: "naturopaths.io" },
  { emoji: "🦷", name: "Dentists", domain: "dentists.ltd" },
  { emoji: "🧘", name: "Yoga Studios", domain: "yoga.io" },
  { emoji: "🥗", name: "Nutritionists", domain: "nutritionists.io" },
  { emoji: "🏥", name: "Physiotherapists", domain: "physiotherapists.io" },
  { emoji: "🧠", name: "Counselors", domain: "counselors.io" },
  { emoji: "🪵", name: "Log Cabins", domain: "logcabin.ltd" },
];

const stats = [
  { v: "∞", l: "Worldwide Cities" },
  { v: "1", l: "Per Trade Per City" },
  { v: "$10", l: "Per 100K Pop / Mo" },
  { v: "4.8", l: "EyeSpyR Score" },
  { v: "20+", l: "Years Domain Age" },
];

const ServiceProfessionals = () => (
  <Layout>
    <Seo
      title="Service Professional Marketing | Exclusive City Territories"
      description="Marketing for cleaners, movers, landscapers, designers and more on 20+ year-old niche domains. One pro per category per city, from $10/month."
      path="/service-professionals"
    />
    <PageHeader
      eyebrow="Industry Army Marketing · Service Professionals"
      title="I Am The Only"
      highlight="Cleaner In Vancouver"
      description={`Replace "cleaner" with your trade. Replace "Vancouver" with your city. That's the IAM model — exclusive territory so you are the only one in your niche in your city across 150+ premium domains.`}
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/contact">Claim My Territory</Link></Button>
        <Button variant="heroOutline" asChild><Link to="/industries">Browse Domains</Link></Button>
      </div>
    </PageHeader>

    <section className="py-12 border-b border-border bg-card/40">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="font-display text-3xl md:text-4xl text-primary text-glow">{s.v}</div>
            <div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Service Professional Categories</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Your Trade Is Here</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Every service professional category has its own domain. Claim your city in your category — your competitor can't follow you in.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-5 rounded-lg bg-card border border-border hover:border-primary/40 hover:border-glow transition-all"
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="font-display text-xl text-foreground">{c.name}</div>
              <div className="text-primary text-sm font-mono mt-1">{c.domain}</div>
              <div className="text-xs text-muted-foreground mt-2">✓ Most cities open</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default ServiceProfessionals;