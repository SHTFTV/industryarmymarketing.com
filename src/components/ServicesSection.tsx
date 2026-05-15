import { motion } from "framer-motion";
import { Search, Link, BarChart3, Globe, Megaphone, TrendingUp } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "SEO Domination",
    description: "Rank #1 on Google. We deploy battle-tested SEO strategies that crush your competition and own your local market.",
  },
  {
    icon: Link,
    title: "Dofollow Backlinks",
    description: "High-authority backlinks that build your domain power and send trust signals to every search engine.",
  },
  {
    icon: BarChart3,
    title: "Lead Generation",
    description: "Turn clicks into customers. Our funnels and landing pages are engineered for maximum conversion.",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Fast, modern websites built for performance. No bloated WordPress—just clean, conversion-focused design.",
  },
  {
    icon: Megaphone,
    title: "Social Media",
    description: "Strategic social campaigns that build your brand presence and engage your target audience where they live.",
  },
  {
    icon: TrendingUp,
    title: "Affordable SEO",
    description: "Enterprise-level SEO at small business prices. Starting at just $10—the marketing revolution is real.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 gradient-tactical">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">What We Deploy</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Our Services</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:border-glow"
            >
              <service.icon className="w-10 h-10 text-primary mb-5 group-hover:animate-pulse-glow" />
              <h3 className="font-display text-2xl text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
