import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { domains as dataDomains } from "@/data/domains";
import { FAQ_DOMAIN_BLURB } from "@/pages/CityPage";
import {
  buildDomainSyncReport,
  logDomainSyncReport,
  type DomainSyncReport,
} from "@/lib/domain-sync";

function DomainSyncBanner({ report }: { report: DomainSyncReport }) {
  const sections: Array<[string, string[]]> = [
    ["Duplicates in domains.ts", report.dupesInData],
    ["Duplicates in Network.tsx", report.dupesInNetwork],
    ["Duplicate mentions in FAQ blurb", report.dupesInFaq],
    ["In Network.tsx but missing from domains.ts", report.inNetworkNotInData],
    ["In domains.ts but missing from Network.tsx", report.inDataNotInNetwork],
    ["Mentioned in FAQ but missing from domains.ts", report.faqNotInData],
  ];
  const ok = report.ok;
  return (
    <div
      className={`border-y px-4 py-3 text-sm ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-orange-500/40 bg-orange-500/10 text-orange-200"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <strong className="font-display tracking-wider uppercase text-xs">
            [dev] Domain Sync: {ok ? "OK" : "Out of sync"}
          </strong>
          <span className="text-xs opacity-70">
            domains.ts · Network.tsx · FAQ blurb
          </span>
        </div>
        {!ok && (
          <ul className="mt-2 space-y-1">
            {sections
              .filter(([, items]) => items.length > 0)
              .map(([label, items]) => (
                <li key={label} className="text-xs">
                  <span className="font-semibold">{label} ({items.length}):</span>{" "}
                  <span className="font-mono opacity-90">{items.join(", ")}</span>
                </li>
              ))}
          </ul>
        )}
        {report.faqIgnored.length > 0 && (
          <p className="mt-2 text-[11px] opacity-60">
            FAQ candidates ignored (subdomains/unknown TLDs):{" "}
            <span className="font-mono">{report.faqIgnored.join(", ")}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export const groups = [
  {
    title: "The Build Army",
    subtitle: "Construction & Trades",
    domains: [
      ["roofers.io", "Roofing"],
      ["framers.io", "Framing"],
      ["drywallers.io", "Drywall"],
      ["finishingcarpenters.com", "Finish Carpentry"],
      ["demolition.io", "Demolition"],
      ["rebar.tv", "Rebar"],
      ["remodelers.io", "Remodeling"],
      ["buildershaus.com", "Trade Hub"],
      ["kongtractors.com", "Contracting"],
      ["logcabin.ltd", "Log Cabins"],
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
      ["promows.ca", "Landscaping"],
      ["promows.com", "Lawn Care"],
      ["plowwow.com", "Snow Plowing"],
      ["snowremoval.tv", "Snow Removal"],
      ["arborists.io", "Arborists"],
      ["bugout.tv", "Bugout & Survival"],
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
      ["lawyersadvice.co", "Legal Advice"],
      ["loveourlistings.com", "Real Estate"],
      ["videographers.io", "Video"],
      ["seoai.tv", "SEO & AI"],
      ["eyespyr.com", "Verification"],
      ["promptagent.ca", "AI Marketing"],
      ["pitchdeck.tv", "Pitch Decks"],
    ],
  },
  {
    title: "The Transportation Army",
    subtitle: "Logistics, Moving & Errands",
    domains: [
      ["errands.io", "Errands & Delivery"],
      ["backhaul.io", "Backhaul & Freight"],
      ["mover.ltd", "Moving"],
    ],
  },
];

const Network = () => {
  const [report, setReport] = useState<DomainSyncReport | null>(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const r = buildDomainSyncReport({
      dataDomains: dataDomains.map((d) => d.domain),
      networkDomains: groups.flatMap((g) => g.domains.map(([d]) => d)),
      faqText: FAQ_DOMAIN_BLURB,
    });
    logDomainSyncReport(r);
    setReport(r);
  }, []);
  return (
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
    {import.meta.env.DEV && report && <DomainSyncBanner report={report} />}
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {groups.map((g, gi) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
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
};

export default Network;