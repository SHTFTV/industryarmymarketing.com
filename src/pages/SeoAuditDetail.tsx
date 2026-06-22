import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Loader2, Sparkles, ArrowLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CheckRow { id: string; label: string; pass: boolean; value: string; }
interface DeepCheck { name: string; status: "pass" | "warn" | "fail"; finding: string; fix: string; }
interface DeepResult { summary: string; checks: DeepCheck[]; quickWins: string[]; }
interface AuditRow {
  id: string;
  url: string;
  score: number;
  status: number | null;
  ttfb: number | null;
  checks: CheckRow[];
  meta: { title: string; description: string; canonical: string; wordCount: number; h1s: string[]; ogImage: string; hasSchema: boolean };
  deep_dive: DeepResult | null;
  created_at: string;
}

const SeoAuditDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("seo_audits")
        .select("id,url,score,status,ttfb,checks,meta,deep_dive,created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) setError(error.message);
      else if (!data) setError("Audit not found or you don't have access.");
      else setAudit(data as unknown as AuditRow);
      setLoading(false);
    })();
  }, [id]);

  const scoreColor = audit ? (audit.score >= 80 ? "text-primary" : audit.score >= 50 ? "text-yellow-400" : "text-red-400") : "";

  return (
    <Layout>
      <Seo
        title={audit ? `Audit · ${audit.url} | IAM` : "Audit Details | IAM"}
        description="Saved SEO audit details — score, on-page checks, and AI deep dive."
        path={`/seo-audit/${id ?? ""}`}
      />
      <PageHeader
        eyebrow="Saved Report"
        title="Audit"
        highlight="Details"
        description={audit ? `${audit.url} · ${new Date(audit.created_at).toLocaleString()}` : "Loading saved audit report…"}
      />

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto mb-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li>
                <Link to="/seo-audit" className="hover:text-primary transition-colors">SEO Audit</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li>
                <Link to="/seo-audit" className="hover:text-primary transition-colors">History</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li className="text-foreground truncate max-w-[40ch]" aria-current="page">
                {audit ? audit.url : "Details"}
              </li>
            </ol>
          </nav>
          <Button asChild variant="secondary" size="sm" className="group">
            <Link to="/seo-audit" aria-label="Back to audit history">
              <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-0.5" />
              Back to Audit History
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-muted-foreground">
            <Loader2 className="animate-spin" size={18} /> Loading…
          </div>
        )}

        {error && !loading && (
          <Card className="p-6 max-w-5xl mx-auto border-border bg-card">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link to="/seo-audit"><Button variant="secondary">Back to audits</Button></Link>
          </Card>
        )}

        {audit && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 border-border bg-card border-glow">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Score</p>
                <p className={`font-display text-6xl ${scoreColor} text-glow leading-none`}>{audit.score}</p>
                <p className="text-xs text-muted-foreground mt-2">out of 100</p>
              </Card>
              <Card className="p-6 border-border bg-card">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">HTTP</p>
                <p className="font-display text-6xl text-foreground leading-none">{audit.status ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-2">{audit.ttfb ?? "—"} ms TTFB</p>
              </Card>
              <Card className="p-6 border-border bg-card">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Words</p>
                <p className="font-display text-6xl text-foreground leading-none">{audit.meta?.wordCount ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {audit.meta?.h1s?.length ?? 0} H1 · {audit.meta?.hasSchema ? "schema ✓" : "no schema"}
                </p>
              </Card>
            </div>

            <Card className="p-6 border-border bg-card">
              <h2 className="font-display text-3xl text-foreground mb-5">On-Page Checks</h2>
              <ul className="divide-y divide-border">
                {(audit.checks ?? []).map((c) => (
                  <li key={c.id} className="flex items-start justify-between py-3 gap-4">
                    <div className="flex items-start gap-3">
                      {c.pass
                        ? <Check size={18} className="text-primary mt-0.5 shrink-0" />
                        : <X size={18} className="text-red-400 mt-0.5 shrink-0" />}
                      <span className="text-sm text-foreground">{c.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right shrink-0">{c.value}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {audit.deep_dive ? (
              <Card className="p-6 md:p-8 border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={18} className="text-primary" />
                  <h2 className="font-display text-3xl text-foreground">AI Deep Dive</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">{audit.deep_dive.summary}</p>
                <div className="grid gap-4">
                  {audit.deep_dive.checks?.map((c, i) => (
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
                {(audit.deep_dive.quickWins?.length ?? 0) > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-2xl text-foreground mb-3">Quick Wins</h3>
                    <ul className="space-y-2">
                      {audit.deep_dive.quickWins.map((w, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <Check size={16} className="text-primary mt-1 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-6 border-border bg-card">
                <p className="text-sm text-muted-foreground">No AI deep dive was generated for this audit.</p>
              </Card>
            )}

            <div className="pt-2">
              <Button asChild variant="secondary" className="group">
                <Link to="/seo-audit" aria-label="Back to audit history">
                  <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-0.5" />
                  Back to Audit History
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </section>
    </Layout>
  );
};

export default SeoAuditDetail;