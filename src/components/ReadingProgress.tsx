import { useEffect, useState } from "react";
import { slugifyHeading } from "@/components/BlogToc";

type Props = {
  /** Selector for the article container whose scroll progress is tracked. */
  targetSelector?: string;
  /** Heading texts (in document order) to resolve the active section. */
  headings: string[];
};

/**
 * Fixed-top progress bar for a long-form article. Shows how far the reader
 * has scrolled through the article body and — when a section is in view —
 * the current section label to sync with the TOC.
 */
const ReadingProgress = ({ targetSelector = "article", headings }: Props) => {
  const [progress, setProgress] = useState(0);
  const [activeText, setActiveText] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.querySelector<HTMLElement>(targetSelector);
    if (!target) return;

    const update = () => {
      const rect = target.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const total = Math.max(1, rect.height - viewportH);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      setProgress((scrolled / total) * 100);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetSelector]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    const map = new Map<string, string>();
    headings
      .filter((h) => h && h.trim().length > 0)
      .forEach((h) => map.set(slugifyHeading(h), h));

    const els = [...map.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

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
          setActiveText(map.get(top) ?? null);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div
      className="fixed left-0 right-0 top-0 z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div className="h-1 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%`, boxShadow: "0 0 12px hsl(72 100% 50% / 0.6)" }}
        />
      </div>
      {activeText && pct > 1 && pct < 99 && (
        <div className="hidden md:flex justify-center">
          <div className="mt-2 rounded-full border border-primary/30 bg-background/85 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary shadow-sm">
            <span className="text-muted-foreground mr-2">Reading</span>
            <span className="text-foreground normal-case tracking-normal">
              {activeText}
            </span>
          </div>
        </div>
      )}
      {/* Accessible progress announcement for screen readers */}
      <span
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="sr-only"
      >
        {Math.round(pct)}% read
      </span>
    </div>
  );
};

export default ReadingProgress;