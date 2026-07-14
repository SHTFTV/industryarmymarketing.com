import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PRICING_MATRIX } from "@/data/pricingMatrix";
import { Button } from "@/components/ui/button";
import { usePpp } from "@/hooks/usePpp";
import { PPP_COUNTRIES } from "@/data/pppFactors";
import { trackEvent } from "@/lib/analytics";

// Human-readable flat pricing rule for a given row.
// Population controls slot count only; the per-slot price never scales.
const RULE_TEXT = "$10 USD per 100,000 population baseline; every slot stays $10/mo";
function ruleCallout(pricePerSlot: number): string {
  return `$10 per 100K = $${pricePerSlot}/slot/mo`;
}
// Formula shown inside the expanded tooltip — locked string so visual
// regression tests can pin the exact wording across desktop + mobile.
const RULE_FORMULA = "1 × 100K × $10 = $10/slot/mo";

// Analytics event names for banner + callout interactions. Deduped per
// mount so noisy focus/hover streams don't flood the pipeline while still
// letting E2E assert that the first interaction of each type was recorded.
const EVT = {
  bannerFocus: "pricing_chart_banner_focus",
  bannerHover: "pricing_chart_banner_hover",
  calloutFocus: "pricing_chart_callout_focus",
  calloutHover: "pricing_chart_callout_hover",
  calloutTooltipOpen: "pricing_chart_callout_tooltip_open",
} as const;

