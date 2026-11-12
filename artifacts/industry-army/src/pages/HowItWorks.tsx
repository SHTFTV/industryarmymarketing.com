import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: "01",
    icon: "🎯",
    title: "Ask About Your Industry",
    body: "Tell us your industry, location and the customers you want to reach. We review fit and availability before agreeing to a listing or city-page partnership. An enquiry does not reserve a territory.",
  },
  {
    n: "02",
    icon: "🌐",
    title: "Choose the Right Scope",
    body: "Hub registration and a city-page partnership are separate offers. Confirm the relevant publication, what is included and any partnership terms before activation. Domain age does not guarantee rankings.",
  },
  {
    n: "03",
    icon: "📡",
    title: "Contribute Useful Work",
    body: "Any contribution needs a relevant audience, accurate sources and editorial review. Links and distribution must be useful and agreed; automatic network-wide cross-linking is not promised. Guest article submissions are currently closed.",
  },
  {
    n: "04",
    icon: "📈",
    title: "Measure Actual Enquiries",
    body: "Review visibility and genuine received enquiries against the agreed goals. Search rankings, AI recommendations, Google Maps placement and lead volume are not guaranteed. Company verification and editorial acceptance are separate decisions.",
  },
];

const HowItWorks = () => (
  <Layout>
    <Seo
      title="How It Works | Industry Army Marketing"
      description="How IAM reviews industry-network fit, separates hub registration from city-page partnerships, scopes contributions and measures actual enquiries."
      path="/how-it-works"
      jsonLd={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "How It Works", path: "/how-it-works" },
      ])}
    />
    <PageHeader
      eyebrow="The Process"
      title="How It"
      highlight="Works"
      description="Start with your industry and goals. Review the fit, agree the scope and terms, and measure the results. City-page partnerships require review before activation."
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
            <Link to="/contact">Ask About Your Industry</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default HowItWorks;