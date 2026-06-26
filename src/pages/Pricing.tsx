import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import PricingSection from "@/components/PricingSection";
import { cities } from "@/data/domains";
import { PRICING_MATRIX, ADDONS } from "@/data/pricingMatrix";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => (
  <Layout>
    <Seo
      title="Pricing — The 250 Scale | Territory Marketing | Industry Army Marketing"
        description="The 250 Scale — canonical territory pricing for all IAM platforms. $10–$50/slot/month. 3–10 slots per city. TALC.tv $10/post. Backlinks $25 one-time. Any industry. Any city."
      path="/pricing"
    />
    <PageHeader
      eyebrow="Transparent Pricing"
      title="The 250 Scale"
      highlight="Territory Pricing"
      description="The canonical IAM territory pricing model. Every city starts at 3 slots. Scales to 10. $10/slot under 1M population — doubles at 1M, steps up $10/million to a cap of $50. Same formula. Every industry. Every city on earth."
    />

    <PricingSection />

    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          Population <span className="text-primary">Slot Matrix</span>
        </h2>
        <p className="text-muted-foreground text-center mb-2">Exact slot counts and flat per-slot pricing. Every slot costs the same — slot 1 and the last slot are identical. A row only reads SOLD OUT when every slot in that population tier is filled.</p>
        <p className="text-xs uppercase tracking-[0.3em] text-primary text-center mb-10">All Prices in USD · Hardcoded · No Formulas</p>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Population Base</th>
                <th className="px-6 py-4">Slots Available</th>
                <th className="px-6 py-4 text-primary">Per Slot / Month</th>
                <th className="px-6 py-4 hidden md:table-cell">Total If Sold Out</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_MATRIX.map((row) => (
                <tr key={row.population} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{row.populationLabel}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.slots} slots</td>
                  <td className="px-6 py-4 text-primary font-display text-xl">${row.pricePerSlot.toFixed(2)}/mo</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm hidden md:table-cell">${row.monthlyTotal.toFixed(2)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-3xl text-foreground text-center mt-16 mb-6">Add-Ons & Upsells</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg bg-card border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Position #1 Feature</p>
            <p className="font-display text-3xl text-primary">+{ADDONS.position1FeaturePercent * 100}%</p>
            <p className="text-muted-foreground text-sm mt-2">Added to monthly billing — half your active slot cost.</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">High-Authority Backlink Pack</p>
            <p className="font-display text-3xl text-primary">${ADDONS.backlinkPackOneTime.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm mt-2">One-time fee.</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">TALC.tv Visual Blast</p>
            <p className="font-display text-3xl text-primary">${ADDONS.talcVisualBlastPerPost.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm mt-2">Per post — pay as you go.</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Hall Visualizer (EyeSpyr)</p>
            <p className="font-display text-3xl text-primary">${ADDONS.hallVisualizerPerRender.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm mt-2">Per render — pay as you go.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-3">
          City <span className="text-primary">Rates</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">Examples from Canada, the US, UK, Europe, the Middle East, Asia and Oceania — every city worldwide is available at the same $10 per 100K formula.</p>
        <p className="text-xs uppercase tracking-[0.3em] text-primary text-center -mt-8 mb-12">All Prices in USD</p>

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
  
    <section className="py-8 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Pricing Source of Truth</p>
        <p className="text-sm text-muted-foreground mt-1">All IAM platforms follow <strong className="text-primary">The 250 Scale</strong></p>
        <a href="https://industryarmymarketing.com/pricing/" className="text-xs text-primary font-mono">industryarmymarketing.com/pricing/ →</a>
      </div>
    </section>
  </Layout>
);

export default Pricing;