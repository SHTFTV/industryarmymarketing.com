// Server-side PPP validator. Source of truth for card-country pricing.
// A future Stripe webhook (payment_intent.created / checkout.session.completed)
// calls this with the card's ISO country and the amount being charged; if
// the amount is below the country's allowed price it rejects the charge and
// the checkout flow reverts to flat USD. Prevents PPP arbitrage where a
// visitor picks an emerging-market country on the site but pays with an
// established-market card.
//
// This function has no auth/JWT check — it's called by trusted server code
// (Stripe webhook signature is verified upstream). Do NOT expose the ability
// to WRITE anything; this endpoint is read-only validation.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

// Must match src/data/pppFactors.ts exactly. Reviewed annually per IAM SOT.
const PPP_FACTORS: Record<string, number> = {
  // Established markets — flat USD
  US: 1.0, CA: 1.0, GB: 1.0, AU: 1.0, SG: 1.0, AE: 1.0, JP: 1.0, KR: 1.0,
  // EU treated flat — expanded here so any EU card country resolves to 1.0
  DE: 1.0, FR: 1.0, IT: 1.0, ES: 1.0, NL: 1.0, BE: 1.0, IE: 1.0, AT: 1.0,
  SE: 1.0, DK: 1.0, FI: 1.0, PT: 1.0, LU: 1.0, PL: 1.0, CZ: 1.0, GR: 1.0,
  HU: 1.0, RO: 1.0, BG: 1.0, HR: 1.0, SI: 1.0, SK: 1.0, EE: 1.0, LV: 1.0,
  LT: 1.0, MT: 1.0, CY: 1.0,
  // Emerging markets — PPP-adjusted for accessibility
  IN: 0.30, PK: 0.28, BD: 0.30, NG: 0.30, KE: 0.35, PH: 0.35, EG: 0.30,
  TR: 0.35, ID: 0.35, VN: 0.35, BR: 0.45, MX: 0.55,
};

const TOLERANCE_CENTS = 50; // ±$0.50 wiggle to absorb rounding

const BodySchema = z.object({
  card_country: z.string().trim().length(2),
  amount_cents: z.number().int().nonnegative().max(10_000_000),
  list_amount_cents: z.number().int().positive().max(10_000_000),
  product_id: z.string().trim().max(120).optional(),
  display_country: z.string().trim().length(2).optional(),
});

function factorFor(country: string): number {
  return PPP_FACTORS[country.toUpperCase()] ?? 1.0;
}

function expectedCents(listCents: number, cardCountry: string): number {
  const f = factorFor(cardCountry);
  // Match client rounding: whole dollars, min $1
  const dollars = Math.max(1, Math.round((listCents / 100) * f));
  return dollars * 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "method_not_allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "invalid_json" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "invalid_input", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { card_country, amount_cents, list_amount_cents, product_id, display_country } = parsed.data;
  const cardCountry = card_country.toUpperCase();
  const displayCountry = (display_country ?? cardCountry).toUpperCase();

  const expected = expectedCents(list_amount_cents, cardCountry);
  const cardFactor = factorFor(cardCountry);
  const displayFactor = factorFor(displayCountry);

  // Arbitrage flag: visitor chose a cheaper display country than their card supports.
  const arbitrage = displayFactor < cardFactor;

  // Amount must be at least expected minus tolerance.
  const underpaid = amount_cents + TOLERANCE_CENTS < expected;
  const valid = !underpaid && !arbitrage;

  const responseBody = {
    valid,
    reason: valid
      ? "ok"
      : arbitrage
        ? "arbitrage_detected"
        : "amount_below_ppp_floor",
    card_country: cardCountry,
    card_factor: cardFactor,
    display_country: displayCountry,
    display_factor: displayFactor,
    list_amount_cents,
    expected_amount_cents: expected,
    provided_amount_cents: amount_cents,
    product_id: product_id ?? null,
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});