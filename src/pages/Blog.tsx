import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blogPosts";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import FeaturedCaseStudy from "@/components/FeaturedCaseStudy";

const Blog = () => {
  // Pin the Weddings.io case study as featured for 3 months, then rotate.
  const PINNED_SLUG = "battle-for-the-brand-weddings-io";
  const PIN_UNTIL = new Date("2026-09-26T00:00:00Z");
  const pinActive = Date.now() < PIN_UNTIL.getTime();
  const pinnedPost = pinActive ? blogPosts.find((p) => p.slug === PINNED_SLUG) : undefined;
  const featured = pinnedPost ?? blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured.slug);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const companyCaseStudies = [
    {
      label: "Company Case Study",
      title: "Brand Defense: Global Territory",
      description:
        "The full company case study on defending Weddings.io, territory ownership, receipts, source links, and the IAM brand-defense model.",
      href: "/case-studies/brand-defense-global-territory",
      image: featured.image,
    },
    {
      label: "Companion Blog",
      title: "You Built Your Tower on Our Land",
      description:
        "The aiweddings.io challenge article that backs the case study with the public timeline and proof trail.",
      href: "/blog/aiweddings-tower-on-our-land",
      image: featured.image,
    },
  ];

  const cities = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.city))).sort(),
    []
  );
  const categories = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.category))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((p) => {
      if (city !== "all" && p.city !== city) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.trade.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.pain.toLowerCase().includes(q)
      );
    });
  }, [rest, query, city, category]);

  const hasFilters = query !== "" || city !== "all" || category !== "all";

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
      <FeaturedCaseStudy />

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
                {featured.cardTitle || `${featured.trade} in ${featured.city}: The $10 Exclusive Territory Guide`}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{featured.pain}</p>
              <Button variant="hero" asChild className="self-start">
                <Link to={`/blog/${featured.slug}`}>Read the guide</Link>
              </Button>
            </div>
          </motion.article>

          <div className="mt-12">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Company Case Study Blog
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {companyCaseStudies.map((item) => (
                <article
                  key={item.href}
                  className="rounded-lg bg-card border border-primary/30 hover:border-primary/60 transition-colors overflow-hidden flex flex-col"
                >
                  <Link to={item.href} className="block">
                    <img
                      src={item.image}
                      alt={`${item.title} — Industry Army Marketing case study`}
                      loading="lazy"
                      width={1280}
                      height={720}
                      className="w-full aspect-video object-cover"
                    />
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-primary text-xs uppercase tracking-widest mb-2">{item.label}</p>
                    <h3 className="font-display text-2xl text-foreground mb-3 leading-tight">
                      <Link to={item.href} className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{item.description}</p>
                    <Link
                      to={item.href}
                      className="text-primary text-xs uppercase tracking-widest mt-auto self-start hover:underline"
                    >
                      Open case study →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mt-16 mb-3">All Intel</p>
          <h3 className="font-display text-3xl text-foreground mb-8">Every trade. Every territory.</h3>

          <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3 mb-8 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trades, cities, keywords…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Search blog posts"
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Filter by city"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by niche"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All niches</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={() => { setQuery(""); setCity("all"); setCategory("all"); }}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-5">
            {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">No guides match those filters. Try clearing them.</p>
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
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
                      {p.cardTitle || `${p.trade} in ${p.city}`}
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
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
