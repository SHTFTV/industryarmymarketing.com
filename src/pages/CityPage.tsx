import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { domains } from "@/data/domains";

const CITY_DATA: Record<string, { name: string; province: string; population: string; rate: string }> = {
  vancouver: { name: "Vancouver", province: "British Columbia", population: "~675,000", rate: "$65/month" },
  surrey: { name: "Surrey", province: "British Columbia", population: "~568,000", rate: "$55/month" },
  calgary: { name: "Calgary", province: "Alberta", population: "~1,340,000", rate: "$130/month" },
  edmonton: { name: "Edmonton", province: "Alberta", population: "~1,010,000", rate: "$100/month" },
  toronto: { name: "Toronto", province: "Ontario", population: "~2,930,000", rate: "$290/month" },
  kelowna: { name: "Kelowna", province: "British Columbia", population: "~145,000", rate: "$10/month" },
};

const faqs = (city: string, rate: string) => [
  { q: `How much does contractor marketing cost in ${city}?`, a: `Contractor marketing in ${city} costs ${rate}. The rate is fixed for exclusive territory holders and is calculated at $10 per 100,000 population.` },
  { q: "What does exclusive territory mean?", a: `One contractor per trade per city — permanently. No other roofer, plumber, or electrician can claim ${city} once you do. Your competition is locked out for as long as you stay.` },
  { q: "What domains does IAM own?", a: "IAM owns 150+ premium industry domains — roofers.io, gasfitter.ca, sparkys.tv, plumbers.ltd, hvacr.tv, drywallers.io, painters.tv, excavators.tv, foundations.io and more. All are 20+ years old." },
  { q: "How long before I see results?", a: "Most contractors see lead flow within 30 to 60 days. IAM domains already rank — you skip the years it takes a new site to build authority." },
  { q: "Is there a contract?", a: `No contract. Cancel anytime. But the moment you cancel, your ${city} territory opens to your competitors immediately.` },
];

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const slug = (city ?? "vancouver").toLowerCase();
  const data = CITY_DATA[slug] ?? CITY_DATA.vancouver;

  return (
    <Layout>
      <PageHeader
        eyebrow={`${data.name}, ${data.province} · IAM Territory`}
        title={`${data.name}`}
        highlight="Contractors"
        description={`The ${data.name} market — ${data.rate}. One contractor per trade. First claim wins. Your competitors will see your name on every search and have no way in.`}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Claim {data.name}</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/pricing">All City Rates</Link></Button>
        </div>
      </PageHeader>

      <section className="py-12 border-b border-border bg-card/40">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><div className="font-display text-3xl text-primary text-glow">{data.population}</div><div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Population</div></div>
          <div><div className="font-display text-3xl text-primary text-glow">{data.rate}</div><div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Monthly Rate</div></div>
          <div><div className="font-display text-3xl text-primary text-glow">50+</div><div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Trades Open</div></div>
          <div><div className="font-display text-3xl text-primary text-glow">20+</div><div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Years Authority</div></div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              {data.name} <span className="text-primary">Territories</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {domains.slice(0, 12).map((d, i) => (
              <motion.div
                key={d.domain}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-mono text-primary">{d.domain}/{slug}</div>
                  <div className="text-foreground text-sm mt-1">{data.name} {d.niche}</div>
                </div>
                <span className="text-xs uppercase tracking-widest text-primary border border-primary/40 rounded px-2 py-1">Open</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 gradient-tactical border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">{data.name} FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">Direct Answers</h2>
          </div>
          <div className="space-y-4">
            {faqs(data.name, data.rate).map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-lg bg-card border border-border"
              >
                <h3 className="font-display text-xl text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CityPage;