// Polls DNS for industryarmymarketing.com and www.industryarmymarketing.com
// until both A records resolve to Lovable's hosting IP (185.158.133.1) across
// multiple public resolvers (Cloudflare, Google, Quad9), then performs an HTTPS
// check to confirm the live site is being served by Lovable.
//
// Usage:
//   bunx tsx scripts/check-dns-propagation.ts
//   bunx tsx scripts/check-dns-propagation.ts --once     # single check, no polling
//   bunx tsx scripts/check-dns-propagation.ts --interval=20 --timeout=1800

const DOMAIN = "industryarmymarketing.com";
const HOSTS = [DOMAIN, `www.${DOMAIN}`];
const EXPECTED_IP = "185.158.133.1";

const RESOLVERS: { name: string; url: (host: string) => string }[] = [
  { name: "Cloudflare", url: (h) => `https://cloudflare-dns.com/dns-query?name=${h}&type=A` },
  { name: "Google",     url: (h) => `https://dns.google/resolve?name=${h}&type=A` },
  { name: "Quad9",      url: (h) => `https://dns.quad9.net:5053/dns-query?name=${h}&type=A` },
];

const args = new Set(process.argv.slice(2));
const getArg = (name: string, fallback: number) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split("=")[1]) : fallback;
};
const ONCE = args.has("--once");
const INTERVAL_S = getArg("interval", 30);
const TIMEOUT_S = getArg("timeout", 1800); // 30 minutes default

type ResolverResult = { resolver: string; ips: string[]; ok: boolean; error?: string };

async function queryResolver(host: string, r: typeof RESOLVERS[number]): Promise<ResolverResult> {
  try {
    const res = await fetch(r.url(host), { headers: { accept: "application/dns-json" } });
    if (!res.ok) return { resolver: r.name, ips: [], ok: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { Answer?: { type: number; data: string }[] };
    const ips = (data.Answer ?? []).filter((a) => a.type === 1).map((a) => a.data);
    return { resolver: r.name, ips, ok: ips.includes(EXPECTED_IP) };
  } catch (e) {
    return { resolver: r.name, ips: [], ok: false, error: (e as Error).message };
  }
}

async function checkHost(host: string) {
  const results = await Promise.all(RESOLVERS.map((r) => queryResolver(host, r)));
  const allOk = results.every((r) => r.ok);
  console.log(`\n${host}`);
  for (const r of results) {
    const tag = r.ok ? "✓" : "✗";
    const detail = r.error ? `error: ${r.error}` : r.ips.length ? r.ips.join(", ") : "no A record";
    console.log(`  ${tag} ${r.resolver.padEnd(11)} → ${detail}`);
  }
  return allOk;
}

async function checkHttps(host: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${host}/`, { redirect: "manual" });
    const server = res.headers.get("server") ?? "";
    const xPoweredBy = res.headers.get("x-powered-by") ?? "";
    const xRedirectBy = res.headers.get("x-redirect-by") ?? "";
    const isWordPress = /wordpress|rank math/i.test(`${server} ${xPoweredBy} ${xRedirectBy}`);
    console.log(`  HTTPS ${host} → ${res.status} ${res.statusText} (server: ${server || "?"})`);
    if (isWordPress) {
      console.log(`     ⚠ Response looks like the old WordPress site, not Lovable.`);
      return false;
    }
    return res.status < 500;
  } catch (e) {
    console.log(`  HTTPS ${host} → error: ${(e as Error).message}`);
    return false;
  }
}

async function runOnce(): Promise<boolean> {
  console.log(`[${new Date().toISOString()}] Checking DNS for A → ${EXPECTED_IP}`);
  const dnsResults = await Promise.all(HOSTS.map((h) => checkHost(h)));
  const dnsOk = dnsResults.every(Boolean);

  if (!dnsOk) return false;

  console.log(`\n✓ DNS resolves to ${EXPECTED_IP} on all resolvers. Checking HTTPS ...`);
  const httpsResults = await Promise.all(HOSTS.map((h) => checkHttps(h)));
  return httpsResults.every(Boolean);
}

async function main() {
  if (ONCE) {
    const ok = await runOnce();
    console.log(ok ? "\n✓ Domain is live on Lovable." : "\n✗ Not ready yet.");
    process.exit(ok ? 0 : 1);
  }

  const start = Date.now();
  let attempt = 0;
  while ((Date.now() - start) / 1000 < TIMEOUT_S) {
    attempt++;
    console.log(`\n=== Attempt ${attempt} ===`);
    if (await runOnce()) {
      console.log(`\n✓ Domain is fully propagated and serving from Lovable.`);
      process.exit(0);
    }
    console.log(`\n…not ready. Sleeping ${INTERVAL_S}s (timeout in ${Math.round(TIMEOUT_S - (Date.now() - start) / 1000)}s).`);
    await new Promise((r) => setTimeout(r, INTERVAL_S * 1000));
  }
  console.error(`\n✗ Timed out after ${TIMEOUT_S}s without successful propagation.`);
  process.exit(1);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});