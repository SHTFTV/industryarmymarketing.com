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
  { name: "Excavation", domain: "excavators.tv", emoji: "🚜" },
  { name: "Painting", domain: "painters.tv", emoji: "🎨" },
  { name: "Steel Stud", domain: "steelstudcontractors.com", emoji: "🔩" },
  { name: "General Contracting", domain: "generalcontractors.ltd", emoji: "🏛️" },
  { name: "Demolition", domain: "demolition.io", emoji: "💥", image: demolitionImg.url, contain: true },
  { name: "Remodeling", domain: "remodelers.io", emoji: "🔨" },
  { name: "Carpentry", domain: "carpenters.ltd", emoji: "🪚" },
  { name: "Flooring", domain: "flooringinstallers.co", emoji: "🪵" },
  { name: "Fireproofing", domain: "fireproofing.ltd", emoji: "🔥" },
  { name: "Spray Foam", domain: "sprayfoamcontractors.ltd", emoji: "🧴" },
  { name: "Kitchen Cabinets", domain: "kitchencabinets.io", emoji: "🍳" },
  { name: "Irrigation", domain: "irrigation.ltd", emoji: "🌊" },
  { name: "Junk Removal", domain: "junkremoval.ltd", emoji: "🗑️" },
  { name: "Custom Closets", domain: "customclosets.io", emoji: "🚪" },
  { name: "Fabrication", domain: "fabricators.ltd", emoji: "⚙️" },
  { name: "Estimating", domain: "estimators.io", emoji: "📋" },
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
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 hover:border-glow transition-all flex flex-col items-center text-center"
            >
              {t.image ? (
                <div className="w-full aspect-square mb-3 overflow-hidden rounded-md bg-background border border-border/50">
                  <img
                    src={t.image}
                    alt={`${t.name} — ${t.domain}`}
                    loading="lazy"
                    className={`w-full h-full ${t.contain ? "object-contain p-3" : "object-cover"}`}
                  />
                </div>
              ) : (
                <div className="text-3xl mb-3" aria-hidden="true">
                  {t.emoji}
                </div>
              )}
              <h3 className="font-display text-lg text-foreground">{t.name}</h3>
              <div className="font-mono text-primary text-sm mt-1 break-all">
                {t.domain}
              </div>
              <span className="mt-4 text-xs uppercase tracking-widest text-primary border border-primary/40 rounded-full px-3 py-1">
                ✓ Available
              </span>
            </motion.div>
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
