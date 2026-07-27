// Admin-only: submit the current sitemap to Google Search Console and
// (best-effort) request URL inspection for the most recent blog posts.
// Also fires an IndexNow ping so Bing/Yandex/Seznam/Naver pick up new URLs.
//
// Requires the Google Search Console connector to be linked to the project.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = "https://www.industryarmymarketing.com/";
const SITEMAP_URL = `${SITE_URL}sitemap.xml`;
const INDEXNOW_KEY = "2ca1481140c909a538c26cb669cf6be1";
const INDEXNOW_HOST = "www.industryarmymarketing.com";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function gscHeaders() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovableKey || !gscKey) {
    throw new Error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gscKey,
    "Content-Type": "application/json",
  };
}

async function submitSitemap() {
  const encodedSite = encodeURIComponent(SITE_URL);
  const encodedSitemap = encodeURIComponent(SITEMAP_URL);
  const url = `${GATEWAY}/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`;
  const res = await fetch(url, { method: "PUT", headers: gscHeaders() });
  const body = await res.text();
  return { status: res.status, ok: res.ok, body };
}

async function inspectUrls(urls: string[]) {
  const results = [];
  for (const inspectionUrl of urls.slice(0, 10)) {
    try {
      const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
        method: "POST",
        headers: gscHeaders(),
        body: JSON.stringify({ inspectionUrl, siteUrl: SITE_URL }),
      });
      const body = await res.json().catch(() => ({}));
      results.push({ url: inspectionUrl, status: res.status, verdict: body?.inspectionResult?.indexStatusResult?.verdict ?? null });
    } catch (err) {
      results.push({ url: inspectionUrl, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

async function pingIndexNow(urlList: string[]) {
  if (urlList.length === 0) return { skipped: true };
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  return { status: res.status, body: await res.text() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth: caller must be an admin.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull recent blog URLs from the sitemap directly (source of truth).
    const sitemapRes = await fetch(SITEMAP_URL, { headers: { Accept: "application/xml" } });
    const xml = await sitemapRes.text();
    const blogUrls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
      .map((m) => m[1].trim())
      .filter((u) => u.includes("/blog/"));

    const [sitemapResult, indexNowResult, inspectionResults] = await Promise.all([
      submitSitemap().catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
      pingIndexNow(blogUrls).catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
      inspectUrls(blogUrls).catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
    ]);

    return new Response(
      JSON.stringify({
        submittedAt: new Date().toISOString(),
        totalBlogUrls: blogUrls.length,
        sitemapSubmit: sitemapResult,
        indexNow: indexNowResult,
        inspection: inspectionResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});