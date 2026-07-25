import { useEffect, useState } from "react";
import Seo from "@/components/Seo";

type Finding = {
  internal_id: string;
  name: string;
  scanner: string;
  severity: string;
  status: "fixed" | "open";
  detected_at: string;
  fixed_at?: string;
  resolution?: string;
};

type History = { generated_at: string; findings: Finding[] };

export default function SecurityFindings() {
  const [data, setData] = useState<History | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/security/findings-history.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  const fixed = data?.findings.filter((f) => f.status === "fixed") ?? [];
  const open = data?.findings.filter((f) => f.status !== "fixed") ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Security Findings & Audit Log — IAM"
        description="Public log of security scan findings, resolutions, and timestamps for the Industry Army Marketing platform."
        path="/security-findings"
        noindex
      />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-heading text-4xl md:text-5xl mb-2 text-primary">Security Findings</h1>
        <p className="text-muted-foreground mb-8">
          Transparent audit trail of scanner findings, remediations, and timestamps.
        </p>

        {err && <div className="text-destructive mb-6">Failed to load history: {err}</div>}
        {!data && !err && <div className="text-muted-foreground">Loading…</div>}

        {data && (
          <>
            <p className="text-xs text-muted-foreground mb-6">
              Snapshot generated {new Date(data.generated_at).toUTCString()}
            </p>

            <Section title={`Open (${open.length})`} findings={open} empty="No open findings." />
            <Section title={`Fixed (${fixed.length})`} findings={fixed} empty="Nothing fixed yet." />
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, findings, empty }: { title: string; findings: Finding[]; empty: string }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-2xl mb-4 text-primary">{title}</h2>
      {findings.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-4">
          {findings.map((f) => (
            <li
              key={f.internal_id}
              className="border border-border rounded-lg p-4 bg-card"
              data-finding-id={f.internal_id}
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