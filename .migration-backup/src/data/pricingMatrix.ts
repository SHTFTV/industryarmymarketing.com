// HARDCODED pricing & slot matrix. DO NOT CALCULATE. DO NOT INTERPOLATE.
// Source of truth — every row is exact and immutable.

export type PricingRow = {
  lowerBound: number;
  upperBound: number;        // use Number.POSITIVE_INFINITY for the terminal "30M+" row
  populationLabel: string;   // e.g. "0 – 100,000"
  slots: number;
  pricePerSlot: number;      // USD per slot per month, flat
  monthlyTotal: number;      // slots * pricePerSlot, precomputed for display only
  status: string;            // Territory Status label, hardcoded
};

export const PRICING_MATRIX: readonly PricingRow[] = [
  { lowerBound: 0,          upperBound: 100_000,    populationLabel: "0 – 100,000",              slots: 3,  pricePerSlot: 10, monthlyTotal: 30,  status: "$10/slot flat" },
  { lowerBound: 100_001,    upperBound: 200_000,    populationLabel: "100,001 – 200,000",        slots: 3,  pricePerSlot: 10, monthlyTotal: 30,  status: "$10/slot flat" },
  { lowerBound: 200_001,    upperBound: 250_000,    populationLabel: "200,001 – 250,000",        slots: 3,  pricePerSlot: 10, monthlyTotal: 30,  status: "$10/slot flat" },
  { lowerBound: 250_001,    upperBound: 350_000,    populationLabel: "250,001 – 350,000",        slots: 4,  pricePerSlot: 10, monthlyTotal: 40,  status: "$10/slot flat" },
  { lowerBound: 350_001,    upperBound: 450_000,    populationLabel: "350,001 – 450,000",        slots: 5,  pricePerSlot: 10, monthlyTotal: 50,  status: "$10/slot flat" },
  { lowerBound: 450_001,    upperBound: 550_000,    populationLabel: "450,001 – 550,000",        slots: 6,  pricePerSlot: 10, monthlyTotal: 60,  status: "$10/slot flat" },
  { lowerBound: 550_001,    upperBound: 650_000,    populationLabel: "550,001 – 650,000",        slots: 7,  pricePerSlot: 10, monthlyTotal: 70,  status: "$10/slot flat" },
  { lowerBound: 650_001,    upperBound: 750_000,    populationLabel: "650,001 – 750,000",        slots: 8,  pricePerSlot: 10, monthlyTotal: 80,  status: "$10/slot flat" },
  { lowerBound: 750_001,    upperBound: 850_000,    populationLabel: "750,001 – 850,000",        slots: 9,  pricePerSlot: 10, monthlyTotal: 90,  status: "$10/slot flat" },
  { lowerBound: 850_001,    upperBound: 1_000_000,  populationLabel: "850,001 – 1,000,000",      slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 1_000_001,  upperBound: 2_000_000,  populationLabel: "1,000,001 – 2,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 2_000_001,  upperBound: 3_000_000,  populationLabel: "2,000,001 – 3,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 3_000_001,  upperBound: 4_000_000,  populationLabel: "3,000,001 – 4,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 4_000_001,  upperBound: 5_000_000,  populationLabel: "4,000,001 – 5,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 5_000_001,  upperBound: 6_000_000,  populationLabel: "5,000,001 – 6,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 6_000_001,  upperBound: 7_000_000,  populationLabel: "6,000,001 – 7,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 7_000_001,  upperBound: 8_000_000,  populationLabel: "7,000,001 – 8,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 8_000_001,  upperBound: 9_000_000,  populationLabel: "8,000,001 – 9,000,000",    slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 9_000_001,  upperBound: 10_000_000, populationLabel: "9,000,001 – 10,000,000",   slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 10_000_001, upperBound: 11_000_000, populationLabel: "10,000,001 – 11,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 11_000_001, upperBound: 12_000_000, populationLabel: "11,000,001 – 12,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 12_000_001, upperBound: 13_000_000, populationLabel: "12,000,001 – 13,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 13_000_001, upperBound: 14_000_000, populationLabel: "13,000,001 – 14,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 14_000_001, upperBound: 15_000_000, populationLabel: "14,000,001 – 15,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 15_000_001, upperBound: 16_000_000, populationLabel: "15,000,001 – 16,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 16_000_001, upperBound: 17_000_000, populationLabel: "16,000,001 – 17,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 17_000_001, upperBound: 18_000_000, populationLabel: "17,000,001 – 18,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 18_000_001, upperBound: 19_000_000, populationLabel: "18,000,001 – 19,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 19_000_001, upperBound: 20_000_000, populationLabel: "19,000,001 – 20,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 20_000_001, upperBound: 21_000_000, populationLabel: "20,000,001 – 21,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 21_000_001, upperBound: 22_000_000, populationLabel: "21,000,001 – 22,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 22_000_001, upperBound: 23_000_000, populationLabel: "22,000,001 – 23,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 23_000_001, upperBound: 24_000_000, populationLabel: "23,000,001 – 24,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 24_000_001, upperBound: 25_000_000, populationLabel: "24,000,001 – 25,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 25_000_001, upperBound: 26_000_000, populationLabel: "25,000,001 – 26,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 26_000_001, upperBound: 27_000_000, populationLabel: "26,000,001 – 27,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 27_000_001, upperBound: 28_000_000, populationLabel: "27,000,001 – 28,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 28_000_001, upperBound: 29_000_000, populationLabel: "28,000,001 – 29,000,000",  slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
  { lowerBound: 29_000_001, upperBound: Number.POSITIVE_INFINITY, populationLabel: "29,000,001 – 30,000,000+", slots: 10, pricePerSlot: 10, monthlyTotal: 100, status: "$10/slot flat" },
] as const;

// Dashboard add-ons — hardcoded flat costs.
export const ADDONS = {
  position1FeaturePercent: 0.5, // 50% of active slot cost, added to monthly billing
  backlinkPackOneTime: 25,      // $25.00 one-time
  talcVisualBlastPerPost: 10,   // $10.00 per post
  hallVisualizerPerRender: 2,   // $2.00 per render
} as const;