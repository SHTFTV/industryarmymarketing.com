import { describe, it, expect } from "vitest";
import { lookupTierByPopulation, parsePopulation, isSoldOut, formatSlotStatus } from "@/lib/pricing";

describe("hardcoded pricing lookup", () => {
  it("returns the baseline tier for tiny towns", () => {
    const t = lookupTierByPopulation(50_000)!;
    expect(t.row.slots).toBe(3);
    expect(t.row.pricePerSlot).toBe(10);
    expect(t.row.status).toBe("$10/slot flat");
  });

  it("steps slots one by one between 250K and 1M", () => {
    expect(lookupTierByPopulation(300_000)!.row.slots).toBe(4);
    expect(lookupTierByPopulation(700_000)!.row.slots).toBe(8);
    expect(lookupTierByPopulation(900_000)!.row.slots).toBe(10);
  });

  it("keeps per-slot pricing flat at exactly $10 for every population sample", () => {
    expect(lookupTierByPopulation(50_000)!.row.pricePerSlot).toBe(10);
    expect(lookupTierByPopulation(300_000)!.row.pricePerSlot).toBe(10);
    expect(lookupTierByPopulation(2_500_000)!.row.pricePerSlot).toBe(10);
    expect(lookupTierByPopulation(9_500_000)!.row.pricePerSlot).toBe(10);
    expect(lookupTierByPopulation(50_000_000)!.row.pricePerSlot).toBe(10);
  });

  it("computes the Position #1 add-on as exactly half the slot cost", () => {
    expect(lookupTierByPopulation(50_000)!.position1AddonMonthly).toBe(5);
    expect(lookupTierByPopulation(50_000_000)!.position1AddonMonthly).toBe(5);
  });

  it("only reads SOLD OUT once all slots are claimed", () => {
    const row = lookupTierByPopulation(50_000)!.row;
    expect(isSoldOut(row, 2)).toBe(false);
    expect(isSoldOut(row, 3)).toBe(true);
    expect(formatSlotStatus(row, 1)).toBe("2 of 3 slots open");
    expect(formatSlotStatus(row, 3)).toBe("SOLD OUT");
  });

  it("parses commas and stray text out of population input", () => {
    expect(parsePopulation("1,340,000")).toBe(1_340_000);
    expect(parsePopulation("Population 568,000")).toBe(568_000);
  });
});