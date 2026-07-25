import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LogRow = {
  id: string;
  url: string;
  engine: string;
  status: string;
  http_status: number | null;
  response_body: string | null;
  error: string | null;
  attempt: number;
  max_attempts: number;
  next_retry_at: string | null;
  trigger_source: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  success: "text-green-500",
  retrying: "text-yellow-500",
  failed: "text-red-500",
  exhausted: "text-red-600 font-semibold",
  pending: "text-muted-foreground",
};

const AdminSubmissionLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("submission_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load log", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data ?? []) as LogRow[]);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthChecked(true);
      if (!session) navigate("/admin/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthChecked(true);
      if (!data.session) navigate("/admin/login", { replace: true });
      else load();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const runRetries = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-submission-retries");
      if (error) throw error;
      const summary = data as { processed?: number };
      toast({ title: "Retry queue processed", description: `${summary.processed ?? 0} rows retried` });
      await load();
    } catch (err) {
      toast({ title: "Retry failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (engineFilter !== "all" && r.engine !== engineFilter) return false;
      if (search && !r.url.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, statusFilter, engineFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { success: 0, retrying: 0, failed: 0, exhausted: 0, pending: 0 };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  if (!authChecked) {
    return <Layout><div className="p-8"><Loader2 className="animate-spin" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Submission Log</h1>
            <p className="text-sm text-muted-foreground">
              IndexNow + Google Search Console URL inspection attempts with retry state.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Reload
            </Button>
            <Button onClick={runRetries} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
              Process retry queue
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {(["success", "retrying", "failed", "exhausted", "pending"] as const).map((s) => (
            <div key={s} className="border rounded-lg p-3">
              <div className={`text-2xl font-bold ${STATUS_STYLES[s]}`}>{counts[s] ?? 0}</div>
              <div className="text-xs text-muted-foreground uppercase">{s}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Input placeholder="Search URL…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border rounded px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="retrying">Retrying</option>
            <option value="failed">Failed</option>
            <option value="exhausted">Exhausted</option>
            <option value="pending">Pending</option>
          </select>
          <select value={engineFilter} onChange={(e) => setEngineFilter(e.target.value)}
            className="bg-background border rounded px-3 py-2 text-sm">
            <option value="all">All engines</option>
            <option value="indexnow">IndexNow</option>
            <option value="google_inspect">Google Inspect</option>
            <option value="google_sitemap">Google Sitemap</option>
          </select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Next retry</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8}><Loader2 className="animate-spin mx-auto my-6" /></TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No entries</TableCell></TableRow>
              )}
              {!loading && filtered.map((r) => (
                <>
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs max-w-md truncate" title={r.url}>{r.url}</TableCell>
                    <TableCell className="text-xs">{r.engine}</TableCell>
                    <TableCell className={`text-xs uppercase ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</TableCell>
                    <TableCell className="text-xs">{r.http_status ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.attempt}/{r.max_attempts}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{r.next_retry_at ? new Date(r.next_retry_at).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-xs">{r.trigger_source ?? "—"}</TableCell>
                  </TableRow>
                  {expanded === r.id && (
                    <TableRow key={r.id + "-detail"}>
                      <TableCell colSpan={8} className="bg-muted/50">
                        <div className="p-3 space-y-2">
                          {r.error && <div className="text-xs"><span className="font-semibold text-red-500">Error:</span> {r.error}</div>}
                          {r.response_body && (
                            <div>
                              <div className="text-xs font-semibold mb-1">Response</div>
                              <pre className="text-xs bg-background border rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-64">
                                {r.response_body}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSubmissionLog;