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
  Send,
  Clock,
  FileDown,
  RotateCw,
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
  owner_email_status: string;
  customer_email_status: string;
  owner_email_error: string | null;
  customer_email_error: string | null;
  owner_message_id: string | null;
  customer_message_id: string | null;
  email_attempted_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 25;
const STATUSES = ["new", "contacted", "won", "lost", "archived"] as const;
const EMAIL_STATUSES = ["sent", "failed", "pending", "skipped"] as const;
type EmailStatusFilter = "all" | (typeof EMAIL_STATUSES)[number];
const OWNER_LABEL = "colin@industryarmymarketing.com";

type EmailAttempt = {
  id: string;
  proposal_id: string;
  kind: "owner" | "customer" | "test";
  recipient: string;
  status: string;
  message_id: string | null;
  error: string | null;
  created_at: string;
};

function statusTone(status: string): string {
  switch (status) {
    case "sent":
      return "bg-primary/15 text-primary border-primary/30";
    case "failed":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "skipped":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
  }
}

const EmailPill = ({
  label,
  status,
  reason,
}: {
  label: string;
  status: string;
  reason?: string | null;
}) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium uppercase ${statusTone(status)}`}
    title={
      status === "skipped" && reason
        ? `${label}: skipped — ${reason}`
        : reason
          ? `${label}: ${status} — ${reason}`
          : `${label}: ${status}`
    }
  >
    {label}·{status}
  </span>
);

const EmailStatusRow = ({
  who,
  to,
  status,
  error,
  messageId,
}: {
  who: string;
  to: string;
  status: string;
  error: string | null;
  messageId: string | null;
}) => (
  <div className="text-sm">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-muted-foreground w-20">{who}</span>
      <EmailPill label={who[0]} status={status} />
      <span className="text-foreground text-xs">{to}</span>
    </div>
    {error && (
      <p className="text-xs text-destructive mt-1 pl-[88px] break-all">
        {error}
      </p>
    )}
    {messageId && (
      <p className="text-[10px] text-muted-foreground mt-0.5 pl-[88px] font-mono">
        id: {messageId}
      </p>
    )}
  </div>
);

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
  const [emailStatusFilter, setEmailStatusFilter] =
    useState<EmailStatusFilter>("all");
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [attempts, setAttempts] = useState<EmailAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [attemptDrawer, setAttemptDrawer] = useState<EmailAttempt | null>(null);
  const [retrying, setRetrying] = useState<null | "owner" | "customer">(null);

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
        "id,name,email,target_url,keywords,budget,competition,target_urls,city_population,package_slug,package_price,status,source,notes,emailed_customer,emailed_owner,owner_email_status,customer_email_status,owner_email_error,customer_email_error,owner_message_id,customer_message_id,email_attempted_at,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });
    if (pkgFilter !== "all") q = q.eq("package_slug", pkgFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (emailStatusFilter !== "all") {
      q = q.or(
        `owner_email_status.eq.${emailStatusFilter},customer_email_status.eq.${emailStatusFilter}`,
      );
    }
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
  }, [authed, page, search, pkgFilter, statusFilter, emailStatusFilter]);

  const loadAttempts = async (proposalId: string) => {
    setAttemptsLoading(true);
    const { data, error } = await supabase
      .from("proposal_email_attempts")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Failed to load email log",
        description: error.message,
        variant: "destructive",
      });
      setAttempts([]);
    } else {
      setAttempts((data as EmailAttempt[]) ?? []);
    }
    setAttemptsLoading(false);
  };

  useEffect(() => {
    if (selected) {
      setTestRecipient(selected.email ?? "");
      loadAttempts(selected.id);
    } else {
      setAttempts([]);
      setTestRecipient("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const sendTestEmail = async () => {
    if (!selected) return;
    const recipient = testRecipient.trim();
    if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) {
      toast({
        title: "Enter a valid recipient email",
        variant: "destructive",
      });
      return;
    }
    setTestSending(true);
    const { data, error } = await supabase.functions.invoke(
      "send-proposal-test-email",
      {
        body: { proposal_id: selected.id, recipient },
      },
    );
    setTestSending(false);
    if (error) {
      toast({
        title: "Test send failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const status = (data as { status?: string })?.status ?? "unknown";
      const messageId = (data as { messageId?: string | null })?.messageId;
      toast({
        title: `Test email ${status}`,
        description: messageId ? `Message ID: ${messageId}` : undefined,
        variant: status === "sent" ? "default" : "destructive",
      });
    }
    loadAttempts(selected.id);
  };

  const retryFailedSend = async (kind: "owner" | "customer") => {
    if (!selected) return;
    setRetrying(kind);
    const { data, error } = await supabase.functions.invoke(
      "retry-seo-proposal-send",
      {
        body: { proposal_id: selected.id, kind },
      },
    );
    setRetrying(null);
    if (error) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const status = (data as { status?: string })?.status ?? "unknown";
      const messageId = (data as { messageId?: string | null })?.messageId;
      toast({
        title: `Retry ${status}`,
        description: messageId ? `Message ID: ${messageId}` : undefined,
        variant: status === "sent" ? "default" : "destructive",
      });
      // Refresh row + attempts.
      const { data: fresh } = await supabase
        .from("seo_proposals")
        .select(
          "id,name,email,target_url,keywords,budget,competition,target_urls,city_population,package_slug,package_price,status,source,notes,emailed_customer,emailed_owner,owner_email_status,customer_email_status,owner_email_error,customer_email_error,owner_message_id,customer_message_id,email_attempted_at,created_at",
        )
        .eq("id", selected.id)
        .maybeSingle();
      if (fresh) {
        const proposal = fresh as Proposal;
        setSelected(proposal);
        setRows((r) => r.map((x) => (x.id === proposal.id ? proposal : x)));
      }
    }
    loadAttempts(selected.id);
  };

  const exportDeliveryReport = () => {
    if (!selected) return;
    const sorted = [...attempts].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const escapeCsv = (v: unknown): string => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines: string[] = [];
    lines.push(`Proposal ID,${escapeCsv(selected.id)}`);
    lines.push(`Name,${escapeCsv(selected.name)}`);
    lines.push(`Email,${escapeCsv(selected.email)}`);
    lines.push(`Package,${escapeCsv(selected.package_slug)}`);
    lines.push(`Package price,${selected.package_price}`);
    lines.push(
      `First attempt,${escapeCsv(first ? new Date(first.created_at).toISOString() : "")}`,
    );
    lines.push(
      `Last attempt,${escapeCsv(last ? new Date(last.created_at).toISOString() : "")}`,
    );
    lines.push(`Total attempts,${attempts.length}`);
    lines.push("");
    lines.push("timestamp,kind,recipient,status,message_id,error");
    for (const a of sorted) {
      lines.push(
        [
          a.created_at,
          a.kind,
          a.recipient,
          a.status,
          a.message_id ?? "",
          a.error ?? "",
        ]
          .map(escapeCsv)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iam-delivery-${selected.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <Select
              value={emailStatusFilter}
              onValueChange={(v) => {
                setEmailStatusFilter(v as EmailStatusFilter);
                setPage(0);
              }}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Email delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All email statuses</SelectItem>
                {EMAIL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    Email: {s}
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
                      <TableCell className="text-xs whitespace-nowrap">
                        <EmailPill
                          label="O"
                          status={r.owner_email_status}
                          reason={r.owner_email_error}
                        />{" "}
                        <EmailPill
                          label="C"
                          status={r.customer_email_status}
                          reason={r.customer_email_error}
                        />
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
                  onClick={exportDeliveryReport}
                  disabled={attempts.length === 0}
                  title="Download CSV of every send attempt"
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  Report
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
              <div className="col-span-2 pt-2 border-t border-border">
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">
                  Email delivery
                </p>
                <div className="grid gap-2">
                  <EmailStatusRow
                    who="Owner"
                    to={selected.email ? `reply-to ${selected.email}` : OWNER_LABEL}
                    status={selected.owner_email_status}
                    error={selected.owner_email_error}
                    messageId={selected.owner_message_id}
                  />
                  {(selected.owner_email_status === "failed" ||
                    selected.owner_email_status === "skipped") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit ml-[88px]"
                      onClick={() => retryFailedSend("owner")}
                      disabled={retrying === "owner"}
                    >
                      {retrying === "owner" ? (
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      ) : (
                        <RotateCw className="w-3.5 h-3.5 mr-2" />
                      )}
                      Retry owner send
                    </Button>
                  )}
                  <EmailStatusRow
                    who="Customer"
                    to={selected.email ?? "no email provided"}
                    status={selected.customer_email_status}
                    error={selected.customer_email_error}
                    messageId={selected.customer_message_id}
                  />
                  {selected.email &&
                    (selected.customer_email_status === "failed" ||
                      selected.customer_email_status === "skipped") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit ml-[88px]"
                        onClick={() => retryFailedSend("customer")}
                        disabled={retrying === "customer"}
                      >
                        {retrying === "customer" ? (
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                          <RotateCw className="w-3.5 h-3.5 mr-2" />
                        )}
                        Retry customer send
                      </Button>
                    )}
                  {selected.email_attempted_at && (
                    <p className="text-xs text-muted-foreground">
                      Last attempt:{" "}
                      {new Date(selected.email_attempted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <p className="text-muted-foreground text-xs uppercase tracking-widest">
                  Send test email
                </p>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <Input
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-card border-border max-w-xs"
                />
                <Button
                  variant="hero"
                  size="sm"
                  onClick={sendTestEmail}
                  disabled={testSending}
                >
                  {testSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send test
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Sends a plain test email (no PDF) via Resend and logs the
                attempt below.
              </p>
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs uppercase tracking-widest">
                  Email delivery audit log
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAttempts(selected.id)}
                  disabled={attemptsLoading}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${attemptsLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              {attempts.length > 0 && (() => {
                const sorted = [...attempts].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                );
                const first = sorted[0];
                const last = sorted[sorted.length - 1];
                const latestWithId = [...sorted]
                  .reverse()
                  .find((a) => a.message_id);
                const latestError = [...sorted]
                  .reverse()
                  .find((a) => a.error);
                return (
                  <div className="bg-background/40 border border-border rounded p-3 mb-3 grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">First attempt</p>
                        <p className="text-foreground">
                          {new Date(first.created_at).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {first.kind} · {first.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Last attempt</p>
                        <p className="text-foreground">
                          {new Date(last.created_at).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {last.kind} · {last.status}
                        </p>
                      </div>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-border">
                      <p className="text-muted-foreground mb-1">
                        Latest message ID
                      </p>
                      {latestWithId ? (
                        <p className="font-mono text-foreground break-all">
                          {latestWithId.message_id}
                          <span className="text-muted-foreground ml-2">
                            ({latestWithId.kind} ·{" "}
                            {new Date(latestWithId.created_at).toLocaleString()})
                          </span>
                        </p>
                      ) : (
                        <p className="text-muted-foreground">—</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground mb-1">
                        Latest Resend error
                      </p>
                      {latestError ? (
                        <p className="text-destructive break-all">
                          {latestError.error}
                          <span className="text-muted-foreground ml-2">
                            ({latestError.kind} ·{" "}
                            {new Date(latestError.created_at).toLocaleString()})
                          </span>
                        </p>
                      ) : (
                        <p className="text-muted-foreground">No errors 🎉</p>
                      )}
                    </div>
                  </div>
                );
              })()}
              {attemptsLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : attempts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No send attempts recorded for this proposal yet.
                </p>
              ) : (
                <div className="border border-border rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">When</TableHead>
                        <TableHead className="text-xs">Kind</TableHead>
                        <TableHead className="text-xs">Recipient</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Message ID / Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((a) => (
                        <TableRow
                          key={a.id}
                          className="cursor-pointer hover:bg-background/40"
                          onClick={() => setAttemptDrawer(a)}
                        >
                          <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                            {new Date(a.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs uppercase">
                            {a.kind}
                          </TableCell>
                          <TableCell className="text-xs break-all max-w-[180px]">
                            {a.recipient}
                          </TableCell>
                          <TableCell>
                            <EmailPill
                              label={a.kind[0].toUpperCase()}
                              status={a.status}
                              reason={a.error}
                            />
                          </TableCell>
                          <TableCell className="text-xs break-all max-w-[240px]">
                            {a.error ? (
                              <span className="text-destructive">{a.error}</span>
                            ) : a.message_id ? (
                              <span className="font-mono text-muted-foreground">
                                {a.message_id}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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