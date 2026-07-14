import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Share2, Repeat, Sparkles, Tv, Globe } from "lucide-react";
import heroAsset from "@/assets/services/social-media-hero.jpg.asset.json";

const platforms = [
  { name: "X (Twitter)", detail: "Real-time posts, thread expansion, auto-hashtag targeting." },
  { name: "Instagram", detail: "Feed image + Reels re-cut from source video, story carousels." },
  { name: "TikTok", detail: "Short-form video with captions, trending-audio matching." },
  { name: "YouTube Shorts", detail: "Vertical cutdowns with title/description SEO baked in." },
  { name: "LinkedIn", detail: "Long-form B2B posts, article syndication, company page updates." },
  { name: "Threads", detail: "Native Meta text posts with cross-links back to Instagram." },
  { name: "Facebook", detail: "Page posts, event boosts, marketplace-friendly formatting." },
  { name: "Pinterest", detail: "Pin generation for how-to and before-after visual trades." },
  { name: "Bluesky", detail: "Federated posts with AT Protocol handle support." },
  { name: "Mastodon", detail: "Federated posts to the largest indie instances." },
];

const faqs = [
  {
    q: "What is TALC.tv?",
    a: "TALC.tv is the Industry Army Marketing broadcast layer — a syndication network we operate that fans a single post out to every major social platform simultaneously. Post once, appear everywhere the same day. TALC is not a scheduler; it is a multi-format re-cutter, so a single upload becomes a Reel, a Short, a TikTok, an X thread, and a LinkedIn post in one operation.",
  },
  {
    q: "What is 'sprinkling' and why does it matter?",
    a: "Sprinkling is our name for cadence-controlled release across platforms. Instead of dumping the same post everywhere in the same hour (which every algorithm flags), we sprinkle staggered variants over 24-72 hours — different hooks, different thumbnails, different first-lines — so each platform reads them as native content. Reach goes up, algorithmic penalty goes down.",
  },
  {
    q: "Which platforms do you actually publish to?",
    a: "X, Instagram, TikTok, YouTube Shorts, LinkedIn, Threads, Facebook, Pinterest, Bluesky, and Mastodon are live today. We add every platform that opens a stable public API — currently evaluating Rednote and Lemon8. You get the platforms your buyers use, without paying for the ones they do not.",
  },
  {
    q: "Do I need to give you my passwords?",
    a: "No. Every connection is via official OAuth API keys — the same secure token flow used by Buffer, Hootsuite, and Later. You grant posting permission from inside each platform's own settings, and you can revoke it at any time without touching a password.",
  },
  {
    q: "How is this priced?",
    a: "TALC.tv syndication is a $10 add-on per placement when bundled with any IAM service, or a flat $99/month standalone for unlimited platform syndication. No per-post fee, no per-platform surcharge.",
  },
  {
    q: "Does social media actually generate leads for contractors?",
    a: "Yes — but not the way influencer marketing works. For contractors and service pros, social is a trust layer, not a discovery layer. Buyers find you on Google, then check your Instagram or LinkedIn to verify you are real. A steady TALC-syndicated presence turns that verification step from a doubt into a green light.",
  },
  {
    q: "Do the posts count as backlinks?",
    a: "Every TALC syndication cross-links back to your site with a dofollow-friendly URL where the platform permits it (LinkedIn, Bluesky, Mastodon, Pinterest). Where platforms strip dofollow (X, Instagram, TikTok), we still gain referral traffic and trust signals from real user clicks.",
  },
  {
    q: "Can I opt out of a specific platform?",
    a: "Yes. You control the platform mix. If you do not want your business on TikTok, we skip it. Toggle any platform on or off from your dashboard.",
  },
];

