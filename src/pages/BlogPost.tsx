import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Layout from "@/components/Layout";
import Seo, { SITE_URL } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { getPost, blogPosts } from "@/data/blogPosts";
import BlogRichContentView from "@/components/BlogRichContent";
import { DisambiguationSchema } from "@/components/DisambiguationSchema";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;
  const [copied, setCopied] = useState(false);

  if (!post) return <Navigate to="/blog" replace />;

  // Long-form body sections (each ~250-350 words) — built from per-post data
  const sections: { h: string; body: string[] }[] = [
    {
      h: `Why ${post.trade} in ${post.city} is different from anywhere else in Canada`,
      body: [
        `${post.detail} That single sentence captures something most national directories miss: a ${post.tradeShort} contractor in ${post.city}, ${post.province} is not solving the same problem as one in Toronto, Calgary, or Halifax. Local building codes, weather cycles, labour rates, permit timelines, and even the way homeowners search Google all shift the moment you cross a metro boundary.`,
        `${post.brand} was acquired and built specifically because of that geography. The domain itself carries authority compounding from 20-plus years of inbound links, citations, and topical relevance. When a homeowner in ${post.city} searches for the exact service this domain represents, the page that ranks above the Google Maps pack is not a generic national portal — it is a hyper-targeted directory built for one trade in one region.`,
        `That matters because intent matters. A search like "${post.tradeShort} ${post.city}" is not someone three months from a decision. It is someone with a permit on the kitchen table, a budget approved, and a contractor short-list of two or three. Owning the listing that ranks there is owning the moment of purchase, not the moment of research.`,
      ],
    },
    {
      h: `The lead-generation problem ${plural(post)} face in 2026`,
      body: [
        post.pain,
        `It compounds. Every dollar a real shop spends on Google Ads pushes the auction higher for the next contractor. Every shared lead from HomeStars or Houzz arrives in three competing inboxes, with the homeowner already trained to bid-shop down to the floor. By the time a serious lead reaches a serious contractor, the margin is already cooked.`,
        `Add seasonal swing — ${post.trade} demand in ${post.city} can spike 40 percent in a single quarter — and the math gets ugly. Pay $400 to acquire a $4,000 job and the unit economics work. Pay $400 to acquire a job that goes to a competitor on price, and you have funded a stranger's marketing budget. This is the trap exclusive territory marketing was built to break.`,
      ],
    },
    {
      h: `How ${post.brand} changes the equation`,
      body: [
        `Industry Army Marketing operates a network of premium trade domains — ${post.brand} being one of them. The model is brutally simple. One contractor per trade per metro region. No bid wars. No shared leads. No bait-and-switch with three competing listings on the same page. The territory is yours alone for as long as you hold the $10 monthly subscription.`,
        `${post.process}`,
        `Behind the scenes, every territory carries structured data, Schema.org markup for LocalBusiness, FAQPage, and where applicable VideoObject and Article schema. That structured data is what makes the listing eligible for rich snippets, Google's AI Overviews, and the answer-engine results that ChatGPT, Perplexity, and Google Gemini draw from when a homeowner asks "who is the best ${post.tradeShort} in ${post.city}".`,
      ],
    },
    {
      h: `Inside the ${post.city} territory — what you actually get for $10`,
      body: [
        `Your ${post.brand} listing is not a placeholder. It is a fully built profile page with hero image, project gallery, service-area map, certification badges, EyeSpyr verification (a physical confirmation that your business exists at the address you claim), direct WhatsApp lead routing, click-to-call CTAs, and a structured inquiry form.`,
        `Lead routing is the underrated piece. The moment a homeowner submits the form on your ${post.brand} listing, a notification fires to your WhatsApp inside 60 seconds with project type, location, budget range, and contact information tagged. No portal log-in, no 12-hour delay, no missed lead because you were on the job site.`,
        `The listing is also indexed by Google within 24 hours of going live, surfaced in the sitemap and video sitemap, and added to the internal link graph of the broader Industry Army Marketing network. That cross-link juice is what compounds — your single $10 listing inherits authority from 200-plus sibling domains in the IAM network.`,
      ],
    },
    {
      h: `What ${post.city} clients are actually searching for`,
      body: [
        `Keyword research across the Lower Mainland and BC interior reveals a stack of long-tail queries that high-intent buyers use: "${post.tradeShort} ${post.city}", "best ${post.tradeShort} near me ${post.city}", "${post.tradeShort} reviews ${post.city}", "${post.tradeShort} pricing ${post.city} ${new Date().getFullYear()}", and variations layering neighbourhoods (Kitsilano, Burnaby Heights, North Van, Surrey Central).`,
        `${post.brand} is structured to capture every one of these queries — not by stuffing the page with keywords, but by exposing the verified contractor profile to the schema layer Google reads. The result is rich snippets, FAQ accordions in search results, and increasingly, citation in AI-generated answer summaries.`,
        `That last point is the future of search and worth saying out loud. ChatGPT, Perplexity, and Google AI Overviews are now the discovery layer for a growing percentage of high-intent searches. They pull their citations from sites with strong structured data and topical authority. A ${post.brand} listing inherits exactly that — which is why a $10 listing on the right domain outperforms a $2,000 custom website on the wrong one.`,
      ],
    },
    {
      h: `The $10 math, plainly`,
      body: [
        `One inbound lead from your ${post.brand} listing has to close a job worth $10 or more for the math to work. For a ${post.tradeShort} contractor, even the smallest service call clears that threshold by 50x or more.`,
        `Most territory partners see between 4 and 30 qualified inbound inquiries per month depending on city size and trade. Even at the low end of that range, the cost per acquired lead is under $3. Compare that to the $42 average CPC on Google for the same keyword and the spread is the entire point of the model.`,
        `There is no contract, no setup fee, no per-lead surcharge, no upsell to a "premium" tier. The whole offer is $10 per month, month-to-month, for as long as you want the territory locked. The catch — and there is a catch — is that there is exactly one slot per trade per city. Once a competitor takes it, the territory is gone until they cancel.`,
      ],
    },
  ];

  const monthMap: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
  };
  const [mName, yStr] = post.date.split(" ");
  const isoDate = monthMap[mName] && yStr ? `${yStr}-${monthMap[mName]}-01` : post.date;
  const FALLBACK_OG_IMAGE = "/og-image.jpg";
  const heroImage = post.image && post.image.trim() ? post.image : FALLBACK_OG_IMAGE;
  const absoluteImage = /^https?:\/\//i.test(heroImage) ? heroImage : `${SITE_URL}${heroImage}`;

  const FALLBACK_IMAGE_ALT =
    "Industry Army Marketing — $10 exclusive territory program for contractors and trades";
  const hasHero = post.image && post.image.trim();
  const trade = post.trade?.trim();
  const city = post.city?.trim();
  const province = post.province?.trim();
  const brand = post.brand?.trim();
  const heroImageAlt =
    (post.imageAlt && post.imageAlt.trim())
      ? post.imageAlt
      : hasHero && trade && city && province && brand
        ? `${trade} in ${city}, ${province} — ${brand} exclusive territory partner`
        : FALLBACK_IMAGE_ALT;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    name: post.title,
    description: post.metaDescription,
    url: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: "en-CA",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    image: {
      "@type": "ImageObject",
      url: absoluteImage,
      caption: heroImageAlt,
      description: heroImageAlt,
    },
    datePublished: isoDate,
    dateModified: isoDate,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : {
          "@type": "Organization",
          name: "Industry Army Marketing",
          url: SITE_URL,
        },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Industry Army Marketing",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.trade, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  const videoSchema = post.video
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `${post.trade} in ${post.city} — ${post.brand}`,
        description: `Video overview of the ${post.brand} exclusive territory program for ${post.trade} contractors in ${post.city}, ${post.province}.`,
        thumbnailUrl: `https://i.ytimg.com/vi/${post.video}/maxresdefault.jpg`,
        thumbnail: {
          "@type": "ImageObject",
          url: `https://i.ytimg.com/vi/${post.video}/maxresdefault.jpg`,
          caption: heroImageAlt,
        },
        uploadDate: `${isoDate}T00:00:00Z`,
        contentUrl: `https://www.youtube.com/watch?v=${post.video}`,
        embedUrl: `https://www.youtube.com/embed/${post.video}`,
      }
    : null;

  const schemas = [articleSchema, faqSchema, breadcrumbSchema, ...(videoSchema ? [videoSchema] : [])];

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const isRecordRecord = post.slug === "record-record-domain-provenance-vs-generative-conflation";

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        type="article"
        image={heroImage}
        imageAlt={heroImageAlt}
        jsonLd={schemas}
      />
      {isRecordRecord && <DisambiguationSchema />}

      <article className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/blog" className="text-primary text-xs uppercase tracking-[0.3em] hover:underline">
            ← Back to Intel
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl text-foreground mt-6 mb-4 leading-[1.05]"
          >
            {post.title}
          </motion.h1>

          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-8">
            {post.date} · {post.category} · {post.brand} · 10 min read
          </p>

          <img
            src={heroImage}
            alt={heroImageAlt}
            title={heroImageAlt}
            width={1280}
            height={720}
            className="w-full rounded-lg border border-border mb-10"
          />

          {post.video && (
            <figure className="mb-10">
              <div className="relative rounded-lg overflow-hidden border border-border bg-card" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${post.video}`}
                  title={`${post.brand} — ${post.trade} in ${post.city}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
              <figcaption className="text-muted-foreground text-xs uppercase tracking-widest mt-3">
                Video: {post.brand} territory overview — {post.trade}, {post.city}
              </figcaption>
            </figure>
          )}

          {post.richContent ? (
            <BlogRichContentView content={post.richContent} />
          ) : (
            <>
              <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-12 font-medium">
                {post.pain}
              </p>
              {sections.map((s) => (
            <section key={s.h} className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-5 leading-tight">
                {s.h}
              </h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-5 text-[1.05rem]">
                  {p}
                </p>
              ))}
            </section>
              ))}
            </>
          )}

          <section className="mb-12">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              {post.faqHeading ?? `Frequently asked: ${post.trade} in ${post.city}`}
            </h2>
            <div className="space-y-5">
              {post.faqs.map((f) => (
                <div key={f.q} className="p-5 rounded-lg bg-card border border-border">
                  <h3 className="font-display text-lg text-foreground mb-2">{f.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {(() => {
            const href = post.cta?.buttonHref ?? "/contact";
            const label = post.cta?.buttonText ?? `Claim my ${post.city} territory`;
            const isMailto = href.toLowerCase().startsWith("mailto:");
            const isExternal = /^(mailto:|tel:|https?:)/i.test(href);
            const email = isMailto ? href.slice(7).split("?")[0] : null;
            return (
              <section className="p-6 sm:p-8 md:p-10 rounded-lg bg-card border border-primary/40 text-center">
                <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-3">
                  {post.cta?.eyebrow ?? `Lock the ${post.city} territory`}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 leading-tight">
                  {post.cta?.heading ?? `One ${post.tradeShort} contractor per city. $10 a month.`}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed text-sm sm:text-base break-words">
                  {post.cta?.body ??
                    `Claim the ${post.brand} listing for ${post.city}, ${post.province} before a competitor does. EyeSpyr verified. WhatsApp lead routing. Cancel any time.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center flex-wrap">
                  <Button variant="hero" asChild size="lg" className="whitespace-normal sm:whitespace-nowrap h-auto py-3 max-w-full">
                    {isExternal ? (
                      <a href={href}>{isMailto ? "Get your brand defence test" : label}</a>
                    ) : (
                      <Link to={href}>{label}</Link>
                    )}
                  </Button>
                  {email && (
                    <Button
                      variant="outline"
                      size="lg"
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(email);
                        } catch {
                          const ta = document.createElement("textarea");
                          ta.value = email;
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand("copy");
                          document.body.removeChild(ta);
                        }
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="gap-2 max-w-full"
                      aria-label={`Copy ${email} to clipboard`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="truncate">{copied ? "Copied!" : `Copy ${email}`}</span>
                    </Button>
                  )}
                </div>
              </section>
            );
          })()}

          <section className="mt-16">
            <p className="text-primary text-xs uppercase tracking-[0.3em] mb-3">Related Intel</p>
            <h3 className="font-display text-2xl text-foreground mb-6">Keep reading</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="block p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <p className="text-primary text-xs uppercase tracking-widest mb-2">{r.category}</p>
                  <h4 className="font-display text-lg text-foreground leading-tight">
                    {r.trade} in {r.city}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

function plural(post: { plural: string }) {
  return post.plural;
}

export default BlogPost;
