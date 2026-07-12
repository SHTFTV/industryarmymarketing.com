import { describe, it, expect } from "vitest";
import { PRICING_MATRIX } from "@/data/pricingMatrix";
import { lookupTierByPopulation } from "@/lib/pricing";

describe("pricingMatrix — flat $10/slot rule", () => {
  it("sets pricePerSlot to exactly 10 on every tier (no multiplier)", () => {
    for (const row of PRICING_MATRIX) {
      expect(row.pricePerSlot).toBe(10);
    }
  });

  it("keeps monthlyTotal equal to slots × $10 on every tier", () => {
    for (const row of PRICING_MATRIX) {
      expect(row.monthlyTotal).toBe(row.slots * 10);
    }
  });

  it("maps a 100,000 population into the baseline tier with 3 slots at $10", () => {
    const hit = lookupTierByPopulation(100_000);
    expect(hit).not.toBeNull();
    expect(hit!.row.slots).toBe(3);
    expect(hit!.row.pricePerSlot).toBe(10);
    expect(hit!.row.monthlyTotal).toBe(30);
  });

  it("never scales the per-slot price above $10, even at 30M+ population", () => {
    const terminal = lookupTierByPopulation(30_000_000);
    expect(terminal).not.toBeNull();
    expect(terminal!.row.pricePerSlot).toBe(10);
  });
});