import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import PricingSection from "@/components/PricingSection";
import { cities } from "@/data/domains";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => (
  <Layout>
    <Seo
      title="Pricing | $10 Per 100K Population — Industry Army Marketing"
        description="Transparent contractor marketing pricing: $10 per 100,000 residents per month. Minimum $10/month. Cancel anytime. See city-by-city rates."
      path="/pricing"
    />
    <PageHeader
      eyebrow="Transparent Pricing"
      title="$10 Per 100K"
      highlight="Population"
      description="Your monthly rate is set by your city's population. The formula never changes: $10 per 100,000 residents. Minimum $10/month. Cancel anytime."
    />

    <PricingSection />

    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          City <span className="text-primary">Rates</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">Examples from Canada, the US, UK, Europe, the Middle East, Asia and Oceania — every city worldwide is available at the same $10 per 100K formula.</p>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Population</th>
                <th className="px-6 py-4 text-primary">Monthly Rate</th>
                <th className="px-6 py-4 hidden md:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c, i) => (
                <motion.tr
                  key={c.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-border hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-foreground">{c.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.population}</td>
                  <td className="px-6 py-4 text-primary font-display text-xl">{c.rate}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm hidden md:table-cell">{c.status}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/contact">Lock In Your Rate</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Pricing;