import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare, Link2, Infinity, Building2, ShieldCheck, Mail, Globe, CheckCircle2 } from "lucide-react";
import { domains } from "@/data/domains";

const includes = [
  { icon: PenSquare, title: "1,500–2,500 Word Post", body: "Original, well-researched guest article published under your byline (or ours, your call)." },
  { icon: Link2, title: "1–2 Dofollow Backlinks", body: "Contextual, in-body dofollow links to your site with the anchor text you choose. No rel=nofollow, no rel=sponsored." },
  { icon: Building2, title: "20+ Year-Old Host Domain", body: "Placed on an aged, niche-relevant IAM domain — the kind of authority money can't buy quickly." },
  { icon: Infinity, title: "Permanent — Never Removed", body: "$10 one-time. No monthly fee. No expiry. The post stays live as long as the domain is live." },
  { icon: ShieldCheck, title: "White-Hat & Editorial", body: "Real editorial content on a real publication. No PBNs, no spun text, no link farms. Safe for Google." },
  { icon: Globe, title: "Indexed & Crawlable", body: "Every post is submitted to Google, Bing, and IndexNow within 24 hours of going live." },
];

const process = [
  { n: "01", t: "Send Us Your Brief", b: "Email your topic, target URL, preferred anchor text, and 2–3 angles. We'll suggest the best domain match from the network." },
  { n: "02", t: "Pay $10", b: "One flat payment per guest post. Volume discounts after 10 posts. E-transfer, card, or PayPal." },
  { n: "03", t: "We Write & Edit", b: "Our editorial team drafts the post, runs it through EyeSpyr quality scoring (must hit 4.8/5.0), and sends you a preview." },
  { n: "04", t: "Live Within 5 Days", b: "Approved post goes live with your dofollow links, indexed, and the URL is sent to you for reporting." },
];

const rules = [
  "Topic must be relevant to the host domain's niche",
  "No casino, adult, pharma, crypto-scam, or hate content",
  "Target URL must load (no broken pages, no redirects to spam)",
  "Anchor text must read naturally — no aggressive exact-match",
  "Original content only — we run plagiarism checks before publishing",
];

const GuestPost = () => (
  <Layout>
    <Seo
      title="Guest Post Service | $10 Dofollow Backlinks on Aged Domains"
      description="Submit a guest post and get a permanent dofollow backlink on a 20+ year-old IAM network domain. $10 flat. White-hat, editorial, niche-relevant. Available worldwide."
      path="/guest-post"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Guest Post with Dofollow Backlinks",
        provider: { "@type": "Organization", name: "Industry Army Marketing" },
        areaServed: "Worldwide",
        description: "Editorial guest post placement with permanent dofollow backlinks on aged, niche-relevant domains.",
        offers: { "@type": "Offer", price: "10", priceCurrency: "CAD" },
      }}
    />
    <PageHeader
      eyebrow="Guest Posting · Dofollow"
      title="Guest Post Service"
      highlight="$10 · Permanent Dofollow"
      description="One editorial guest post. One or two dofollow backlinks. Published on an aged, niche-relevant domain from the IAM network. Permanent — no monthly fee, no expiry. Open to clients worldwide."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/contact">Submit a Guest Post</Link></Button>
        <Button variant="heroOutline" asChild><Link to="/dofollow-backlinks">Browse Host Domains</Link></Button>
      </div>
    </PageHeader>

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">What Every Guest Post Includes</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Editorial Quality. Real Authority.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {includes.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

    <section className="py-20 gradient-tactical border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Process</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">From Pitch to Published</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {process.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Editorial Standards</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-5">What We Accept</h2>
            <ul className="space-y-3">
              {rules.map((r) => (
                <li key={r} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-7 rounded-lg bg-card border border-border">
            <Mail className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-2xl text-foreground mb-2">Submit Your Guest Post</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Email your brief to <a className="text-primary hover:underline" href="mailto:colin@industryarmymarketing.com">colin@industryarmymarketing.com</a> with subject line <span className="text-foreground font-mono">"Guest Post"</span>. Include your target URL, anchor text, topic ideas, and any deadline. We respond within one business day.
            </p>
            <Button variant="hero" asChild><Link to="/contact">Start a Submission</Link></Button>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 gradient-tactical border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Sample Host Domains</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Where Your Post Could Live</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm">
            150+ niche-relevant publications. All 20+ years old. We'll pick the best fit for your topic — or you can request one.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {domains.slice(0, 18).map((d, i) => (
            <motion.div
              key={d.domain}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-primary text-glow">{d.domain}</span>
                <span className="text-xl">{d.emoji}</span>
              </div>
              <p className="text-foreground text-sm">{d.niche}</p>
              <p className="text-muted-foreground text-xs mt-2">⏱ 20+ years active · dofollow</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="heroOutline" asChild>
            <Link to="/dofollow-backlinks">View Full Domain Network →</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default GuestPost;