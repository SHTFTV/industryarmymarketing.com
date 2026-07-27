import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import financialAdvisorsImg from "@/assets/flagship/financialadvisors-card.jpg.asset.json";
import canabinoidImg from "@/assets/flagship/canabinoid-card.jpg.asset.json";
import miningMinuteImg from "@/assets/flagship/miningminute-card.jpg.asset.json";
import animalHospitalsImg from "@/assets/flagship/animalhospitals-card.jpg.asset.json";
import bugoutImg from "@/assets/flagship/bugout-card.jpg.asset.json";
import solarSystemsImg from "@/assets/flagship/solarsystems-card.jpg.asset.json";

const brands = [
  { name: "FinancialAdvisors.io", url: "https://financialadvisors.io", tagline: "Vetted Advisor Network", image: financialAdvisorsImg.url },
  { name: "Canabinoid.io", url: "https://canabinoid.io", tagline: "Cannabis Science & Industry Hub", image: canabinoidImg.url },
  { name: "TheMiningMinute.com", url: "https://theminingminute.com", tagline: "Mining News In 60 Seconds", image: miningMinuteImg.url },
  { name: "AnimalHospitals.io", url: "https://animalhospitals.io", tagline: "Vet Clinic Discovery Network", image: animalHospitalsImg.url },
  { name: "BugOut.tv", url: "https://bugout.tv", tagline: "Survival & Prepper Video Network", image: bugoutImg.url },
  { name: "SolarSystems.ltd", url: "https://solarsystems.ltd", tagline: "Residential & Commercial Solar Network", image: solarSystemsImg.url },
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
              className="group relative rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden hover:border-glow"
            >
              <div className="relative aspect-square overflow-hidden bg-background">
                <img
                  src={brand.image}
                  alt={`${brand.name} — ${brand.tagline}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <span className="absolute top-2 right-2 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest">
                  Coming Soon
                </span>
              </div>
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-primary text-glow leading-tight">{brand.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{brand.tagline}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