const PricingChartSection = () => {
  const { country, setCountry, factor, adjust } = usePpp();
  const isDiscounted = factor < 1;
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);
  // When a tooltip is open, remember which trigger opened it so we can
  // restore focus on dismiss (Escape, outside click, or scroll).
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const closeTooltip = useCallback((restoreFocus: boolean) => {
    setOpenTooltip((current) => {
      if (current === null) return current;
      if (restoreFocus) {
        const trigger = triggerRefs.current.get(current);
        // Defer so React finishes the state flush before we move focus.
        if (trigger) queueMicrotask(() => trigger.focus());
      }
      return null;
    });
  }, []);
  // Close on outside click and on scroll — matches native tooltip UX and
  // prevents a stale tooltip from floating away from its trigger as the
  // sticky matrix scrolls beneath it.
  useEffect(() => {
    if (openTooltip === null) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const trigger = triggerRefs.current.get(openTooltip);
      const tipId = `pricing-tip-${openTooltip}`;
      const tipMobileId = `pricing-tip-mobile-${openTooltip}`;
      const tip =
        document.getElementById(tipId) || document.getElementById(tipMobileId);
      if (target && (trigger?.contains(target) || tip?.contains(target))) return;
      closeTooltip(false);
    };
    const onScroll = () => closeTooltip(false);
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [openTooltip, closeTooltip]);
  // Escape key closes an open tooltip from anywhere on the page, matching
  // native tooltip / disclosure keyboard patterns (WAI-ARIA 1.2).
  const handleTooltipKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Escape" && openTooltip !== null) {
        e.preventDefault();
        closeTooltip(true);
      }
    },
    [openTooltip, closeTooltip],
  );
  // De-dupe focus/hover events per row per mount so a user rapidly moving
  // the pointer/keyboard across the matrix records one event per row.
  const firedRef = useRef<Set<string>>(new Set());
  const fireOnce = useCallback(
    (event: string, meta: Record<string, unknown>) => {
      const key = `${event}:${meta.lowerBound ?? "banner"}`;
      if (firedRef.current.has(key)) return;
      firedRef.current.add(key);
      trackEvent(event, meta);
    },
    [],
  );
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
          $10 USD per slot, flat across every population tier. Population only controls slot count. A tier only reads SOLD OUT when every slot is filled.
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

      {/* Pinned rule banner — sticks above the chart while users scroll long tiers */}
      <div
        data-testid="pricing-rule-banner"
        role="note"
        aria-label={RULE_TEXT}
        tabIndex={0}
        onFocus={() => fireOnce(EVT.bannerFocus, { rule: RULE_TEXT })}
        onMouseEnter={() => fireOnce(EVT.bannerHover, { rule: RULE_TEXT })}
        className="sticky top-16 z-20 mb-4 rounded-md border-2 border-primary bg-background/95 backdrop-blur px-4 py-3 shadow-[0_0_20px_hsl(var(--primary)/0.25)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <p className="font-display text-lg md:text-xl text-center tracking-wide">
          <span className="text-primary">$10 USD</span>{" "}
          <span className="text-foreground">per slot, flat across every population tier</span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center mt-1">
          100K baseline · No population multiplier
        </p>
      </div>

      {/* Mobile: stacked cards */}
      <ul
        className="sm:hidden space-y-3 list-none p-0"
        aria-labelledby="pricing-chart-heading"
        data-testid="pricing-chart-mobile"
      >
        {PRICING_MATRIX.map((row) => (
          <li
            key={row.lowerBound}
            className="rounded-lg border border-border bg-card p-4"
            title={`${RULE_TEXT} — ${ruleCallout(row.pricePerSlot)}`}
          >
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
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                ref={(el) => {
                  if (el) triggerRefs.current.set(row.lowerBound, el);
                  else triggerRefs.current.delete(row.lowerBound);
                }}
                data-testid={`pricing-callout-mobile-${row.lowerBound}`}
                aria-label={`${row.populationLabel}: ${ruleCallout(row.pricePerSlot)} — ${RULE_TEXT}`}
                aria-expanded={openTooltip === row.lowerBound}
                aria-describedby={
                  openTooltip === row.lowerBound ? `pricing-tip-mobile-${row.lowerBound}` : undefined
                }
                title={`${RULE_TEXT} — ${ruleCallout(row.pricePerSlot)}`}
                onKeyDown={handleTooltipKeyDown}
                onFocus={() =>
                  fireOnce(EVT.calloutFocus, {
                    lowerBound: row.lowerBound,
                    pricePerSlot: row.pricePerSlot,
                    population: row.populationLabel,
                    layout: "mobile",
                  })
                }
                onMouseEnter={() =>
                  fireOnce(EVT.calloutHover, {
                    lowerBound: row.lowerBound,
                    pricePerSlot: row.pricePerSlot,
                    population: row.populationLabel,
                    layout: "mobile",
                  })
                }
                onClick={() => {
                  setOpenTooltip((prev) => (prev === row.lowerBound ? null : row.lowerBound));
                  trackEvent(EVT.calloutTooltipOpen, {
                    lowerBound: row.lowerBound,
                    pricePerSlot: row.pricePerSlot,
                    population: row.populationLabel,
                    layout: "mobile",
                  });
                }}
                className="block w-full text-left text-[10px] font-mono text-primary/90 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                {ruleCallout(row.pricePerSlot)}
              </button>
              {openTooltip === row.lowerBound && (
                <div
                  id={`pricing-tip-mobile-${row.lowerBound}`}
                  role="tooltip"
                  data-testid={`pricing-tooltip-mobile-${row.lowerBound}`}
                  className="mt-2 rounded-md border border-primary/60 bg-background px-3 py-2 text-[11px] text-foreground shadow-md"
                >
                  <span className="text-primary font-semibold">{RULE_TEXT}</span>
                  <span className="block text-muted-foreground mt-1">
                    {row.populationLabel} → {ruleCallout(row.pricePerSlot)}
                  </span>
                  <span
                    data-testid={`pricing-tooltip-formula-mobile-${row.lowerBound}`}
                    className="block text-primary/90 font-mono mt-1"
                  >
                    {RULE_FORMULA}
                  </span>
                </div>
              )}
            </div>
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
              <th scope="col" className="px-3 md:px-6 py-4 hidden md:table-cell whitespace-nowrap">$10 / 100K Rule</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_MATRIX.map((row) => (
              <tr
                key={row.lowerBound}
                className="border-t border-border hover:bg-secondary/40 transition-colors"
                title={`${RULE_TEXT} — ${ruleCallout(row.pricePerSlot)}`}
              >
                <th scope="row" className="px-4 md:px-6 py-3 font-semibold text-foreground whitespace-nowrap text-left">{row.populationLabel}</th>
                <td className="px-3 md:px-6 py-3 text-muted-foreground">{row.slots}</td>
                <td className="px-3 md:px-6 py-3 text-primary font-display text-lg whitespace-nowrap">
                  ${adjust(row.pricePerSlot)}/mo
                  {isDiscounted && <span className="ml-2 text-[10px] font-body text-muted-foreground line-through">${row.pricePerSlot}</span>}
                </td>
                <td className="px-3 md:px-6 py-3 text-muted-foreground text-sm hidden md:table-cell whitespace-nowrap">${adjust(row.monthlyTotal)}/mo</td>
                <td className="px-3 md:px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground hidden lg:table-cell whitespace-nowrap">{row.status}</td>
                <td
                  data-testid={`pricing-callout-${row.lowerBound}`}
                  className="px-3 md:px-6 py-3 text-[11px] font-mono text-primary/90 hidden md:table-cell whitespace-nowrap"
                >
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) triggerRefs.current.set(row.lowerBound, el);
                      else triggerRefs.current.delete(row.lowerBound);
                    }}
                    data-testid={`pricing-callout-button-${row.lowerBound}`}
                    aria-label={`${row.populationLabel}: ${ruleCallout(row.pricePerSlot)} — ${RULE_TEXT}`}
                    aria-expanded={openTooltip === row.lowerBound}
                    aria-describedby={
                      openTooltip === row.lowerBound ? `pricing-tip-${row.lowerBound}` : undefined
                    }
                    title={`${RULE_TEXT} — ${ruleCallout(row.pricePerSlot)}`}
                    onKeyDown={handleTooltipKeyDown}
                    onFocus={() =>
                      fireOnce(EVT.calloutFocus, {
                        lowerBound: row.lowerBound,
                        pricePerSlot: row.pricePerSlot,
                        population: row.populationLabel,
                        layout: "desktop",
                      })
                    }
                    onMouseEnter={() =>
                      fireOnce(EVT.calloutHover, {
                        lowerBound: row.lowerBound,
                        pricePerSlot: row.pricePerSlot,
                        population: row.populationLabel,
                        layout: "desktop",
                      })
                    }
                    onClick={() => {
                      setOpenTooltip((prev) =>
                        prev === row.lowerBound ? null : row.lowerBound,
                      );
                      trackEvent(EVT.calloutTooltipOpen, {
                        lowerBound: row.lowerBound,
                        pricePerSlot: row.pricePerSlot,
                        population: row.populationLabel,
                        layout: "desktop",
                      });
                    }}
                    className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1 text-left"
                  >
                    {ruleCallout(row.pricePerSlot)}
                  </button>
                  {openTooltip === row.lowerBound && (
                    <div
                      id={`pricing-tip-${row.lowerBound}`}
                      role="tooltip"
                      data-testid={`pricing-tooltip-${row.lowerBound}`}
                      className="mt-1 rounded border border-primary/60 bg-background px-2 py-1 text-[11px] text-foreground shadow-md whitespace-normal"
                    >
                      <span className="text-primary font-semibold">{RULE_TEXT}</span>
                      <span className="block text-muted-foreground">
                        {row.populationLabel} → {ruleCallout(row.pricePerSlot)}
                      </span>
                      <span
                        data-testid={`pricing-tooltip-formula-${row.lowerBound}`}
                        className="block text-primary/90 font-mono"
                      >
                        {RULE_FORMULA}
                      </span>
                    </div>
                  )}
                </td>
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