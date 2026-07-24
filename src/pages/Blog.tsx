import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { SITE_URL } from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import featuredBattle from "@/assets/blog/weddings-vs-aiweddings-battle.png.asset.json";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blogPosts";
import { useBlogPostsOverlay } from "@/hooks/useBlogPostsOverlay";
import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { trackEvent, BLOG_EVENTS } from "@/lib/analytics";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

const Blog = () => {
  // DB overlay: after hydration, filter to is_published=true rows and
  // let admin display_order + is_featured override the static ordering.
  // On first render (SSR/prerender/hydration), falls back to the static
  // list so crawler HTML matches what react-snap captured.
  const { posts: overlayPosts, featured: dbFeatured } = useBlogPostsOverlay();
  // Pin the Weddings.io case study as featured for 3 months, then rotate.
  const PINNED_SLUG = "battle-for-the-brand-weddings-io";
  const PIN_UNTIL = new Date("2026-09-26T00:00:00Z");
  const pinActive = Date.now() < PIN_UNTIL.getTime();
  // Precedence: admin-featured (DB) → time-limited pin → newest published.
  const pinnedPost = pinActive ? overlayPosts.find((p) => p.slug === PINNED_SLUG) : undefined;
  const featured = dbFeatured ?? pinnedPost ?? overlayPosts[0] ?? blogPosts[0];
  const rest = overlayPosts.filter((p) => p.slug !== featured.slug);
  // Persist search state in URL so filtered views are shareable and
  // survive page reloads. Empty/default values are stripped so the URL
  // stays clean ("/blog" instead of "/blog?q=&city=all&category=all").
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // Focus targets for a11y announcements on filter/pagination changes.
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const firstCardRef = useRef<HTMLAnchorElement | null>(null);
  const isInitialRender = useRef(true);

  // Debounced search: local input state drives the field, and a 300ms
  // timer commits the value into the URL query. Filtering + analytics
  // only fire once the URL settles, so typing stays cheap.
  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => {
    // Keep local state in sync when the URL changes externally
    // (back/forward navigation, deep link, clear-filters click).
    setSearchInput(query);
  }, [query]);
  useEffect(() => {
    if (searchInput === query) return;
    const t = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput === "") next.delete("q");
          else next.set("q", searchInput);
          next.delete("page"); // any filter change resets pagination
          return next;
        },
        { replace: true },
      );
      trackEvent(BLOG_EVENTS.search, { query: searchInput });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput, query, setSearchParams]);

  const updateParam = useCallback(
    (key: "q" | "city" | "category", value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const isDefault =
            (key === "q" && value === "") ||
            (key !== "q" && (value === "all" || value === ""));
          if (isDefault) next.delete(key);
          else next.set(key, value);
          // Any filter change resets pagination to page 1.
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextPage <= 1) next.delete("page");
          else next.set("page", String(nextPage));
          return next;
        },
        { replace: false }, // pagination should push so back-button works
      );
      trackEvent(BLOG_EVENTS.changePage, { page: nextPage });
      // Move focus into the newly rendered results after paint so
      // keyboard/screen-reader users land inside the updated page.
      requestAnimationFrame(() => {
        firstCardRef.current?.focus();
      });
    },
    [setSearchParams],
  );
  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("city");
        next.delete("category");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
    trackEvent(BLOG_EVENTS.clearFilters);
  }, [setSearchParams]);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  // On any filter change (post-initial-render), soft-focus the results
  // heading so assistive tech announces the new count.
  const filterFingerprint = `${query}|${city}|${category}`;
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    resultsHeadingRef.current?.focus({ preventScroll: true });
  }, [filterFingerprint]);

  return (
    <Layout>
      <Seo
        title="Blog — Industry Army Intel | $10 Exclusive Trade Territories"
        description="2,000-word guides to exclusive territory marketing for contractors, trades, and service pros across BC and Canada. One trade per city. $10/month."
        path="/blog"
        image={featuredBattle.url}
        imageAlt="Weddings.io vs aiweddings.io — Industry Army Marketing Battle for the Brand case study"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            name: "Industry Army Intel",
            url: `${SITE_URL}/blog`,
            description:
              "Guides on $10 exclusive territory marketing across trade and lifestyle domains — SEO, AEO, GEO, and the math behind the model.",
            publisher: { "@id": `${SITE_URL}/#organization` },
            inLanguage: "en-CA",
            // Anchor the Blog node to a WebPage whose @id is byte-identical
            // to the sitemap <loc>. Search engines join graphs via @id, so
            // the primary route identifier must exactly match the canonical
            // URL emitted in sitemap.xml — no fragments, no trailing slash.
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${SITE_URL}/blog#latest`,
            name: "Latest Industry Army Intel posts",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: Math.min(blogPosts.length, 10),
            itemListElement: blogPosts.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/blog/${p.slug}`,
              name: p.cardTitle || `${p.trade} in ${p.city}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
            ],
          },
        ]}
      />
      <PageHeader
        eyebrow="Industry Army Intel"
        title="The"
        highlight="Blog"
        description="Deep dives on $10 exclusive territory marketing — one guide per trade domain. SEO, AEO, GEO, and the math behind the model."
      />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">All Intel</p>
          <h3 className="font-display text-3xl text-foreground mb-8">Every trade. Every territory.</h3>

          {/* Quick-filter chips — one-click browsing for common categories,
              highlighted so visitors can jump straight into "Press Releases
              / Notices" (official statements) without opening the dropdown. */}
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Quick category filters">
            {[
              { label: "All Intel", value: "all" },
              { label: "Press Releases / Notices", value: "Press Releases / Notices", emphasis: true },
              { label: "Brand Protection", value: "Brand Protection" },
              { label: "Company", value: "Company" },
              { label: "SEO Strategy", value: "SEO Strategy" },
            ].map((chip) => {
              const active = category === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    updateParam("category", chip.value);
                    trackEvent(BLOG_EVENTS.filterCategory, { category: chip.value });
                  }}
                  aria-pressed={active}
                  className={
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors " +
                    (active
                      ? "bg-primary text-primary-foreground border-primary"
                      : chip.emphasis
                        ? "bg-primary/10 text-primary border-primary/40 hover:bg-primary/20"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary")
                  }
                >
                  {chip.emphasis && <span aria-hidden="true">📣</span>}
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3 mb-8 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trades, cities, keywords…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                aria-label="Search blog posts"
              />
            </div>
            <select
              value={city}
              onChange={(e) => {
                updateParam("city", e.target.value);
                trackEvent(BLOG_EVENTS.filterCity, { city: e.target.value });
              }}
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
              onChange={(e) => {
                updateParam("category", e.target.value);
                trackEvent(BLOG_EVENTS.filterCategory, { category: e.target.value });
              }}
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
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-5">
            {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
            {totalPages > 1 && (
              <span className="ml-2 text-muted-foreground/70">
                · page {currentPage} of {totalPages}
              </span>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">No guides match those filters. Try clearing them.</p>
            </div>
          ) : (
          <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paged.map((p, i) => (
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
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-2"
              aria-label="Blog pagination"
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-border text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3 w-3" /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={`h-9 min-w-9 px-2 rounded-md border text-xs uppercase tracking-widest transition-colors ${
                    n === currentPage
                      ? "border-primary/60 text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-border text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next <ChevronRight className="h-3 w-3" />
              </button>
            </nav>
          )}
          </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
