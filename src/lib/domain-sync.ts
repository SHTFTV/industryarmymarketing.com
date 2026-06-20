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
};

const DOMAIN_RE = /\b[a-z0-9-]+\.(?:io|tv|ltd|ca|com|co|info)\b/gi;

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

export function buildDomainSyncReport(input: {
  dataDomains: string[];
  networkDomains: string[];
  faqText: string;
}): DomainSyncReport {
  const data = input.dataDomains.map((d) => d.toLowerCase());
  const net = input.networkDomains.map((d) => d.toLowerCase());
  const dataSet = new Set(data);
  const netSet = new Set(net);

  const faqDomains = Array.from(
    new Set((input.faqText.match(DOMAIN_RE) ?? []).map((d) => d.toLowerCase())),
  ).sort();
  const faqDomainsRaw = (input.faqText.match(DOMAIN_RE) ?? []).map((d) => d.toLowerCase());
  const dupesInFaq = findDupes(faqDomainsRaw);

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
  // eslint-disable-next-line no-console
  console.groupEnd();
}