import { useMemo } from "react";

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

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-lg border border-border bg-card/70 p-5"
    >
      <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-semibold mb-3">
        On this page
      </p>
      <ol className="space-y-2 list-decimal pl-5 text-sm">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-foreground/90 hover:text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BlogToc;