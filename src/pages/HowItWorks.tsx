import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: "01",
    icon: "🎯",
    title: "Claim Your Territory",
    body: "Pick your trade and city. Once you're in, no other business in your trade can join in your city. Ever. Your territory is 100% exclusive and locked the moment you sign up.",
  },
  {
    n: "02",
    icon: "🌐",
    title: "Inherit the Authority",
    body: "Your business gets a dedicated page on your trade's premium domain — like roofers.io or gasfitter.ca — carrying 20+ years of SEO authority. You don't build it. You inherit it.",
  },
  {
    n: "03",
    icon: "📡",
    title: "The Army Amplifies You",
    body: "Your content syndicates across 150+ industry sites. Every site cross-links to your page. The whole network amplifies your brand simultaneously.",
  },
  {
    n: "04",
    icon: "📈",
    title: "Leads Come To You",
    body: "Homeowners and businesses searching for your trade in your city find you first. AI search engines surface you. Google Maps ranks you. Calls and quotes start landing.",
  },
];

const HowItWorks = () => (
  <Layout>
    <Seo
      title="How It Works | Industry Army Marketing"
      description="Four steps to owning your trade in your city: choose city, lock category, get listed on 20+ year domains, and start fielding leads — from $10/month."
      path="/how-it-works"
    />
    <PageHeader
      eyebrow="The Process"
      title="How It"
      highlight="Works"
      description="Four simple steps to owning your trade in your city. No long-term contracts. No agency markup. No hidden fees."
    />
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col md:flex-row gap-6 p-8 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
            >
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:min-w-[140px]">
                <span className="font-display text-5xl text-primary text-glow">{s.n}</span>
                <span className="text-4xl">{s.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-3xl text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/contact">Claim Your Territory</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default HowItWorks;