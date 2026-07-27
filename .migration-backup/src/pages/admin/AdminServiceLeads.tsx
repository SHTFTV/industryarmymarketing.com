import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, LogOut, ChevronLeft, ChevronRight, RefreshCw, Download,
  Target, FileText, Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ServiceSlug =
  | "lead-generation"
  | "web-development"
  | "social-media"
  | "affordable-seo"
  | "dofollow-backlinks";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "spam";

type ServiceLead = {
  id: string;
  service: ServiceSlug;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  trade: string | null;
  budget: string | null;
  timeline: string | null;
  project_description: string | null;
  session_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  page_path: string | null;
  status: LeadStatus;
  created_at: string;
};

const SERVICE_OPTIONS: { value: "all" | ServiceSlug; label: string }[] = [
  { value: "all", label: "All services" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "web-development", label: "Web Development" },
  { value: "social-media", label: "Social Media" },
  { value: "affordable-seo", label: "Affordable SEO" },
  { value: "dofollow-backlinks", label: "Dofollow Backlinks" },
];

const STATUS_OPTIONS: { value: "all" | LeadStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "spam", label: "Spam" },
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-primary/20 text-primary border-primary/40",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  qualified: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  won: "bg-green-500/20 text-green-400 border-green-500/40",
  lost: "bg-muted text-muted-foreground border-border",
  spam: "bg-red-500/20 text-red-400 border-red-500/40",
};

const PAGE_SIZE = 25;

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const AdminServiceLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<ServiceLead[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [service, setService] = useState<"all" | ServiceSlug>("all");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selected, setSelected] = useState<ServiceLead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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

  const buildQuery = (opts: { forExport?: boolean } = {}) => {
    let q = supabase
      .from("service_leads")
      .select("*", { count: opts.forExport ? undefined : "exact" })
      .order("created_at", { ascending: false });
    if (service !== "all") q = q.eq("service", service);
    if (status !== "all") q = q.eq("status", status);
    if (dateFrom) q = q.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) {
      const end = new Date(dateTo);
      end.setDate(end.getDate() + 1);
      q = q.lt("created_at", end.toISOString());
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
        title: "Failed to load service leads",
        description: error.message.includes("permission")
          ? "You need admin role to view service leads."
          : error.message,
        variant: "destructive",
      });
      setRows([]);
      setCount(0);
    } else {
      setRows((data as ServiceLead[]) ?? []);
      setCount(c ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, page, service, status, dateFrom, dateTo]);

  useEffect(() => {
    setPage(0);
  }, [service, status, dateFrom, dateTo]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / PAGE_SIZE)),
    [count],
  );

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const updateStatus = async (id: string, next: LeadStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("service_leads")
      .update({ status: next })
      .eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    if (selected?.id === id) setSelected({ ...selected, status: next });
  };

  const exportCsv = async () => {
    setExporting(true);
    // Fetch up to 10k rows honoring the same filters.
    const { data, error } = await buildQuery({ forExport: true }).range(0, 9999);
    setExporting(false);
    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      return;
    }
    const list = (data as ServiceLead[]) ?? [];
    const cols: (keyof ServiceLead)[] = [
      "created_at", "service", "status", "name", "email", "phone", "company",
      "city", "trade", "budget", "timeline", "project_description",
      "page_path", "referrer", "session_id", "user_agent", "id",
    ];
    const header = cols.join(",");
    const body = list
      .map((r) => cols.map((c) => csvEscape(r[c])).join(","))
      .join("\n");
    const csv = `${header}\n${body}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = service === "all" ? "all" : service;
    a.download = `service-leads-${scope}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: `${list.length} lead${list.length === 1 ? "" : "s"} downloaded.` });
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
              <h1 className="font-display text-4xl md:text-5xl text-foreground">Service Bid Requests</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {count} lead{count === 1 ? "" : "s"} matching filters
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/leads"><Target className="w-4 h-4 mr-2" />General leads</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/proposals"><FileText className="w-4 h-4 mr-2" />SEO proposals</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
              </Button>
              <Button variant="hero" size="sm" onClick={exportCsv} disabled={exporting || loading}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign out
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 rounded-lg bg-card border border-border">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1">
                <Filter className="w-3 h-3" />Service
              </label>
              <Select value={service} onValueChange={(v) => setService(v as typeof service)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City / Trade</TableHead>
                  <TableHead>Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin inline-block text-primary" />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No bid requests match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-primary">{r.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_BADGE[r.status]}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <a href={`mailto:${r.email}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {r.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[r.city, r.trade].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{r.budget ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft className="w-4 h-4 mr-1" />Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
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
            className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-1">{selected.service}</div>
                <h2 className="font-display text-3xl text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>

            <div className="mb-4">
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
              <Select
                value={selected.status}
                onValueChange={(v) => updateStatus(selected.id, v as LeadStatus)}
                disabled={updatingId === selected.id}
              >
                <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone ?? "—"}</div>
              <div><span className="text-muted-foreground">Company:</span> {selected.company ?? "—"}</div>
              <div><span className="text-muted-foreground">City:</span> {selected.city ?? "—"}</div>
              <div><span className="text-muted-foreground">Trade:</span> {selected.trade ?? "—"}</div>
              <div><span className="text-muted-foreground">Budget:</span> {selected.budget ?? "—"}</div>
              <div><span className="text-muted-foreground">Timeline:</span> {selected.timeline ?? "—"}</div>
              <div className="col-span-2 break-all"><span className="text-muted-foreground">Page:</span> {selected.page_path ?? "—"}</div>
              <div className="col-span-2 break-all"><span className="text-muted-foreground">Referrer:</span> {selected.referrer ?? "—"}</div>
              <div className="col-span-2 break-all"><span className="text-muted-foreground">Session:</span> {selected.session_id ?? "—"}</div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Project details</p>
              <p className="whitespace-pre-wrap text-foreground">{selected.project_description ?? "—"}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminServiceLeads;