import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import { motion } from "framer-motion";

const groups = [
  {
    title: "The Build Army",
    subtitle: "Construction & Trades",
    domains: [
      ["roofers.io", "Roofing"],
      ["framers.io", "Framing"],
      ["drywallers.io", "Drywall"],
      ["finishingcarpenters.com", "Finish Carpentry"],
      ["demolition.io", "Demolition"],
      ["gasfitter.ca", "Gas Fitting"],
      ["foundations.io", "Foundations"],
      ["steelstud.ca", "Steel Stud"],
      ["remodelers.io", "Remodeling"],
      ["buildershaus.com", "Trade Hub"],
      ["kongtractors.com", "Contracting"],
      ["kongtenders.com", "Bidding Platform"],
    ],
  },
  {
    title: "The Systems Army",
    subtitle: "Electrical, Plumbing & Mechanical",
    domains: [
      ["sparkys.tv", "Electrical"],
      ["licensedelectricalcontractor.com", "Licensed EC"],
      ["plumbers.ltd", "Plumbing"],
      ["hvacr.tv", "HVAC & Refrigeration"],
    ],
  },
  {
    title: "The Outdoor Army",
    subtitle: "Exterior & Landscaping",
    domains: [
      ["excavators.tv", "Excavation"],
      ["hardscapes.io", "Hardscaping"],
      ["painters.tv", "Painting"],
      ["promows.com", "Lawn Care"],
      ["plowwow.com", "Snow Plowing"],
      ["snowremoval.tv", "Snow Removal"],
      ["lsfence.ca", "Fencing"],
      ["arborists.io", "Arborists"],
    ],
  },
  {
    title: "The Interior Army",
    subtitle: "Interior & Design",
    domains: [
      ["decorator.tv", "Decorating"],
      ["interiordesigners.io", "Interior Design"],
      ["kitchencabinets.io", "Kitchen Cabinets"],
      ["fabricators.io", "Custom Fabrication"],
    ],
  },
  {
    title: "The Wellness Army",
    subtitle: "Health & Wellness",
    domains: [
      ["treatments.tv", "Treatments Hub"],
      ["healthwealthhome.com", "Wellness Hub"],
      ["chiropractors.ltd", "Chiropractic"],
      ["naturopaths.io", "Naturopathy"],
      ["massagetherapy.tv", "Massage Therapy"],
      ["acupuncture.io", "Acupuncture"],
      ["yoga.io", "Yoga"],
      ["nutritionists.io", "Nutrition"],
      ["physiotherapists.io", "Physiotherapy"],
      ["counselors.io", "Counseling"],
      ["dentists.ltd", "Dentistry"],
    ],
  },
  {
    title: "The Mining Army",
    subtitle: "Mining & Resources",
    domains: [
      ["criticalminerals.info", "Critical Minerals"],
      ["criticalmineralmines.com", "Mineral Mines"],
      ["minews.tv", "Mining News"],
      ["theminingminute.com", "The Mining Minute"],
      ["miningshorts.com", "Mining Shorts"],
      ["ipos.ltd", "IPOs"],
      ["talc.tv", "Talc"],
    ],
  },
  {
    title: "The Services Army",
    subtitle: "Services, Legal & Media",
    domains: [
      ["weddings.io", "Weddings"],
      ["caterers.tv", "Catering"],
      ["cleaners.io", "Cleaning"],
      ["movers.io", "Moving"],
      ["lawyersadvice.co", "Legal Advice"],
      ["loveourlistings.com", "Real Estate"],
      ["videographers.io", "Video"],
      ["seoai.tv", "SEO & AI"],
      ["eyespyr.com", "Verification"],
      ["promptagent.ca", "AI Marketing"],
      ["pitchdeck.tv", "Pitch Decks"],
    ],
  },
];

const Network = () => (
  <Layout>
    <Seo
      title="Domain Network — 80+ Premium Trade Domains | IAM"
      description="Industry Army Marketing's network of 80+ premium .io, .tv, .ltd, and .ca trade domains. One exclusive contractor per city, per domain."
      path="/network"
    />
    <PageHeader
      eyebrow="The IAM Domain Army"
      title="The"
      highlight="Network"
      description="Over 80 premium trade and niche domains across construction, wellness, mining, law, and more. One exclusive contractor per city, per domain."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {groups.map((g, gi) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.05 }}
          >
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-2">
              {g.subtitle}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              {g.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.domains.map(([domain, label]) => (
                <div
                  key={domain}
                  className="flex items-center justify-between p-4 rounded-md bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <span className="font-display text-lg text-primary">{domain}</span>
                  <span className="text-muted-foreground text-xs uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
    <CtaBanner
      title="Your Trade."
      highlight="Your Territory."
      description="Don't see your trade? Run a free scan and we'll find your fit across the IAM network."
      primaryLabel="Find My Domain"
      primaryTo="/scan-wizard"
      secondaryLabel="View Pricing"
      secondaryTo="/pricing"
    />
  </Layout>
);

export default Network;