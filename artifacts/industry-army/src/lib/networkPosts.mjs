const ENDPOINT = "https://ppdnkogmsfwhhknayolb.supabase.co/rest/v1/posts";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZG5rb2dtc2Z3aGhrbmF5b2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MjQ5NTMsImV4cCI6MjEwMzIwMDk1M30.ms-jCItS0WZ25Zts53KyAa5X9a5MdQONHytTtILIJJQ";
const CITIES = [["vancouver","Vancouver","BC"],["toronto","Toronto","ON"],["edmonton","Edmonton","AB"],["calgary","Calgary","AB"],["winnipeg","Winnipeg","MB"],["ottawa","Ottawa","ON"],["montreal","Montreal","QC"],["victoria","Victoria","BC"]];
export function markdownToRich(body) {
  const text = String(body || "").replace(/\r\n/g, "\n").trim();
  const chunks = text.split(/\n(?=## )/);
  const intro = (chunks[0] || "").trim();
  const sections = chunks.slice(1).map((chunk) => {
    const [head, ...rest] = chunk.split("\n");
    const paragraphs = rest.join("\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return { heading: head.replace(/^#+\s*/, "").trim(), paragraphs };
  }).filter((section) => section.heading);
  return { intro, sections };
}
function cityOf(slug, title) {
  const blob = `${slug} ${title}`.toLowerCase();
  for (const [key, city, province] of CITIES) if (blob.includes(key)) return { city, province };
  return { city: "Canada", province: "BC" };
}
export function rowToPost(row) {
  if (!row?.slug || !row.title || !row.image_url || !row.published_at) return null;
  const when = new Date(row.published_at);
  if (!Number.isFinite(when.getTime()) || when.getTime() > Date.now()) return null;
  const place = cityOf(row.slug, row.title);
  const rich = markdownToRich(row.body_md);
  const date = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric" }).format(when);
  return {
    brand: "Industry Army Marketing", trade: "Industry publishing", tradeShort: "industry publishing", plural: "businesses", video: null, imageKey: "build-journal",
    city: place.city, province: place.province, category: "Build Journal", pain: "", detail: "", process: "", authorName: "Colin Hamilton", contactBusiness: "iam", campaignSite: "industryarmymarketing.com",
    slug: row.slug, title: row.title, cardTitle: row.title, excerpt: row.excerpt || "", metaDescription: row.meta_description || row.excerpt || row.title,
    campaignLabel: String(row.title).split(":")[0].slice(0, 48), image: row.image_url, ogImage: row.image_url, imageAlt: row.image_alt || row.title, ogImageAlt: row.image_alt || row.title,
    publishedAt: row.published_at, date,
    faqs: Array.isArray(row.faq) ? row.faq.filter((item) => item?.q && item?.a) : [],
    richContent: { intro: rich.intro, sections: rich.sections, sources: Array.isArray(row.sources) ? row.sources.filter((source) => source?.url && source?.title).map((source) => ({ href: source.url, label: source.title })) : [] },
  };
}
export async function fetchNetworkPosts(signal) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("site", "eq.industryarmymarketing.com");
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("published_at", `lte.${new Date().toISOString()}`);
  url.searchParams.set("select", "title,slug,meta_description,excerpt,body_md,faq,sources,image_url,image_alt,published_at");
  url.searchParams.set("order", "published_at.desc");
  url.searchParams.set("limit", "1000");
  const response = await fetch(url, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, signal });
  if (!response.ok) throw new Error(`Supabase posts returned ${response.status}`);
  const rows = await response.json();
  return rows.map(rowToPost).filter(Boolean);
}
export function mergePosts(existing, incoming) {
  const seen = new Set(existing.map((post) => post.slug));
  return [...incoming.filter((post) => post && !seen.has(post.slug)), ...existing];
}
