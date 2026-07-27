import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Download, Loader2 } from "lucide-react";
import { SEO_PACKAGES, recommendPackage, type SeoPackageSlug } from "@/data/seoPackages";
import { downloadSeoProposalPdf } from "@/lib/seoProposalPdf";
import { submitSeoOrder } from "@/lib/submitSeoOrder";
import { track, trackDebounced } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";
import { usePpp } from "@/hooks/usePpp";
import PriceUsd from "@/components/PriceUsd";

const schema = z.object({
  budget: z.number().min(0).max(50_000),
  competition: z.enum(["low", "medium", "high"]),
  targetUrls: z.number().int().min(1).max(50),
  cityPopulation: z.number().min(0).max(50_000_000),
  clientName: z.string().trim().max(100).optional().or(z.literal("")),
  clientEmail: z.union([z.string().trim().email().max(255), z.literal("")]).optional(),
  targetUrl: z.string().trim().max(500).optional().or(z.literal("")),
  keywords: z.string().trim().max(500).optional().or(z.literal("")),
});

const SeoPackageEstimator = () => {
  const { adjust, factor } = usePpp();
  const [budget, setBudget] = useState("300");
  const [competition, setCompetition] = useState<"low" | "medium" | "high">("medium");
  const [targetUrls, setTargetUrls] = useState("2");
  const [cityPopulation, setCityPopulation] = useState("250000");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [recommendation, setRecommendation] = useState<SeoPackageSlug | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void track("estimator_view");
  }, []);

  const recommended = useMemo(
    () =>
      recommendPackage({
        budget: Number(budget) || 0,
        competition,
        targetUrls: Number(targetUrls) || 1,
        cityPopulation: Number(cityPopulation) || 0,
      }),
    [budget, competition, targetUrls, cityPopulation],
  );

  const pkg = SEO_PACKAGES.find((p) => p.slug === (recommendation ?? recommended))!;

  useEffect(() => {
    void track("estimator_recommendation", { packageSlug: recommended });
  }, [recommended]);

  const buildParams = () =>
    new URLSearchParams({
      budget: String(budget),
      competition,
      targetUrls: String(targetUrls),
      cityPopulation: String(cityPopulation),
      ...(clientName ? { clientName } : {}),
      ...(clientEmail ? { clientEmail } : {}),
      ...(targetUrl ? { targetUrl } : {}),
      ...(keywords ? { keywords } : {}),
    }).toString();

  const parsedInput = () =>
    schema.safeParse({
      budget: Number(budget),
      competition,
      targetUrls: Number(targetUrls),
      cityPopulation: Number(cityPopulation),
      clientName,
      clientEmail,
      targetUrl,
      keywords,
    });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parsedInput();
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    const rec = recommendPackage({
      budget: parsed.data.budget,
      competition: parsed.data.competition,
      targetUrls: parsed.data.targetUrls,
      cityPopulation: parsed.data.cityPopulation,
    });
    setRecommendation(rec);
    void track("estimator_submit", {
      packageSlug: rec,
      meta: {
        budget: parsed.data.budget,
        competition: parsed.data.competition,
        targetUrls: parsed.data.targetUrls,
        cityPopulation: parsed.data.cityPopulation,
        hasEmail: Boolean(parsed.data.clientEmail),
      },
    });
  };

  const onDownload = () => {
    const parsed = parsedInput();
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    try {
      const filename = downloadSeoProposalPdf({
        budget: parsed.data.budget,
        competition: parsed.data.competition,
        targetUrls: parsed.data.targetUrls,
        cityPopulation: parsed.data.cityPopulation,
        slug: pkg.slug,
        clientName: parsed.data.clientName || undefined,
        clientEmail: parsed.data.clientEmail || undefined,
        targetUrl: parsed.data.targetUrl || undefined,
        keywords: parsed.data.keywords || undefined,
      });
      void track("pdf_download", {
        packageSlug: pkg.slug,
        meta: { source: "estimator" },
      });
      toast({ title: "Proposal ready", description: `Downloaded ${filename}` });
    } catch {
      toast({ title: "Could not generate PDF", variant: "destructive" });
    }
  };

  const onOrder = async () => {
    const parsed = parsedInput();
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    if (!parsed.data.clientEmail) {
      setError("Please add your email so we can send you the proposal PDF.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await submitSeoOrder({
        budget: parsed.data.budget,
        competition: parsed.data.competition,
        targetUrls: parsed.data.targetUrls,
        cityPopulation: parsed.data.cityPopulation,
        slug: pkg.slug,
        clientName: parsed.data.clientName || undefined,
        clientEmail: parsed.data.clientEmail || undefined,
        targetUrl: parsed.data.targetUrl || undefined,
        keywords: parsed.data.keywords || undefined,
        source: "estimator",
      });
      toast({
        title: result.emailedCustomer ? "Order sent!" : "Request received",
        description:
          result.warning ??
          `${pkg.name} proposal on the way. Colin will confirm within 24h.`,
      });
    } catch (err) {
      toast({
        title: "Order failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="estimator" className="py-20 border-y border-border bg-card/40 scroll-mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
            Package Estimator
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            Which Package <span className="text-primary">Fits You?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four inputs. Instant recommendation. Downloadable proposal PDF. Order prefilled with everything you just entered.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <form onSubmit={onSubmit} className="lg:col-span-3 p-6 rounded-lg border border-border bg-card space-y-5">
            <div>
              <Label htmlFor="budget">Budget (USD, one-time)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                max={50000}
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  trackDebounced("budget", "estimator_input_change", {
                    meta: { field: "budget", value: e.target.value },
                  });
                }}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Competition Level</Label>
              <Select
                value={competition}
                onValueChange={(v) => {
                  setCompetition(v as typeof competition);
                  void track("estimator_input_change", {
                    meta: { field: "competition", value: v },
                  });
                }}
              >
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — new niche or local terms</SelectItem>
                  <SelectItem value="medium">Medium — regional / commercial terms</SelectItem>
                  <SelectItem value="high">High — national / category-killer terms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urls">Target URLs</Label>
                <Input
                  id="urls"
                  type="number"
                  min={1}
                  max={50}
                  value={targetUrls}
                  onChange={(e) => {
                    setTargetUrls(e.target.value);
                    trackDebounced("urls", "estimator_input_change", {
                      meta: { field: "targetUrls", value: e.target.value },
                    });
                  }}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="pop">City Population</Label>
                <Input
                  id="pop"
                  type="number"
                  min={0}
                  max={50_000_000}
                  value={cityPopulation}
                  onChange={(e) => {
                    setCityPopulation(e.target.value);
                    trackDebounced("pop", "estimator_input_change", {
                      meta: { field: "cityPopulation", value: e.target.value },
                    });
                  }}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Optional — prefill your proposal & order
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cname">Your name</Label>
                  <Input id="cname" maxLength={100} value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-2" placeholder="Colin R." />
                </div>
                <div>
                  <Label htmlFor="cemail">Email</Label>
                  <Input id="cemail" type="email" maxLength={255} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="mt-2" placeholder="you@company.com" />
                </div>
                <div>
                  <Label htmlFor="curl">Target URL</Label>
                  <Input id="curl" maxLength={500} value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} className="mt-2" placeholder="https://your-site.com/service" />
                </div>
                <div>
                  <Label htmlFor="ckw">Keywords (3–5)</Label>
                  <Input id="ckw" maxLength={500} value={keywords} onChange={(e) => setKeywords(e.target.value)} className="mt-2" placeholder="roofing vancouver, ..." />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" variant="hero" className="w-full">
              <Target className="w-4 h-4 mr-2" /> Get My Recommendation
            </Button>
          </form>

          <div className="lg:col-span-2 p-6 rounded-lg border border-primary/40 bg-primary/5 flex flex-col">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Recommended</p>
            <div className="text-4xl mb-2">{pkg.icon}</div>
            <h3 className="font-display text-4xl text-foreground">{pkg.name}</h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{pkg.tagline}</p>
            <p className="font-display text-3xl text-primary mb-4">
              <PriceUsd usd={pkg.price} suffix=" one-time" />
            </p>
            {factor < 1 && (
              <p className="text-[10px] uppercase tracking-widest text-primary mb-3">
                PPP-adjusted · {Math.round(factor * 100)}% of ${pkg.price} · Card country enforced at checkout
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-4 flex-1">{pkg.summary}</p>
            <div className="grid grid-cols-3 gap-2 text-center py-3 mb-4 border-y border-border">
              <div><div className="font-display text-lg text-primary">{pkg.deliverables}</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Placements</div></div>
              <div><div className="font-display text-lg text-primary">{pkg.timelineDays}d</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Delivery</div></div>
              <div><div className="font-display text-lg text-primary">{pkg.revisions}</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Revisions</div></div>
            </div>
            <div className="space-y-2">
              <Button
                variant="hero"
                className="w-full"
                onClick={onOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Order {pkg.name} · ${adjust(pkg.price)} →</>
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" /> Download PDF Proposal
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link
                  to={`/seo-packages/${pkg.slug}?${buildParams()}`}
                  onClick={() =>
                    void track("package_selected", {
                      packageSlug: pkg.slug,
                      meta: { source: "estimator" },
                    })
                  }
                >
                  See Full {pkg.name} Details →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoPackageEstimator;