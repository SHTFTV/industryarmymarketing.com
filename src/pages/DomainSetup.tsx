import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "lovable_verify_token";
const DOMAIN = "industryarmymarketing.com";
const LOVABLE_IP = "185.158.133.1";

type Record = {
  type: string;
  host: string;
  value: string;
  ttl: string;
  note?: string;
};

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = value;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="px-3 py-1 text-xs font-mono rounded bg-green-500 text-black hover:bg-green-400 transition"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

const DomainSetup = () => {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
      setInput(saved);
    }
  }, []);

  const saveToken = () => {
    const cleaned = input.trim();
    if (!cleaned) {
      toast.error("Paste the value from Lovable → Project Settings → Domains");
      return;
    }
    // Normalize: accept either "lovable_verify=XXX" or just "XXX"
    const normalized = cleaned.startsWith("lovable_verify=")
      ? cleaned
      : `lovable_verify=${cleaned}`;
    localStorage.setItem(STORAGE_KEY, normalized);
    setToken(normalized);
    toast.success("Saved. Records below are ready to copy.");
  };

  const clearToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setInput("");
  };

  const records: Record[] = [
    { type: "A", host: "@", value: LOVABLE_IP, ttl: "3600", note: "Root domain" },
    { type: "A", host: "www", value: LOVABLE_IP, ttl: "3600", note: "www subdomain" },
    {
      type: "TXT",
      host: "_lovable",
      value: token || "(paste your token above to reveal)",
      ttl: "3600",
      note: "Lovable ownership verification",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-green-400">DNS Setup</h1>
        <p className="text-zinc-400 mb-8">
          Exact records to paste into your registrar (NamesPro, GoDaddy, etc.) for{" "}
          <span className="font-mono text-white">{DOMAIN}</span>.
        </p>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Step 1 — Get your verify token</h2>
          <ol className="text-sm text-zinc-300 space-y-1 list-decimal list-inside mb-4">
            <li>Open Lovable → Project Settings → Domains → Connect Domain.</li>
            <li>Enter <span className="font-mono">{DOMAIN}</span>.</li>
            <li>Copy the TXT value (looks like <span className="font-mono">lovable_verify=abc123…</span>).</li>
            <li>Paste it below.</li>
          </ol>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="lovable_verify=..."
              className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2 font-mono text-sm"
            />
            <button
              onClick={saveToken}
              className="px-4 py-2 bg-green-500 text-black font-semibold rounded hover:bg-green-400"
            >
              Save
            </button>
            {token && (
              <button
                onClick={clearToken}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
              >
                Clear
              </button>
            )}
          </div>
          {token && (
            <p className="text-xs text-green-400 mt-3">
              ✓ Saved locally to this browser. Refresh-safe.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Step 2 — Add these records</h2>
          <div className="space-y-4">
            {records.map((r, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-mono bg-green-500 text-black rounded mr-2">
                      {r.type}
                    </span>
                    <span className="text-sm text-zinc-400">{r.note}</span>
                  </div>
                </div>
                <dl className="grid grid-cols-[100px_1fr_auto] gap-y-2 gap-x-3 items-center text-sm">
                  <dt className="text-zinc-500">Host</dt>
                  <dd className="font-mono break-all">{r.host}</dd>
                  <dd><CopyBtn value={r.host} /></dd>

                  <dt className="text-zinc-500">Value</dt>
                  <dd className="font-mono break-all">
                    {r.type === "TXT" && !token ? (
                      <span className="text-yellow-400">{r.value}</span>
                    ) : (
                      r.value
                    )}
                  </dd>
                  <dd>
                    {r.type === "TXT" && !token ? (
                      <button
                        disabled
                        className="px-3 py-1 text-xs rounded bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      >
                        Copy
                      </button>
                    ) : (
                      <CopyBtn value={r.value} />
                    )}
                  </dd>

                  <dt className="text-zinc-500">TTL</dt>
                  <dd className="font-mono">{r.ttl}</dd>
                  <dd />
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 text-sm text-zinc-400">
          <h3 className="text-white font-semibold mb-2">After saving the records</h3>
          <p>
            Propagation usually takes 15–60 minutes. Verify in terminal:
          </p>
          <pre className="bg-zinc-900 border border-zinc-800 rounded p-3 mt-2 font-mono text-xs overflow-x-auto">
bunx tsx scripts/check-dns-propagation.ts
          </pre>
        </section>
      </div>
    </main>
  );
};

export default DomainSetup;