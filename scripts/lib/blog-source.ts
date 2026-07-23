// Shared build-time helper: fetch published blog posts from the Supabase
// `blog_posts` table via the anon REST endpoint. Falls back to `null` on
// any error so callers can degrade to the static `src/data/blogPosts.ts`
// source without breaking the build.

import { readFileSync } from "fs";
import { resolve } from "path";

export type DbBlogPost = {
  slug: string;
  title: string;
  published_at: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  data: Record<string, unknown> | null;
};

function readEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const env = readFileSync(resolve(".env"), "utf8");
    const m = env.match(new RegExp(`^${key}\\s*=\\s*"?([^"\\n]+)"?`, "m"));
    return m?.[1];
  } catch {
    return undefined;
  }
}

export async function fetchPublishedBlogPosts(): Promise<DbBlogPost[] | null> {
  const url = readEnv("VITE_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) return null;
  try {
    // Order: display_order asc (admin-controlled), then newest published_at.
    const endpoint =
      `${url}/rest/v1/blog_posts` +
      `?select=slug,title,published_at,is_published,is_featured,display_order,data` +
      `&is_published=eq.true` +
      `&order=display_order.asc,published_at.desc`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[blog-source] DB fetch failed ${res.status}; falling back to static file`);
      return null;
    }
    const rows = (await res.json()) as DbBlogPost[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows;
  } catch (e) {
    console.warn(`[blog-source] DB fetch error: ${(e as Error).message}; falling back to static`);
    return null;
  }
}

/** Convenience: return published slugs ordered newest-first (by published_at)
 *  with an optional stable secondary sort by display_order. Matches the
 *  ordering used by the existing static-file parsers. */
export function sortedSlugsNewestFirst(rows: DbBlogPost[]): string[] {
  return [...rows]
    .sort((a, b) => {
      const ta = Date.parse(a.published_at) || 0;
      const tb = Date.parse(b.published_at) || 0;
      if (tb !== ta) return tb - ta;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((r) => r.slug);
}