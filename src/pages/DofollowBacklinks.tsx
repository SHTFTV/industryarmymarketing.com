import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Server, Globe } from "lucide-react";
import { dofollowDomains } from "@/data/dofollowDomains";

const DofollowBacklinks = () => {
  const netlify = dofollowDomains.filter((d) => d.host === "Netlify");
  const wordpress = dofollowDomains.filter((d) => d.host === "WordPress");
  const total = dofollowDomains.length;

  const renderGrid = (list: typeof dofollowDomains) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {list.map((d, i) => (
        <motion.a
          key={d.domain}
          href={`https://${d.domain}`}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(i * 0.015, 0.4) }}
          className="group p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="min-w-0">
            <div className="font-mono text-primary text-glow truncate group-hover:underline">
              {d.domain}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Live · {d.published}</div>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-3" />
        </motion.a>
      ))}
    </div>
  );

  return (
    <Layout>
      <PageHeader
        eyebrow={`${total} Live Domains · Permanent Placement`}
        title="Dofollow Backlinks"
        highlight="$10 Forever"
        description="The full Industry Army Marketing network of live, indexable, dofollow-friendly domains. One $10 payment places your post on any domain below — permanent, no monthly fee, no expiry."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Claim a Backlink — $10</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/backlinks">Backlink Program Details</Link></Button>
        </div>
      </PageHeader>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              Static Network <span className="text-muted-foreground text-lg font-sans">· {netlify.length} domains</span>
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Hand-built static sites on premium .io / .ltd / .ca / .tv / .com TLDs. Fast, lightweight, and indexed — your post is added as a permanent dofollow placement.
          </p>
          {renderGrid(netlify)}
        </div>
      </section>

      <section className="py-16 gradient-tactical border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              WordPress Network <span className="text-muted-foreground text-lg font-sans">· {wordpress.length} domains</span>
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Managed WordPress sites with editorial-grade publishing. Ideal for guest posts with images, embedded video, and long-form anchor copy.
          </p>
          {renderGrid(wordpress)}
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Lock In Your <span className="text-primary text-glow">Dofollow Backlink</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            One flat $10 payment. Permanent placement. 48-hour turnaround. Email <span className="text-primary">colin@industryarmymarketing.com</span> or call 604-761-1518.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button variant="hero" asChild><Link to="/contact">Get My Backlink</Link></Button>
            <Button variant="heroOutline" asChild><a href="tel:6047611518">Call 604-761-1518</a></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DofollowBacklinks;