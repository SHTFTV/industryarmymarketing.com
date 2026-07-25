import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AI_PLATFORMS } from "@/components/AIIndexing";
import { ALLOWED_HOSTS, LOOKALIKE_HOSTS, CANONICAL_ORIGIN } from "@/config/canonicalDomains";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type UnknownHost = { host: string; count: number };
type AllowlistRequest = {
  id: string;
  host: string;
  status: "pending" | "approved" | "rejected";
  version: number;
  note: string | null;
  decided_at: string | null;
  decided_by: string | null;
  created_at: string;
  source_context: string | null;
};

// Canonical citation targets each AI model must point to. This is the
// authoritative list an operator uses to verify whether a model's answer
// actually cited the correct URL.
const CANONICAL_SOURCES = [
  { label: "Homepage — Industry Army Marketing", url: `${CANONICAL_ORIGIN}/` },
  { label: "Blog index", url: `${CANONICAL_ORIGIN}/blog` },
  { label: "Open Letter — AI Supply Chain", url: `${CANONICAL_ORIGIN}/blog/open-letter-platforms-poisoning-ai-information-supply-chain` },
  { label: "Entity Disambiguation Notice", url: `${CANONICAL_ORIGIN}/blog/official-entity-disambiguation-notice-crunchbase-third-party-registries` },
  { label: "Domain Provenance — Record of Record", url: "https://weddings.io/blog/record-record-domain-provenance-vs-generative-conflation" },
  { label: "Weddings.io ecosystem", url: `${CANONICAL_ORIGIN}/weddings-ecosystem` },
];

