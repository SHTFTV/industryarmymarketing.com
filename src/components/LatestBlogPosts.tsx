import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";

const LatestBlogPosts = () => {
  const latest = blogPosts.slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Industry Army Intel
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              Latest from the <span className="text-primary text-glow">Blog</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Fresh 2,000-word guides on exclusive $10 territories — one trade per city.
            </p>
          </div>
          <Button variant="hero" asChild className="self-start md:self-end">
            <Link to="/blog">View all guides</Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latest.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
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
                <h3 className="font-display text-lg text-foreground mb-2 leading-tight">
                  <Link to={`/blog/${p.slug}`} className="hover:text-primary transition-colors">
                    {p.trade} in {p.city}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
                  {p.date}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                  {p.excerpt || p.pain}
                </p>
                <Link
                  to={`/blog/${p.slug}`}
                  className="text-primary text-xs uppercase tracking-widest mt-auto self-start hover:underline"
                >
                  Read →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlogPosts;