import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Search, Lock, Sparkles, History, Trash2, RotateCcw, ExternalLink, Share2, ClipboardCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
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
interface AuditRow {
  id: string;
  url: string;
  score: number;
  status: number | null;
  ttfb: number | null;
  checks: CheckRow[];
  meta: ScanResult["meta"];
  deep_dive: DeepResult | null;
  created_at: string;
}

const PAGE_SIZE = 5;
type SortOption = "newest" | "oldest" | "score-desc" | "score-asc" | "url-asc";
const SORT_OPTIONS: SortOption[] = ["newest","oldest","score-desc","score-asc","url-asc"];
const defaultSort: SortOption = "newest";
type ScoreFilter = "all" | "high" | "mid" | "low";
const SCORE_FILTERS: ScoreFilter[] = ["all","high","mid","low"];
type DeepFilter = "all" | "with" | "without";
const DEEP_FILTERS: DeepFilter[] = ["all","with","without"];
interface HistoryFilters { q: string; score: ScoreFilter; deep: DeepFilter; }
const defaultFilters: HistoryFilters = { q: "", score: "all", deep: "all" };

const SeoAudit = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: HistoryFilters = {
    q: searchParams.get("q") ?? "",
    score: (SCORE_FILTERS.includes(searchParams.get("score") as ScoreFilter)
      ? (searchParams.get("score") as ScoreFilter) : "all"),
    deep: (DEEP_FILTERS.includes(searchParams.get("deep") as DeepFilter)
      ? (searchParams.get("deep") as DeepFilter) : "all"),
  };
  const sort: SortOption = SORT_OPTIONS.includes(searchParams.get("sort") as SortOption)
    ? (searchParams.get("sort") as SortOption) : defaultSort;
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const updateParams = (updates: Record<string, string | null>, opts: { resetPage?: boolean } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === "all" || (k === "sort" && v === defaultSort) || (k === "page" && v === "1")) {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      if (opts.resetPage) next.delete("page");
      return next;
    }, { replace: true });
  };
  const setFilters = (updater: HistoryFilters | ((f: HistoryFilters) => HistoryFilters)) => {
    const nf = typeof updater === "function" ? (updater as (f: HistoryFilters) => HistoryFilters)(filters) : updater;
    updateParams({ q: nf.q || null, score: nf.score, deep: nf.deep }, { resetPage: true });
  };
  const setSort = (s: SortOption) => updateParams({ sort: s }, { resetPage: true });
  const setPage = (updater: number | ((p: number) => number)) => {
    const np = typeof updater === "function" ? (updater as (p: number) => number)(page) : updater;
    updateParams({ page: String(np) });
  };

  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [deep, setDeep] = useState<DeepResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diving, setDiving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<AuditRow[]>([]);
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  useEffect(() => {
    if (!shareCopied) return;
    const t = setTimeout(() => setShareCopied(false), 2000);
    return () => clearTimeout(t);
  }, [shareCopied]);

  const filteredHistory = history.filter((a) => {
    if (filters.q.trim() && !a.url.toLowerCase().includes(filters.q.trim().toLowerCase())) return false;
    if (filters.score === "high" && a.score < 80) return false;
    if (filters.score === "mid" && (a.score < 50 || a.score >= 80)) return false;
    if (filters.score === "low" && a.score >= 50) return false;
    if (filters.deep === "with" && !a.deep_dive) return false;
    if (filters.deep === "without" && a.deep_dive) return false;
    return true;
  }).slice().sort((a, b) => {
    switch (sort) {
      case "oldest": return +new Date(a.created_at) - +new Date(b.created_at);
      case "score-desc": return b.score - a.score;
      case "score-asc": return a.score - b.score;
      case "url-asc": return a.url.localeCompare(b.url);
      case "newest":
      default: return +new Date(b.created_at) - +new Date(a.created_at);
    }
  });
  const filtersActive = filters.q !== "" || filters.score !== "all" || filters.deep !== "all";

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  useEffect(() => {
    if (safePage !== page) updateParams({ page: safePage === 1 ? null : String(safePage) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, page]);
  const pagedHistory = filteredHistory.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const loadHistory = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("seo_audits")
      .select("id,url,score,status,ttfb,checks,meta,deep_dive,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) { toast.error("Could not load history"); return; }
    setHistory((data as unknown as AuditRow[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadHistory(u.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadHistory(u.id);
      else { setHistory([]); setCurrentAuditId(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadHistory]);

  const runScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setScanning(true); setScan(null); setDeep(null); setCurrentAuditId(null);
    try {
      const { data, error } = await supabase.functions.invoke("audit-fetch-page", { body: { url } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data as ScanResult;
      setScan(result);
      if (user) {
        const { data: row, error: insertErr } = await supabase
          .from("seo_audits")
          .insert({
            user_id: user.id,
            url: result.url,
            score: result.score,
            status: result.status,
            ttfb: result.ttfb,
            checks: result.checks as unknown as never,
            meta: result.meta as unknown as never,
          })
          .select("id")
          .single();
        if (!insertErr && row) {
          setCurrentAuditId(row.id);
          loadHistory(user.id);
        }
      }
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
      const result = data.result as DeepResult;
      setDeep(result);
      if (user && currentAuditId) {
        await supabase
          .from("seo_audits")
          .update({ deep_dive: result as unknown as never })
          .eq("id", currentAuditId);
        loadHistory(user.id);
      }
      toast.success("Deep dive ready");
    } catch (err) {
      toast.error("Deep dive failed", { description: (err as Error).message });
    } finally { setDiving(false); }
  };

  const loadAudit = (a: AuditRow) => {
    setUrl(a.url);
    setScan({
      url: a.url,
      status: a.status ?? 0,
      ttfb: a.ttfb ?? 0,
      score: a.score,
      checks: a.checks ?? [],
      meta: a.meta,
      bodySample: "",
    });
    setDeep(a.deep_dive ?? null);
    setCurrentAuditId(a.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAudit = async (id: string) => {
    const { error } = await supabase.from("seo_audits").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    if (currentAuditId === id) { setScan(null); setDeep(null); setCurrentAuditId(null); }
    if (user) loadHistory(user.id);
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
        <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {user ? <>Signed in as <span className="text-foreground">{user.email}</span> — history syncing</> : "Sign in to save your audit history"}
          </p>
          {!user && (
            <Link to="/sync-account" className="text-xs uppercase tracking-widest text-primary hover:text-glow">
              Sign in to save →
            </Link>
          )}
        </div>

        <Card className="p-6 md:p-8 border-border bg-card max-w-5xl mx-auto">
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

        {user && history.length > 0 && (
          <Card className="p-6 md:p-8 border-border bg-card max-w-5xl mx-auto mt-6">
            <div id="history" className="flex items-center gap-3 mb-4">
              <History size={18} className="text-primary" />
              <h2 className="font-display text-3xl text-foreground">Audit History</h2>
              <span className="text-xs text-muted-foreground">
                ({filteredHistory.length}{filtersActive ? ` of ${history.length}` : ""})
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={async () => {
                  const shareUrl = window.location.href;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied to clipboard");
                    setShareCopied(true);
                  } catch {
                    toast.error("Could not copy link");
                  }
                }}
                className="ml-auto h-8"
                aria-label="Copy shareable link to this audit history view"
              >
                {shareCopied ? (
                  <><ClipboardCheck size={14} className="mr-1.5" /> Copied</>
                ) : (
                  <><Share2 size={14} className="mr-1.5" /> Share</>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 mb-5">
              <Input
                type="search"
                placeholder="Search URL…"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="h-10"
                aria-label="Search audit history by URL"
              />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                aria-label="Sort audit history"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="score-desc">Score: high → low</option>
                <option value="score-asc">Score: low → high</option>
                <option value="url-asc">URL: A → Z</option>
              </select>
              <select
                value={filters.score}
                onChange={(e) => setFilters((f) => ({ ...f, score: e.target.value as ScoreFilter }))}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                aria-label="Filter by score"
              >
                <option value="all">All scores</option>
                <option value="high">High (80+)</option>
                <option value="mid">Mid (50–79)</option>
                <option value="low">Low (&lt;50)</option>
              </select>
              <select
                value={filters.deep}
                onChange={(e) => setFilters((f) => ({ ...f, deep: e.target.value as DeepFilter }))}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                aria-label="Filter by deep dive status"
              >
                <option value="all">Any deep dive</option>
                <option value="with">With deep dive</option>
                <option value="without">Without deep dive</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateParams({ q: null, score: null, deep: null, sort: null, page: null })}
                disabled={!filtersActive && sort === defaultSort}
                className="h-10"
              >
                Clear
              </Button>
            </div>

            <ul className="divide-y divide-border">
              {pagedHistory.length === 0 && (
                <li className="py-6 text-sm text-muted-foreground text-center">
                  No audits match your filters.
                </li>
              )}
              {pagedHistory.map((a) => {
                const sc = a.score >= 80 ? "text-primary" : a.score >= 50 ? "text-yellow-400" : "text-red-400";
                const isCurrent = currentAuditId === a.id;
                return (
                  <li key={a.id} className={`flex items-center justify-between gap-4 py-3 ${isCurrent ? "opacity-100" : ""}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`font-display text-3xl ${sc} leading-none w-12 text-right`}>{a.score}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{a.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString()} {a.deep_dive && "· deep dive ✓"}
                          {isCurrent && " · viewing"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => loadAudit(a)} className="h-8">
                        <RotateCcw size={14} className="mr-1.5" /> Load
                      </Button>
                      <Button size="sm" variant="secondary" asChild className="h-8">
                        <Link to={`/seo-audit/${a.id}`}>
                          <ExternalLink size={14} className="mr-1.5" /> Open
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAudit(a.id)} className="h-8 text-muted-foreground hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page <span className="text-foreground">{safePage}</span> of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="h-8"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

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