import { useEffect, useMemo, useState } from "react";

export const slugifyHeading = (h: string) =>
  h
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

type Props = {
  headings: string[];
};

const BlogToc = ({ headings }: Props) => {
  const items = useMemo(
    () =>
      headings
        .filter((h) => h && h.trim().length > 0)
        .map((h) => ({ text: h, id: slugifyHeading(h) })),
    [headings],
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // Track which section headings are in view; pick the top-most visible one.
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.boundingClientRect.top);
          } else {
            visible.delete(e.target.id);
          }
        });
        if (visible.size > 0) {
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActiveId(top);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-lg border border-border bg-card/70 p-5"
      data-testid="blog-toc"
    >
      <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-semibold mb-3">
        On this page
      </p>
      <ol className="space-y-2 list-decimal pl-5 text-sm">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <li
              key={it.id}
              className={active ? "marker:text-primary marker:font-bold" : undefined}
            >
              <a
                href={`#${it.id}`}
                aria-current={active ? "location" : undefined}
                data-active={active ? "true" : undefined}
                className={
                  "underline-offset-2 transition-colors " +
                  (active
                    ? "text-primary font-semibold underline decoration-primary"
                    : "text-foreground/90 hover:text-primary underline decoration-primary/30 hover:decoration-primary")
                }
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BlogToc;