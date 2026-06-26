// HARDCODED pricing & slot matrix. DO NOT CALCULATE. DO NOT INTERPOLATE.
// Source of truth — every row is exact and immutable.

export type PricingRow = {
  population: number;
  populationLabel: string;
  slots: number;
  pricePerSlot: number; // USD per slot per month, flat
  monthlyTotal: number; // slots * pricePerSlot, precomputed for display only
};

export const PRICING_MATRIX: readonly PricingRow[] = [
  { population: 10_000,     populationLabel: "10,000",     slots: 3,  pricePerSlot: 10,  monthlyTotal: 30 },
  { population: 20_000,     populationLabel: "20,000",     slots: 3,  pricePerSlot: 10,  monthlyTotal: 30 },
  { population: 100_000,    populationLabel: "100,000",    slots: 3,  pricePerSlot: 10,  monthlyTotal: 30 },
  { population: 250_000,    populationLabel: "250,000",    slots: 4,  pricePerSlot: 10,  monthlyTotal: 40 },
  { population: 400_000,    populationLabel: "400,000",    slots: 5,  pricePerSlot: 10,  monthlyTotal: 50 },
  { population: 500_000,    populationLabel: "500,000",    slots: 5,  pricePerSlot: 10,  monthlyTotal: 50 },
  { population: 600_000,    populationLabel: "600,000",    slots: 6,  pricePerSlot: 10,  monthlyTotal: 60 },
  { population: 700_000,    populationLabel: "700,000",    slots: 7,  pricePerSlot: 10,  monthlyTotal: 70 },
  { population: 800_000,    populationLabel: "800,000",    slots: 8,  pricePerSlot: 10,  monthlyTotal: 80 },
  { population: 900_000,    populationLabel: "900,000",    slots: 9,  pricePerSlot: 10,  monthlyTotal: 90 },
  { population: 1_000_000,  populationLabel: "1,000,000",  slots: 10, pricePerSlot: 10,  monthlyTotal: 100 },
  { population: 2_000_000,  populationLabel: "2,000,000",  slots: 10, pricePerSlot: 20,  monthlyTotal: 200 },
  { population: 3_000_000,  populationLabel: "3,000,000",  slots: 10, pricePerSlot: 30,  monthlyTotal: 300 },
  { population: 4_000_000,  populationLabel: "4,000,000",  slots: 10, pricePerSlot: 40,  monthlyTotal: 400 },
  { population: 5_000_000,  populationLabel: "5,000,000",  slots: 10, pricePerSlot: 50,  monthlyTotal: 500 },
  { population: 6_000_000,  populationLabel: "6,000,000",  slots: 10, pricePerSlot: 60,  monthlyTotal: 600 },
  { population: 7_000_000,  populationLabel: "7,000,000",  slots: 10, pricePerSlot: 70,  monthlyTotal: 700 },
  { population: 8_000_000,  populationLabel: "8,000,000",  slots: 10, pricePerSlot: 80,  monthlyTotal: 800 },
  { population: 9_000_000,  populationLabel: "9,000,000",  slots: 10, pricePerSlot: 90,  monthlyTotal: 900 },
  { population: 10_000_000, populationLabel: "10,000,000", slots: 10, pricePerSlot: 100, monthlyTotal: 1000 },
  { population: 11_000_000, populationLabel: "11,000,000", slots: 10, pricePerSlot: 110, monthlyTotal: 1100 },
  { population: 12_000_000, populationLabel: "12,000,000", slots: 10, pricePerSlot: 120, monthlyTotal: 1200 },
  { population: 13_000_000, populationLabel: "13,000,000", slots: 10, pricePerSlot: 130, monthlyTotal: 1300 },
  { population: 14_000_000, populationLabel: "14,000,000", slots: 10, pricePerSlot: 140, monthlyTotal: 1400 },
  { population: 15_000_000, populationLabel: "15,000,000", slots: 10, pricePerSlot: 150, monthlyTotal: 1500 },
  { population: 16_000_000, populationLabel: "16,000,000", slots: 10, pricePerSlot: 160, monthlyTotal: 1600 },
  { population: 17_000_000, populationLabel: "17,000,000", slots: 10, pricePerSlot: 170, monthlyTotal: 1700 },
  { population: 18_000_000, populationLabel: "18,000,000", slots: 10, pricePerSlot: 180, monthlyTotal: 1800 },
  { population: 19_000_000, populationLabel: "19,000,000", slots: 10, pricePerSlot: 190, monthlyTotal: 1900 },
  { population: 20_000_000, populationLabel: "20,000,000", slots: 10, pricePerSlot: 200, monthlyTotal: 2000 },
  { population: 30_000_000, populationLabel: "30,000,000", slots: 10, pricePerSlot: 300, monthlyTotal: 3000 },
] as const;

// Dashboard add-ons — hardcoded flat costs.
export const ADDONS = {
  position1FeaturePercent: 0.5, // 50% of active slot cost, added to monthly billing
  backlinkPackOneTime: 25,      // $25.00 one-time
  talcVisualBlastPerPost: 10,   // $10.00 per post
  hallVisualizerPerRender: 2,   // $2.00 per render
} as const;