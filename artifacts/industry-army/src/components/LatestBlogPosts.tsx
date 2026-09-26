import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { useEffect, useMemo, useState } from "react";

const LIMIT = 4;

type Ranked = {
  slug: string;
  trade: string;
  city: string;
  date: string;
  index: number;
  publishedAt?: string;
  included: boolean;
  reason: string;
};

const buildRanking = (): Ranked[] => {
  return blogPosts.map((post, rank) => {
    const included = rank < LIMIT;
    return {
      slug: post.slug,
      trade: post.trade,
      city: post.city,
      date: post.date,
      publishedAt: post.publishedAt,
      index: rank,
      included,
      reason: included
        ? "included (top " + LIMIT + " from centralized newest-first blog order)"
        : "excluded — below top " + LIMIT + " in centralized newest-first blog order",
    };
  });
};

const useBlogDebug = () => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("debug") === "blog" || params.has("debugBlog");
    const fromStorage = window.localStorage.getItem("debugBlog") === "1";
    setEnabled(fromQuery || fromStorage);
  }, []);
  return enabled;
};

const LatestBlogPosts = () => {
  const debug = useBlogDebug();
  const ranking = useMemo(buildRanking, []);
  const latest = ranking
    .filter((r) => r.included)
    .map((r) => r.slug)
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is (typeof blogPosts)[number] => Boolean(p));

  useEffect(() => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `[blog-debug] Homepage carousel ranking — ${blogPosts.length} posts, showing top ${LIMIT}`,
    );
    // eslint-disable-next-line no-console
    console.table(
      ranking.map((r, rank) => ({
        rank: rank + 1,
        included: r.included ? "✅" : "❌",
        id: r.slug,
        date: r.date,
        publishedAt: r.publishedAt ?? "",
        orderIndex: r.index,
        reason: r.reason,
      })),
    );
    // eslint-disable-next-line no-console
    console.groupEnd();
  }, [debug, ranking]);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {debug && (
          <div
            data-testid="blog-debug-panel"
            className="mb-8 rounded-lg border border-primary/50 bg-card/80 p-4 text-xs font-mono text-foreground"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-primary uppercase tracking-widest">
                Blog Debug — {blogPosts.length} posts ranked, top {LIMIT} shown
              </p>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem("debugBlog");
                  window.location.search = "";
                }}
                className="text-muted-foreground hover:text-primary"
              >
                disable
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-primary/80">
                  <tr>
                    <th className="py-1 pr-3">#</th>
                    <th className="py-1 pr-3">in</th>
                    <th className="py-1 pr-3">id (slug)</th>
                    <th className="py-1 pr-3">date</th>
                    <th className="py-1 pr-3">publishedAt</th>
                    <th className="py-1 pr-3">order</th>
                    <th className="py-1">reason</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, rank) => (
                    <tr
                      key={r.slug + r.index}
                      className={r.included ? "text-foreground" : "text-muted-foreground"}
                    >
                      <td className="py-1 pr-3">{rank + 1}</td>
                      <td className="py-1 pr-3">{r.included ? "✅" : "❌"}</td>
                      <td className="py-1 pr-3">{r.slug}</td>
                      <td className="py-1 pr-3">{r.date}</td>
                        <td className="py-1 pr-3">{r.publishedAt ?? "—"}</td>
                      <td className="py-1 pr-3">{r.index}</td>
                      <td className="py-1">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-muted-foreground">
              Enable: <code>?debug=blog</code> or <code>localStorage.debugBlog=1</code>. Full table
              also logged to console.
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Industry Army Intel
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              Latest from the <span className="text-primary text-glow">Blog</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Guides to contractor marketing, business listings, and exclusive market opportunities.
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
                    {("cardTitle" in p && (p as { cardTitle?: string }).cardTitle) ||
                      `${p.trade} in ${p.city}`}
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