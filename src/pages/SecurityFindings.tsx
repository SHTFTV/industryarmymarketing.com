import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type Finding = {
  internal_id: string;
  name: string;
  scanner: string;
  severity: string;
  status: "fixed" | "open";
  detected_at: string;
  fixed_at?: string;
  resolution?: string;
  category?: string;
  affected?: string[];
  policy_or_query?: string;
  details?: string;
  references?: string[];
  source?: string;
};

type History = { generated_at: string; findings: Finding[] };
type ScanRun = {
  id: string;
  generated_at: string;
  source: string;
  finding_count: number;
  findings: Finding[];
  notes: string | null;
};

export default function SecurityFindings() {
  const [data, setData] = useState<History | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [runs, setRuns] = useState<ScanRun[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [drilldown, setDrilldown] = useState<Finding | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    fetch("/security/findings-history.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) return;
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: sess.user.id,
        _role: "admin",
      });
      setIsAdmin(!!adminCheck);
      if (adminCheck) {
        const { data: runsData } = await supabase
          .from("security_scan_runs")
          .select("*")
          .order("generated_at", { ascending: false })
          .limit(25);
        if (runsData) setRuns(runsData as unknown as ScanRun[]);
      }
    })();
  }, []);

  const staticFindings = data?.findings ?? [];
  const runFindings: Finding[] = useMemo(
    () =>
      runs.flatMap((r) =>
        (r.findings ?? []).map((f) => ({
          ...f,
          source: f.source ?? `manual_rescan @ ${r.generated_at}`,
        })),
      ),
    [runs],
  );
  const all: Finding[] = useMemo(
    () => [...staticFindings, ...runFindings],
    [staticFindings, runFindings],
  );

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86_399_000 : null;
    return all.filter((f) => {
      if (status !== "all" && f.status !== status) return false;
      if (severity !== "all" && f.severity !== severity) return false;
      if (qLower) {
        const hay = `${f.internal_id} ${f.name} ${f.scanner} ${f.resolution ?? ""} ${
          f.details ?? ""
        } ${(f.affected ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      if (fromTs || toTs) {
        const t = new Date(f.detected_at).getTime();
        if (fromTs && t < fromTs) return false;
        if (toTs && t > toTs) return false;
      }
      return true;
    });
  }, [all, q, status, severity, from, to]);

  const open = filtered.filter((f) => f.status !== "fixed");
  const fixed = filtered.filter((f) => f.status === "fixed");

  async function handleRescan() {
    setRescanning(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("security-rescan", {
        body: {},
      });
      if (error) throw error;
      toast({ title: "Re-scan complete", description: `${res?.findings?.length ?? 0} findings recorded.` });
      const { data: runsData } = await supabase
        .from("security_scan_runs")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(25);
      if (runsData) setRuns(runsData as unknown as ScanRun[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown error";
      toast({ title: "Re-scan failed", description: msg, variant: "destructive" });
    } finally {
      setRescanning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Security Findings & Audit Log — IAM"
        description="Public log of security scan findings, resolutions, and timestamps for the Industry Army Marketing platform."
        path="/security-findings"
        noindex
      />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-heading text-4xl md:text-5xl mb-2 text-primary">Security Findings</h1>
        <p className="text-muted-foreground mb-8">
          Transparent audit trail of scanner findings, remediations, and timestamps.
        </p>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <span className="text-sm text-primary font-semibold">Admin controls</span>
            <Button size="sm" onClick={handleRescan} disabled={rescanning}>
              {rescanning ? "Re-scanning…" : "Re-run security scan"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Runs runtime assertions and appends a timestamped row to the scan history.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <Input
            placeholder="Search id, name, scanner, affected…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:col-span-2"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
          </div>
        </div>

        {err && <div className="text-destructive mb-6">Failed to load history: {err}</div>}
        {!data && !err && <div className="text-muted-foreground">Loading…</div>}

        {data && (
          <>
            <p className="text-xs text-muted-foreground mb-6">
              Snapshot generated {new Date(data.generated_at).toUTCString()} · Showing {filtered.length} of {all.length} finding(s)
              {runs.length > 0 && <> · {runs.length} admin re-scan run(s) merged</>}
            </p>

            <Section title={`Open (${open.length})`} findings={open} empty="No open findings." onSelect={setDrilldown} />
            <Section title={`Fixed (${fixed.length})`} findings={fixed} empty="Nothing fixed yet." onSelect={setDrilldown} />
          </>
        )}

        <Dialog open={!!drilldown} onOpenChange={(o) => !o && setDrilldown(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {drilldown && (
              <>
                <DialogHeader>
                  <DialogTitle>{drilldown.name}</DialogTitle>
                  <DialogDescription className="font-mono text-xs">
                    {drilldown.internal_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Scanner: {drilldown.scanner}</Badge>
                    <Badge>Severity: {drilldown.severity}</Badge>
                    <Badge>Status: {drilldown.status}</Badge>
                    {drilldown.category && <Badge>Category: {drilldown.category}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Detected {new Date(drilldown.detected_at).toUTCString()}
                    {drilldown.fixed_at && <> · Fixed {new Date(drilldown.fixed_at).toUTCString()}</>}
                    {drilldown.source && <> · Source: {drilldown.source}</>}
                  </div>
                  {drilldown.details && (
                    <div>
                      <h4 className="font-semibold mb-1">Details</h4>
                      <p className="text-muted-foreground">{drilldown.details}</p>
                    </div>
                  )}
                  {drilldown.affected && drilldown.affected.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1">Affected components</h4>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {drilldown.affected.map((a) => <li key={a} className="font-mono text-xs">{a}</li>)}
                      </ul>
                    </div>
                  )}
                  {drilldown.policy_or_query && (
                    <div>
                      <h4 className="font-semibold mb-1">Policy / query that triggered or resolved</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {drilldown.policy_or_query}
                      </pre>
                    </div>
                  )}
                  {drilldown.resolution && (
                    <div>
                      <h4 className="font-semibold mb-1">Resolution</h4>
                      <p className="text-muted-foreground">{drilldown.resolution}</p>
                    </div>
                  )}
                  {drilldown.references && drilldown.references.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1">References</h4>
                      <ul className="list-disc pl-5">
                        {drilldown.references.map((r) => (
                          <li key={r}><a className="text-primary underline break-all" href={r} target="_blank" rel="noreferrer">{r}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{children}</span>;
}

function Section({
  title,
  findings,
  empty,
  onSelect,
}: {
  title: string;
  findings: Finding[];
  empty: string;
  onSelect: (f: Finding) => void;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-2xl mb-4 text-primary">{title}</h2>
      {findings.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-4">
          {findings.map((f) => (
            <li
              key={`${f.internal_id}-${f.detected_at}`}
              className="border border-border rounded-lg p-4 bg-card cursor-pointer hover:border-primary/50 transition-colors"
              data-finding-id={f.internal_id}
              onClick={() => onSelect(f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(f)}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {f.scanner}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    f.severity === "high"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {f.severity}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    f.status === "fixed"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {f.status}
                </span>
                <span className="ml-auto text-xs text-primary/70">View details →</span>
              </div>
              <h3 className="font-semibold mb-1">{f.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-2">{f.internal_id}</p>
              <div className="text-xs text-muted-foreground mb-2">
                Detected {new Date(f.detected_at).toUTCString()}
                {f.fixed_at && <> · Fixed {new Date(f.fixed_at).toUTCString()}</>}
              </div>
              {f.resolution && <p className="text-sm">{f.resolution}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}