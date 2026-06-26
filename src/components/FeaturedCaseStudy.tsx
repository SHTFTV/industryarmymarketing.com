import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getPost } from "@/data/blogPosts";

const FEATURED_SLUG = "battle-for-the-brand-weddings-io";

const FeaturedCaseStudy = () => {
  const post = getPost(FEATURED_SLUG);
  if (!post) return null;

  return (
    <section
      aria-labelledby="featured-case-study-title"
      className="py-16 bg-gradient-to-br from-background via-card/40 to-background border-y border-primary/30"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center"
        >
          <Link to={`/blog/${post.slug}`} className="block group">
            <div className="relative overflow-hidden rounded-lg border border-primary/40 shadow-[0_0_40px] shadow-primary/10">
              <img
                src={post.image}
                alt={`Weddings.io battle for the brand — ${post.trade} case study`}
                loading="lazy"
                width={1280}
                height={720}
                className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform"
              />
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                Case Study
              </span>
            </div>
          </Link>

          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Flagship case study · receipts inside
            </p>
            <h2
              id="featured-case-study-title"
              className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] mb-4"
            >
              The Battle For the Brand:{" "}
              <span className="text-primary text-glow">Weddings.io</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              How a six-letter .io registered on May 13, 2015 survived 78 Wayback captures,
              three copycat attacks, and eleven quiet years — then shipped as the wedding
              industry's exclusive-territory disruptor. WHOIS records, Wayback exhibits,
              footnoted sources, and a full timeline included.
            </p>
            <ul className="grid grid-cols-3 gap-3 mb-6 text-center">
              {[
                { n: "2015", l: "Registered" },
                { n: "78", l: "Wayback captures" },
                { n: "11 yrs", l: "Continuous hold" },
              ].map((s) => (
                <li
                  key={s.l}
                  className="rounded-md border border-border bg-card/60 px-3 py-2"
                >
                  <p className="font-display text-2xl text-primary leading-none">{s.n}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {s.l}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" asChild>
                <Link to={`/blog/${post.slug}`}>Read the case study</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/blog/${post.slug}#exhibits`}>Jump to the proof exhibits</Link>
              </Button>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
};

export default FeaturedCaseStudy;