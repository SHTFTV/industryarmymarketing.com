import { Link } from "react-router-dom";
import type { BlogRichContent as RichContent } from "@/data/blogPosts";

const FOOTNOTE_RE = /\[\^([a-z0-9_-]+)\]/gi;

const renderWithFootnotes = (text: string, ids: string[]) => {
  const nodes: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  FOOTNOTE_RE.lastIndex = 0;
  while ((match = FOOTNOTE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const id = match[1];
    const num = ids.indexOf(id) + 1;
    if (num > 0) {
      nodes.push(
        <sup key={`${id}-${match.index}`} className="text-primary">
          <a
            href={`#fn-${id}`}
            id={`fnref-${id}`}
            className="ml-0.5 px-1 rounded bg-primary/10 hover:bg-primary/20 no-underline text-xs"
            aria-label={`Footnote ${num}`}
          >
            {num}
          </a>
        </sup>,
      );
    } else {
      nodes.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

const isExternal = (href: string) => /^https?:\/\//i.test(href);

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

const BlogRichContentView = ({ content }: { content: RichContent }) => {
  const ids = (content.footnotes ?? []).map((f) => f.id);

  return (
    <div className="blog-rich-content">
      {content.intro && (
        <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-12 font-medium">
          {renderWithFootnotes(content.intro, ids)}
        </p>
      )}

      {content.sections.map((section, i) => (
        <section key={i} className="mb-12">
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-5 leading-tight">
            {section.heading}
          </h2>
          {section.paragraphs.map((p, j) => (
            <p key={j} className="text-muted-foreground leading-relaxed mb-5 text-[1.05rem]">
              {renderWithFootnotes(p, ids)}
            </p>
          ))}
          {section.image && (
            <figure className="my-8">
              {section.image.href ? (
                <SmartLink href={section.image.href} className="block">
                  <img
                    src={section.image.src}
                    alt={section.image.alt}
                    title={section.image.alt}
                    loading="lazy"
                    className="w-full rounded-lg border border-border"
                  />
                </SmartLink>
              ) : (
                <img
                  src={section.image.src}
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