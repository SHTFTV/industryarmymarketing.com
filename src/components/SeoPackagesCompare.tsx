import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

const rows: { label: string; get: (p: typeof SEO_PACKAGES[number]) => string | number }[] = [
  { label: "Price (one-time)", get: (p) => `$${p.price}` },
  { label: "Total link placements", get: (p) => p.deliverables },
  { label: "Timeline", get: (p) => `${p.timelineDays} days` },
  { label: "Revisions", get: (p) => p.revisions },
  { label: "IAM network placements", get: (p) => p.iam.length },
  { label: "Link-building line items", get: (p) => p.linkBuilding.length },
];

const SeoPackagesCompare = () => {
  return (
    <section
      id="seo-packages-compare"
      aria-labelledby="seo-packages-compare-heading"
      className="py-24 bg-card/30 border-y border-border"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">
            Side-by-Side
          </p>
          <h2
            id="seo-packages-compare-heading"
            className="font-display text-5xl md:text-6xl text-foreground"
          >
            Compare Packages
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Bullets, Boom, Bombs — line them up and pick your firepower.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-left" aria-describedby="seo-packages-compare-heading">
            <caption className="sr-only">
              Feature comparison of Bullets, Boom, and Bombs SEO packages.
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-4 text-xs uppercase tracking-widest text-muted-foreground">
                  Feature
                </th>
                {SEO_PACKAGES.map((p) => (
                  <th
                    key={p.slug}
                    scope="col"
                    className={`p-4 font-display text-2xl ${
                      p.featured ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {p.icon} {p.name}
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-normal mt-1">
                      {p.tagline}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/60">
                  <th
                    scope="row"
                    className="p-4 text-sm text-muted-foreground font-normal"
                  >
                    {row.label}
                  </th>
                  {SEO_PACKAGES.map((p) => (
                    <td key={p.slug} className="p-4 text-foreground text-sm">
                      {row.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="p-4 text-sm text-muted-foreground font-normal align-top">
                  Best for
                </th>
                {SEO_PACKAGES.map((p) => (
                  <td key={p.slug} className="p-4 text-sm text-foreground align-top">
                    <ul className="space-y-1">
                      {p.bestFor.slice(0, 3).map((b) => (
                        <li key={b} className="flex gap-2">
                          <Check size={14} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4" />
                {SEO_PACKAGES.map((p) => (
                  <td key={p.slug} className="p-4">
                    <Button
                      asChild
                      variant={p.featured ? "hero" : "outline"}
                      size="lg"
                      className="w-full uppercase tracking-widest text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                        Choose {p.name}
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SeoPackagesCompare;
