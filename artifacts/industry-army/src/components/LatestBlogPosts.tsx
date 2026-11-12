import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { homepageJournal, homepagePublicationLabel } from "@/lib/homepageJournal.mjs";

const LatestBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => homepageJournal(blogPosts));
  // The manifest is emitted from the exact same canonical collection as /blog
  // on every publisher deployment. An already-open homepage also sees new releases.
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch('/journal-index.json', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json();
        if (alive && result.schemaVersion === 1 && Array.isArray(result.posts)) {
          const eligible = homepageJournal(result.posts);
          if (eligible.length) setPosts(eligible);
        }
      } catch { /* Keep the actual dated, prerendered canonical posts; never fake freshness. */ }
    };
    void refresh();
    const interval = window.setInterval(refresh, 60000);
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { alive = false; controller.abort(); window.clearInterval(interval); window.removeEventListener('focus', focus); };
  }, []);

  return (
    <section id="latest-journal" aria-labelledby="latest-journal-title" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Inside the build</p>
            <h2 id="latest-journal-title" className="font-display text-4xl md:text-5xl text-foreground leading-tight">The <span className="text-primary text-glow">Build Journal</span></h2>
            <p className="text-muted-foreground mt-3 max-w-xl">Brand identities, websites, apps and rollouts. Newest published story first—explore the launches and work behind them.</p>
          </div>
          <Button variant="hero" asChild className="self-start md:self-end"><Link to="/blog">Read the journal</Link></Button>
        </div>
        {posts[0] && <p className="text-sm text-muted-foreground mb-5">Latest publication: <time dateTime={posts[0].publishedAt}>{homepagePublicationLabel(posts[0].publishedAt)}</time></p>}
        <Carousel opts={{ align: 'start', loop: false, slidesToScroll: 1 }} aria-label="Published Build Journal stories, newest first" className="pt-14">
          <div className="absolute right-0 top-0 flex gap-3">
            <CarouselPrevious className="static translate-y-0 h-11 w-11" />
            <CarouselNext className="static translate-y-0 h-11 w-11" />
          </div>
          <CarouselContent>
            {posts.map((p: BlogPost) => (
              <CarouselItem key={p.slug} className="basis-[92%] sm:basis-1/2 lg:basis-1/3">
                <article data-published-at={p.publishedAt} className="h-full rounded-lg bg-card border border-border overflow-hidden flex flex-col">
                  <Link to={`/blog/${p.slug}`} className="block" aria-label={p.title}>
                    <img src={p.image} alt={p.imageAlt || p.title} loading="lazy" width={1600} height={900} className="w-full aspect-video object-contain bg-black" />
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-primary text-xs uppercase tracking-widest mb-2">{p.category} · {p.brand}</p>
                    <h3 className="font-display text-xl text-foreground mb-3 leading-tight"><Link to={`/blog/${p.slug}`} className="hover:text-primary transition-colors">{p.title}</Link></h3>
                    <p className="text-muted-foreground text-sm mb-3"><time dateTime={p.publishedAt}>{homepagePublicationLabel(p.publishedAt)}</time></p>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{p.excerpt || p.pain}</p>
                    <Link to={`/blog/${p.slug}`} className="text-primary text-sm mt-auto self-start hover:underline">Read the story →</Link>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
export default LatestBlogPosts;
