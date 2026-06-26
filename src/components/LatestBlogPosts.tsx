import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { useEffect, useMemo, useState } from "react";

const monthOrder: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

const dateScore = (date: string) => {
  const [month, year] = date.split(" ");
  return (Number(year) || 0) * 12 + (monthOrder[month] ?? -1);
};

const LIMIT = 4;
// Pin the Weddings.io case study to the front of the carousel for 3 months,
// then let it rotate into the normal date-sorted loop.
const PINNED_SLUG = "battle-for-the-brand-weddings-io";
const PIN_UNTIL = new Date("2026-09-26T00:00:00Z");

type Ranked = {
  slug: string;
  trade: string;
  city: string;
  date: string;
  index: number;
  score: number;
  included: boolean;
  reason: string;
};

const buildRanking = (): Ranked[] => {
  const scored = blogPosts.map((post, index) => {
    const score = dateScore(post.date);
    const [month, year] = post.date.split(" ");
    const reasons: string[] = [];
    if (!post.slug) reasons.push("missing slug");
    if (!post.date) reasons.push("missing date");
    if (monthOrder[month] === undefined) reasons.push(`unrecognized month "${month}"`);
    if (!Number(year)) reasons.push(`unrecognized year "${year}"`);
    return {
      slug: post.slug,
      trade: post.trade,
      city: post.city,
      date: post.date,
      index,
      score,
      parseIssues: reasons,
    };
  });

  const sorted = [...scored].sort((a, b) => b.score - a.score || b.index - a.index);
  const cutoffScore = sorted[LIMIT - 1]?.score ?? -Infinity;
  const cutoffIndex = sorted[LIMIT - 1]?.index ?? -1;

  return sorted.map((item, rank) => {
    const included = rank < LIMIT;
    let reason = "included (top " + LIMIT + " by date, newest first)";
    if (!included) {
      if (item.parseIssues.length) {
        reason = `excluded — ${item.parseIssues.join("; ")}`;
      } else if (item.score < cutoffScore) {
        reason = `excluded — older than cutoff (score ${item.score} < ${cutoffScore})`;
      } else {
        reason = `excluded — tie at cutoff score ${cutoffScore}, lost insertion-order tiebreak (index ${item.index} < ${cutoffIndex})`;
      }
    } else if (item.parseIssues.length) {
      reason = `included BUT has parse issues: ${item.parseIssues.join("; ")}`;
    }
    return { ...item, included, reason };
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
  const pinActive = Date.now() < PIN_UNTIL.getTime();
  const pinnedPost = pinActive ? blogPosts.find((p) => p.slug === PINNED_SLUG) : undefined;
  const dateOrderedSlugs = ranking.filter((r) => r.included).map((r) => r.slug);
  const orderedSlugs = pinnedPost
    ? [PINNED_SLUG, ...dateOrderedSlugs.filter((s) => s !== PINNED_SLUG)].slice(0, LIMIT)
    : dateOrderedSlugs;
  const latest = orderedSlugs
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
        score: r.score,
        sourceIndex: r.index,
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
                    <th className="py-1 pr-3">score</th>
                    <th className="py-1 pr-3">srcIdx</th>
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
                      <td className="py-1 pr-3">{r.score}</td>
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