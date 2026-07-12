import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEO_PACKAGES } from "@/data/seoPackages";

const SeoPackagesSection = () => {
  return (
    <section id="seo-packages" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">
            Choose Your Arsenal
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            SEO Packages
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Three tiers of authority firepower — from a starter volley to a full-arsenal
            assault on your category.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEO_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-lg bg-card border transition-all duration-300 hover:border-glow flex flex-col ${
                pkg.featured
                  ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded">
                  Most Popular
                </span>
              )}
              <div className="text-4xl mb-3">{pkg.icon}</div>
              <h3 className="font-display text-3xl text-foreground">{pkg.name}</h3>
              <p className="text-primary text-xs uppercase tracking-widest mt-1 mb-4">
                {pkg.tagline}
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-4xl text-foreground">${pkg.price}</span>
                <span className="text-muted-foreground text-sm">one-time</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {pkg.summary}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 uppercase tracking-widest">
                <span>{pkg.deliverables} links</span>
                <span>·</span>
                <span>{pkg.timelineDays} days</span>
              </div>
              <Link
                to={`/seo-packages/${pkg.slug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-primary text-primary-foreground font-semibold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
              >
                View {pkg.name} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/seo-packages"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 uppercase tracking-widest text-xs font-semibold"
          >
            Compare all packages <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeoPackagesSection;