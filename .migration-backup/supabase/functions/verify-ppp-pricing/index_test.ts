// Deno tests for verify-ppp-pricing.
// Run with: supabase--test_edge_functions { functions: ["verify-ppp-pricing"] }
//
// These tests hit the DEPLOYED edge function over HTTP so we exercise the
// exact request/response contract the future Stripe webhook will rely on.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/verify-ppp-pricing`;

async function call(body: unknown) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

// list_amount_cents = 1000 ($10) — the canonical $10 / 100K pop slot.
const LIST = 1000;

Deno.test("US card paying full USD list is valid", async () => {
  const { status, json } = await call({
    card_country: "US",
    amount_cents: LIST,
    list_amount_cents: LIST,
    display_country: "US",
  });
  assertEquals(status, 200);
  assertEquals(json.valid, true);
  assertEquals(json.reason, "ok");
  assertEquals(json.expected_amount_cents, 1000);
  assertEquals(json.card_factor, 1);
});

Deno.test("IN card paying IN-adjusted price is valid", async () => {
  const { json } = await call({
    card_country: "IN",
    amount_cents: 300, // $3 = round($10 * 0.30)
    list_amount_cents: LIST,
    display_country: "IN",
  });
  assertEquals(json.valid, true);
  assertEquals(json.reason, "ok");
  assertEquals(json.expected_amount_cents, 300);
  assertEquals(json.card_factor, 0.3);
});

Deno.test("Arbitrage: US card but IN display should be rejected", async () => {
  const { json } = await call({
    card_country: "US",
    amount_cents: 300,
    list_amount_cents: LIST,
    display_country: "IN",
  });
  assertEquals(json.valid, false);
  assertEquals(json.reason, "arbitrage_detected");
  assertEquals(json.expected_amount_cents, 1000); // must re-quote to US price
});

Deno.test("Underpayment below tolerance is rejected", async () => {
  const { json } = await call({
    card_country: "US",
    amount_cents: 100, // $1 vs expected $10
    list_amount_cents: LIST,
    display_country: "US",
  });
  assertEquals(json.valid, false);
  assertEquals(json.reason, "amount_below_ppp_floor");
  assertEquals(json.expected_amount_cents, 1000);
});

Deno.test("Within $0.50 tolerance is accepted", async () => {
  const { json } = await call({
    card_country: "US",
    amount_cents: 970, // $9.70 — within 50c tolerance of $10
    list_amount_cents: LIST,
    display_country: "US",
  });
  assertEquals(json.valid, true);
});

Deno.test("Unknown card country falls back to factor 1.0", async () => {
  const { json } = await call({
    card_country: "ZZ",
    amount_cents: LIST,
    list_amount_cents: LIST,
  });
  assertEquals(json.card_factor, 1);
  assertEquals(json.expected_amount_cents, 1000);
  assertEquals(json.valid, true);
});

Deno.test("MX card matrix: factor 0.55, expected $6", async () => {
  const { json } = await call({
    card_country: "MX",
    amount_cents: 600,
    list_amount_cents: LIST,
  });
  assertEquals(json.card_factor, 0.55);
  assertEquals(json.expected_amount_cents, 600);
  assertEquals(json.valid, true);
});

Deno.test("BR card underpaying is amount_below_ppp_floor with correct re-quote", async () => {
  const { json } = await call({
    card_country: "BR",
    amount_cents: 100,
    list_amount_cents: LIST,
  });
  assertEquals(json.reason, "amount_below_ppp_floor");
  assertEquals(json.expected_amount_cents, 500); // $10 * 0.45 = $4.50 -> round -> $5
});

Deno.test("Invalid body returns 400 invalid_input", async () => {
  const { status, json } = await call({ card_country: "USA", amount_cents: -1, list_amount_cents: 0 });
  assertEquals(status, 400);
  assertEquals(json.error, "invalid_input");
});

Deno.test("GET is not allowed", async () => {
  const res = await fetch(ENDPOINT, {
    method: "GET",
    headers: { Authorization: `Bearer ${ANON}`, apikey: ANON },
  });
  const json = await res.json();
  assertEquals(res.status, 405);
  assertEquals(json.error, "method_not_allowed");
});