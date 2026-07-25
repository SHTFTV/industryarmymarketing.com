// Picks retryable submission_log rows past their next_retry_at and retries
// them with exponential backoff. Safe to call on a schedule (cron) or
// manually by an admin. Uses service role.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = "https://www.industryarmymarketing.com/";
const INDEXNOW_KEY = "2ca1481140c909a538c26cb669cf6be1";
const INDEXNOW_HOST = "www.industryarmymarketing.com";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function backoffMs(attempt: number): number {
  const table = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 4 * 60 * 60_000];
  return table[Math.min(attempt - 1, table.length - 1)];
}

function gscHeaders() {
  return {
    Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY") ?? "",
    "Content-Type": "application/json",
  };
}

async function retryIndexNow(url: string) {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST, key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: [url],
    }),
  });
  return { status: res.status, body: (await res.text()) || "" };
}

async function retryInspect(url: string) {
  const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
    method: "POST", headers: gscHeaders(),
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  });
  const text = await res.text();
  let verdict: string | null = null;
  try { verdict = JSON.parse(text)?.inspectionResult?.indexStatusResult?.verdict ?? null; } catch { /* ignore */ }
  return { status: res.status, body: (verdict ? `verdict=${verdict}\n` : "") + text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: rows, error } = await supabase
    .from("submission_log")
    .select("id,url,engine,attempt,max_attempts")
    .in("status", ["retrying"])
    .lte("next_retry_at", new Date().toISOString())
    .order("next_retry_at", { ascending: true })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; status: string; http_status: number | null }> = [];

  for (const row of rows ?? []) {
    const attempt = row.attempt + 1;
    let httpStatus: number | null = null;
    let responseBody: string | null = null;
    let errMsg: string | null = null;

    try {
      if (row.engine === "indexnow") {
        const r = await retryIndexNow(row.url);
        httpStatus = r.status;
        responseBody = r.body.slice(0, 2000);
      } else if (row.engine === "google_inspect") {
        const r = await retryInspect(row.url);
        httpStatus = r.status;
        responseBody = r.body.slice(0, 2000);
      }
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }

    const ok = httpStatus != null && httpStatus >= 200 && httpStatus < 300;
    const transient = errMsg != null || httpStatus == null || httpStatus === 429 || (httpStatus ?? 0) >= 500;
    const exhausted = !ok && attempt >= row.max_attempts;
    const newStatus = ok ? "success" : exhausted ? "exhausted" : transient ? "retrying" : "failed";

    await supabase.from("submission_log").update({
      status: newStatus,
      attempt,
      http_status: httpStatus,
      response_body: responseBody,
      error: ok ? null : (errMsg ?? `HTTP ${httpStatus}`),
      next_retry_at: newStatus === "retrying" ? new Date(Date.now() + backoffMs(attempt)).toISOString() : null,
    }).eq("id", row.id);

    results.push({ id: row.id, status: newStatus, http_status: httpStatus });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});