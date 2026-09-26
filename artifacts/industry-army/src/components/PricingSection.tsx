import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    tier: "BASELINE",
    name: "Annual Listing",
    price: "$10",
    unit: "/year",
    subtitle: "Directory Listing • EyeSpyR rating included",
    featured: false,
    features: [
      "Business name on directory",
      "Phone & address listed",
      "Service area shown",
      "Annual directory listing",
      "EyeSpyR verified rating",
    ],
    cta: "GET LISTED",
    href: "/contact?tier=directory",
  },
  {
    tier: "SEO TERRITORY",
    name: "Exclusive Market Ownership",
    price: "Contact us",
    unit: "",
    subtitle: "Monthly pricing based on your market size",
    featured: true,
    badge: "LOCK OUT COMPETITORS",
    features: [
      "1 contractor per trade per city",
      "City or neighborhood scope confirmed before signup",
      "Featured placement in your market",
      "EyeSpyR verified rating",
      "TALC.tv content blasts — $10/post",
      "Confirm your rate and availability before joining",
      "Month-to-month subscription",
    ],
    cta: "CHECK YOUR MARKET RATE",
    href: "/contact?tier=exclusive",
  },
  {
    tier: "CONTENT",
    name: "TALC.tv Blast",
    price: "$10",
    unit: "/post",
    subtitle: "Anyone · Anytime · No Lock Required",
    featured: false,
    features: [
      "One completed project photo",
      "AI generates 2,000-word SEO post",
      "Auto-published to city page + GMB",
      "Permanent backlink to your site",
      "No retainer — pay per win",
    ],
    cta: "ASK ABOUT A BLAST",
    href: "/contact",
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
            Directory listings start at <span className="text-primary font-semibold">$10/year</span>.
            Exclusive market pricing depends on your city or neighborhood.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mt-2">All Pricing in USD</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
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

        {/* Enterprise banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto rounded-lg border border-border bg-surface-elevated p-10 text-center"
        >
          <h3 className="font-display text-2xl md:text-3xl text-foreground">
            WE FIT ANY BUDGET • ANY SIZE •
          </h3>
          <h3 className="font-display text-2xl md:text-3xl text-primary mt-1">
            ENTERPRISE LEVEL DOMINATION
          </h3>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm">
            We offer custom pricing for individual packages, websites, product sales, and full marketing builds — exclusive territory rates depend on market size. Multi-location contractors, franchises, and enterprise accounts welcome.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
