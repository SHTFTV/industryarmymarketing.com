import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";
import { domains } from "@/data/domains";

const Industries = () => (
  <Layout>
    <Seo
      title="150+ Premium Industry Domains | The IAM Network"
      description="Two decades of curated, niche-relevant domains across construction, trades, health, real estate, legal, and lifestyle. One contractor per trade per city — own your territory."
      path="/industries"
    />
    <PageHeader
      eyebrow="The IAM Network"
      title="150+ Premium"
      highlight="Industry Domains"
      description="Two decades of curated, niche-relevant domains across construction, trades, health, real estate, legal, and lifestyle. Each one is a doorway your customers already walk through."
    />
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {domains.map((d, i) => (
            <motion.a
              key={d.domain}
              href={`https://${d.domain}`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="group p-5 rounded-lg bg-card border border-border hover:border-primary/50 hover:border-glow transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{d.emoji}</span>
                <span className="font-mono text-primary group-hover:text-glow truncate">{d.domain}</span>
              </div>
              <p className="text-muted-foreground text-sm">{d.niche}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Industries;
