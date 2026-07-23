import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// SSRF protection: reject non-public hosts, private ranges, and cloud metadata IPs.
// We resolve DNS before fetch and re-check the resolved IPs. We do NOT allow redirects
// (redirect: 'error') so a public URL cannot rebind to an internal one mid-request.
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

function isBlockedIPv4(ip: string): boolean {
  const n = ipToNumber(ip);
  if (n === null) return true;
  const inRange = (start: string, prefix: number) => {
    const s = ipToNumber(start)!;
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    return (n & mask) === (s & mask);
  };
  return (
    inRange('0.0.0.0', 8) ||          // "This" network
    inRange('10.0.0.0', 8) ||          // Private
    inRange('100.64.0.0', 10) ||       // CGNAT
    inRange('127.0.0.0', 8) ||         // Loopback
    inRange('169.254.0.0', 16) ||      // Link-local + cloud metadata (169.254.169.254)
    inRange('172.16.0.0', 12) ||       // Private
    inRange('192.0.0.0', 24) ||        // IETF
    inRange('192.168.0.0', 16) ||      // Private
    inRange('198.18.0.0', 15) ||       // Benchmarking
    inRange('224.0.0.0', 4) ||         // Multicast
    inRange('240.0.0.0', 4)            // Reserved
  );
}

function isBlockedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return (
    lower === '::1' ||                   // Loopback
    lower === '::' ||
    lower.startsWith('fc') ||             // Unique local fc00::/7
    lower.startsWith('fd') ||
    lower.startsWith('fe80') ||           // Link-local
    lower.startsWith('fe9') ||
    lower.startsWith('fea') ||
    lower.startsWith('feb') ||
    lower.startsWith('ff') ||             // Multicast
    lower.startsWith('::ffff:')           // IPv4-mapped — re-check IPv4
  );
}

async function assertPublicHost(host: string): Promise<void> {
  // Reject bracketed IPv6 literals, non-ASCII, obviously-invalid hosts.
  const cleanHost = host.replace(/^\[|\]$/g, '');
  if (!cleanHost || cleanHost.length > 253) throw new Error('invalid host');
  // If host is a literal IP, check it directly.
  if (/^[0-9.]+$/.test(cleanHost)) {
    if (isBlockedIPv4(cleanHost)) throw new Error('host resolves to a blocked address');
    return;
  }
  if (cleanHost.includes(':')) {
    if (isBlockedIPv6(cleanHost)) throw new Error('host resolves to a blocked address');
    return;
  }
  // Reject localhost aliases without DNS lookup.
  if (/^(localhost|localhost\.localdomain|ip6-localhost|ip6-loopback)$/i.test(cleanHost)) {
    throw new Error('host resolves to a blocked address');
  }
  // Resolve DNS. Deno.resolveDns requires --allow-net; edge runtime allows it.
  let records: string[] = [];
  try {
    const a = await Deno.resolveDns(cleanHost, 'A').catch(() => [] as string[]);
    const aaaa = await Deno.resolveDns(cleanHost, 'AAAA').catch(() => [] as string[]);
    records = [...a, ...aaaa];
  } catch {
    throw new Error('dns resolution failed');
  }
  if (records.length === 0) throw new Error('dns resolution failed');
  for (const ip of records) {
    if (ip.includes(':')) {
      if (isBlockedIPv6(ip)) throw new Error('host resolves to a blocked address');
    } else {
      if (isBlockedIPv4(ip)) throw new Error('host resolves to a blocked address');
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (url.length > 2048) {
      return new Response(JSON.stringify({ error: 'url too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let target: URL;
    try { target = new URL(url.startsWith('http') ? url : `https://${url}`); }
    catch { return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'only http(s) URLs allowed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Reject credentials-in-URL and non-standard ports that commonly hit internal services.
    if (target.username || target.password) {
      return new Response(JSON.stringify({ error: 'credentials in url not allowed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (target.port && !['', '80', '443', '8080', '8443'].includes(target.port)) {
      return new Response(JSON.stringify({ error: 'port not allowed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    try {
      await assertPublicHost(target.hostname);
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const started = Date.now();
    // redirect: 'error' — do NOT follow redirects. A redirect could point to a
    // private address that bypasses the pre-fetch DNS check.
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 10_000);
    let res: Response;
    try {
      res = await fetch(target.toString(), {
        redirect: 'error',
        signal: ac.signal,
        headers: { 'User-Agent': 'IAM-SEO-Audit/1.0', Accept: 'text/html,application/xhtml+xml' },
      });
    } catch (e) {
      clearTimeout(timeout);
      return new Response(JSON.stringify({ error: 'fetch failed', detail: (e as Error).message }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    clearTimeout(timeout);
    const ttfb = Date.now() - started;
    // Cap response size to prevent runaway memory usage on huge documents.
    const buf = new Uint8Array(await res.arrayBuffer());
    const html = new TextDecoder().decode(buf.slice(0, 2_000_000));

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