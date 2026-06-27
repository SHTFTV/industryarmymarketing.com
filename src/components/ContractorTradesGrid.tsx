import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import plumbersImg from "@/assets/flagship/plumbers-mascot.png.asset.json";
import drywallersImg from "@/assets/flagship/drywallers-mascot.png.asset.json";
import demolitionImg from "@/assets/flagship/demolition-logo.png.asset.json";
import framersImg from "@/assets/flagship/framers-logo.png.asset.json";
import roofersImg from "@/assets/flagship/roofers-hero.jpg.asset.json";
import hvacrImg from "@/assets/flagship/hvacr-hero.jpg.asset.json";
import finishingCarpentersImg from "@/assets/flagship/finishingcarpenters-logo.png.asset.json";
import rebarImg from "@/assets/flagship/rebar-logo.png.asset.json";
import kitchenCabinetsImg from "@/assets/flagship/kitchencabinets-card.png.asset.json";
import estimatorsImg from "@/assets/flagship/estimators-logo.png.asset.json";
import fabricatorsImg from "@/assets/flagship/fabricators-logo.png.asset.json";
import hardscapesImg from "@/assets/flagship/hardscapes-logo.png.asset.json";

export type ContractorTrade = {
  name: string;
  domain: string;
  emoji: string;
  image?: string;
  contain?: boolean;
};

// Mirrors the trade-availability grid shown across contractor surfaces:
// emoji + trade name + premium domain + AVAILABLE pill.
export const CONTRACTOR_TRADES: ContractorTrade[] = [
  { name: "Roofing", domain: "roofers.io", emoji: "🏠", image: roofersImg.url },
  { name: "Framing", domain: "framers.io", emoji: "🏗️", image: framersImg.url, contain: true },
  { name: "Drywall", domain: "drywallers.io", emoji: "🧱", image: drywallersImg.url, contain: true },
  { name: "Plumbing", domain: "plumbers.ltd", emoji: "💧", image: plumbersImg.url, contain: true },
  { name: "Finishing Carpentry", domain: "finishingcarpenters.com", emoji: "✏️", image: finishingCarpentersImg.url, contain: true },
  { name: "HVAC", domain: "hvacr.tv", emoji: "❄️", image: hvacrImg.url },
  { name: "Rebar & Reinforcing", domain: "rebar.tv", emoji: "🔗", image: rebarImg.url, contain: true },
  { name: "Estimating", domain: "estimators.io", emoji: "📐", image: estimatorsImg.url, contain: true },
  { name: "Kitchen Cabinets", domain: "kitchencabinets.io", emoji: "🍳", image: kitchenCabinetsImg.url },
  { name: "Hardscapes", domain: "hardscapes.io", emoji: "🪨", image: hardscapesImg.url, contain: true },
  { name: "Demolition", domain: "demolition.io", emoji: "💥", image: demolitionImg.url, contain: true },
  { name: "Fabrication", domain: "fabricators.io", emoji: "⚙️", image: fabricatorsImg.url, contain: true },
  { name: "Carpentry", domain: "carpenters.ltd", emoji: "🪚" },
  { name: "Flooring", domain: "flooringinstallers.co", emoji: "🪵" },
  { name: "Fireproofing", domain: "fireproofing.ltd", emoji: "🔥" },
  { name: "Spray Foam", domain: "sprayfoamcontractors.ltd", emoji: "🧴" },
  { name: "Irrigation", domain: "irrigation.ltd", emoji: "🌊" },
  { name: "Junk Removal", domain: "junkremoval.ltd", emoji: "🗑️" },
  { name: "Custom Closets", domain: "customclosets.io", emoji: "🚪" },
  { name: "Strata Roofing", domain: "strataroofing.ca", emoji: "🏢" },
  { name: "Tenant Improvement", domain: "tenantimprovement.ca", emoji: "🏬" },
];

type Props = {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  limit?: number;
  showCta?: boolean;
};

const ContractorTradesGrid = ({
  eyebrow = "Live Trade Availability",
  title = (
    <>
      Premium <span className="text-primary">Contractor Domains</span>
    </>
  ),
  description = "One contractor per trade per city. When it's locked, it's locked — permanently.",
  limit,
  showCta = false,
}: Props) => {
  const trades = limit ? CONTRACTOR_TRADES.slice(0, limit) : CONTRACTOR_TRADES;

  return (
    <section className="py-20 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            {eyebrow}
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {trades.map((t, i) => (
            <motion.a
              key={t.name}
              href={`https://${t.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${t.domain}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="group p-6 rounded-lg bg-card border border-border hover:border-primary/60 hover:border-glow hover:-translate-y-1 transition-all flex flex-col items-center text-center"
            >
              {t.image ? (
                <div className="w-full aspect-square mb-3 overflow-hidden rounded-md border border-border/50 relative bg-gradient-to-br from-primary/20 via-background to-secondary/40">
                  {t.contain && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center text-[9rem] opacity-20 blur-[2px] select-none"
                      >
                        {t.emoji}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.25),transparent_65%)]"
                      />
                    </>
                  )}
                  <img
                    src={t.image}
                    alt={`${t.name} — ${t.domain}`}
                    loading="lazy"
                    className={`relative w-full h-full transition-transform duration-500 group-hover:scale-110 ${t.contain ? "object-contain p-4 drop-shadow-[0_6px_18px_hsl(var(--primary)/0.45)]" : "object-cover"}`}
                  />
                  {!t.contain && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                    />
                  )}
                </div>
              ) : (
                <div
                  className="w-full aspect-square mb-3 overflow-hidden rounded-md border border-border/50 relative flex items-center justify-center bg-gradient-to-br from-primary/15 via-background to-secondary/30"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 blur-[1px] select-none">
                    {t.emoji}
                  </span>
                  <span className="relative text-5xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
                    {t.emoji}
                  </span>
                </div>
              )}
              <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
              <div className="font-mono text-primary text-sm mt-1 break-all">
                {t.domain}
              </div>
              <span className="mt-4 text-xs uppercase tracking-widest text-primary border border-primary/40 rounded-full px-3 py-1">
                ✓ Available
              </span>
            </motion.a>
          ))}
        </div>

        {showCta && (
          <div className="text-center mt-12">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contractors">See All Trades</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContractorTradesGrid;
