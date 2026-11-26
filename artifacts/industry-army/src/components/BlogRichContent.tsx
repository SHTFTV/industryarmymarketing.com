import { Link } from "react-router-dom";
import type { BlogRichContent as RichContent } from "@/data/blogPosts";
import { slugifyHeading } from "@/components/BlogToc";
import BlogVideoBanner from "@/components/BlogVideoBanner";
import BlogMarkdown from "@/components/BlogMarkdown";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

const resolveImageSrc = (src: string) => {
  if (src.startsWith("/__l5e/assets-v1/")) {
    return `https://www.industryarmymarketing.com${src}`;
  }

  return src;
};

const SmartLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) =>
  isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link to={href} className={className}>
      {children}
    </Link>
  );

const BlogRichContentView = ({
  content,
  afterIntro,
}: {
  content: RichContent;
  afterIntro?: React.ReactNode;
}) => {
  const ids = (content.footnotes ?? []).map((f) => f.id);
  const topEvidenceSections = content.sections.filter(
    (section) => section.image && /^exhibit\b/i.test(section.heading),
  );

  return (
    <div className={`blog-rich-content ${content.theme === "hive" ? "rounded-xl bg-[#faf6eb] p-5 sm:p-8 [&_h2]:font-serif" : ""}`} style={content.theme === "hive" ? { "--foreground": "145 32% 17%", "--muted-foreground": "130 10% 34%", "--primary": "36 71% 33%", "--card": "48 40% 94%", "--border": "80 16% 80%" } as React.CSSProperties : undefined}>
      {content.intro && (
        <div className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-12 font-medium">
          <BlogMarkdown text={content.intro} footnoteIds={ids} />
        </div>
      )}

      {topEvidenceSections.length > 0 && (
        <section className="mb-12 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-5 leading-tight">
            Evidence screenshots
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {topEvidenceSections.map((section) => {
              const image = section.image;
              if (!image) return null;

              const figure = (
                <figure className="overflow-hidden rounded-lg border border-border bg-card">
                  <img
                    src={resolveImageSrc(image.src)}
                    alt={image.alt}
                    title={image.alt}
                    loading="eager"
                    className="w-full bg-background object-contain"
                  />
                  <figcaption className="p-3 text-muted-foreground text-xs uppercase tracking-widest">
                    {image.caption ?? section.heading}
                  </figcaption>
                </figure>
              );

              return image.href ? (
                <SmartLink key={section.heading} href={image.href} className="block">
                  {figure}
                </SmartLink>
              ) : (
                <div key={section.heading}>{figure}</div>
              );
            })}
          </div>
        </section>
      )}

      {afterIntro}

      {content.sections.map((section, i) => (
        <section key={i} className="mb-12">
          {section.video && <BlogVideoBanner banner={section.video} />}
          <h2
            id={slugifyHeading(section.heading)}
            className="font-display text-2xl md:text-3xl text-foreground mb-5 leading-tight scroll-mt-24"
          >
            {section.heading}
          </h2>
          {section.paragraphs.map((p, j) => (
            <div key={j} className="text-muted-foreground leading-relaxed mb-5 text-[1.05rem]">
              <BlogMarkdown text={p} footnoteIds={ids} />
            </div>
          ))}
          {section.image && (
            <figure className="my-8">
              {section.image.href ? (
                <SmartLink href={section.image.href} className="block">
                  <img
                    src={resolveImageSrc(section.image.src)}
                    alt={section.image.alt}
                    title={section.image.alt}
                    loading="lazy"
                    className="w-full rounded-lg border border-border"
                  />
                </SmartLink>
              ) : (
                <img
                  src={resolveImageSrc(section.image.src)}
                  alt={section.image.alt}
                  title={section.image.alt}
                  loading="lazy"
                  className="w-full rounded-lg border border-border"
                />
              )}
              {section.image.caption && (
                <figcaption className="text-muted-foreground text-xs uppercase tracking-widest mt-3">
                  {section.image.caption}
                </figcaption>
              )}
            </figure>
          )}
        </section>
      ))}

      {content.timeline && content.timeline.length > 0 && (
        <section className="mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            Timeline
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6 leading-tight">
            The receipts, in order
          </h2>
          <ol className="border-l-2 border-primary/40 pl-6 space-y-6">
            {content.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/60" />
                <p className="text-primary text-xs uppercase tracking-widest mb-1">{t.date}</p>
                <h3 className="font-display text-lg text-foreground mb-1">{t.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.footnotes && content.footnotes.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl text-foreground mb-4">Footnotes</h2>
          <ol className="space-y-2 list-decimal pl-5 text-sm text-muted-foreground">
            {content.footnotes.map((f) => (
              <li key={f.id} id={`fn-${f.id}`} className="leading-relaxed">
                {f.href ? (
                  <SmartLink href={f.href} className="hover:text-primary underline underline-offset-2">
                    {f.text}
                  </SmartLink>
                ) : (
                  f.text
                )}{" "}
                <a
                  href={`#fnref-${f.id}`}
                  className="text-primary text-xs no-underline hover:underline"
                  aria-label="Back to reference"
                >
                  ↩
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.sources && content.sources.length > 0 && (
        <section className="mb-12 p-5 rounded-lg bg-card border border-border">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            Sources &amp; further reading
          </p>
          <ul className="space-y-2">
            {content.sources.map((s) => (
              <li key={s.href} className="text-sm">
                <SmartLink
                  href={s.href}
                  className="text-foreground hover:text-primary underline underline-offset-2"
                >
                  {s.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default BlogRichContentView;
