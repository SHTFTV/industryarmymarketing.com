import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Globe, Network, Video, MapPin, Ban } from "lucide-react";
import ContractorTradesGrid from "@/components/ContractorTradesGrid";

const reasons = [
  { icon: Lock, title: "Exclusive Territory", body: "One roofer. One framer. One electrician. Per city. When your competitor tries to join, they can't. You locked them out." },
  { icon: Globe, title: "Premium Domain Authority", body: "Domains like roofers.io and gasfitter.ca have been building SEO authority for 20+ years. You inherit that ranking power instantly." },
  { icon: Network, title: "Network Of 150+ Sites", body: "Your content syndicates across our entire industry network. Every site links back to you, amplifying your reach." },
  { icon: Video, title: "Done-For-You Content", body: "We create videos, social posts, and branded content for your business. You focus on the job site — we handle marketing." },
  { icon: MapPin, title: "Local SEO Domination", body: "City-specific landing pages, Google Maps optimization, and hyper-local keyword targeting put you at the top for 'contractor near me' searches." },
  { icon: Ban, title: "No Long-Term Contracts", body: "Cancel anytime. But when you leave, your territory opens up to your competition. Most contractors stay because the ROI is obvious from month one." },
];

const Contractors = () => (
  <Layout>
    <Seo
      title="Contractor Marketing | Exclusive Trade & City Territories"
      description="Construction and trades marketing on premium 20+ year-old industry domains. One contractor per trade per city. Lock your category from $10/month."
      path="/contractors"
    />
    <PageHeader
      eyebrow="Built By Contractors · For Contractors"
      title="Construction &"
      highlight="Contractor Marketing"
      description="Exclusive territory. One contractor per trade per city. Premium industry domains with 20+ years of authority. Lock out your competition today."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/apply/contractors">Apply For Your Territory</Link></Button>
        <Button variant="heroOutline" asChild><Link to="/pricing">See Pricing</Link></Button>
      </div>
    </PageHeader>

    <ContractorTradesGrid
      eyebrow="50+ Construction Trades · Live Availability"
      title={<>Your Trade <span className="text-primary">Is Here</span></>}
      description="Premium industry domains, one contractor per trade per city. Lock yours before your competition does."
    />

    <section className="py-20 border-y border-border bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            See It <span className="text-primary">In Action</span>
          </h2>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/VQxS3STSLHA"
            title="Industry Army Contractors"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>

    <section className="py-20 gradient-tactical border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Why Contractors <span className="text-primary">Choose IAM</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-7 rounded-lg bg-card border border-border hover:border-primary/40 hover:border-glow transition-all"
            >
              <r.icon className="w-9 h-9 text-primary mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">{r.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Contractors;
