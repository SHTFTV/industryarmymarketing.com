import Layout from "@/components/Layout";
import Seo, { SITE_URL } from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blogPosts";
import { useBlogPostsOverlay } from "@/hooks/useBlogPostsOverlay";
import { useMemo } from "react";

// Category values considered "case studies" for this landing page. Keep in
// sync with src/data/blogPosts.ts categories. Individual case studies live
// under /blog/:slug — this page is a filtered grid, not a separate route.
const CASE_STUDY_CATEGORIES = new Set([
  "Company Case Study",
  "Case Study",
  "Brand Protection",
]);

const CaseStudies = () => {
  const { posts: overlayPosts } = useBlogPostsOverlay();
  const source = overlayPosts.length > 0 ? overlayPosts : blogPosts;
  const studies = useMemo(
    () => source.filter((p) => CASE_STUDY_CATEGORIES.has(p.category)),
    [source],
  );

  return (
    <Layout>
      <Seo
        title="Case Studies — Industry Army Marketing | Brand Defense & Territory Wins"
        description="Company case studies from the Industry Army Marketing network: brand defense, exclusive territory ownership, and the receipts behind the $10 slot model."
        path="/case-studies"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${SITE_URL}/case-studies#collection`,
            name: "Industry Army Marketing Case Studies",
            url: `${SITE_URL}/case-studies`,
            description:
              "Company case studies documenting brand defense, exclusive territory ownership, and the $10 slot model across the IAM network.",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            inLanguage: "en-CA",
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${SITE_URL}/case-studies#list`,
            name: "Industry Army Marketing case studies",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: studies.length,
            itemListElement: studies.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/blog/${p.slug}`,
              name: p.cardTitle || p.title,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              {
                "@type": "ListItem",
                position: 2,
                name: "Case Studies",
                item: `${SITE_URL}/case-studies`,
              },
            ],
          },
        ]}
      />
      <PageHeader
        eyebrow="IAM Company Case Studies"
        title="Case"
        highlight="Studies"
        description="Territory ownership, brand defense, and the receipts behind the $10 slot model — every case study links through to its full write-up in the Intel blog."
      />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            All Case Studies
          </p>
          <h3 className="font-display text-3xl text-foreground mb-8">
            One trade. One territory. Every receipt on record.
          </h3>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-5">
            {studies.length} {studies.length === 1 ? "case study" : "case studies"}
          </p>

          {studies.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                No case studies published yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studies.map((p, i) => (
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
                      alt={`${p.trade} — ${p.brand}`}
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
                      <Link
                        to={`/blog/${p.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {p.cardTitle || p.title}
                      </Link>
                    </h4>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
                      {p.date} · 10 min read
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                      {p.excerpt}
                    </p>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="text-primary text-sm uppercase tracking-widest mt-auto self-start hover:underline"
                    >
                      Read the case study →
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

export default CaseStudies;