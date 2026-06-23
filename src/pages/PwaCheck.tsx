import { useEffect, useState } from "react";
import Seo from "@/components/Seo";

type Status = "ok" | "warn" | "fail";
type Row = { label: string; status: Status; detail?: string };

const REQUIRED_FIELDS = ["name", "short_name", "icons", "start_url", "display", "theme_color", "background_color"] as const;

const badge = (s: Status) =>
  s === "ok" ? "bg-primary text-primary-foreground" : s === "warn" ? "bg-yellow-500 text-black" : "bg-destructive text-destructive-foreground";

const headOrGet = async (url: string): Promise<Response> => {
  try {
    const r = await fetch(url, { method: "HEAD" });
    if (r.ok) return r;
  } catch {}
  return fetch(url, { method: "GET" });
};

const loadImageDims = (url: string): Promise<{ w: number; h: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });

const PwaCheck = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(true);
  const [manifest, setManifest] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Row[] = [];
      let mf: any = null;
      const manifestUrl = new URL("/site.webmanifest", window.location.href);
      try {
        const res = await fetch(manifestUrl.href, { cache: "no-cache" });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          out.push({ label: "GET /site.webmanifest", status: "fail", detail: `HTTP ${res.status}` });
        } else {
          out.push({ label: "GET /site.webmanifest", status: "ok", detail: `HTTP 200 · ${ct}` });
          out.push({
            label: "Manifest content-type",
            status: ct.includes("manifest+json") || ct.includes("application/json") ? "ok" : "warn",
            detail: ct || "missing",
          });
          mf = await res.json();
          setManifest(mf);
        }
      } catch (e: any) {
        out.push({ label: "GET /site.webmanifest", status: "fail", detail: e?.message ?? String(e) });
      }

      if (mf) {
        for (const f of REQUIRED_FIELDS) {
          const present = mf[f] !== undefined && mf[f] !== null && !(Array.isArray(mf[f]) && mf[f].length === 0);
          out.push({ label: `field: ${f}`, status: present ? "ok" : "fail", detail: present ? JSON.stringify(mf[f]).slice(0, 80) : "missing" });
        }

        const icons: Array<{ src: string; sizes?: string; type?: string; purpose?: string }> = mf.icons || [];
        const has192 = icons.some((i) => /(^|\s)192x192(\s|$)/.test(i.sizes || ""));
        const has512 = icons.some((i) => /(^|\s)512x512(\s|$)/.test(i.sizes || ""));
        const hasMaskable = icons.some((i) => (i.purpose || "").includes("maskable"));
        out.push({ label: "icon ≥ 192x192", status: has192 ? "ok" : "fail" });
        out.push({ label: "icon ≥ 512x512", status: has512 ? "ok" : "fail" });
        out.push({ label: "maskable icon present", status: hasMaskable ? "ok" : "warn", detail: hasMaskable ? "" : "recommended for Android adaptive icons" });

        for (const icon of icons) {
          const url = new URL(icon.src, manifestUrl).href;
          let status: Status = "ok";
          const detail: string[] = [`→ ${url}`];
          try {
            const res = await headOrGet(url);
            if (!res.ok) {
              status = "fail";
              detail.push(`HTTP ${res.status}`);
            } else {
              const ct = res.headers.get("content-type") || "";
              detail.push(ct);
              if (icon.type && ct && !ct.includes(icon.type.split("/")[1])) {
                status = "warn";
                detail.push(`declared ${icon.type}`);
              }
            }
          } catch (e: any) {
            status = "fail";
            detail.push(e?.message ?? String(e));
          }

          if (icon.type !== "image/svg+xml" && icon.sizes && icon.sizes !== "any") {
            try {
              const { w, h } = await loadImageDims(url);
              const [dw, dh] = icon.sizes.split("x").map(Number);
              if (w === dw && h === dh) {
                detail.push(`${w}x${h} ✓`);
              } else {
                status = status === "fail" ? "fail" : "warn";
                detail.push(`actual ${w}x${h} ≠ declared ${icon.sizes}`);
              }
            } catch {
              status = "fail";
              detail.push("could not load image");
            }
          }

          out.push({ label: `icon ${icon.src}${icon.sizes ? ` (${icon.sizes})` : ""}`, status, detail: detail.join(" · ") });
        }
      }

      const links = Array.from(document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], link[rel="apple-touch-icon"], link[rel="mask-icon"]')) as HTMLLinkElement[];
      for (const l of links) {
        try {
          const res = await headOrGet(l.href);
          out.push({
            label: `<link rel="${l.rel}"> ${new URL(l.href).pathname}`,
            status: res.ok ? "ok" : "fail",
            detail: `HTTP ${res.status} · ${res.headers.get("content-type") || ""}`,
          });
        } catch (e: any) {
          out.push({ label: `<link rel="${l.rel}"> ${l.href}`, status: "fail", detail: e?.message ?? String(e) });
        }
      }

      if (!cancelled) {
        setRows(out);
        setRunning(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = rows.reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { ok: 0, warn: 0, fail: 0 } as Record<Status, number>,
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Seo
        title="PWA & Icon Validation | IAM Internal"
        description="Internal PWA manifest and icon validation tool for Industry Army Marketing."
        path="/pwa-check"
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl mb-2 text-primary">PWA / Icon Validation</h1>
        <p className="text-muted-foreground mb-6">
          Live in-browser audit of <code>site.webmanifest</code>, required fields, declared icons, and HTML link tags.
        </p>

        <div className="flex gap-2 mb-6 text-sm">
          <span className={`px-3 py-1 rounded ${badge("ok")}`}>{counts.ok} ok</span>
          <span className={`px-3 py-1 rounded ${badge("warn")}`}>{counts.warn} warn</span>
          <span className={`px-3 py-1 rounded ${badge("fail")}`}>{counts.fail} fail</span>
          {running && <span className="px-3 py-1 rounded bg-muted text-muted-foreground">running…</span>}
        </div>

        <div className="border border-border rounded-md divide-y divide-border bg-card">
          {rows.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 text-sm">
              <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase ${badge(r.status)}`}>{r.status}</span>
              <div className="min-w-0">
                <div className="font-mono break-all">{r.label}</div>
                {r.detail && <div className="text-muted-foreground text-xs mt-0.5 break-all">{r.detail}</div>}
              </div>
            </div>
          ))}
        </div>

        {manifest && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted-foreground">Raw manifest</summary>
            <pre className="mt-2 p-4 bg-card border border-border rounded text-xs overflow-x-auto">{JSON.stringify(manifest, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default PwaCheck;
