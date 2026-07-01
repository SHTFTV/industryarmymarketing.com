import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import plumbersImg from "@/assets/flagship/plumbers-card.jpg.asset.json";
import drywallersImg from "@/assets/flagship/drywallers-card.jpg.asset.json";
import demolitionImg from "@/assets/flagship/demolition-card.jpg.asset.json";
import framersImg from "@/assets/flagship/framers-card.jpg.asset.json";
import roofersImg from "@/assets/flagship/roofers-card.jpg.asset.json";
import hvacrImg from "@/assets/flagship/hvacr-hero.jpg.asset.json";
import finishingCarpentersImg from "@/assets/flagship/finishingcarpenters-card.jpg.asset.json";
import rebarImg from "@/assets/flagship/rebar-card.jpg.asset.json";
import kitchenCabinetsImg from "@/assets/flagship/kitchencabinets-card.png.asset.json";
import estimatorsImg from "@/assets/flagship/estimators-card.jpg.asset.json";
import fabricatorsImg from "@/assets/flagship/fabricators-card.jpg.asset.json";
import hardscapesImg from "@/assets/flagship/hardscapes-card.jpg.asset.json";
import carpentryImg from "@/assets/flagship/trade-carpentry.jpg.asset.json";
import flooringImg from "@/assets/flagship/trade-flooring.jpg.asset.json";
import fireproofingImg from "@/assets/flagship/trade-fireproofing.jpg.asset.json";
import sprayfoamImg from "@/assets/flagship/trade-sprayfoam.jpg.asset.json";
import irrigationImg from "@/assets/flagship/trade-irrigation.jpg.asset.json";
import junkremovalImg from "@/assets/flagship/trade-junkremoval.jpg.asset.json";
import customclosetsImg from "@/assets/flagship/trade-customclosets.jpg.asset.json";
import strataroofingImg from "@/assets/flagship/trade-strataroofing.jpg.asset.json";
import tenantimprovementImg from "@/assets/flagship/trade-tenantimprovement.jpg.asset.json";

export type ContractorTrade = {
  name: string;
  domain: string;
  emoji: string;
  image?: string;
  contain?: boolean;
  seo?: string;
};