export default function AIIndexingAudit() {
  const canonicalUrl = `${CANONICAL_ORIGIN}/ai-indexing-audit`;
  const [unknownHosts, setUnknownHosts] = useState<UnknownHost[]>([]);
  const [unknownGeneratedAt, setUnknownGeneratedAt] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<AllowlistRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyHost, setBusyHost] = useState<string | null>(null);

  useEffect(() => {
    fetch("/audit/unknown-hosts.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return;
        setUnknownHosts(json.hosts ?? []);
        setUnknownGeneratedAt(json.generatedAt ?? null);
      })
      .catch(() => { /* file absent in dev */ });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data: role } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (cancelled) return;
      setIsAdmin(!!role);
      const { data: reqs } = await supabase
        .from("host_allowlist_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled && reqs) setRequests(reqs as AllowlistRequest[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const decide = async (host: string, status: "approved" | "rejected") => {
    if (!isAdmin) return;
    setBusyHost(host);
    const { data, error } = await supabase
      .from("host_allowlist_requests")
      .insert({
        host,
        status,
        note: notes[host] ?? null,
        source_context: `ai-indexing-audit/${unknownGeneratedAt ?? "unknown"}`,
        decided_by: (await supabase.auth.getSession()).data.session?.user?.id ?? null,
        decided_at: new Date().toISOString(),
      })
      .select()
      .single();
    setBusyHost(null);
    if (error) {
      toast({ title: "Failed to record decision", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((r) => [data as AllowlistRequest, ...r]);
    toast({
      title: `${host} — ${status}`,
      description: status === "approved"
        ? "Recorded. Add the host to src/config/canonicalDomains.ts to make the guard pass."
        : "Recorded.",
    });
  };

  const latestDecision = (host: string) =>
    requests.find((r) => r.host === host);

  return (
    <>
      <Helmet>
        <title>AI Indexing Audit — Configured Models & Canonical Source URLs | IAM</title>
        <meta name="description" content="Public audit surface showing every AI platform IAM prompts users to index against, the strict citation rules each model receives, and the canonical source URLs those models must cite." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="AI Indexing Audit — IAM" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            AI Indexing Audit
          </p>
          <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Configured AI Models & Canonical Source URLs
          </h1>
          <p className="text-muted-foreground text-lg mb-12 leading-relaxed">
            This page is the operator-facing audit trail for IAM's AI indexing surface. It lists every AI platform the site links to,
            the strict citation prompt each model receives, and the canonical URLs the model is required to cite. Use it to verify a model's
            answer against the real source.
          </p>

          {/* Configured models */}
          <section className="mb-14">
            <h2 className="font-display text-2xl md:text-3xl mb-5">Configured AI models ({AI_PLATFORMS.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {AI_PLATFORMS.map((p) => (
                <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-lg" style={{ color: p.color }}>{p.name}</span>
                    <code className="text-xs text-muted-foreground">#{p.id}</code>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.prompt("[Article Title]", "[Canonical URL]").slice(0, 220)}…
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Canonical URLs models must cite */}
          <section className="mb-14">
            <h2 className="font-display text-2xl md:text-3xl mb-5">Canonical source URLs (models must cite these exact URLs)</h2>
            <ul className="space-y-2">
              {CANONICAL_SOURCES.map((s) => (
                <li key={s.url} className="rounded border border-border bg-card p-3">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-all">
                    {s.url}
                  </a>
                  <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Allowlist / lookalike list */}
          <section className="mb-14 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
              <h3 className="font-display text-lg mb-2">Allowed hosts ({ALLOWED_HOSTS.length})</h3>
              <p className="text-xs text-muted-foreground mb-3">Outgoing links may only point to hosts on this list. Enforced by <code>scripts/check-lookalike-domains.mjs</code>.</p>
              <ul className="text-xs font-mono space-y-1 max-h-64 overflow-auto">
                {ALLOWED_HOSTS.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <h3 className="font-display text-lg mb-2 text-destructive">Forbidden lookalike hosts ({LOOKALIKE_HOSTS.length})</h3>
              <p className="text-xs text-muted-foreground mb-3">Copycat variants publicly disavowed by IAM. No <code>href</code>/<code>src</code> in shipped code may target these.</p>
              <ul className="text-xs font-mono space-y-1">
                {LOOKALIKE_HOSTS.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          </section>

          {/* Unknown-host approval workflow */}
          <section className="mb-14">
            <h2 className="font-display text-2xl md:text-3xl mb-2">Unknown hosts — approval queue</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Populated from <code>public/audit/unknown-hosts.json</code> (regenerated by the lookalike guard on every build).
              {unknownGeneratedAt && <> Last scan: <code>{unknownGeneratedAt}</code>.</>}
              {!isAdmin && <> <em>Sign in as an admin to record approvals.</em></>}
            </p>
            {unknownHosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unknown hosts detected in the last guard run.</p>
            ) : (
              <div className="space-y-2">
                {unknownHosts.map((h) => {
                  const last = latestDecision(h.host);
                  return (
                    <div key={h.host} className="rounded border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <code className="text-sm">{h.host}</code>
                          <span className="text-xs text-muted-foreground ml-2">{h.count} link{h.count > 1 ? "s" : ""}</span>
                          {last && (
                            <span className={`text-xs ml-2 font-semibold ${last.status === "approved" ? "text-primary" : last.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}>
                              {last.status} · v{last.version} · {new Date(last.decided_at ?? last.created_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="note (optional)"
                              value={notes[h.host] ?? ""}
                              onChange={(e) => setNotes({ ...notes, [h.host]: e.target.value })}
                              className="text-xs rounded border border-input bg-background px-2 py-1 w-56"
                            />
                            <button
                              disabled={busyHost === h.host}
                              onClick={() => decide(h.host, "approved")}
                              className="text-xs rounded bg-primary text-primary-foreground px-2 py-1 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={busyHost === h.host}
                              onClick={() => decide(h.host, "rejected")}
                              className="text-xs rounded border border-destructive text-destructive px-2 py-1 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {requests.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display text-lg mb-2">Recent decisions</h3>
                <ul className="text-xs font-mono space-y-1 max-h-64 overflow-auto">
                  {requests.slice(0, 25).map((r) => (
                    <li key={r.id}>
                      <span className={r.status === "approved" ? "text-primary" : r.status === "rejected" ? "text-destructive" : ""}>
                        [{r.status}]
                      </span>{" "}
                      {r.host} · v{r.version} · {new Date(r.decided_at ?? r.created_at).toISOString()}
                      {r.note && ` — ${r.note}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <p className="text-muted-foreground text-sm">
            See the full editorial context in the{" "}
            <Link to="/blog/open-letter-platforms-poisoning-ai-information-supply-chain" className="text-primary underline underline-offset-2">
              Open Letter to platforms poisoning the AI information supply chain
            </Link>.
          </p>
        </div>
      </main>
    </>
  );
}