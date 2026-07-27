import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { COMING_SOON_EVENT, type ComingSoonDetail } from "@/lib/comingSoon";

const DEFAULT_TITLE = "Checkout Coming Soon";
const DEFAULT_MESSAGE =
  "Payments aren't live yet. Reach out to lock your slot, or read the latest on the blog.";

const ComingSoonModal = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ComingSoonDetail>({});

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ComingSoonDetail>;
      setDetail(custom.detail ?? {});
      setOpen(true);
    };
    window.addEventListener(COMING_SOON_EVENT, handler as EventListener);
    return () => window.removeEventListener(COMING_SOON_EVENT, handler as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="coming-soon-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2147483645] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-lg border border-primary/50 bg-card shadow-[0_0_40px_hsl(72_100%_50%_/_0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fake-checkout header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/70" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  secure · checkout
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground text-lg leading-none px-2"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-8">
              <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-semibold mb-3">
                Coming Soon
              </p>
              <h2 id="coming-soon-title" className="font-display text-3xl md:text-4xl text-foreground leading-tight">
                {detail.title || DEFAULT_TITLE}
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {detail.message || DEFAULT_MESSAGE}
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href="mailto:partnerships@industryarmymarketing.com?subject=Territory%20Interest"
                  className="flex items-center justify-between rounded border border-primary/60 bg-primary/5 px-4 py-3 text-sm hover:bg-primary/10 transition-colors"
                >
                  <span className="uppercase tracking-widest text-[10px] text-muted-foreground">
                    Partnerships
                  </span>
                  <span className="font-mono text-primary text-xs md:text-sm">
                    partnerships@industryarmymarketing.com
                  </span>
                </a>
                <Link
                  to="/blog"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded border border-border bg-secondary/40 px-4 py-3 text-sm hover:bg-secondary/70 transition-colors"
                >
                  <span className="uppercase tracking-widest text-[10px] text-muted-foreground">
                    Or
                  </span>
                  <span className="text-foreground">Join us again on the blog →</span>
                </Link>
              </div>

              <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center">
                Est. May 13, 2015 · Industry Army Marketing
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;