// Mirrors the trade-availability grid shown across contractor surfaces:
// emoji + trade name + premium domain + AVAILABLE pill.
export const CONTRACTOR_TRADES: ContractorTrade[] = [
  { name: "Roofing", domain: "roofers.io", emoji: "🏠", image: roofersImg.url, seo: "Residential and commercial roofing contractors — asphalt, metal, torch-on, and flat systems. One roofer per city, permanent dofollow authority from a category-defining .io domain." },
  { name: "Framing", domain: "framers.io", emoji: "🏗️", image: framersImg.url, seo: "Wood and steel-stud framing crews for custom homes, multi-family, and commercial builds. Verified operators with EyeSpyR badges and TALC.tv job-site posts." },
  { name: "Drywall", domain: "drywallers.io", emoji: "🧱", image: drywallersImg.url, seo: "Drywall, taping, and Level-5 finishing contractors for new construction and renovations. Exclusive city territory locked to a single verified crew — $10 flat, month to month." },
  { name: "Plumbing", domain: "plumbers.ltd", emoji: "💧", image: plumbersImg.url, seo: "Licensed plumbers for service calls, new construction, and commercial roughs. Premium .ltd domain with EyeSpyR verification and direct WhatsApp lead routing." },
  { name: "Finishing Carpentry", domain: "finishingcarpenters.com", emoji: "✏️", image: finishingCarpentersImg.url, seo: "Finish carpenters, millworkers, and trim specialists showcased with portfolio galleries. Category-defining .com domain built for high-end residential and commercial interiors." },
  { name: "HVAC", domain: "hvacr.tv", emoji: "❄️", image: hvacrImg.url, seo: "HVAC and refrigeration contractors on video — heat pumps, rooftop units, and commercial cold-side work. Premium .tv authority for licensed mechanical operators." },
  { name: "Rebar & Reinforcing", domain: "rebar.tv", emoji: "🔗", image: rebarImg.url, seo: "Rebar placers, post-tension crews, and concrete reinforcing specialists. Category-defining .tv domain for civil, high-rise, and infrastructure suppliers." },
  { name: "Estimating", domain: "estimators.io", emoji: "📐", image: estimatorsImg.url, seo: "Independent construction estimators for quantity take-offs, hard-bid, and preconstruction budgets. Verified specialists — one estimator per city, dofollow-linked." },
  { name: "Kitchen Cabinets", domain: "kitchencabinets.io", emoji: "🍳", image: kitchenCabinetsImg.url, seo: "Custom cabinet shops, semi-custom installers, and kitchen designers. Premium .io domain feeding BuildersHaus.com and Weddings.io registry buyers." },
  { name: "Hardscapes", domain: "hardscapes.io", emoji: "🪨", image: hardscapesImg.url, seo: "Paver installers, retaining wall builders, and outdoor living hardscape crews. Category-defining .io domain with project galleries and EyeSpyR-verified operators." },
  { name: "Demolition", domain: "demolition.io", emoji: "💥", image: demolitionImg.url, seo: "Interior strip-outs, selective demo, and full-structure demolition contractors. Verified crews with dust-control protocols and premium .io category authority." },
  { name: "Fabrication", domain: "fabricators.io", emoji: "⚙️", image: fabricatorsImg.url, seo: "Custom steel, aluminum, and specialty fabrication shops for architectural, industrial, and commercial builds. Category-defining .io domain for one-off and production runs." },
  { name: "Carpentry", domain: "carpenters.ltd", emoji: "🪚", image: carpentryImg.url, seo: "Rough and finish carpenters for framing, decks, and custom builds. Premium .ltd domain, one carpentry crew per city, permanent territory." },
  { name: "Flooring", domain: "flooringinstallers.co", emoji: "🪵", image: flooringImg.url, seo: "Hardwood, luxury vinyl, and tile flooring installers with portfolio reels. Verified crews for residential renovations and commercial tenant improvements." },
  { name: "Fireproofing", domain: "fireproofing.ltd", emoji: "🔥", image: fireproofingImg.url, seo: "Spray-applied fireproofing, intumescent coatings, and firestopping contractors for commercial and high-rise projects. Premium .ltd category authority." },
  { name: "Spray Foam", domain: "sprayfoamcontractors.ltd", emoji: "🧴", image: sprayfoamImg.url, seo: "Closed-cell and open-cell spray foam insulation contractors for residential and commercial envelopes. Verified applicators, one crew per city." },
  { name: "Irrigation", domain: "irrigation.ltd", emoji: "🌊", image: irrigationImg.url, seo: "Landscape irrigation, drip systems, and smart-controller installers. Feeds ProMows.com maintenance operators and BuildersHaus.com custom builds." },
  { name: "Junk Removal", domain: "junkremoval.ltd", emoji: "🗑️", image: junkremovalImg.url, seo: "Residential and commercial junk removal, estate cleanouts, and construction debris hauling. Category-defining .ltd domain with same-day booking." },
  { name: "Custom Closets", domain: "customclosets.io", emoji: "🚪", image: customclosetsImg.url, seo: "Custom closet designers, walk-in installers, and organizational millwork specialists. Premium .io category domain for high-ticket residential clients." },
  { name: "Strata Roofing", domain: "strataroofing.ca", emoji: "🏢", image: strataroofingImg.url, seo: "Strata and multi-family roofing contractors specializing in tar-and-gravel, TPO, and torch-on membrane systems. Verified operators for property managers across Canada." },
  { name: "Tenant Improvement", domain: "tenantimprovement.ca", emoji: "🏬", image: tenantimprovementImg.url, seo: "Commercial tenant improvement GCs for retail buildouts, office renovations, and restaurant fit-ups. Category-defining .ca domain for landlords and brokers." },
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
                <div className={`w-full aspect-square mb-3 overflow-hidden rounded-md border border-border/50 relative ${t.contain ? "bg-background" : "bg-background"}`}>
                  <img
                    src={t.image}
                    alt={`${t.name} — ${t.domain}`}
                    loading="lazy"
                    className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${t.contain ? "object-contain p-4" : "object-cover"}`}
                  />
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
