import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Search, Lock, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CheckRow { id: string; label: string; pass: boolean; value: string; }
interface ScanResult {
  url: string; status: number; ttfb: number; score: number;
  checks: CheckRow[];
  meta: { title: string; description: string; canonical: string; wordCount: number; h1s: string[]; ogImage: string; hasSchema: boolean };
  bodySample: string;
}
interface DeepCheck { name: string; status: "pass" | "warn" | "fail"; finding: string; fix: string; }
interface DeepResult { summary: string; checks: DeepCheck[]; quickWins: string[]; }

const SeoAudit = () => {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [deep, setDeep] = useState<DeepResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diving, setDiving] = useState(false);

  const runScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setScanning(true); setScan(null); setDeep(null);
    try {
      const { data, error } = await supabase.functions.invoke("audit-fetch-page", { body: { url } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setScan(data as ScanResult);
    } catch (err) {
      toast.error("Scan failed", { description: (err as Error).message });
    } finally { setScanning(false); }
  };

  const runDeepDive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan || !email.trim()) return;
    setDiving(true);
    try {
      const { data, error } = await supabase.functions.invoke("audit-deep-dive", {
        body: { url: scan.url, meta: scan.meta, bodySample: scan.bodySample, email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDeep(data.result as DeepResult);
      toast.success("Deep dive ready");
    } catch (err) {
      toast.error("Deep dive failed", { description: (err as Error).message });
    } finally { setDiving(false); }
  };

  const scoreColor = scan ? (scan.score >= 80 ? "text-primary" : scan.score >= 50 ? "text-yellow-400" : "text-red-400") : "";

  return (
    <Layout>
      <Seo
        title="Free SEO Audit — Scan Your Site in 30 Seconds | IAM"
        description="Run a free on-page SEO audit. Get a score, 12 checks, and an AI-powered deep dive with quick wins for your site."
        path="/seo-audit"
      />
      <PageHeader
        eyebrow="Recon Tool"
        title="Free SEO"
        highlight="Audit"
        description="Drop your URL. We scan title, meta, headings, schema, images, speed, and 6 more on-page signals — then hand you an AI deep dive."
      />

      <section className="container mx-auto px-4 py-12">
        <Card className="p-6 md:p-8 border-border bg-card max-w-3xl mx-auto">
          <form onSubmit={runScan} className="flex flex-col md:flex-row gap-3">
            <Input
              type="url"
              placeholder="https://yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-12 text-base"
              required
            />
            <Button type="submit" disabled={scanning} className="h-12 px-8 font-display tracking-wider text-base">
              {scanning ? <Loader2 className="animate-spin mr-2" size={18} /> : <Search className="mr-2" size={18} />}
              {scanning ? "Scanning..." : "Run Audit"}
            </Button>
          </form>
        </Card>

        {scan && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid gap-6 max-w-5xl mx-auto">
            {/* Score cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 border-border bg-card border-glow">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Score</p>
                <p className={`font-display text-6xl ${scoreColor} text-glow leading-none`}>{scan.score}</p>
                <p className="text-xs text-muted-foreground mt-2">out of 100</p>
              </Card>
              <Card className="p-6 border-border bg-card">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">HTTP</p>
                <p className="font-display text-6xl text-foreground leading-none">{scan.status}</p>
                <p className="text-xs text-muted-foreground mt-2">{scan.ttfb} ms TTFB</p>
              </Card>
              <Card className="p-6 border-border bg-card">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Words</p>
                <p className="font-display text-6xl text-foreground leading-none">{scan.meta.wordCount}</p>
                <p className="text-xs text-muted-foreground mt-2">{scan.meta.h1s.length} H1 · {scan.meta.hasSchema ? "schema ✓" : "no schema"}</p>
              </Card>
            </div>

            {/* Checks */}
            <Card className="p-6 border-border bg-card">
              <h2 className="font-display text-3xl text-foreground mb-5">On-Page Checks</h2>
              <ul className="divide-y divide-border">
                {scan.checks.map((c) => (
                  <li key={c.id} className="flex items-start justify-between py-3 gap-4">
                    <div className="flex items-start gap-3">
                      {c.pass ? (
                        <Check size={18} className="text-primary mt-0.5 shrink-0" />
                      ) : (
                        <X size={18} className="text-red-400 mt-0.5 shrink-0" />
                      )}
                      <span className="text-sm text-foreground">{c.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right shrink-0">{c.value}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Email gate / deep dive */}
            {!deep ? (
              <Card className="p-6 md:p-8 border-border bg-card border-glow">
                <div className="flex items-center gap-3 mb-3">
                  <Lock size={18} className="text-primary" />
                  <h2 className="font-display text-3xl text-foreground">Unlock the AI Deep Dive</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-5">
                  Get a written executive summary, 10 expert-level checks with specific fixes, and a quick-wins list. No spam. Just the report.
                </p>
                <form onSubmit={runDeepDive} className="flex flex-col md:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12"
                    required
                  />
                  <Button type="submit" disabled={diving} className="h-12 px-8 font-display tracking-wider">
                    {diving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
                    {diving ? "Analyzing..." : "Generate Deep Dive"}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-6 md:p-8 border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={18} className="text-primary" />
                  <h2 className="font-display text-3xl text-foreground">AI Deep Dive</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">{deep.summary}</p>

                <div className="grid gap-4">
                  {deep.checks.map((c, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 bg-secondary/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-xl text-foreground">{c.name}</h3>
                        <span className={`text-xs uppercase tracking-widest px-2 py-1 rounded ${
                          c.status === "pass" ? "bg-primary/15 text-primary" :
                          c.status === "warn" ? "bg-yellow-400/15 text-yellow-400" :
                          "bg-red-500/15 text-red-400"
                        }`}>{c.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2"><span className="text-foreground font-medium">Finding: </span>{c.finding}</p>
                      <p className="text-sm text-muted-foreground"><span className="text-primary font-medium">Fix: </span>{c.fix}</p>
                    </div>
                  ))}
                </div>

                {deep.quickWins?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-2xl text-foreground mb-3">Quick Wins</h3>
                    <ul className="space-y-2">
                      {deep.quickWins.map((w, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <Check size={16} className="text-primary mt-1 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        )}
      </section>
    </Layout>
  );
};

export default SeoAudit;