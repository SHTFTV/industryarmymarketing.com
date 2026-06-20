// Dev-only sync check across the three places domains are listed:
//   - src/data/domains.ts      (canonical domain catalog)
//   - src/pages/Network.tsx    ("groups" rendered on /network)
//   - src/pages/CityPage.tsx   (FAQ blurb listing example domains)
//
// Logs grouped console warnings in development. Returns the report so it can
// also be asserted in tests if desired.

export type DomainSyncReport = {
  ok: boolean;
  dupesInData: string[];
  dupesInNetwork: string[];
  dupesInFaq: string[];
  inNetworkNotInData: string[];
  inDataNotInNetwork: string[];
  faqDomains: string[];
  faqNotInData: string[];
  faqIgnored: string[];
};

// TLDs the IAM network actually uses. Keep in sync with src/data/domains.ts.
const ALLOWED_TLDS = ["io", "tv", "ltd", "ca", "com", "co", "info", "net", "org"] as const;

// Candidate matcher — greedy enough to capture multi-label hosts and URL paths
// so we can post-filter them out (subdomains, emails, paths). Anchored with
// negative-ish boundaries handled in code, not regex, for clarity.
const DOMAIN_CANDIDATE_RE = new RegExp(
  // optional scheme + optional www, then 1+ labels, then a TLD from the list
  `(?:https?://)?(?:www\\.)?([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\\.(?:${ALLOWED_TLDS.join("|")}))(?:/[^\\s)]*)?`,
  "gi",
);

// Strip surrounding/trailing punctuation that often follows a domain in prose.
const TRAILING_PUNCT_RE = /[.,;:!?)\]}'"»›]+$/;

function findDupes(list: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const d of list) {
    const k = d.toLowerCase();
    if (seen.has(k)) dupes.add(k);
    seen.add(k);
  }
  return Array.from(dupes).sort();
}

/**
 * Extract clean root domains from prose. Hardened against:
 *   - Trailing punctuation (".", ",", ")", etc.)
 *   - Email addresses (info@roofers.io → ignored)
 *   - URLs with paths (https://roofers.io/toronto → roofers.io)
 *   - "www." prefixes (www.roofers.io → roofers.io)
 *   - Subdomains (blog.roofers.io → ignored; only root "name.tld" counts)
 *   - Unknown TLDs (foo.xyz → ignored)
 *
 * Returns { kept, ignored } so callers can surface what was filtered out.
 */
export function extractFaqDomains(text: string): { kept: string[]; ignored: string[] } {
  const kept: string[] = [];
  const ignored: string[] = [];
  const matches = text.matchAll(DOMAIN_CANDIDATE_RE);
  for (const m of matches) {
    const start = m.index ?? 0;
    const prevChar = start > 0 ? text[start - 1] : "";
    // Skip emails: "info@roofers.io"
    if (prevChar === "@") continue;
    // Skip if it's the tail of a longer host we already consumed
    // (regex is greedy from the left, so this is mostly defensive)
    if (prevChar && /[a-z0-9-]/i.test(prevChar)) continue;

    let host = (m[1] || m[0]).toLowerCase();
    host = host.replace(/^https?:\/\//, "").replace(/^www\./, "");
    // Drop any path/query that snuck in via the outer group
    host = host.split("/")[0].split("?")[0].split("#")[0];
    host = host.replace(TRAILING_PUNCT_RE, "");

    const labels = host.split(".");
    const tld = labels[labels.length - 1];
    if (!ALLOWED_TLDS.includes(tld as (typeof ALLOWED_TLDS)[number])) continue;

    // Enforce root domain only (exactly "name.tld"). Subdomains are intentionally ignored
    // so "blog.roofers.io" doesn't get treated as a missing catalog entry.
    if (labels.length !== 2) {
      ignored.push(host);
      continue;
    }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(labels[0])) {
      ignored.push(host);
      continue;
    }
    kept.push(host);
  }
  return { kept, ignored: Array.from(new Set(ignored)).sort() };
}

export function buildDomainSyncReport(input: {
  dataDomains: string[];
  networkDomains: string[];
  faqText: string;
}): DomainSyncReport {
  const data = input.dataDomains.map((d) => d.toLowerCase());
  const net = input.networkDomains.map((d) => d.toLowerCase());
  const dataSet = new Set(data);
  const netSet = new Set(net);

  const { kept: faqRaw, ignored: faqIgnored } = extractFaqDomains(input.faqText);
  const faqDomains = Array.from(new Set(faqRaw)).sort();
  const dupesInFaq = findDupes(faqRaw);

  const inNetworkNotInData = Array.from(netSet).filter((d) => !dataSet.has(d)).sort();
  const inDataNotInNetwork = Array.from(dataSet).filter((d) => !netSet.has(d)).sort();
  const faqNotInData = faqDomains.filter((d) => !dataSet.has(d));

  const dupesInData = findDupes(data);
  const dupesInNetwork = findDupes(net);

  const ok =
    dupesInData.length === 0 &&
    dupesInNetwork.length === 0 &&
    dupesInFaq.length === 0 &&
    inNetworkNotInData.length === 0 &&
    inDataNotInNetwork.length === 0 &&
    faqNotInData.length === 0;

  return {
    ok,
    dupesInData,
    dupesInNetwork,
    dupesInFaq,
    inNetworkNotInData,
    inDataNotInNetwork,
    faqDomains,
    faqNotInData,
    faqIgnored,
  };
}

export function logDomainSyncReport(r: DomainSyncReport) {
  if (r.ok) {
    // eslint-disable-next-line no-console
    console.info(
      "%c[domain-sync] OK%c — Network.tsx, domains.ts, and FAQ are in sync.",
      "color:#4CAF50;font-weight:bold",
      "color:inherit",
    );
    if (r.faqIgnored.length) {
      // eslint-disable-next-line no-console
      console.debug(
        "[domain-sync] FAQ candidates ignored (subdomains/unknown TLDs):",
        r.faqIgnored.join(", "),
      );
    }
    return;
  }
  // eslint-disable-next-line no-console
  console.group(
    "%c⚠️ [domain-sync] Out of sync",
    "color:#FF5722;font-weight:bold;font-size:12px",
  );
  const row = (label: string, items: string[]) => {
    if (items.length) {
      // eslint-disable-next-line no-console
      console.warn(`${label} (${items.length}):`, items.join(", "));
    }
  };
  row("Duplicates in domains.ts", r.dupesInData);
  row("Duplicates in Network.tsx", r.dupesInNetwork);
  row("Duplicate mentions in FAQ blurb", r.dupesInFaq);
  row("In Network.tsx but missing from domains.ts", r.inNetworkNotInData);
  row("In domains.ts but missing from Network.tsx", r.inDataNotInNetwork);
  row("Mentioned in FAQ but missing from domains.ts", r.faqNotInData);
  row("FAQ candidates ignored (subdomains/unknown TLDs)", r.faqIgnored);
  // eslint-disable-next-line no-console
  console.groupEnd();
}