import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PRICING_MATRIX } from "@/data/pricingMatrix";
import { Button } from "@/components/ui/button";

const PricingChartSection = () => (
  <section className="py-24 gradient-tactical border-y border-border">
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The 250 Scale</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground">
          Territory <span className="text-primary">Pricing Chart</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Hardcoded flat per-slot pricing. Slot 1 and the last slot cost the same. A tier only reads SOLD OUT when every slot is filled.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mt-2">All Prices in USD</p>
      </motion.div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 md:px-6 py-4">Population</th>
              <th className="px-4 md:px-6 py-4">Slots</th>
              <th className="px-4 md:px-6 py-4 text-primary">Per Slot / Mo</th>
              <th className="px-4 md:px-6 py-4 hidden md:table-cell">Total If Sold Out</th>
              <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_MATRIX.map((row) => (
              <tr key={row.lowerBound} className="border-t border-border hover:bg-secondary/40 transition-colors">
                <td className="px-4 md:px-6 py-3 font-semibold text-foreground">{row.populationLabel}</td>
                <td className="px-4 md:px-6 py-3 text-muted-foreground">{row.slots}</td>
                <td className="px-4 md:px-6 py-3 text-primary font-display text-lg">${row.pricePerSlot}/mo</td>
                <td className="px-4 md:px-6 py-3 text-muted-foreground text-sm hidden md:table-cell">${row.monthlyTotal}/mo</td>
                <td className="px-4 md:px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground hidden lg:table-cell">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-10">
        <Link to="/pricing">
          <Button variant="hero">See Full Pricing & Calculator</Button>
        </Link>
      </div>
    </div>
  </section>
);

export default PricingChartSection;