import { motion } from "framer-motion";
import { Shield, Target, Zap } from "lucide-react";

const stats = [
  { icon: Shield, value: "20+", label: "Years Experience" },
  { icon: Target, value: "500+", label: "Businesses Served" },
  { icon: Zap, value: "$10", label: "Starting Price" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 gradient-tactical">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">About IAM</p>
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
              Join Your Industry
              <br />
              <span className="text-primary text-glow">Get An Army Behind You</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Industry Army Marketing is a Vancouver-based digital marketing powerhouse with over 
              20 years of experience transforming local businesses into market leaders. We believe 
              every business deserves enterprise-level marketing—without the enterprise price tag.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From SEO domination to lead generation, we deploy proven strategies that put you 
              on top. Our $10 marketing revolution has helped hundreds of contractors, service 
              providers, and local businesses claim their territory and crush the competition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-6 p-6 rounded-lg bg-card border border-border"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-4xl text-primary text-glow">{stat.value}</p>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
