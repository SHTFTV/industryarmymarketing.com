import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  const [featured, ...rest] = blogPosts;
  return (
    <Layout>
      <Seo
        title="Blog — Industry Army Intel | $10 Exclusive Trade Territories"
        description="2,000-word guides to exclusive territory marketing for contractors, trades, and service pros across BC and Canada. One trade per city. $10/month."
        path="/blog"
      />
      <PageHeader
        eyebrow="Industry Army Intel"
        title="The"
        highlight="Blog"
        description="Deep dives on $10 exclusive territory marketing — one guide per trade domain. SEO, AEO, GEO, and the math behind the model."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Featured</p>
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8 p-6 md:p-8 rounded-lg bg-card border border-primary/30"
          >
            <Link to={`/blog/${featured.slug}`} className="block">
              <img
                src={featured.image}
                alt={`${featured.trade} in ${featured.city} — ${featured.brand}`}
                width={1280}
                height={720}
                className="w-full rounded-md border border-border"
              />
            </Link>
            <div className="flex flex-col justify-center">
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
                {featured.date} · {featured.category} · {featured.brand}
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 leading-tight">
                {featured.trade} in {featured.city}: The $10 Exclusive Territory Guide
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{featured.pain}</p>
              <Button variant="hero" asChild className="self-start">
                <Link to={`/blog/${featured.slug}`}>Read the guide</Link>
              </Button>
            </div>
          </motion.article>

          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mt-16 mb-3">All Intel</p>
          <h3 className="font-display text-3xl text-foreground mb-8">Every trade. Every territory.</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((p, i) => (
              <motion.article
                key={p.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="rounded-lg bg-card border border-border hover:border-primary/40 transition-colors overflow-hidden flex flex-col"
              >
                <Link to={`/blog/${p.slug}`} className="block">
                  <img
                    src={p.image}
                    alt={`${p.trade} in ${p.city} — ${p.brand}`}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="w-full aspect-video object-cover"
                  />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-primary text-xs uppercase tracking-widest mb-2">
                    {p.category} · {p.brand}
                  </p>
                  <h4 className="font-display text-xl text-foreground mb-2 leading-tight">
                    <Link to={`/blog/${p.slug}`} className="hover:text-primary transition-colors">
                      {p.trade} in {p.city}
                    </Link>
                  </h4>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
                    {p.date} · 10 min read
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                    {p.pain}
                  </p>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="text-primary text-sm uppercase tracking-widest mt-auto self-start hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
