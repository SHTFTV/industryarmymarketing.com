// Submits blog URLs to IndexNow and Google URL Inspection, logging every
// attempt to public.submission_log. Retries transient failures with
// exponential backoff by scheduling `next_retry_at` on the log row; the
// `process-submission-retries` function picks those up on a schedule.
//
// Auth: admin JWT OR service-role key (used by DB triggers / cron).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = "https://www.industryarmymarketing.com/";
const INDEXNOW_KEY = "2ca1481140c909a538c26cb669cf6be1";
const INDEXNOW_HOST = "www.industryarmymarketing.com";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const MAX_ATTEMPTS = 5;

function gscHeaders() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovableKey || !gscKey) throw new Error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gscKey,
    "Content-Type": "application/json",
  };
}

// Backoff: 1m, 5m, 15m, 60m, 4h — capped by MAX_ATTEMPTS.
function backoffMs(attempt: number): number {
  const table = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 4 * 60 * 60_000];
  return table[Math.min(attempt - 1, table.length - 1)];
}

function isTransient(status: number | null, err?: string | null): boolean {
  if (err) return true;
  if (status == null) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}

type LogInsert = {
  url: string;
  engine: "indexnow" | "google_sitemap" | "google_inspect";
  status: "success" | "failed" | "retrying" | "exhausted";
  http_status: number | null;
  response_body: string | null;
  error: string | null;
  attempt: number;
  max_attempts: number;
  next_retry_at: string | null;
  trigger_source: string;
};

async function pingIndexNow(urls: string[]): Promise<{ status: number; body: string }> {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });
  return { status: res.status, body: (await res.text()) || "" };
}

async function inspectUrl(inspectionUrl: string): Promise<{ status: number; body: string; verdict: string | null }> {
  const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
    method: "POST",
    headers: gscHeaders(),
    body: JSON.stringify({ inspectionUrl, siteUrl: SITE_URL }),
  });
  const text = await res.text();
  let verdict: string | null = null;
  try { verdict = JSON.parse(text)?.inspectionResult?.indexStatusResult?.verdict ?? null; } catch { /* ignore */ }
  return { status: res.status, body: text, verdict };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    // Auth: allow either admin JWT or shared service token in header.
    const authHeader = req.headers.get("Authorization") ?? "";
    const isServiceCall = authHeader === `Bearer ${serviceKey}` ||
      req.headers.get("x-service-token") === serviceKey;

    if (!isServiceCall) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: userData } = await userClient.auth.getUser();
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body.urls) ? body.urls.filter((u: unknown) => typeof u === "string") : [];
    const source: string = typeof body.source === "string" ? body.source : (isServiceCall ? "service" : "admin");
    const skipInspect: boolean = body.skipInspect === true;

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const logs: LogInsert[] = [];

    // IndexNow: one batched call per invocation, but log per-URL for the audit trail.
    try {
      const { status, body: rb } = await pingIndexNow(urls);
      const ok = status >= 200 && status < 300;
      for (const u of urls) {
        const attempt = 1;
        const transient = !ok && isTransient(status);
        logs.push({
          url: u,
          engine: "indexnow",
          status: ok ? "success" : transient ? "retrying" : "failed",
          http_status: status,
          response_body: rb.slice(0, 2000),
          error: ok ? null : `HTTP ${status}`,
          attempt,
          max_attempts: MAX_ATTEMPTS,
          next_retry_at: !ok && transient ? new Date(Date.now() + backoffMs(attempt)).toISOString() : null,
          trigger_source: source,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      for (const u of urls) {
        logs.push({
          url: u, engine: "indexnow", status: "retrying", http_status: null, response_body: null,
          error: msg, attempt: 1, max_attempts: MAX_ATTEMPTS,
          next_retry_at: new Date(Date.now() + backoffMs(1)).toISOString(), trigger_source: source,
        });
      }
    }

    // Google URL inspection per-URL (best-effort, capped).
    if (!skipInspect) {
      for (const u of urls.slice(0, 10)) {
        try {
          const { status, body: rb, verdict } = await inspectUrl(u);
          const ok = status >= 200 && status < 300;
          const transient = !ok && isTransient(status);
          logs.push({
            url: u,
            engine: "google_inspect",
            status: ok ? "success" : transient ? "retrying" : "failed",
            http_status: status,
            response_body: (verdict ? `verdict=${verdict}\n` : "") + rb.slice(0, 2000),
            error: ok ? null : `HTTP ${status}`,
            attempt: 1,
            max_attempts: MAX_ATTEMPTS,
            next_retry_at: !ok && transient ? new Date(Date.now() + backoffMs(1)).toISOString() : null,
            trigger_source: source,
          });
        } catch (err) {
          logs.push({
            url: u, engine: "google_inspect", status: "retrying", http_status: null, response_body: null,
            error: err instanceof Error ? err.message : String(err),
            attempt: 1, max_attempts: MAX_ATTEMPTS,
            next_retry_at: new Date(Date.now() + backoffMs(1)).toISOString(), trigger_source: source,
          });
        }
      }
    }

    const { error: insertErr } = await supabase.from("submission_log").insert(logs);
    if (insertErr) console.error("submission_log insert failed", insertErr);

    return new Response(JSON.stringify({
      submittedAt: new Date().toISOString(),
      count: urls.length,
      logs: logs.map((l) => ({ url: l.url, engine: l.engine, status: l.status, http_status: l.http_status })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});