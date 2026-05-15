import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Link2, Infinity, Building2, Target, Zap, Eye } from "lucide-react";
import { domains } from "@/data/domains";

const features = [
  { icon: Link2, title: "100% Dofollow", body: "Full link equity passed to your site. No rel=nofollow, no rel=sponsored. Raw SEO value." },
  { icon: Infinity, title: "Permanent Placement", body: "$10 one time. No monthly fee. No expiry. Your link stays live as long as the domain is live." },
  { icon: Building2, title: "20+ Year Domain Authority", body: "Every domain in the IAM network has been active for 20+ years. Authority money alone cannot buy quickly." },
  { icon: Target, title: "Niche Relevant", body: "We match your post to the most relevant domain — roofers.io for roofing, plumbers.ltd for plumbing." },
  { icon: Zap, title: "48-Hour Placement", body: "Links go live within 48 hours of payment. You get a confirmation email with the live URL." },
  { icon: Eye, title: "EyeSpyR Verified", body: "Every host page scores 4.8/5.0 on EyeSpyR's content quality system — protecting your backlink value." },
];

const steps = [
  { n: "01", t: "Email or Call", b: "Tell us your URL, target anchor text, and which domain category fits your niche. Phone 604-761-1518 or email colin@industryarmymarketing.com." },
  { n: "02", t: "Pay $10", b: "One flat payment of $10 CAD. No subscription, no monthly fee, no expiry. E-transfer, credit card or PayPal." },
  { n: "03", t: "Link Goes Live", b: "Your dofollow backlink is placed within 48 hours. You receive a confirmation email with the live URL of your post." },
  { n: "04", t: "It Stays Forever", b: "Your link is permanent. It stays live as long as the IAM domain is active — all domains have been running 20+ years." },
];

const Backlinks = () => (
  <Layout>
    <PageHeader
      eyebrow="The Three Tens · Guest Posting"
      title="Permanent Dofollow"
      highlight="Backlinks · $10"
      description="One post. One dofollow link. Placed on a 20+ year old high-authority domain. Permanent — no expiry, no monthly fee, no catch. The most affordable white-hat backlink in Canada."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/contact">Get My Backlink — $10</Link></Button>
        <Button variant="heroOutline" asChild><a href="#domains">Browse Domains</a></Button>
      </div>
    </PageHeader>

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">What You Get</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Every Backlink Includes</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
            >
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section id="domains" className="py-20 gradient-tactical border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">150+ Available Domains</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Choose Your Domain</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            All domains are 20+ years old with established authority. We match your niche automatically — or request a specific domain.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {domains.slice(0, 24).map((d, i) => (
            <motion.div
              key={d.domain}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              className="p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-primary text-glow">{d.domain}</span>
                <span className="text-xl">{d.emoji}</span>
              </div>
              <p className="text-foreground text-sm">{d.niche}</p>
              <p className="text-muted-foreground text-xs mt-2">⏱ 20+ years active</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-8 text-sm">
          150+ more available — Medical, legal, events, media and more. Email for the full list.
        </p>
        <div className="text-center mt-6">
          <Button variant="heroOutline" asChild>
            <Link to="/dofollow-backlinks">View All Live Domains →</Link>
          </Button>
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Simple Process</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-7 rounded-lg bg-card border border-border"
            >
              <div className="font-display text-4xl text-primary text-glow mb-2">{s.n}</div>
              <h3 className="font-display text-2xl text-foreground mb-2">{s.t}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Backlinks;