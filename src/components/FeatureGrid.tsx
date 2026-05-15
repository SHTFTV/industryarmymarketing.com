import { motion } from "framer-motion";

export interface Feature {
  icon?: string;
  title: string;
  body: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3;
}

const FeatureGrid = ({ features, columns = 3 }: FeatureGridProps) => {
  const colClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
        >
          {f.icon && <div className="text-3xl mb-3">{f.icon}</div>}
          <h3 className="font-display text-2xl text-foreground mb-2">{f.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureGrid;