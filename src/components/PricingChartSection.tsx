import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PRICING_MATRIX } from "@/data/pricingMatrix";
import { Button } from "@/components/ui/button";
import { usePpp } from "@/hooks/usePpp";
import { PPP_COUNTRIES } from "@/data/pppFactors";

const PricingChartSection = () => {
  const { country, setCountry, factor, adjust } = usePpp();
  const isDiscounted = factor < 1;
  return (
  <section className="py-24 gradient-tactical border-y border-border">
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The 250 Scale</p>
        <h2 id="pricing-chart-heading" className="font-display text-5xl md:text-6xl text-foreground">
          Territory <span className="text-primary">Pricing Chart</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          $10 USD per 100,000 population, per slot. Slot 1 and the last slot cost the same. A tier only reads SOLD OUT when every slot is filled.
        </p>
        <div className="mt-4 inline-flex items-center gap-3 rounded border border-border bg-card px-3 py-2">
          <label htmlFor="ppp-country" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Country
          </label>
          <select
            id="ppp-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-transparent text-foreground text-sm focus:outline-none"
            aria-label="Select your country for PPP-adjusted pricing"
          >
            <optgroup label="Established (flat USD)">
              {PPP_COUNTRIES.filter((c) => c.tier === "established").map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Emerging (PPP-adjusted)">
              {PPP_COUNTRIES.filter((c) => c.tier === "emerging").map((c) => (
                <option key={c.code} value={c.code}>{c.name} — {Math.round(c.factor * 100)}%</option>
              ))}
            </optgroup>
          </select>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mt-3">
          {isDiscounted
            ? `PPP-adjusted for accessibility · ${Math.round(factor * 100)}% of USD list · Card country enforced at checkout`
            : "All prices in USD · Card country enforced at checkout"}
        </p>
      </motion.div>

      {/* Mobile: stacked cards */}
      <ul
        className="sm:hidden space-y-3 list-none p-0"
        aria-labelledby="pricing-chart-heading"
        data-testid="pricing-chart-mobile"
      >
        {PRICING_MATRIX.map((row) => (
          <li key={row.lowerBound} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{row.populationLabel}</p>
            <div className="flex items-baseline justify-between mt-2">
              <p className="font-display text-2xl text-primary">
                <span aria-label={`${adjust(row.pricePerSlot)} dollars per slot per month`}>${adjust(row.pricePerSlot)}</span>
                <span className="text-sm text-muted-foreground">/slot/mo</span>
              </p>
              <p className="text-sm text-foreground">{row.slots} slots</p>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
              {row.status} · ${adjust(row.monthlyTotal)}/mo if sold out
              {isDiscounted ? ` · list $${row.pricePerSlot}` : ""}
            </p>
          </li>
        ))}
      </ul>

      {/* Tablet/desktop: scrollable table */}
      <div
        className="hidden sm:block rounded-lg border border-border bg-card overflow-x-auto"
        role="region"
        aria-labelledby="pricing-chart-heading"
        tabIndex={0}
      >
        <table
          className="w-full min-w-[640px] text-left"
          data-testid="pricing-chart-table"
        >
          <caption className="sr-only">
            Territory pricing chart — population range, slot count, per-slot monthly price, total if sold out, and territory status.
          </caption>
          <thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 md:px-6 py-4 whitespace-nowrap">Population</th>
              <th scope="col" className="px-3 md:px-6 py-4 whitespace-nowrap">Slots</th>
              <th scope="col" className="px-3 md:px-6 py-4 text-primary whitespace-nowrap">Per Slot / Mo</th>
              <th scope="col" className="px-3 md:px-6 py-4 hidden md:table-cell whitespace-nowrap">Total If Sold Out</th>
              <th scope="col" className="px-3 md:px-6 py-4 hidden lg:table-cell whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_MATRIX.map((row) => (
              <tr key={row.lowerBound} className="border-t border-border hover:bg-secondary/40 transition-colors">
                <th scope="row" className="px-4 md:px-6 py-3 font-semibold text-foreground whitespace-nowrap text-left">{row.populationLabel}</th>
                <td className="px-3 md:px-6 py-3 text-muted-foreground">{row.slots}</td>
                <td className="px-3 md:px-6 py-3 text-primary font-display text-lg whitespace-nowrap">
                  ${adjust(row.pricePerSlot)}/mo
                  {isDiscounted && <span className="ml-2 text-[10px] font-body text-muted-foreground line-through">${row.pricePerSlot}</span>}
                </td>
                <td className="px-3 md:px-6 py-3 text-muted-foreground text-sm hidden md:table-cell whitespace-nowrap">${adjust(row.monthlyTotal)}/mo</td>
                <td className="px-3 md:px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground hidden lg:table-cell whitespace-nowrap">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-10">
        <Button asChild variant="hero">
          <Link to="/pricing" data-testid="pricing-chart-cta" aria-label="See full pricing and territory calculator">
            See Full Pricing & Calculator
          </Link>
        </Button>
      </div>
    </div>
  </section>
  );
};

export default PricingChartSection;