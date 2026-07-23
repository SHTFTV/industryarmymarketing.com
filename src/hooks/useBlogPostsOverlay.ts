import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts, type BlogPost } from "@/data/blogPosts";

type Overlay = {
  publishedSlugs: Set<string> | null; // null = no overlay (DB down); render static as-is
  featuredSlugs: Set<string>;
  order: Map<string, number>;
};

const emptyOverlay: Overlay = {
  publishedSlugs: null,
  featuredSlugs: new Set(),
  order: new Map(),
};

let cache: Overlay | null = null;
let inflight: Promise<Overlay> | null = null;

async function fetchOverlay(): Promise<Overlay> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug,is_published,is_featured,display_order,published_at")
        .order("display_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (error || !data) return emptyOverlay;
      const published = new Set<string>();
      const featured = new Set<string>();
      const order = new Map<string, number>();
      data.forEach((r, idx) => {
        if (r.is_published) published.add(r.slug);
        if (r.is_featured) featured.add(r.slug);
        order.set(r.slug, r.display_order ?? idx);
      });
      cache = { publishedSlugs: published, featuredSlugs: featured, order };
      return cache;
    } catch {
      return emptyOverlay;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Returns the static blogPosts array filtered and re-ordered by the DB
 *  overlay once it loads. On the first render (SSR / prerender / initial
 *  hydration) returns the static list as-is so crawler HTML stays stable. */
export function useBlogPostsOverlay(): {
  posts: BlogPost[];
  featured: BlogPost | undefined;
  loaded: boolean;
} {
  const [overlay, setOverlay] = useState<Overlay>(cache ?? emptyOverlay);
  const [loaded, setLoaded] = useState<boolean>(!!cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    fetchOverlay().then((o) => {
      if (!alive) return;
      setOverlay(o);
      setLoaded(true);
    });
    return () => { alive = false; };
  }, []);

  const { publishedSlugs, featuredSlugs, order } = overlay;
  const posts = publishedSlugs
    ? blogPosts
        .filter((p) => publishedSlugs.has(p.slug))
        .slice()
        .sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999))
    : blogPosts;

  const featured = posts.find((p) => featuredSlugs.has(p.slug));
  return { posts, featured, loaded };
}