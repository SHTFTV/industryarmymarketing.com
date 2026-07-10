import { Link, useParams, useSearchParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { breadcrumbList } from "@/lib/breadcrumb";
import { SEO_PACKAGES, type SeoPackageSlug } from "@/data/seoPackages";
import { Check, Clock, Target, Zap, ShieldCheck, RefreshCw, Download } from "lucide-react";
import { downloadSeoProposalPdf } from "@/lib/seoProposalPdf";
import { toast } from "@/hooks/use-toast";

const SeoPackageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const pkg = SEO_PACKAGES.find((p) => p.slug === slug);
  if (!pkg) return <Navigate to="/seo-packages" replace />;

  const idx = SEO_PACKAGES.findIndex((p) => p.slug === pkg.slug);
  const next = SEO_PACKAGES[(idx + 1) % SEO_PACKAGES.length];

  // Prefilled context from estimator query params (optional).
  const clientName = params.get("clientName") ?? "";
  const clientEmail = params.get("clientEmail") ?? "";
  const targetUrl = params.get("targetUrl") ?? "";
  const keywords = params.get("keywords") ?? "";
  const budget = params.get("budget") ?? "";
  const competition = (params.get("competition") ?? "") as "" | "low" | "medium" | "high";
  const targetUrls = params.get("targetUrls") ?? "";
  const cityPopulation = params.get("cityPopulation") ?? "";
  const hasPrefill = Boolean(clientName || clientEmail || targetUrl || keywords || budget);

  const buildMailto = () => {
    const subject = `${pkg.name} Package Order — ${clientName || "IAM prospect"}`;
    const body = [
      `Package: ${pkg.name} (${pkg.tagline}) — $${pkg.price}`,
      "",
      hasPrefill ? "— Estimator Inputs —" : "",
      budget ? `Budget: $${budget}` : "",
      competition ? `Competition: ${competition}` : "",
      targetUrls ? `Target URLs: ${targetUrls}` : "",
      cityPopulation ? `City population: ${cityPopulation}` : "",
      "",
      "— Contact —",
      `Name: ${clientName || "(please fill)"}`,
      `Email: ${clientEmail || "(please fill)"}`,
      `Target URL: ${targetUrl || "(please fill)"}`,
      `Keywords: ${keywords || "(please fill 3–5)"}`,
      "",
      `Deliverables: ${pkg.deliverables} placements · ${pkg.timelineDays}-day delivery · ${pkg.revisions} revisions`,
    ]
      .filter((l) => l !== "")
      .join("\n");
    return `mailto:colin@industryarmymarketing.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const onDownloadPdf = () => {
    try {
      const comp: "low" | "medium" | "high" =
        competition === "low" || competition === "medium" || competition === "high" ? competition : "medium";
      const filename = downloadSeoProposalPdf({
        budget: Number(budget) || pkg.price,
        competition: comp,
        targetUrls: Number(targetUrls) || 1,
        cityPopulation: Number(cityPopulation) || 0,
        slug: pkg.slug,
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
        targetUrl: targetUrl || undefined,
        keywords: keywords || undefined,
      });
      toast({ title: "Proposal ready", description: `Downloaded ${filename}` });
    } catch {
      toast({ title: "Could not generate PDF", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <Seo
        title={`${pkg.name} — ${pkg.tagline} · $${pkg.price} SEO Link Package | IAM`}
        description={`${pkg.name}: ${pkg.summary} ${pkg.deliverables} placements. ${pkg.timelineDays}-day delivery. Exclusive IAM network domains included.`}
        path={`/seo-packages/${pkg.slug}`}
        jsonLd={[
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "SEO Packages", path: "/seo-packages" },
            { name: pkg.name, path: `/seo-packages/${pkg.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${pkg.name} — ${pkg.tagline}`,
            description: pkg.summary,
            brand: { "@type": "Organization", name: "Industry Army Marketing" },
            offers: {
              "@type": "Offer",
              price: String(pkg.price),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        ]}
      />
      <PageHeader
        eyebrow={`SEO Package · ${pkg.tagline}`}
        title={`${pkg.icon} ${pkg.name}.`}
        highlight={`$${pkg.price}`}
        description={pkg.summary}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="lg" asChild>
            <a href={buildMailto()}>
              Order {pkg.name} · ${pkg.price}
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={onDownloadPdf}>
            <Download className="w-4 h-4 mr-2" /> Download PDF Proposal
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/seo-packages">← All Packages</Link>
          </Button>
        </div>
        {hasPrefill && (
          <p className="mt-4 text-xs uppercase tracking-widest text-primary">
            Prefilled from your estimator inputs ✓
          </p>
        )}
      </PageHeader>

      {/* At-a-glance stats */}
      <section className="py-10 border-b border-border bg-card/40">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            [`${pkg.deliverables}`, "Total placements"],
            [`${pkg.timelineDays} days`, "Delivery"],
            [`${pkg.revisions}`, "Rounds of revisions"],
            ["100%", "Original content"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-3xl text-primary">{n}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Best For */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
            Best <span className="text-primary">For</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {pkg.bestFor.map((b) => (
              <div key={b} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16 bg-card/40 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Full <span className="text-primary">Deliverables</span>
          </h2>
          <p className="text-muted-foreground mb-10">
            {pkg.deliverables} total placements across three deployment layers. Every article is 500+ words of original content — no spun content, no shared footprints.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <div className="text-xs uppercase tracking-widest text-primary font-bold">Link Building</div>
              </div>
              <ul className="space-y-2">
                {pkg.linkBuilding.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <div className="text-xs uppercase tracking-widest text-primary font-bold">IAM Network Placements</div>
              </div>
              <ul className="space-y-2">
                {pkg.iam.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-primary" />
                <div className="text-xs uppercase tracking-widest text-primary font-bold">Tier 2 Drip</div>
              </div>
              <ul className="space-y-2">
                {pkg.tier2.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            {pkg.timelineDays}-Day <span className="text-primary">Timeline</span>
          </h2>
          <p className="text-muted-foreground mb-10">
            Standard delivery. Rush available on Boom and Bombs — email us.
          </p>
          <ol className="relative border-l-2 border-primary/30 pl-6 space-y-6">
            {pkg.timeline.map((t) => (
              <li key={t.day} className="relative">
                <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
                  <Clock className="w-3 h-3 inline mr-1" /> {t.day}
                </div>
                <div className="text-muted-foreground">{t.step}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-card/40 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8 text-center">
            What's <span className="text-primary">Included</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, t: "Domain Exclusivity", d: "No IAM domain placed for a competing client in your niche during the same cycle." },
              { icon: RefreshCw, t: `${pkg.revisions} Free Revisions`, d: "Anchor text, target URL, and content tone adjustments before publishing." },
              { icon: Clock, t: `${pkg.timelineDays}-Day Delivery`, d: "Standard turnaround from order confirmation to full link report." },
              { icon: Check, t: "Full Link Report", d: "Every live URL, anchor text, DA, and placement domain — CSV + PDF, white-label available." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="p-5 rounded-lg border border-border bg-card">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <div className="font-semibold text-foreground mb-1">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary/5 border-y border-primary/20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-5xl mb-4">{pkg.icon}</div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            Deploy <span className="text-primary">{pkg.name}</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            ${pkg.price} one-time. {pkg.deliverables} placements. {pkg.timelineDays}-day delivery. Email your target URL and 3–5 keywords — we confirm within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <a href={`mailto:colin@industryarmymarketing.com?subject=${pkg.name} Package Order`}>
                Order {pkg.name} · ${pkg.price}
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={`/seo-packages/${next.slug}`}>Compare with {next.name} →</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SeoPackageDetail;