import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ eyebrow, title, highlight, description, children }: PageHeaderProps) => {
  return (
    <section className="relative overflow-hidden border-b border-border gradient-tactical">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="container mx-auto px-4 py-20 md:py-28 relative">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl md:text-7xl text-foreground leading-none max-w-4xl"
        >
          {title} {highlight && <span className="text-primary text-glow">{highlight}</span>}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl text-lg mt-6 leading-relaxed"
          >
            {description}
          </motion.p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px gradient-neon-line opacity-50" />
    </section>
  );
};

export default PageHeader;