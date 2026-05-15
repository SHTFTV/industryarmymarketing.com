import { motion } from "framer-motion";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  source?: string;
}

const TestimonialCard = ({ t, index = 0 }: { t: Testimonial; index?: number }) => (
  <motion.figure
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="p-6 rounded-lg bg-card border border-border h-full flex flex-col"
  >
    <div className="text-primary text-sm tracking-widest mb-3">★★★★★</div>
    <blockquote className="text-foreground/90 text-sm leading-relaxed flex-1">
      "{t.quote}"
    </blockquote>
    <figcaption className="mt-5 pt-4 border-t border-border">
      <p className="font-display text-lg text-foreground">{t.name}</p>
      <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">{t.role}</p>
      {t.source && (
        <p className="text-primary/80 text-[10px] uppercase tracking-widest mt-1">{t.source}</p>
      )}
    </figcaption>
  </motion.figure>
);

export default TestimonialCard;