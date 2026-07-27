import { blogPosts } from "../src/data/blogPosts";
import { writeFileSync } from "node:fs";
const rows = blogPosts.map((p, i) => ({
  slug: p.slug,
  title: p.title,
  published_at: p.publishedAt ?? new Date().toISOString(),
  is_published: true,
  is_featured: i === 0,
  display_order: i,
  data: p,
}));
writeFileSync("/tmp/blog-posts.json", JSON.stringify(rows));
console.log(`dumped ${rows.length}`);
