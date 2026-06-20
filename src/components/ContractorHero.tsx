import { motion } from "framer-motion";

interface ContractorHeroProps {
  imageSrc: string;
  h1: string;
  city: string;
  trade: string;
  rate: number;
  overlayColor?: string;
}

const ContractorHero = ({
  imageSrc,
  h1,
  city,
  trade,
  rate,
  overlayColor = "from-black/85 via-black/55 to-black/20",
}: ContractorHeroProps) => (
  <section className="relative w-full min-h-[200px] md:min-h-[320px] overflow-hidden border-b border-border">
    <img
      src={imageSrc}
      alt={`${trade} marketing in ${city}`}
      fetchPriority="high"
      loading="eager"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className={`absolute inset-0 bg-gradient-to-r ${overlayColor}`} aria-hidden="true" />
    <div className="relative container mx-auto px-4 py-12 md:py-20 min-h-[200px] md:min-h-[320px] flex flex-col justify-end">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl md:text-6xl text-white max-w-4xl leading-tight"
      >
        {h1}
      </motion.h1>
      <p className="mt-3 font-mono text-sm md:text-base text-primary uppercase tracking-[0.2em]">
        {city} · {trade} · ${rate}/month exclusive territory
      </p>
    </div>
  </section>
);

export default ContractorHero;