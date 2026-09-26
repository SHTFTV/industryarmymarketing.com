import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    tier: "TIER 1 · REGISTRATION",
    name: "Hub Site Registration",
    price: "$10",
    unit: "/year",
    subtitle: "Your business registered on one industry hub site",
    featured: false,
    features: [
      "Directory listing on one relevant hub site",
      "Business name and contact details",
      "Your trade and service area",
      "Annual registration — $10 per hub site",
      "City-page upgrades are a separate plan",
    ],
    cta: "REGISTER ON A HUB SITE",
    href: "/contact?tier=directory",
  },
  {
    tier: "TIER 2 · SELECTIVE UPGRADE",
    name: "City-Page Partnership",
    price: "By application",
    unit: "",
    subtitle: "Separate pricing agreed after a fit review",
    featured: true,
    badge: "RIGHT FIT FIRST",
    features: [
      "City-page opportunity for selected partners",
      "Reserved for creators who contribute useful content",
      "Share real projects, photos, videos and industry knowledge",
      "Help grow your industry hub and the wider network",
      "City, category, scope and pricing agreed before activation",
      "Applying does not reserve or activate a city page",
    ],
    cta: "APPLY FOR A CITY PAGE",
    href: "/apply/contractors",
  },
];

// Keep offers aligned with the detailed /pricing page.
const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-7xl text-foreground">
            CONTRACTOR <span className="text-primary">PRICING</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Register on one hub site for <span className="text-primary font-semibold">$10/year</span>.
            The low fee makes participation accessible. Bring your expertise, real projects and useful ideas.
            City-page partnerships remain a separate, selective upgrade.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mt-2">All Pricing in USD</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative rounded-lg border p-6 flex flex-col ${
                plan.featured
                  ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)] bg-surface-elevated"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded">
                  {plan.badge}
                </div>
              )}

              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-1">
                {plan.tier}
              </p>
              <h3 className="font-display text-2xl text-foreground mb-4">
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl text-primary">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{plan.subtitle}</p>

              <div className="border-t border-border my-2" />

              <ul className="space-y-3 mt-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "hero" : "heroOutline"}
                className="w-full"
                asChild
              >
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl mx-auto text-center text-sm text-muted-foreground">
          Optional content service: TALC.tv blasts are $10 per post, priced separately from
          registration and city-page partnerships. <Link to="/contact" className="text-primary underline">Ask about content services</Link>.
        </p>

        {/* Enterprise banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto rounded-lg border border-border bg-surface-elevated p-10 text-center"
        >
          <h3 className="font-display text-2xl md:text-3xl text-foreground">
            BRING YOUR KNOWLEDGE. SHARE YOUR WORK.
          </h3>
          <h3 className="font-display text-2xl md:text-3xl text-primary mt-1">
            BUILD CONNECTIONS IN YOUR INDUSTRY
          </h3>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm">
            Websites, SEO packages and other marketing services are priced separately. For a city-page partnership, we review your fit, content contribution and market before agreeing the scope and price.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
