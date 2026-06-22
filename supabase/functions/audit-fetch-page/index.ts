import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let target: URL;
    try { target = new URL(url.startsWith('http') ? url : `https://${url}`); }
    catch { return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

    const started = Date.now();
    const res = await fetch(target.toString(), { redirect: 'follow', headers: { 'User-Agent': 'IAM-SEO-Audit/1.0' } });
    const ttfb = Date.now() - started;
    const html = await res.text();

    const pick = (re: RegExp) => { const m = html.match(re); return m ? m[1].trim() : ''; };
    const all = (re: RegExp) => { const out: string[] = []; let m; while ((m = re.exec(html)) !== null) out.push(m[1].trim()); return out; };

    const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const robots = pick(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const viewport = pick(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i);
    const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
    const h1s = all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    const h2s = all(/<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    const imgs = all(/<img\b([^>]*)>/gi);
    const imgsMissingAlt = imgs.filter(tag => !/\balt\s*=/.test(tag)).length;
    const hasSchema = /application\/ld\+json/i.test(html);
    const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(' ').length : 0;
    const httpsOk = target.protocol === 'https:';

    // Scoring (0-100)
    const checks = [
      { id: 'title', label: 'Title tag (30–60 chars)', pass: title.length >= 30 && title.length <= 60, value: `${title.length} chars` },
      { id: 'description', label: 'Meta description (70–160 chars)', pass: description.length >= 70 && description.length <= 160, value: `${description.length} chars` },
      { id: 'h1', label: 'Single H1', pass: h1s.length === 1, value: `${h1s.length} found` },
      { id: 'canonical', label: 'Canonical tag', pass: !!canonical, value: canonical || 'missing' },
      { id: 'viewport', label: 'Responsive viewport', pass: !!viewport, value: viewport ? 'set' : 'missing' },
      { id: 'og', label: 'Open Graph image', pass: !!ogImage, value: ogImage ? 'set' : 'missing' },
      { id: 'schema', label: 'Structured data (JSON-LD)', pass: hasSchema, value: hasSchema ? 'detected' : 'missing' },
      { id: 'alt', label: 'All images have alt text', pass: imgsMissingAlt === 0, value: `${imgsMissingAlt} missing` },
      { id: 'https', label: 'HTTPS', pass: httpsOk, value: target.protocol },
      { id: 'words', label: 'Substantive content (>300 words)', pass: wordCount > 300, value: `${wordCount} words` },
      { id: 'robots', label: 'Not blocked by robots meta', pass: !/noindex/i.test(robots), value: robots || 'default' },
      { id: 'ttfb', label: 'TTFB < 800 ms', pass: ttfb < 800, value: `${ttfb} ms` },
    ];
    const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);

    return new Response(JSON.stringify({
      url: target.toString(), status: res.status, ttfb, score, checks,
      meta: { title, description, canonical, robots, viewport, ogTitle, ogImage, h1s, h2s: h2s.slice(0, 10), wordCount, imgsMissingAlt, hasSchema, httpsOk },
      bodySample: bodyText.slice(0, 4000),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});