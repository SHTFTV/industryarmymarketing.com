import { motion } from "framer-motion";
import { Shield, Target, Zap } from "lucide-react";

const stats = [
  { icon: Shield, value: "LSFencing", label: "Years of SEO work" },
  { icon: Target, value: "Steelstud", label: "Documented enquiry-to-award example" },
  { icon: Zap, value: "$10/year", label: "Registration on one industry hub" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 gradient-tactical">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">About IAM</p>
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
              Join Your Industry
              <br />
              <span className="text-primary text-glow">Get An Army Behind You</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              IAM brings together years of website building, SEO work and practical industry
              experience. Our long-term work with LSFencing is part of that foundation,
              alongside the industry sites we have built and developed across the network.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The next stage is participation: more businesses sharing real projects, useful
              knowledge and clear service information. We want each hub to become more useful
              to the people searching it, attract more users and create more opportunities
              for its participating businesses. Register on one hub for $10/year, or apply
              for a separately priced city-page partnership if you are ready to contribute content.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
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
