import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cities } from "@/data/domains";
import { lookupTierByPopulation, parsePopulation, formatSlotStatus } from "@/lib/pricing";

const CitiesPreview = () => (
  <section className="py-24 gradient-tactical border-y border-border">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Worldwide Coverage</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground">Featured Markets</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {cities.filter((c) => c.slug !== "any").map((c, i) => {
          const tier = lookupTierByPopulation(parsePopulation(c.population));
          const rate = tier ? `$${tier.row.monthlyTotal}/mo` : c.rate;
          const slotStatus = tier ? formatSlotStatus(tier.row, 0) : c.status;
          return (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/cities/${c.slug}`}
              className="block p-6 rounded-lg bg-card border border-border hover:border-primary/50 hover:border-glow transition-all"
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className="font-display text-2xl text-foreground">{c.name}</h3>
                <span className="font-display text-2xl text-primary text-glow">{rate}</span>
              </div>
              <p className="text-muted-foreground text-sm">Population {c.population}</p>
              <p className="text-xs text-primary uppercase tracking-widest mt-3">{slotStatus} →</p>
            </Link>
          </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default CitiesPreview;