import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadSeoProposalPdf } from "@/lib/seoProposalPdf";
import { SEO_PACKAGES, type SeoPackageSlug } from "@/data/seoPackages";

type Proposal = {
  id: string;
  name: string | null;
  email: string | null;
  target_url: string | null;
  keywords: string | null;
  budget: number;
  competition: "low" | "medium" | "high";
  target_urls: number;
  city_population: number;
  package_slug: SeoPackageSlug;
  package_price: number;
  status: string;
  source: string;
  notes: string | null;
  emailed_customer: boolean;
  emailed_owner: boolean;
  created_at: string;
};

const PAGE_SIZE = 25;
const STATUSES = ["new", "contacted", "won", "lost", "archived"] as const;

const AdminProposals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Proposal[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState<"all" | SeoPackageSlug>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Proposal | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setAuthChecked(true);
      if (!session) navigate("/admin/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
      if (!data.session) navigate("/admin/login", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const buildQuery = () => {
    let q = supabase
      .from("seo_proposals")
      .select(
        "id,name,email,target_url,keywords,budget,competition,target_urls,city_population,package_slug,package_price,status,source,notes,emailed_customer,emailed_owner,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });
    if (pkgFilter !== "all") q = q.eq("package_slug", pkgFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (search) {
      const esc = search.replace(/[%_,]/g, (c) => `\\${c}`);
      const like = `%${esc}%`;
      q = q.or(
        `name.ilike.${like},email.ilike.${like},target_url.ilike.${like},keywords.ilike.${like},notes.ilike.${like}`,
      );
    }
    return q;
  };

  const load = async () => {
    if (!authed) return;
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count: c, error } = await buildQuery().range(from, to);
    if (error) {
      toast({
        title: "Failed to load proposals",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRows((data as Proposal[]) ?? []);
      setCount(c ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, page, search, pkgFilter, statusFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / PAGE_SIZE)),
    [count],
  );

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("seo_proposals")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const regenPdf = (p: Proposal) => {
    try {
      downloadSeoProposalPdf({
        budget: p.budget,
        competition: p.competition,
        targetUrls: p.target_urls,
        cityPopulation: p.city_population,
        slug: p.package_slug,
        clientName: p.name ?? undefined,
        clientEmail: p.email ?? undefined,
        targetUrl: p.target_url ?? undefined,
        keywords: p.keywords ?? undefined,
      });
    } catch {
      toast({ title: "PDF regen failed", variant: "destructive" });
    }
  };

  const exportCsv = async () => {
    setLoading(true);
    const { data, error } = await buildQuery().range(0, 9999);
    setLoading(false);
    if (error || !data) {
      toast({
        title: "Export failed",
        description: error?.message ?? "unknown",
        variant: "destructive",
      });
      return;
    }
    const cols = [
      "created_at",
      "status",
      "package_slug",
      "package_price",
      "name",
      "email",
      "target_url",
      "keywords",
      "budget",
      "competition",
      "target_urls",
      "city_population",
      "source",
      "emailed_owner",
      "emailed_customer",
      "notes",
    ];
    const escapeCsv = (v: unknown): string => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = [cols.join(",")];
    for (const row of data as Proposal[]) {
      lines.push(cols.map((k) => escapeCsv((row as any)[k])).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iam-seo-proposals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (!authChecked) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 bg-background min-h-[70vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground">
                SEO Proposals
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {count} total request{count === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/leads">
                  <Users className="w-4 h-4 mr-2" />
                  Contact leads
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="hero" size="sm" onClick={exportCsv} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search name, email, URL, keywords, notes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-card border-border pl-9"
              />
            </div>
            <Select
              value={pkgFilter}
              onValueChange={(v) => {
                setPkgFilter(v as typeof pkgFilter);
                setPage(0);
              }}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All packages</SelectItem>
                {SEO_PACKAGES.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.icon} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg overflow-x-auto bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin inline-block text-primary" />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No proposals match your filters yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-primary font-medium">
                          {SEO_PACKAGES.find((p) => p.slug === r.package_slug)?.name}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ${r.package_price}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
                      <TableCell>
                        {r.email ? (
                          <a
                            href={`mailto:${r.email}`}
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {r.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground">
                        {r.target_url ?? "—"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateStatus(r.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[120px] bg-card border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={
                            r.emailed_owner ? "text-primary" : "text-muted-foreground"
                          }
                        >
                          O
                        </span>{" "}
                        <span
                          className={
                            r.emailed_customer
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          C
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenPdf(r)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">
                  {SEO_PACKAGES.find((p) => p.slug === selected.package_slug)?.name} ·
                  ${selected.package_price}
                </p>
                <h2 className="font-display text-3xl text-foreground">
                  {selected.name ?? "Anonymous"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selected.created_at).toLocaleString()} · status:{" "}
                  <span className="text-primary">{selected.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenPdf(selected)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {selected.email ? (
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-primary hover:underline"
                  >
                    {selected.email}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Source:</span>{" "}
                {selected.source}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Target URL:</span>{" "}
                {selected.target_url ?? "—"}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Keywords:</span>{" "}
                {selected.keywords ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Budget:</span> $
                {selected.budget}
              </div>
              <div>
                <span className="text-muted-foreground">Competition:</span>{" "}
                {selected.competition}
              </div>
              <div>
                <span className="text-muted-foreground">Target URLs:</span>{" "}
                {selected.target_urls}
              </div>
              <div>
                <span className="text-muted-foreground">City population:</span>{" "}
                {selected.city_population.toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Emailed owner:</span>{" "}
                {selected.emailed_owner ? "yes" : "no"}
              </div>
              <div>
                <span className="text-muted-foreground">Emailed customer:</span>{" "}
                {selected.emailed_customer ? "yes" : "no"}
              </div>
            </div>
            {selected.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-2">Notes</p>
                <p className="whitespace-pre-wrap text-foreground text-sm">
                  {selected.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminProposals;