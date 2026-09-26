import { motion } from "framer-motion";
import { Search, Link, BarChart3, Globe, Megaphone, TrendingUp } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const services = [
  {
    icon: Search,
    title: "SEO Domination",
    description: "Improve how customers find your business with relevant pages, technical SEO, and clear enquiry paths. Rankings and results vary by market.",
    to: "/seo-packages",
  },
  {
    icon: Link,
    title: "Dofollow Backlinks",
    description: "Build a useful presence on relevant industry directories. We focus on accurate business information, relevant placements, and qualified enquiries.",
    to: "/services/dofollow-backlinks",
    ctaLabel: "See the Backlink Program",
  },
  {
    icon: BarChart3,
    title: "Lead Generation",
    description: "Every service is a lead-gen engine. We put you on live bids, RFPs, and buyer feeds so real jobs land in your inbox—not just clicks.",
    to: "/services/lead-generation",
    ctaLabel: "How Leads Work",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Fast, modern sites built to convert. Three tiers: Starter $499, Growth $1,499, Flagship $3,999. Join the Army network on launch—or don't. Your call.",
    to: "/services/web-development",
    ctaLabel: "See the Tiers",
  },
  {
    icon: Megaphone,
    title: "Social Media",
    description: "Powered by TALC.tv and the Sprinkling network. We syndicate you across X, Instagram, TikTok, YouTube, LinkedIn, Threads and every platform with an open API—one push, six+ channels.",
    to: "/services/social-media",
    ctaLabel: "Explore TALC.tv",
  },
  {
    icon: TrendingUp,
    title: "Affordable SEO",
    description: "Register on one hub site for $10/year. City-page partnerships are a separate upgrade for selected content creators, with scope and pricing agreed after a fit review.",
    to: "/services/affordable-seo",
    ctaLabel: "See Both Doors",
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
              {service.to && (
                <RouterLink
                  to={service.to}
                  className="inline-block mt-4 text-primary text-xs uppercase tracking-widest font-semibold hover:opacity-80"
                >
                  {service.ctaLabel ?? "View SEO Packages"} →
                </RouterLink>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
