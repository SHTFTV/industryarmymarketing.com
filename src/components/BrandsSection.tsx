import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const brands = [
  { name: "Plow.tv", url: "http://plow.tv/", tagline: "Grow Food & Community" },
  { name: "Treatments.tv", url: "http://treatments.tv/", tagline: "Natural Health & Wellness" },
  { name: "Decorator.tv", url: "http://decorator.tv/", tagline: "Interior Design & DIY" },
  { name: "Rebar.tv", url: "http://rebar.tv/", tagline: "Towers & Mega Projects" },
  { name: "PitchDeck.tv", url: "http://pitchdeck.tv/", tagline: "Ideas to Investors" },
  { name: "Errands.io", url: "http://errands.io/", tagline: "Drone & Video Services" },
];

const BrandsSection = () => {
  return (
    <section id="brands" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">Our Network</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Some Of Our Brands</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, i) => (
            <motion.a
              key={brand.name}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-8 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300 flex flex-col items-center text-center hover:border-glow"
            >
              <h3 className="font-display text-3xl text-primary mb-2 text-glow">{brand.name}</h3>
              <p className="text-muted-foreground text-sm">{brand.tagline}</p>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-4" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