const SocialMedia = () => {
  const path = "/services/social-media";
  const image = heroAsset.url;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Social Media Syndication via TALC.tv",
      serviceType: "Social Media Marketing",
      provider: { "@type": "Organization", name: "Industry Army Marketing", url: "https://www.industryarmymarketing.com" },
      description: "One-push, multi-platform social syndication for contractors and service pros. TALC.tv broadcasts across X, Instagram, TikTok, YouTube, LinkedIn, Threads and more.",
      image: `https://www.industryarmymarketing.com${image}`,
      offers: { "@type": "Offer", price: "10.00", priceCurrency: "USD", description: "Per-placement social syndication add-on" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.industryarmymarketing.com/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://www.industryarmymarketing.com/services" },
        { "@type": "ListItem", position: 3, name: "Social Media", item: `https://www.industryarmymarketing.com${path}` },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title="Social Media Syndication — TALC.tv Powers 10+ Platforms | IAM"
        description="One push, ten+ platforms. TALC.tv syndicates your content across X, Instagram, TikTok, YouTube Shorts, LinkedIn, Threads, Facebook, Pinterest, Bluesky and Mastodon. Sprinkling cadence, native formatting, real leads."
        path={path}
        image={image}
        imageAlt="TALC.tv broadcast tower fanning signals to ten social platforms"
        jsonLd={jsonLd}
      />
      <PageHeader
        eyebrow="Service · Social Media"
        title="Social Media"
        highlight="Powered by TALC.tv"
        description="Post once. Land on X, Instagram, TikTok, YouTube Shorts, LinkedIn, Threads and every platform with an open API. Native formatting on each, sprinkled cadence, real leads."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Add TALC to My Stack</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/eyespyr">See Eyespyr Upsells</Link></Button>
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 max-w-4xl py-16 space-y-14">
        <motion.img
          src={image}
          alt="TALC.tv broadcast tower with neon green signal beams reaching six social platform orbs"
          width={1024}
          height={1024}
          className="w-full rounded-lg border border-border shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">The problem with social media for trades</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Contractors do not have time to run six social accounts. Neither do plumbers, electricians,
            accountants, or wedding vendors. But every buyer who lands on your site quietly checks — do
            you post? Do you have followers? Do you look like a going concern, or a ghost? If the answer
            is ghost, they close the tab and call the next contractor.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Doing it manually across ten platforms is a full-time job nobody in the trades is going to
            take. Hiring a social media manager runs $2,000-$5,000 a month before you have posted a
            single thing. And most managers post the same PDF-brochure content to every platform,
            which every algorithm punishes.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That is why we built TALC.tv.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">TALC.tv — the broadcast layer</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-primary">TALC.tv</strong> is the Industry Army Marketing broadcast
            infrastructure. It is not a scheduler and not a Buffer clone. It is a multi-format re-cutter
            that takes a single upload — a blog post, a job-site photo, a testimonial video, a service
            announcement — and fans it into native content for every platform your audience uses.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One video becomes a TikTok, a YouTube Short, an Instagram Reel, an X post with captioned
            preview, a LinkedIn native video, and a Facebook page post. One blog post becomes an X
            thread, a LinkedIn article, a Threads teaser, a Pinterest pin, and a Bluesky post. All in
            the same operation, all with platform-appropriate cropping, hashtags, and hook lines.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Sprinkling — cadence that beats the algorithm</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every platform's spam filter will punish the same post appearing everywhere in the same
            hour. That is why TALC does not fire all at once. We <em>sprinkle</em> — staggered posts
            over 24-72 hours, each with a different hook line, different thumbnail, different first
            sentence. To each platform's algorithm, it looks like native, considered content — because
            it is.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result: reach goes up, algorithmic penalty goes down, and the same source content earns
            three to five times the impressions of a naive multi-post approach.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Platforms we syndicate to</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every platform with a stable public API. As of today:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg">{p.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-4">Adding: Rednote, Lemon8, and any platform that opens a public post API.</p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">How TALC works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Radio, title: "Ingest", body: "Upload one source asset — video, image, blog post, or job announcement. Or auto-pull from your IAM site's RSS feed." },
              { icon: Repeat, title: "Re-cut", body: "TALC generates platform-native variants — aspect ratios, hooks, hashtags, captions — with human review on your dashboard before publish." },
              { icon: Sparkles, title: "Sprinkle", body: "Posts fire on a staggered 24-72 hour cadence, tuned per platform's peak-engagement window. You watch impressions climb from one dashboard." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-lg bg-card border border-border">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-4">Dofollow where it counts</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every IAM channel is dofollow-first — social included. Where a platform supports dofollow
            links (LinkedIn, Bluesky, Mastodon, Pinterest), every TALC post carries a real link back
            to your site. Where the platform strips dofollow by policy (X, Instagram, TikTok), you
            still gain referral traffic, trust signals from real users, and cross-platform authority.
            The pipe is always pointed at your front door.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-xl mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center py-10 border-t border-border">
          <Tv className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl mb-3">Broadcast once. Land everywhere.</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Add TALC.tv to your stack for $10 per placement, or $99/month standalone.</p>
          <Button variant="hero" size="lg" asChild><Link to="/contact">Turn On TALC</Link></Button>
        </section>
      </article>
    </Layout>
  );
};

export default SocialMedia;