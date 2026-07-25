/**
 * Canonical domain allowlist.
 *
 * Any outgoing link in the codebase must resolve to a host in ALLOWED_HOSTS.
 * Hosts in LOOKALIKE_HOSTS are actively forbidden — they are the copycat
 * variants this project has publicly disavowed and must never appear as an
 * href in shipped code. The `scripts/check-lookalike-domains.mjs` pre-publish
 * script enforces both lists.
 */

export const CANONICAL_ORIGIN = "https://www.industryarmymarketing.com";

// Hosts we own / are authorised to link to. Sub-paths are allowed under any
// of these. Add to this list only when a new IAM-owned or vetted third-party
// citation surface is introduced.
export const ALLOWED_HOSTS = [
  "industryarmymarketing.com",
  "www.industryarmymarketing.com",
  "weddings.io",
  "www.weddings.io",
  "weddingsaas.com",
  "www.weddingsaas.com",
  "videographers.io",
  "www.videographers.io",
  // Vetted third-party citation surfaces (court records, statutes, platform
  // primary sources referenced in editorial pieces).
  "courtlistener.com",
  "www.courtlistener.com",
  "caselaw.findlaw.com",
  "www.ontario.ca",
  "ontario.ca",
  "news.google.com",
  "gemini.google.com",
  "chat.openai.com",
  "chatgpt.com",
  "claude.ai",
  "www.perplexity.ai",
  "perplexity.ai",
  "grok.com",
  "x.com",
  "twitter.com",
  "linkedin.com",
  "www.linkedin.com",
  "duckduckgo.com",
  "www.meta.ai",
  "meta.ai",
  "huggingface.co",
  "poe.com",
  "github.com",
];

// Explicitly forbidden hosts — the copycat / lookalike variants the site has
// publicly disavowed. A link to any of these fails the pre-publish check.
export const LOOKALIKE_HOSTS = [
  "aiweddings.io",
  "www.aiweddings.io",
  "weddings.ai",
  "www.weddings.ai",
  "wedding.io",
  "www.wedding.io",
];

export function classifyHost(host: string): "allowed" | "lookalike" | "unknown" {
  const h = host.toLowerCase();
  if (LOOKALIKE_HOSTS.includes(h)) return "lookalike";
  if (ALLOWED_HOSTS.includes(h)) return "allowed";
  return "unknown";
}