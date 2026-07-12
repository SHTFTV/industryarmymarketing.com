import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  Crosshair,
  Link2,
  Clock,
  RotateCcw,
  Network,
  Layers,
  Target,
  ArrowRight,
  Wallet,
  MessageCircleQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { Button } from "@/components/ui/button";
import { track, recordCtaAttribution } from "@/lib/analytics";

type Row = {
  label: string;
  Icon: LucideIcon;
  get: (p: typeof SEO_PACKAGES[number]) => string | number;
};

const rows: Row[] = [
  { label: "Total link placements", Icon: Link2, get: (p) => p.deliverables },
  { label: "Deployment window", Icon: Clock, get: (p) => `${p.timelineDays} days` },
  { label: "Revisions included", Icon: RotateCcw, get: (p) => p.revisions },
  { label: "IAM network placements", Icon: Network, get: (p) => p.iam.length },
  { label: "Link-building line items", Icon: Layers, get: (p) => p.linkBuilding.length },
];

const SeoPackagesCompare = () => {
  const prefersReducedMotion = useReducedMotion();
  const fadeIn = prefersReducedMotion
    ? { initial: false, whileInView: undefined, transition: undefined }
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
      };
  return (
    <section
      id="seo-packages-compare"
      aria-labelledby="seo-packages-compare-heading"
      className="relative py-24 overflow-hidden bg-background border-y border-border"
    >
      {/* Tactical grid backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none motion-reduce:opacity-40"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative container mx-auto px-4">
        <motion.div
          {...fadeIn}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            <Crosshair size={14} />
            <span>Side-by-Side</span>
            <Crosshair size={14} />
          </div>
          <h2
            id="seo-packages-compare-heading"
            className="font-display text-5xl md:text-7xl text-foreground leading-none motion-reduce:[text-shadow:none]"
          >
            Compare the{" "}
            <span className="text-primary [text-shadow:0_0_30px_hsl(var(--primary)/0.6)] motion-reduce:[text-shadow:none]">
              Arsenal
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-5 text-base">
            Three loadouts. One target: the top of Google. Line them up and pick
            your firepower.
          </p>
        </motion.div>

        {/* Budget promise band */}
        <motion.div
          {...fadeIn}
          className="mx-auto max-w-4xl mb-14 rounded-xl border border-primary/30 bg-card/60 p-6 md:p-8 shadow-[0_0_40px_-15px_hsl(var(--primary)/0.4)] motion-reduce:shadow-none"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 md:border-r md:border-border md:pr-6">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
                <Wallet size={22} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-primary uppercase tracking-[0.25em] text-[10px] font-semibold">
                  What's your budget?
                </p>
                <p className="font-display text-2xl md:text-3xl text-foreground leading-tight">
                  We'll spend it.
                </p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-foreground/90 text-base leading-relaxed">
                In the right places, of course — the domains, verticals, and
                anchors that actually move rankings for your niche.
              </p>
              <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                <MessageCircleQuestion size={14} className="text-primary" aria-hidden="true" />
                Tell us about your business and we'll answer honestly — no fluff, no filler.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Semantic table for a11y; visually rendered as neon spec-sheet columns */}
        <table
          className="w-full border-collapse"
          aria-describedby="seo-packages-compare-heading"
        >
          <caption className="sr-only">
            Feature comparison of Bullets, Boom, and Bombs SEO packages.
          </caption>

          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Feature
              </th>
              {SEO_PACKAGES.map((p) => (
                <th
                  key={p.slug}
                  scope="col"
                  className="p-0 align-bottom"
                  style={{ width: `${100 / SEO_PACKAGES.length}%` }}
                >
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { delay: 0.05 * SEO_PACKAGES.indexOf(p) }
                    }
                    className={`relative mx-2 rounded-t-xl p-6 text-left border border-b-0 ${
                      p.featured
                        ? "border-primary bg-gradient-to-b from-primary/15 to-transparent shadow-[0_-10px_40px_-10px_hsl(var(--primary)/0.5)] motion-reduce:shadow-none"
                        : "border-border bg-card/60"
                    }`}
                  >
                    {p.featured && (
                      <span className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded">
                        Most Popular
                      </span>
                    )}
                    <div className="text-3xl mb-3" aria-hidden="true">
                      {p.icon}
                    </div>
                    <div
                      className={`font-display text-4xl leading-none ${
                        p.featured ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {p.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-sans font-normal">
                      {p.tagline}
                    </div>
                    <div className="flex items-baseline gap-1 mt-5 font-sans">
                      <span
                        className={`font-display text-5xl ${
                          p.featured ? "text-primary" : "text-foreground"
                        }`}
                      >
                        ${p.price}
                      </span>
                      <span className="text-muted-foreground text-xs uppercase tracking-widest ml-1">
                        one-time
                      </span>
                    </div>
                  </motion.div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={row.label} className="group">
                <th
                  scope="row"
                  className="hidden md:table-cell w-[220px] p-4 text-left align-middle border-b border-border/40"
                >
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground font-normal">
                    <row.Icon
                      size={16}
                      className="text-primary/80 shrink-0"
                      aria-hidden="true"
                    />
                    {row.label}
                  </div>
                </th>
                {SEO_PACKAGES.map((p) => (
                  <td
                    key={p.slug}
                    className={`p-4 align-middle text-center md:text-left border-b border-border/40 border-x mx-2 motion-safe:transition-colors ${
                      p.featured
                        ? "bg-primary/5 border-primary/30 group-hover:bg-primary/10"
                        : "bg-card/30 group-hover:bg-card/60"
                    }`}
                  >
                    <div className="md:hidden text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center justify-center gap-2">
                      <row.Icon size={12} aria-hidden="true" /> {row.label}
                    </div>
                    <span
                      className={`font-display text-3xl md:text-4xl leading-none ${
                        p.featured ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {row.get(p)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}

            {/* Best for */}
            <tr>
              <th
                scope="row"
                className="hidden md:table-cell w-[220px] p-4 text-left align-top border-b border-border/40"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground font-normal">
                  <Target size={16} className="text-primary/80 shrink-0" aria-hidden="true" />
                  Best for
                </div>
              </th>
              {SEO_PACKAGES.map((p) => (
                <td
                  key={p.slug}
                  className={`p-4 align-top border-b border-border/40 border-x ${
                    p.featured
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card/30"
                  }`}
                >
                  <div className="md:hidden text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                    <Target size={12} aria-hidden="true" /> Best for
                  </div>
                  <ul className="space-y-2">
                    {p.bestFor.slice(0, 3).map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-foreground/90">
                        <Check
                          size={14}
                          className="text-primary shrink-0 mt-1"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* CTA row */}
            <tr>
              <td className="hidden md:table-cell" />
              {SEO_PACKAGES.map((p) => (
                <td
                  key={p.slug}
                  className={`p-4 pt-6 align-top border-x rounded-b-xl ${
                    p.featured
                      ? "bg-primary/5 border-primary/30 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)] motion-reduce:shadow-none"
                      : "bg-card/30 border-border"
                  }`}
                >
                  <Button
                    asChild
                    variant={p.featured ? "hero" : "outline"}
                    size="lg"
                    className="w-full uppercase tracking-widest text-xs group/cta focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Link
                      to={`/seo-packages/${p.slug}`}
                      aria-label={`Compare and view ${p.name} SEO package — ${p.tagline}, $${p.price}`}
                      data-testid={`home-compare-cta-${p.slug}`}
                      onClick={() => {
                        void track("home_package_cta_click", {
                          packageSlug: p.slug,
                          meta: {
                            label: p.name,
                            price: p.price,
                            source: "home_seo_packages_compare",
                          },
                        });
                        recordCtaAttribution({
                          event: "home_package_cta_click",
                          label: p.name,
                          source: "home_seo_packages_compare",
                          target: `/seo-packages/${p.slug}`,
                          packageSlug: p.slug,
                          price: p.price,
                        });
                      }}
                    >
                      Deploy {p.name}
                      <ArrowRight
                        size={14}
                        className="ml-2 motion-safe:transition-transform motion-safe:group-hover/cta:translate-x-1"
                      />
                    </Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <SeoPackagesCompareFaq fadeIn={fadeIn} />
      </div>
    </section>
  );
};

export default SeoPackagesCompare;

const FAQS: { q: string; a: string }[] = [
  {
    q: "What if my budget doesn't fit a tier exactly?",
    a: "Tell us your number. We'll deploy in the right places — domains, verticals, and anchors that actually move your rankings — instead of padding a package.",
  },
  {
    q: "How fast will I see results?",
    a: "Every package deploys in 14 days. Indexing and ranking movement typically shows in weeks 3–8, depending on niche competition and target city size.",
  },
  {
    q: "Do you work with my niche?",
    a: "If you're a contractor, service pro, wedding/roofing/plumbing/electrical business, or local operator, yes. If your niche is unusual, ask — we'll answer honestly.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Every package is one-time. Come back when you want another push, or scale to Boom or Bombs when your budget grows.",
  },
];

function SeoPackagesCompareFaq({
  fadeIn,
}: {
  fadeIn: Record<string, unknown>;
}) {
  return (
    <motion.aside
      {...fadeIn}
      aria-labelledby="seo-packages-compare-faq-heading"
      className="mt-16 mx-auto max-w-4xl rounded-xl border border-border bg-card/40 p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
          <MessageCircleQuestion size={18} className="text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-primary uppercase tracking-[0.25em] text-[10px] font-semibold">
            Answers about your business
          </p>
          <h3
            id="seo-packages-compare-faq-heading"
            className="font-display text-2xl md:text-3xl text-foreground leading-tight"
          >
            Budget questions, answered.
          </h3>
        </div>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {FAQS.map((f) => (
          <div key={f.q}>
            <dt className="text-foreground font-semibold text-sm mb-1">{f.q}</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed">{f.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-border pt-5">
        <Button
          asChild
          variant="hero"
          size="lg"
          className="uppercase tracking-widest text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Link
            to="/contact"
            aria-label="Tell us your budget and get honest answers about your business"
            data-testid="home-compare-faq-cta-contact"
            onClick={() =>
              void track("home_compare_faq_cta_click", {
                meta: { label: "Tell us your budget", source: "home_seo_packages_compare_faq", target: "/contact" },
              })
            }
          >
            Tell us your budget
            <ArrowRight size={14} className="ml-2 motion-safe:transition-transform" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="uppercase tracking-widest text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Link
            to="/seo-packages"
            aria-label="Compare all SEO packages in detail"
            data-testid="home-compare-faq-cta-compare"
            onClick={() =>
              void track("home_compare_faq_cta_click", {
                meta: { label: "Compare all packages", source: "home_seo_packages_compare_faq", target: "/seo-packages" },
              })
            }
          >
            Compare all packages
          </Link>
        </Button>
      </div>
    </motion.aside>
  );
}
