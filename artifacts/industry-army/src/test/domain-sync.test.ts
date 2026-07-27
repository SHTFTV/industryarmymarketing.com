import { describe, it, expect } from "vitest";
import { buildDomainSyncReport } from "@/lib/domain-sync";
import { domains as dataDomains } from "@/data/domains";
import { groups } from "@/pages/Network";
import { FAQ_DOMAIN_BLURB } from "@/pages/CityPage";

describe("domain catalog sync", () => {
  const report = buildDomainSyncReport({
    dataDomains: dataDomains.map((d) => d.domain),
    networkDomains: groups.flatMap((g) => g.domains.map(([d]) => d)),
    faqText: FAQ_DOMAIN_BLURB,
  });

  it("has no duplicates in domains.ts", () => {
    expect(report.dupesInData).toEqual([]);
  });

  it("has no duplicates in Network.tsx groups", () => {
    expect(report.dupesInNetwork).toEqual([]);
  });

  it("has no duplicate mentions in the FAQ blurb", () => {
    expect(report.dupesInFaq).toEqual([]);
  });

  it("every Network domain exists in the domains.ts catalog", () => {
    expect(report.inNetworkNotInData).toEqual([]);
  });

  it("every domains.ts entry is rendered on /network", () => {
    expect(report.inDataNotInNetwork).toEqual([]);
  });

  it("every domain mentioned in the FAQ blurb exists in the catalog", () => {
    expect(report.faqNotInData).toEqual([]);
  });

  it("is fully in sync", () => {
    expect(report.ok).toBe(true);
  });
});