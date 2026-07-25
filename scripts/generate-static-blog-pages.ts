// Generates crawlable, no-JavaScript blog HTML under public/blog/.
// These files are copied into the production build before Vite runs, so
// /blog/{slug} returns a complete article body to Google, ChatGPT, Claude,
// Perplexity, Duck.ai, and other fetchers even when the React app is not run.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import vm from "vm";

const BASE_URL = "https://industryarmymarketing.com";
const SOURCE_PATH = resolve("src/data/blogPosts.ts");
const OUTPUT_ROOT = resolve("public/blog");
const DEFAULT_IMAGE = "/og-image.jpg";

type BlogRichSection = {
  heading: string;
  paragraphs: string[];
  image?: { src: string; alt: string; caption?: string; href?: string };
};

type BlogPost = {
  slug: string;
  brand: string;
  trade: string;
  tradeShort: string;
  plural: string;
  video: string | null;
  imageKey: string;
  image?: string;
  city: string;
  province: string;
  category: string;
  date: string;
  publishedAt?: string;
  excerpt: string;
  title: string;
  metaDescription: string;
  pain: string;
  detail: string;
  process: string;
  faqs: { q: string; a: string }[];
  cardTitle?: string;
  imageAlt?: string;
  ogImage?: string;
  ogImageAlt?: string;
  authorName?: string;
  richContent?: {
    intro?: string;
    sections: BlogRichSection[];
    sources?: { label: string; href: string }[];
    footnotes?: { id: string; text: string; href?: string }[];
  };
  faqHeading?: string;
  cta?: {
    eyebrow?: string;
    heading: string;
    body: string;
    buttonText: string;
    buttonHref: string;
  };
};

const source = readFileSync(SOURCE_PATH, "utf8");

function aliasPath(importPath: string): string {
  if (!importPath.startsWith("@/")) return resolve(importPath);
  return resolve("src", importPath.slice(2));
}

function extractBalanced(text: string, startIndex: number, open: string, close: string): string {
  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === open) depth += 1;
    if (ch === close) depth -= 1;
    if (depth === 0) return text.slice(startIndex, i + 1);
  }

  throw new Error(`Could not extract balanced ${open}${close} expression.`);
}

function extractExpressionAfter(label: string, open: string, close: string): string {
  const labelIndex = source.indexOf(label);
  if (labelIndex === -1) throw new Error(`Missing ${label}`);
  const equalsIndex = source.indexOf("=", labelIndex);
  const searchFrom = equalsIndex === -1 ? labelIndex : equalsIndex;
  const startIndex = source.indexOf(open, searchFrom);
  if (startIndex === -1) throw new Error(`Missing ${open} after ${label}`);
  return extractBalanced(source, startIndex, open, close);
}

const context: Record<string, unknown> = {};

for (const match of source.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+["'](@\/[^"']+)["'];/gm)) {
  const [, name, importPath] = match;
  if (importPath.endsWith(".asset.json")) {
    context[name] = JSON.parse(readFileSync(aliasPath(importPath), "utf8"));
  } else {
    // Raw src/ image imports are fingerprinted by Vite at build time and are
    // not directly addressable from public static HTML. Use the site-wide OG
    // fallback for these older posts; asset.json-backed evidence images keep
    // their exact CDN URLs.
    context[name] = DEFAULT_IMAGE;
  }
}

for (const match of source.matchAll(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\.url;$/gm)) {
  const [, name, ref] = match;
  const value = context[ref];
  context[name] = value && typeof value === "object" && "url" in value ? (value as { url: string }).url : DEFAULT_IMAGE;
}

const imgMap = vm.runInNewContext(
  `(${extractExpressionAfter("const IMG", "{", "}")})`,
  context,
) as Record<string, string>;

const rawPosts = vm.runInNewContext(
  `(${extractExpressionAfter("const rawBlogPosts", "[", "]")})`,
  context,
) as BlogPost[];

const posts = rawPosts
  .map((post, index) => ({ ...post, image: imgMap[post.imageKey] ?? post.image ?? DEFAULT_IMAGE, index }))
  .sort((a, b) => {
    const ta = Date.parse(a.publishedAt ?? "") || 0;
    const tb = Date.parse(b.publishedAt ?? "") || 0;
    return tb - ta || b.index - a.index;
  });

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(url: string | undefined): string {
  const value = url?.trim() || DEFAULT_IMAGE;
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function inline(text: string): string {
  const token = /\[([^\]^][^\]]*)\]\(([^)\s]+)\)|\[\^([a-z0-9_-]+)\]/gi;
  let out = "";
  let last = 0;
  for (const match of text.matchAll(token)) {
    const index = match.index ?? 0;
    out += esc(text.slice(last, index));
    if (match[1] && match[2]) {
      out += `<a href="${esc(absoluteUrl(match[2]))}">${esc(match[1])}</a>`;
    } else if (match[3]) {
      out += `<sup>${esc(match[3])}</sup>`;
    }
    last = index + match[0].length;
  }
  out += esc(text.slice(last));
  return out;
}

