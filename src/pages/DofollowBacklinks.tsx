import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Server, Globe, Search, Copy, Check, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { dofollowDomains } from "@/data/dofollowDomains";

type SortMode = "newest" | "oldest" | "az" | "za";
type HostFilter = "all" | "Netlify" | "WordPress";

const CopyButton = ({ domain }: { domain: string }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(domain);
      setCopied(true);
      toast({ title: "Copied", description: domain });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: domain, variant: "destructive" });
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${domain} to clipboard`}
      className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

const DofollowBacklinks = () => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [host, setHost] = useState<HostFilter>("all");
  const total = dofollowDomains.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? dofollowDomains.filter((d) => d.domain.toLowerCase().includes(q))
      : [...dofollowDomains];

    const byDate = (s: string) => new Date(s).getTime();
    switch (sort) {
      case "newest":
        return base.sort((a, b) => byDate(b.published) - byDate(a.published));
      case "oldest":
        return base.sort((a, b) => byDate(a.published) - byDate(b.published));
      case "az":
        return base.sort((a, b) => a.domain.localeCompare(b.domain));
      case "za":
        return base.sort((a, b) => b.domain.localeCompare(a.domain));
    }
  }, [query, sort]);

  const netlify = filtered.filter((d) => d.host === "Netlify");
  const wordpress = filtered.filter((d) => d.host === "WordPress");

  const showNetlify = host === "all" || host === "Netlify";
  const showWordpress = host === "all" || host === "WordPress";
  const visibleCount = (showNetlify ? netlify.length : 0) + (showWordpress ? wordpress.length : 0);

  const visibleDomains = [
    ...(showNetlify ? netlify : []),
    ...(showWordpress ? wordpress : []),
  ].map((d) => d.domain);

  const [copiedAll, setCopiedAll] = useState(false);
  const [copyFormat, setCopyFormat] = useState<"plain" | "url">("plain");
  const [copySeparator, setCopySeparator] = useState<
    "newline" | "csv" | "tsv" | "ssv" | "scsv"
  >("newline");
  const [quoteItems, setQuoteItems] = useState(false);

  const formattedOutput = useMemo(() => {
    const joiner =
      copySeparator === "csv"
        ? ","
        : copySeparator === "tsv"
        ? "\t"
        : copySeparator === "ssv"
        ? " "
        : copySeparator === "scsv"
        ? ";"
        : "\n";
    const isDelimited = copySeparator !== "newline";
    // RFC 4180-style escaping, applied consistently to CSV/TSV/SSV/SCSV.
    // A value is wrapped in double quotes when the user opts in, or when it
    // contains the active delimiter, a double quote, or a line break.
    const escapeForDelimited = (raw: string) => {
      const needsQuotes =
        quoteItems ||
        raw.includes(joiner) ||
        raw.includes('"') ||
        raw.includes("\n") ||
        raw.includes("\r");
      if (!needsQuotes) return raw;
      return `"${raw.replace(/"/g, '""')}"`;
    };
    const items = visibleDomains
      .map((d) => (copyFormat === "url" ? `https://${d}` : d))
      .map((s) => (isDelimited ? escapeForDelimited(s) : s));
    return items.join(joiner);
  }, [visibleDomains, copyFormat, copySeparator, quoteItems]);

  const onCopyAll = async () => {
    if (visibleDomains.length === 0) return;
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopiedAll(true);
      const formatLabel = copyFormat === "url" ? "Full URLs" : "Plain domains";
      const sepLabel =
        copySeparator === "csv"
          ? quoteItems ? "comma-separated, quoted" : "comma-separated"
          : copySeparator === "tsv"
          ? quoteItems ? "tab-separated, quoted" : "tab-separated"
          : copySeparator === "ssv"
          ? quoteItems ? "space-separated, quoted" : "space-separated"
          : copySeparator === "scsv"
          ? quoteItems ? "semicolon-separated, quoted" : "semicolon-separated"
          : "newline-separated";
      toast({
        title: `Copied ${visibleDomains.length} domain${visibleDomains.length === 1 ? "" : "s"}`,
        description: `${formatLabel}, ${sepLabel}.`,
      });
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const hostOptions: { value: HostFilter; label: string; count: number }[] = [
    { value: "all", label: "All Hosts", count: total },
    { value: "Netlify", label: "Netlify", count: dofollowDomains.filter((d) => d.host === "Netlify").length },
    { value: "WordPress", label: "WordPress", count: dofollowDomains.filter((d) => d.host === "WordPress").length },
  ];

  const renderGrid = (list: typeof dofollowDomains) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {list.map((d, i) => (
        <motion.div
          key={d.domain}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(i * 0.015, 0.4) }}
          className="group p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between gap-3"
        >
          <a
            href={`https://${d.domain}`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="min-w-0">
              <div className="font-mono text-primary text-glow truncate group-hover:underline">
                {d.domain}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{d.published}</div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
          </a>
          <CopyButton domain={d.domain} />
        </motion.div>
      ))}
    </div>
  );

  return (
    <Layout>
      <PageHeader
        eyebrow={`${total} Live Domains · Permanent Placement`}
        title="Dofollow Backlinks"
        highlight="$10 Forever"
        description="The full Industry Army Marketing network of live, indexable, dofollow-friendly domains. One $10 payment places your post on any domain below — permanent, no monthly fee, no expiry."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/contact">Claim a Backlink — $10</Link></Button>
          <Button variant="heroOutline" asChild><Link to="/backlinks">Backlink Program Details</Link></Button>
        </div>
      </PageHeader>

      <section className="py-8 bg-background border-b border-border sticky top-16 z-30 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter domains... (e.g. roofers, .ca, weddings)"
                className="pl-11 h-12 font-mono bg-card border-border focus-visible:ring-primary"
                aria-label="Filter dofollow backlink domains"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
              <SelectTrigger
                className="h-12 w-full sm:w-56 bg-card border-border uppercase tracking-widest text-xs font-semibold"
                aria-label="Sort dofollow backlinks"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest published</SelectItem>
                <SelectItem value="oldest">Oldest published</SelectItem>
                <SelectItem value="az">Domain A → Z</SelectItem>
                <SelectItem value="za">Domain Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {hostOptions.map((opt) => {
              const active = host === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHost(opt.value)}
                  aria-pressed={active}
                  className={`px-4 h-9 rounded-md border text-xs uppercase tracking-widest font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {opt.label} <span className="opacity-70">· {opt.count}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {query
              ? `${visibleCount} of ${total} domains match`
              : `${visibleCount} live domains`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <div
              role="radiogroup"
              aria-label="Copy format"
              className="inline-flex rounded-md border border-border bg-card overflow-hidden h-9"
            >
              {([
                { value: "plain", label: "Plain" },
                { value: "url", label: "https://" },
              ] as const).map((opt) => {
                const active = copyFormat === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCopyFormat(opt.value)}
                    className={`px-3 text-xs uppercase tracking-widest font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div
              role="radiogroup"
              aria-label="Copy separator"
              className="inline-flex rounded-md border border-border bg-card overflow-hidden h-9"
            >
              {([
                { value: "newline", label: "Newline" },
                { value: "csv", label: "CSV" },
                { value: "tsv", label: "TSV" },
                { value: "ssv", label: "SSV" },
                { value: "scsv", label: "Semi" },
              ] as const).map((opt) => {
                const active = copySeparator === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCopySeparator(opt.value)}
                    className={`px-3 text-xs uppercase tracking-widest font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={quoteItems}
              aria-label="Wrap items in quotes"
              onClick={() => setQuoteItems((q) => !q)}
              disabled={copySeparator === "newline"}
              title={
                copySeparator !== "newline"
                  ? "Wrap each item in double quotes"
                  : "Switch to CSV, TSV, SSV, or Semi to enable quoting"
              }
              className={`h-9 px-3 inline-flex items-center rounded-md border text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                quoteItems && copySeparator !== "newline"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
              }`}
            >
              "Quoted"
            </button>
            <Button
              type="button"
              variant="heroOutline"
              size="sm"
              onClick={onCopyAll}
              disabled={visibleDomains.length === 0}
              className="gap-2"
            >
              {copiedAll ? (
                <Check className="w-4 h-4" />
              ) : (
                <ClipboardList className="w-4 h-4" />
              )}
              {copiedAll ? "Copied" : `Copy all ${visibleDomains.length}`}
            </Button>
          </div>
          {visibleDomains.length > 0 && (
            <details className="mt-3 max-w-3xl mx-auto" open>
              <summary className="text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                Output preview
              </summary>
              <pre
                aria-label="Copy all output preview"
                className="mt-2 p-3 rounded-md bg-card border border-border text-xs font-mono text-foreground max-h-40 overflow-auto whitespace-pre-wrap break-all"
              >
                {formattedOutput}
              </pre>
            </details>
          )}
        </div>
      </section>

      {showNetlify && (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              Static Network <span className="text-muted-foreground text-lg font-sans">· {netlify.length} domains</span>
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Hand-built static sites on premium .io / .ltd / .ca / .tv / .com TLDs. Fast, lightweight, and indexed — your post is added as a permanent dofollow placement.
          </p>
          {netlify.length > 0 ? renderGrid(netlify) : (
            <p className="text-muted-foreground text-sm italic">No static domains match "{query}".</p>
          )}
        </div>
      </section>
      )}

      {showWordpress && (
      <section className="py-16 gradient-tactical border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              WordPress Network <span className="text-muted-foreground text-lg font-sans">· {wordpress.length} domains</span>
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Managed WordPress sites with editorial-grade publishing. Ideal for guest posts with images, embedded video, and long-form anchor copy.
          </p>
          {wordpress.length > 0 ? renderGrid(wordpress) : (
            <p className="text-muted-foreground text-sm italic">No WordPress domains match "{query}".</p>
          )}
        </div>
      </section>
      )}

      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Lock In Your <span className="text-primary text-glow">Dofollow Backlink</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            One flat $10 payment. Permanent placement. 48-hour turnaround. Email <span className="text-primary">colin@industryarmymarketing.com</span> or call 604-761-1518.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button variant="hero" asChild><Link to="/contact">Get My Backlink</Link></Button>
            <Button variant="heroOutline" asChild><a href="tel:6047611518">Call 604-761-1518</a></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DofollowBacklinks;