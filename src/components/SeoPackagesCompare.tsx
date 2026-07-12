import { motion } from "framer-motion";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

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
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            <Crosshair size={14} />
            <span>Side-by-Side</span>
            <Crosshair size={14} />
          </div>
          <h2
            id="seo-packages-compare-heading"
            className="font-display text-5xl md:text-7xl text-foreground leading-none"
          >
            Compare the{" "}
            <span className="text-primary [text-shadow:0_0_30px_hsl(var(--primary)/0.6)]">
              Arsenal
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-5 text-base">
            Three loadouts. One target: the top of Google. Line them up and pick
            your firepower.
          </p>
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * SEO_PACKAGES.indexOf(p) }}
                    className={`relative mx-2 rounded-t-xl p-6 text-left border border-b-0 ${
                      p.featured
                        ? "border-primary bg-gradient-to-b from-primary/15 to-transparent shadow-[0_-10px_40px_-10px_hsl(var(--primary)/0.5)]"
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
                    className={`p-4 align-middle text-center md:text-left border-b border-border/40 border-x mx-2 ${
                      p.featured
                        ? "bg-primary/5 border-primary/30 group-hover:bg-primary/10"
                        : "bg-card/30 group-hover:bg-card/60"
                    } transition-colors`}
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
                      ? "bg-primary/5 border-primary/30 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]"
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
                      onClick={() =>
                        void track("home_package_cta_click", {
                          packageSlug: p.slug,
                          meta: {
                            label: p.name,
                            price: p.price,
                            source: "home_seo_packages_compare",
                          },
                        })
                      }
                    >
                      Deploy {p.name}
                      <ArrowRight
                        size={14}
                        className="ml-2 transition-transform group-hover/cta:translate-x-1"
                      />
                    </Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SeoPackagesCompare;