function isoDate(post: BlogPost): string {
  if (post.publishedAt && Number.isFinite(Date.parse(post.publishedAt))) return post.publishedAt;
  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12",
  };
  const [month, year] = post.date.split(" ");
  return months[month] && year ? `${year}-${months[month]}-01T00:00:00Z` : "2026-01-01T00:00:00Z";
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function figure(section: BlogRichSection): string {
  if (!section.image) return "";
  const img = section.image;
  const image = `<img src="${esc(absoluteUrl(img.src))}" alt="${esc(img.alt)}" loading="lazy">`;
  return `<figure>${img.href ? `<a href="${esc(absoluteUrl(img.href))}">${image}</a>` : image}${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}</figure>`;
}

function fallbackSections(post: BlogPost): BlogRichSection[] {
  return [
    {
      heading: `${post.trade} in ${post.city}: the local search problem`,
      paragraphs: [post.detail, post.pain],
    },
    {
      heading: `How ${post.brand} changes the equation`,
      paragraphs: [post.process],
    },
    {
      heading: "The $10 territory model",
      paragraphs: [
        `Industry Army Marketing keeps the offer simple: $10 placements, dofollow pages, direct lead routing, and no inflated retainer layer. The constraint is scarcity — the best city-plus-trade and partner placements are limited by design.`,
      ],
    },
  ];
}

function renderBody(post: BlogPost): string {
  const content = post.richContent;
  const sections = content?.sections ?? fallbackSections(post);
  return [
    content?.intro ? `<p class="lede">${inline(content.intro)}</p>` : `<p class="lede">${inline(post.excerpt)}</p>`,
    ...sections.map((section) => [
      `<section id="${esc(slugifyHeading(section.heading))}">`,
      `<h2>${inline(section.heading)}</h2>`,
      ...section.paragraphs.map((p) => `<p>${inline(p)}</p>`),
      figure(section),
      `</section>`,
    ].join("\n")),
    `<section id="faqs"><h2>${esc(post.faqHeading ?? `Frequently asked: ${post.trade} in ${post.city}`)}</h2>${post.faqs
      .map((faq) => `<h3>${inline(faq.q)}</h3><p>${inline(faq.a)}</p>`)
      .join("\n")}</section>`,
    content?.sources?.length
      ? `<section id="sources"><h2>Sources and further reading</h2><ul>${content.sources
          .map((source) => `<li><a href="${esc(absoluteUrl(source.href))}">${esc(source.label)}</a></li>`)
          .join("\n")}</ul></section>`
      : "",
    post.cta
      ? `<section id="contact"><h2>${inline(post.cta.heading)}</h2><p>${inline(post.cta.body)}</p><p><a class="button" href="${esc(absoluteUrl(post.cta.buttonHref))}">${esc(post.cta.buttonText)}</a></p></section>`
      : "",
  ].join("\n");
}

function schemasFor(post: BlogPost, imageUrl: string): object[] {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const published = isoDate(post);
  const publisher = {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Industry Army Marketing",
    url: BASE_URL,
    logo: { "@type": "ImageObject", url: `${BASE_URL}/icon-512.png`, width: 512, height: 512 },
  };
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    name: post.title,
    description: post.metaDescription,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-CA",
    image: { "@type": "ImageObject", url: imageUrl, caption: post.imageAlt ?? post.ogImageAlt ?? post.title },
    datePublished: published,
    dateModified: published,
    articleSection: post.category,
    author: { "@type": post.authorName ? "Person" : "Organization", name: post.authorName ?? "Industry Army Marketing", url: BASE_URL },
    publisher,
  };
  const schemas: object[] = [
    blogPosting,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url,
      name: post.title,
      url,
      description: post.metaDescription,
      isPartOf: { "@id": `${BASE_URL}/#website` },
      primaryImageOfPage: { "@type": "ImageObject", url: imageUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];
  if ((post.category ?? "").toLowerCase().includes("notice") || (post.category ?? "").toLowerCase().includes("press release")) {
    schemas.push({
      ...blogPosting,
      "@type": "NewsArticle",
      "@id": `${url}#newsarticle`,
    });
  }
  return schemas;
}

