import { useMemo, useState } from "react";
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
import { Target } from "lucide-react";
import { SEO_PACKAGES, recommendPackage, type SeoPackageSlug } from "@/data/seoPackages";

const schema = z.object({
  budget: z.number().min(0).max(50_000),
  competition: z.enum(["low", "medium", "high"]),
  targetUrls: z.number().int().min(1).max(50),
  cityPopulation: z.number().min(0).max(50_000_000),
});

const SeoPackageEstimator = () => {
  const [budget, setBudget] = useState("300");
  const [competition, setCompetition] = useState<"low" | "medium" | "high">("medium");
  const [targetUrls, setTargetUrls] = useState("2");
  const [cityPopulation, setCityPopulation] = useState("250000");
  const [recommendation, setRecommendation] = useState<SeoPackageSlug | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recommended = useMemo(
    () => recommendPackage({
      budget: Number(budget) || 0,
      competition,
      targetUrls: Number(targetUrls) || 1,
      cityPopulation: Number(cityPopulation) || 0,
    }),
    [budget, competition, targetUrls, cityPopulation],
  );

  const pkg = SEO_PACKAGES.find((p) => p.slug === (recommendation ?? recommended))!;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      budget: Number(budget),
      competition,
      targetUrls: Number(targetUrls),
      cityPopulation: Number(cityPopulation),
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    setRecommendation(
      recommendPackage({
        budget: parsed.data.budget,
        competition: parsed.data.competition,
        targetUrls: parsed.data.targetUrls,
        cityPopulation: parsed.data.cityPopulation,
      }),
    );
  };

  return (
    <section className="py-20 border-y border-border bg-card/40">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">Package Estimator</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            Which Package <span className="text-primary">Fits You?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four inputs. Instant recommendation. No email required.
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
                onChange={(e) => setBudget(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Competition Level</Label>
              <Select value={competition} onValueChange={(v) => setCompetition(v as typeof competition)}>
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
                  onChange={(e) => setTargetUrls(e.target.value)}
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
                  onChange={(e) => setCityPopulation(e.target.value)}
                  className="mt-2"
                />
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
              ${pkg.price}<span className="text-sm text-muted-foreground font-sans"> one-time</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6 flex-1">{pkg.summary}</p>
            <div className="space-y-2">
              <Button variant="hero" className="w-full" asChild>
                <Link to={`/seo-packages/${pkg.slug}`}>See Full {pkg.name} Details →</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:colin@industryarmymarketing.com?subject=${pkg.name} Package Order`}>
                  Order {pkg.name} · ${pkg.price}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoPackageEstimator;