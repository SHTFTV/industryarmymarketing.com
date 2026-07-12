import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cities, domains } from "@/data/domains";
import { ADDONS } from "@/data/pricingMatrix";
import { lookupTierByPopulation, parsePopulation, formatSlotStatus } from "@/lib/pricing";
import { usePpp } from "@/hooks/usePpp";
import { openComingSoon } from "@/lib/comingSoon";

const CITY_OPTIONS = cities.filter((c) => c.slug !== "any");

const PricingCalculator = () => {
  const { factor, adjust } = usePpp();
  const [cityQuery, setCityQuery] = useState("");
  const [manualPop, setManualPop] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const matchedCity = useMemo(() => {
    if (!cityQuery.trim()) return null;
    const q = cityQuery.toLowerCase();
    return (
      CITY_OPTIONS.find((c) => c.name.toLowerCase() === q) ||
      CITY_OPTIONS.find((c) => c.name.toLowerCase().startsWith(q)) ||
      CITY_OPTIONS.find((c) => c.name.toLowerCase().includes(q)) ||
      null
    );
  }, [cityQuery]);

  const suggestions = useMemo(() => {
    if (!cityQuery.trim() || matchedCity?.name.toLowerCase() === cityQuery.toLowerCase()) return [];
    const q = cityQuery.toLowerCase();
    return CITY_OPTIONS.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
  }, [cityQuery, matchedCity]);

  const effectivePop = matchedCity ? parsePopulation(matchedCity.population) : parsePopulation(manualPop);
  const tierLookup = lookupTierByPopulation(effectivePop);
  const tier = tierLookup?.row ?? null;
  const canCheck = Boolean(industry && (matchedCity || effectivePop > 0));

  const industryLabel = domains.find((d) => d.domain === industry);

  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Instant Price Check</p>
          <h2 className="font-display text-4xl md:text-6xl text-foreground">
            Check Your <span className="text-primary text-glow">Territory</span>
          </h2>
          <p className="text-muted-foreground mt-3">Your city. Your industry. Your exact monthly cost — no calls, no quotes.</p>
        </div>

        <div className="rounded-xl border border-primary/40 bg-card shadow-[0_0_40px_hsl(var(--primary)/0.15)] overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Step 1 — City */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-display flex items-center justify-center text-sm">1</span>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Your City</p>
              </div>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => { setCityQuery(e.target.value); setShowResult(false); }}
                placeholder="e.g. Vancouver"
                list="iam-city-list"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary outline-none"
              />
              <datalist id="iam-city-list">
                {CITY_OPTIONS.map((c) => <option key={c.slug} value={c.name} />)}
              </datalist>
              {!matchedCity && cityQuery.trim() && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Not in our list? Enter population:</p>
                  <input
                    type="number"
                    value={manualPop}
                    onChange={(e) => { setManualPop(e.target.value); setShowResult(false); }}
                    placeholder="e.g. 500000"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary outline-none"
                  />
                  {suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {suggestions.map((s) => (
                        <button
                          key={s.slug}
                          onClick={() => { setCityQuery(s.name); setManualPop(""); }}
                          className="text-xs px-2 py-1 rounded border border-border hover:border-primary text-muted-foreground hover:text-primary"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {matchedCity && (
                <p className="text-xs text-primary mt-2">✓ Population {matchedCity.population}</p>
              )}
            </div>

            {/* Step 2 — Industry */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-display flex items-center justify-center text-sm">2</span>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Your Industry</p>
              </div>
              <select
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setShowResult(false); }}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:border-primary outline-none"
              >
                <option value="">Select industry…</option>
                {domains.map((d) => (
                  <option key={d.domain} value={d.domain}>{d.emoji} {d.niche} — {d.domain}</option>
                ))}
              </select>
              {industryLabel && (
                <p className="text-xs text-primary mt-2">✓ {industryLabel.niche}</p>
              )}
            </div>

            {/* Step 3 — Check */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-display flex items-center justify-center text-sm">3</span>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Check Market</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">We'll match you to the exact slot tier — no formulas, no surprises.</p>
              </div>
              <Button
                variant="hero"
                size="lg"
                disabled={!canCheck}
                onClick={() => setShowResult(true)}
                className="w-full"
              >
                Check My Price →
              </Button>
            </div>
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && canCheck && tier && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-primary/40 bg-surface-elevated"
              >
                <div className="p-8 md:p-10">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Your Territory Rate</p>
                  <div className="grid md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                      <h3 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
                        {matchedCity?.name || `Population ${effectivePop.toLocaleString()}`}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {industryLabel?.niche} · {industryLabel?.domain}
                      </p>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                        {tier.populationLabel} · {tier.status} · {formatSlotStatus(tier, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Per Slot</p>
                      <p className="font-display text-5xl text-primary text-glow">${adjust(tier.pricePerSlot)}<span className="text-base text-muted-foreground">/mo</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {factor < 1 ? `List $${tier.pricePerSlot} · ${Math.round(factor * 100)}% PPP` : "Slot 1 = slot " + tier.slots}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Available</p>
                      <p className="font-display text-5xl text-foreground">{tier.slots}<span className="text-base text-muted-foreground"> slots</span></p>
                      <p className="text-xs text-muted-foreground mt-1">One contractor per slot</p>
                    </div>
                  </div>

                  <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 rounded border border-border bg-card">
                      <p className="text-xs uppercase text-muted-foreground">Position #1 add-on</p>
                      <p className="text-primary font-display text-xl">+${adjust(tier.pricePerSlot * ADDONS.position1FeaturePercent)}/mo</p>
                    </div>
                    <div className="p-3 rounded border border-border bg-card">
                      <p className="text-xs uppercase text-muted-foreground">Backlink Pack</p>
                      <p className="text-primary font-display text-xl">${adjust(ADDONS.backlinkPackOneTime)} once</p>
                    </div>
                    <div className="p-3 rounded border border-border bg-card">
                      <p className="text-xs uppercase text-muted-foreground">TALC.tv Blast</p>
                      <p className="text-primary font-display text-xl">${adjust(ADDONS.talcVisualBlastPerPost)}/post</p>
                    </div>
                    <div className="p-3 rounded border border-border bg-card">
                      <p className="text-xs uppercase text-muted-foreground">Hall Visualizer</p>
                      <p className="text-primary font-display text-xl">${adjust(ADDONS.hallVisualizerPerRender)}/render</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      onClick={() => openComingSoon({ title: "Apply Today — Claim This Slot" })}
                    >
                      Apply Today — Claim This Slot
                    </Button>
                    <Button
                      variant="heroOutline"
                      size="lg"
                      onClick={() => openComingSoon({ title: "Talk to Sales" })}
                    >
                      Talk to Sales
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            {showResult && canCheck && !tier && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-border p-8 text-center text-muted-foreground"
              >
                Enter a valid population to see your tier.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;