function renderPost(post: BlogPost): string {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const imageUrl = absoluteUrl(post.ogImage ?? post.image ?? DEFAULT_IMAGE);
  const schemas = schemasFor(post, imageUrl);
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title)}</title>
  <meta name="description" content="${esc(post.metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${esc(url)}">
  <link rel="alternate" type="application/rss+xml" title="Industry Army Marketing RSS" href="${BASE_URL}/rss.xml">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(post.metaDescription)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(imageUrl)}">
  <meta property="og:image:alt" content="${esc(post.ogImageAlt ?? post.imageAlt ?? post.title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(post.metaDescription)}">
  <meta name="twitter:url" content="${esc(url)}">
  <meta name="twitter:image" content="${esc(imageUrl)}">
  ${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("\n  ")}
  <style>
    :root{color-scheme:dark;--bg:#070a07;--panel:#101510;--text:#f2f7ef;--muted:#b8c5b4;--line:#263126;--accent:#39ff14}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif;line-height:1.7}main{max-width:920px;margin:0 auto;padding:48px 20px 72px}nav{margin-bottom:32px}a{color:var(--accent);text-underline-offset:3px}h1,h2,h3{line-height:1.1;letter-spacing:0}h1{font-size:clamp(2.4rem,7vw,5rem);margin:18px 0}h2{font-size:clamp(1.6rem,4vw,2.5rem);margin-top:48px}h3{font-size:1.2rem;margin:26px 0 4px}.eyebrow{color:var(--accent);text-transform:uppercase;font-weight:800;font-size:.78rem;letter-spacing:.18em}.lede{font-size:1.28rem;color:var(--text)}p,li{color:var(--muted);font-size:1.04rem}.hero,figure{border:1px solid var(--line);background:var(--panel);border-radius:8px;overflow:hidden}.hero img,figure img{display:block;width:100%;height:auto}figcaption{padding:12px 14px;color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.12em}.button{display:inline-block;border:1px solid var(--accent);padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:800}.meta{color:var(--muted);font-size:.9rem}section{scroll-margin-top:20px}
  </style>
</head>
<body>
  <main>
    <nav><a href="${BASE_URL}/blog">← Blog</a> · <a href="${BASE_URL}/llms.txt">AI reading guide</a> · <a href="${BASE_URL}/sitemap.xml">Sitemap</a> · <a href="${BASE_URL}/rss.xml">RSS</a></nav>
    <article>
      <p class="eyebrow">${esc(post.category)} · ${esc(post.date)}</p>
      <h1>${esc(post.title)}</h1>
      <p class="meta">By ${esc(post.authorName ?? "Industry Army Marketing")} · Canonical URL: <a href="${esc(url)}">${esc(url)}</a></p>
      <figure class="hero"><img src="${esc(imageUrl)}" alt="${esc(post.ogImageAlt ?? post.imageAlt ?? post.title)}" loading="eager"><figcaption>${esc(post.ogImageAlt ?? post.imageAlt ?? post.title)}</figcaption></figure>
      ${renderBody(post)}
    </article>
  </main>
</body>
</html>
`;
}

function renderListing(): string {
  const itemList = posts.map((post, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${BASE_URL}/blog/${post.slug}`,
    name: post.title,
  }));
  return `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Blog — Industry Army Marketing</title><meta name="description" content="Crawlable Industry Army Marketing articles for search engines and AI readers."><meta name="robots" content="index,follow"><link rel="canonical" href="${BASE_URL}/blog"><link rel="alternate" type="application/rss+xml" href="${BASE_URL}/rss.xml"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${BASE_URL}/blog`, name: "Industry Army Marketing Blog", url: `${BASE_URL}/blog` })}</script><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", "@id": `${BASE_URL}/blog#latest`, itemListElement: itemList })}</script><style>:root{color-scheme:dark}body{margin:0;background:#070a07;color:#f2f7ef;font-family:Inter,Arial,sans-serif;line-height:1.6}main{max-width:1000px;margin:0 auto;padding:48px 20px}a{color:#39ff14}li{margin:12px 0;color:#b8c5b4}h1{font-size:clamp(2.5rem,7vw,5rem);line-height:1.05}</style></head><body><main><h1>Industry Army Marketing Blog</h1><p>Static, crawlable article index for search engines, AI readers, and RSS consumers.</p><p><a href="${BASE_URL}/llms.txt">AI reading guide</a> · <a href="${BASE_URL}/sitemap.xml">Sitemap</a> · <a href="${BASE_URL}/rss.xml">RSS</a></p><ol>${posts.map((post) => `<li><a href="${BASE_URL}/blog/${post.slug}">${esc(post.title)}</a><br>${esc(post.metaDescription)}</li>`).join("\n")}</ol></main></body></html>`;
}

if (!existsSync(OUTPUT_ROOT)) mkdirSync(OUTPUT_ROOT, { recursive: true });

for (const post of posts) {
  const dir = resolve(OUTPUT_ROOT, post.slug);
  mkdirSync(dir, { recursive: true });
  const html = renderPost(post);
  writeFileSync(resolve(dir, "index.html"), html);
  writeFileSync(resolve(OUTPUT_ROOT, `${post.slug}.html`), html);
}

writeFileSync(resolve(OUTPUT_ROOT, "index.html"), renderListing());

const stale = resolve(OUTPUT_ROOT, "open-letter-platforms-poisoning-ai-information-supply-chain.html.tmp");
if (existsSync(stale)) rmSync(stale);

console.log(`static blog HTML written (${posts.length} posts)`);
