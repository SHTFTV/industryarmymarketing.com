import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const posts = [
  {
    category: "Marketing Strategy",
    title: "Why Exclusive Territory Marketing Beats Google Ads for Contractors",
    date: "March 2026",
    read: "8 min read",
    excerpt:
      "Every year BC contractors pour thousands into Google Ads — only to bid against each other, watch costs climb, and share leads with three competitors. Exclusive territory marketing changes the equation entirely.",
    featured: true,
  },
  {
    category: "Reputation",
    title: "The 5-Minute Review Response: Why Speed Is Your Competitive Edge",
    date: "February 2026",
    read: "5 min read",
    excerpt:
      "Contractors who respond to negative reviews within an hour recover customer trust at 3x the rate of those who wait 24 hours. I-Spy-R's WhatsApp alerts make the 5-minute response standard.",
  },
  {
    category: "SEO",
    title: "Premium .io and .tv Domains: Why They Rank Faster Than .com for Trades",
    date: "February 2026",
    read: "6 min read",
    excerpt:
      "Generic .com domains are crowded. Trade-specific .io and .tv domains carry stronger topical authority signals and they're far less competitive.",
  },
  {
    category: "Business",
    title: "How a Langley Electrician Locked 4 Cities and Doubled Inbound Calls",
    date: "January 2026",
    read: "4 min read",
    excerpt:
      "Mike C. had been spending $800/month on shared leads. He switched to four IAM exclusive territories on sparkys.tv. Within 60 days his inbound call volume had doubled.",
  },
  {
    category: "Legal",
    title: "PIPEDA and Your Client Data: What Canadian Contractors Need to Know in 2026",
    date: "January 2026",
    read: "7 min read",
    excerpt:
      "Canada's privacy law applies to any business collecting customer information — including lead forms on your website. Most contractors are non-compliant without knowing it.",
  },
  {
    category: "Marketing",
    title: "Guest Posts That Actually Work: The IAM Backlink Strategy for Trade SEO",
    date: "December 2025",
    read: "5 min read",
    excerpt:
      "A $10 guest post on a premium trade domain isn't just content — it's a do-follow backlink from a topically relevant, high-authority domain.",
  },
];

const Blog = () => {
  const [featured, ...rest] = posts;
  return (
    <Layout>
      <Seo
        title="Blog — Industry Army Intel | IAM"
        description="Trade marketing tactics, reputation management tips, contractor business advice, and IAM network updates. No filler."
        path="/blog"
      />
      <PageHeader
        eyebrow="Industry Army Intel"
        title="The"
        highlight="Blog"
        description="Trade marketing tactics, reputation management tips, contractor business advice, and IAM network updates. No filler."
      />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Featured Post</p>
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-lg bg-card border border-primary/30"
          >
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
              {featured.date} · {featured.category} · {featured.read}
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              {featured.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
            <Button variant="hero" asChild>
              <Link to="/contact">Get Your Territory</Link>
            </Button>
          </motion.article>

          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mt-16 mb-3">
            Latest Intel
          </p>
          <h3 className="font-display text-3xl text-foreground mb-8">Recent Articles</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {rest.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <p className="text-primary text-xs uppercase tracking-widest mb-2">{p.category}</p>
                <h4 className="font-display text-xl text-foreground mb-2 leading-tight">{p.title}</h4>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
                  {p.date} · {p.read}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.excerpt}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;