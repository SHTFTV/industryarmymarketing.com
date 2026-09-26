import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare, Link2, Infinity, Building2, ShieldCheck, Mail, Globe, CheckCircle2 } from "lucide-react";
import { domains } from "@/data/domains";

const includes = [
  { icon: PenSquare, title: "Your Practical Expertise", body: "Bring an original article, project story or useful industry lesson. Explain what readers can learn from your experience." },
  { icon: Link2, title: "Relevant Sources and Connections", body: "Use links where they help a reader understand the topic or find the business behind the work. Paid placements must disclose sponsorship and qualify commercial links." },
  { icon: Building2, title: "A Relevant Industry Home", body: "We review the topic and proposed hub together. The goal is useful content for that publication’s audience." },
  { icon: Infinity, title: "Accessible Participation", body: "$10 CAD per accepted guest-post placement, separate from annual hub registration. Confirm the placement and terms before payment." },
  { icon: ShieldCheck, title: "Editorial Review", body: "Contributions are reviewed for relevance, accuracy and usefulness. Payment does not guarantee acceptance or search rankings." },
  { icon: Globe, title: "A Growing Catalog", body: "Explore specialist sites across the network and propose the audience your contribution can help." },
];
const process = [
  { n: "01", t: "Share Your Idea", b: "Send your topic, intended audience, original draft or project outline, and relevant examples." },
  { n: "02", t: "Find the Right Fit", b: "Review the proposed industry hub, your contribution and any changes needed before agreeing to publication." },
  { n: "03", t: "Agree the Details", b: "Confirm the placement, $10 CAD fee and timing. Writing or other hands-on content services are scoped separately." },
  { n: "04", t: "Publish Useful Work", b: "After acceptance, prepare the agreed contribution for publication. Share the published resource with people who can use it." },
];
const rules = [
  "Help the host site’s actual industry audience",
  "Share original work and credit sources accurately",
  "Use project details, photographs and names only with permission",
  "Make links relevant and disclose commercial relationships",
  "Distinguish your completed work from referrals and unconfirmed outcomes",
];

const GuestPost = () => (
  <Layout>
    <Seo
      title="Share Your Expertise | Industry Guest Contributions | IAM"
      description="Share original industry knowledge, project stories and useful guest articles with a relevant IAM hub. Contributions are reviewed for fit and usefulness."
      path="/guest-post"
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Industry Guest Contributions",
          provider: { "@type": "Organization", name: "Industry Army Marketing" },
          areaServed: "Worldwide",
          description:
            "Reviewed guest contributions for relevant industry audiences.",
          offers: { "@type": "Offer", price: "10", priceCurrency: "CAD" },
        },
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guest Post", path: "/guest-post" },
        ]),
      ]}
    />
    <PageHeader
      eyebrow="Useful Content · Industry Connections"
      title="Your Knowledge Belongs"
      highlight="With Your Industry"
      description="We want your useful ideas, project experience and practical knowledge. Propose a contribution to a relevant industry hub and help build a resource your peers and customers can use."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/contact?request=guest-post">Propose a Contribution</Link></Button>
        <Button variant="heroOutline" asChild><Link to="/network">Browse Host Domains</Link></Button>
      </div>
    </PageHeader>

    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Why Contribute</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Find Your Trade. Share What You Know.</h2>
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
              Email your brief to <a className="text-primary hover:underline" href="mailto:colin@industryarmymarketing.com">colin@industryarmymarketing.com</a> with subject line <span className="text-foreground font-mono">"Guest Post"</span>. Include your topic, intended readers, original work or project examples, and any preferred timing. We will review the fit and next steps.
            </p>
            <Button variant="hero" asChild><Link to="/contact?request=guest-post">Start a Submission</Link></Button>
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
            Explore the catalog and suggest a relevant home for your contribution. Availability, editorial fit and placement are confirmed during review.
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
              <p className="text-muted-foreground text-xs mt-2">Industry contribution proposals welcome</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="heroOutline" asChild>
            <Link to="/network">View Full Domain Network →</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default GuestPost;