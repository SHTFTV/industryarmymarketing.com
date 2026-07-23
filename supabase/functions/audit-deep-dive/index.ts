import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Require an authenticated user. Endpoint calls a paid AI gateway — must not be public.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimData, error: claimErr } = await supabase.auth.getClaims(token);
    if (claimErr || !claimData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimData.claims.sub as string;

    const { url, meta, bodySample, email } = await req.json();
    if (!url || !email) {
      return new Response(JSON.stringify({ error: 'url and email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (typeof url !== 'string' || url.length > 2048) {
      return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (typeof email !== 'string' || email.length > 320) {
      return new Response(JSON.stringify({ error: 'invalid email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Cap sizes forwarded to the paid model. Untrusted user content — hard cap it.
    const safeBodySample = typeof bodySample === 'string' ? bodySample.slice(0, 4000) : '';
    const safeMeta = meta && typeof meta === 'object' ? JSON.stringify(meta).slice(0, 4000) : '{}';

    // Rate limit: max 10 deep-dive runs per user per hour.
    // We use seo_events (already present) as a lightweight ledger.
    const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('seo_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event', 'audit_deep_dive')
      .gte('created_at', oneHourAgo);
    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    await admin.from('seo_events').insert({ user_id: userId, event: 'audit_deep_dive', payload: { url, email } }).catch(() => {});

    const prompt = `You are an expert SEO auditor. Analyze the page below and return ONLY valid JSON with this exact shape:
{"summary":"2-3 sentence executive summary","checks":[{"name":"...","status":"pass|warn|fail","finding":"...","fix":"..."}],"quickWins":["...","...","..."]}

Produce exactly 10 checks covering: title quality, meta description quality, heading hierarchy, content depth & E-E-A-T, internal linking signals, schema/structured data, image SEO, mobile/CWV signals, keyword targeting clarity, and CTAs/conversion clarity.

URL: ${url}
META: ${safeMeta}
BODY SAMPLE (first 4k chars): ${safeBodySample}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': LOVABLE_API_KEY,
        'X-Lovable-AIG-SDK': 'edge-function',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert SEO auditor. Return only valid JSON, no markdown fences.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: text }), { status: aiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { parsed = { summary: content, checks: [], quickWins: [] }; }

    return new Response(JSON.stringify({ email, url, result: parsed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});