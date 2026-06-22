import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { url, meta, bodySample, email } = await req.json();
    if (!url || !email) {
      return new Response(JSON.stringify({ error: 'url and email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `You are an expert SEO auditor. Analyze the page below and return ONLY valid JSON with this exact shape:
{"summary":"2-3 sentence executive summary","checks":[{"name":"...","status":"pass|warn|fail","finding":"...","fix":"..."}],"quickWins":["...","...","..."]}

Produce exactly 10 checks covering: title quality, meta description quality, heading hierarchy, content depth & E-E-A-T, internal linking signals, schema/structured data, image SEO, mobile/CWV signals, keyword targeting clarity, and CTAs/conversion clarity.

URL: ${url}
META: ${JSON.stringify(meta)}
BODY SAMPLE (first 4k chars): ${bodySample}`;

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