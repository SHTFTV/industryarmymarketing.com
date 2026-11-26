import { useEffect, useState } from "react";
import type { BlogPost } from "@/data/blogPosts";
import { fetchNetworkPosts } from "@/lib/networkPosts.mjs";
export function useNetworkPosts(): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetchNetworkPosts(controller.signal).then((rows: BlogPost[]) => setPosts(rows)).catch(() => {});
    return () => controller.abort();
  }, []);
  return posts;
}
