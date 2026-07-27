// Single, hardcoded verification layer for every pricing lookup in the app.
// No formulas. No interpolation. Every value is read straight from PRICING_MATRIX.

import { PRICING_MATRIX, ADDONS, type PricingRow } from "@/data/pricingMatrix";

export type TierLookup = {
  row: PricingRow;
  monthlyTotalIfSoldOut: number;
  position1AddonMonthly: number;
};

/** Strict, hardcoded lookup. Returns null on out-of-range / bad input. */
export function lookupTierByPopulation(population: number): TierLookup | null {
  if (!Number.isFinite(population) || population < 0) return null;
  const row = PRICING_MATRIX.find(
    (r) => population >= r.lowerBound && population <= r.upperBound,
  );
  if (!row) return null;
  return {
    row,
    monthlyTotalIfSoldOut: row.monthlyTotal,
    // 50% of active slot cost — the only "math" we allow, per spec.
    position1AddonMonthly: Number((row.pricePerSlot * ADDONS.position1FeaturePercent).toFixed(2)),
  };
}

export function parsePopulation(input: string | number | undefined | null): number {
  if (typeof input === "number") return Math.max(0, Math.floor(input));
  if (!input) return 0;
  return Number(String(input).replace(/[^\d]/g, "")) || 0;
}

/** True only when claimedSlots meets or exceeds the hardcoded slot ceiling. */
export function isSoldOut(row: PricingRow, claimedSlots: number): boolean {
  return claimedSlots >= row.slots;
}

export function formatSlotStatus(row: PricingRow, claimedSlots = 0): string {
  if (isSoldOut(row, claimedSlots)) return "SOLD OUT";
  const remaining = row.slots - claimedSlots;
  return `${remaining} of ${row.slots} slots open`;
}

/** Self-check the hardcoded matrix at module load. Throws on any drift. */
function verifyMatrix(): void {
  if (PRICING_MATRIX.length === 0) throw new Error("PRICING_MATRIX is empty");
  let prevUpper = -1;
  for (const row of PRICING_MATRIX) {
    if (row.lowerBound !== prevUpper + 1 && prevUpper !== -1) {
      throw new Error(`PRICING_MATRIX gap: ${prevUpper} → ${row.lowerBound}`);
    }
    if (row.upperBound < row.lowerBound) {
      throw new Error(`PRICING_MATRIX inverted row at ${row.lowerBound}`);
    }
    if (row.slots < 1 || row.slots > 10) {
      throw new Error(`PRICING_MATRIX bad slot count ${row.slots}`);
    }
    if (row.pricePerSlot < 10) {
      throw new Error(`PRICING_MATRIX bad pricePerSlot ${row.pricePerSlot}`);
    }
    if (row.monthlyTotal !== row.slots * row.pricePerSlot) {
      throw new Error(
        `PRICING_MATRIX monthlyTotal drift: ${row.monthlyTotal} ≠ ${row.slots} × ${row.pricePerSlot}`,
      );
    }
    prevUpper = row.upperBound;
  }
}
verifyMatrix();

export { ADDONS, PRICING_MATRIX };