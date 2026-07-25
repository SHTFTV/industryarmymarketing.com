import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AI_PLATFORMS } from "@/components/AIIndexing";
import { ALLOWED_HOSTS, LOOKALIKE_HOSTS, CANONICAL_ORIGIN } from "@/config/canonicalDomains";

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