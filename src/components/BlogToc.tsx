import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

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
  const [focusIndex, setFocusIndex] = useState(0);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

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

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    // Move a11y focus to the section heading so screen readers announce it.
    const prevTabIndex = el.getAttribute("tabindex");
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    if (prevTabIndex === null) {
      // Cleanup after blur so we don't leave tabindex on headings permanently.
      el.addEventListener(
        "blur",
        () => el.removeAttribute("tabindex"),
        { once: true },
      );
    }
    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
    setActiveId(id);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string, idx: number) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setFocusIndex(idx);
    scrollToId(id);
  };

  // Roving tabindex: only one link is tab-reachable at a time; arrow keys
  // move focus between links, Home/End jump to ends.
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, idx: number) => {
    let next = idx;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (idx + 1) % items.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (idx - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setFocusIndex(next);
    linkRefs.current[next]?.focus();
  };

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-lg border border-border bg-card/70 p-5"
      data-testid="blog-toc"
    >
      <p
        id="blog-toc-label"
        className="text-primary text-[10px] uppercase tracking-[0.3em] font-semibold mb-3"
      >
        On this page
      </p>
      <ol
        aria-labelledby="blog-toc-label"
        className="space-y-2 list-decimal pl-5 text-sm"
      >
        {items.map((it) => {
          const active = activeId === it.id;
          const idx = items.indexOf(it);
          const tabIndex = idx === focusIndex ? 0 : -1;
          return (
            <li
              key={it.id}
              className={active ? "marker:text-primary marker:font-bold" : undefined}
            >
              <a
                href={`#${it.id}`}
                ref={(el) => (linkRefs.current[idx] = el)}
                tabIndex={tabIndex}
                onClick={(e) => handleClick(e, it.id, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onFocus={() => setFocusIndex(idx)}
                aria-current={active ? "location" : undefined}
                data-active={active ? "true" : undefined}
                className={
                  "inline-block rounded-sm underline-offset-2 transition-colors " +
                  "focus:outline-none focus-visible:outline-none " +
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
                  "focus-visible:ring-offset-background " +
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