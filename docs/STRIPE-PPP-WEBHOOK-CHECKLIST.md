# Stripe × verify-ppp-pricing wiring checklist

Do NOT execute these steps until official launch. This is the runbook for
connecting the live Stripe PaymentIntent webhook to `verify-ppp-pricing`
so PPP arbitrage and underpayment are auto-cancelled and re-quoted.

## 0. Prerequisites
- [ ] Lovable Cloud enabled (already true — required for edge functions).
- [ ] `verify-ppp-pricing` deployed and green (`test_edge_functions` passes).
- [ ] Stripe account claimed and moved to live mode.
- [ ] Business decision confirmed: **cancel + re-quote** (not partial
      capture, not silent adjust).

## 1. Create a Stripe webhook endpoint
- [ ] Add edge function `supabase/functions/stripe-webhook/index.ts`.
- [ ] Subscribe to events: `payment_intent.created`,
      `payment_intent.succeeded`, `payment_intent.payment_failed`.
- [ ] Set `verify_jwt = false` in `supabase/config.toml` for that function
      (Stripe cannot present a Supabase JWT).

## 2. Store secrets (use `add_secret`)
- [ ] `STRIPE_SECRET_KEY` — live sk_.
- [ ] `STRIPE_WEBHOOK_SECRET` — from the Stripe dashboard for THIS endpoint.

## 3. Implement the webhook handler (sketch)

```ts
// supabase/functions/stripe-webhook/index.ts
import Stripe from "npm:stripe@16";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const whsec = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const VERIFY_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-ppp-pricing`;

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();
  const event = await stripe.webhooks.constructEventAsync(raw, sig, whsec);

  if (event.type === "payment_intent.created" || event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const cardCountry =
      pi.charges?.data?.[0]?.payment_method_details?.card?.country ??
      pi.latest_charge && (await stripe.charges.retrieve(pi.latest_charge as string))
        .payment_method_details?.card?.country;

    const listCents = Number(pi.metadata.list_amount_cents ?? pi.amount);
    const displayCountry = pi.metadata.display_country ?? cardCountry;

    const r = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_country: cardCountry,
        amount_cents: pi.amount,
        list_amount_cents: listCents,
        display_country: displayCountry,
        product_id: pi.metadata.product_id,
      }),
    }).then((x) => x.json());

    if (!r.valid) {
      // Cancel and re-quote.
      if (pi.status !== "succeeded") {
        await stripe.paymentIntents.cancel(pi.id, { cancellation_reason: "fraudulent" });
      } else {
        await stripe.refunds.create({ payment_intent: pi.id, reason: "fraudulent" });
      }
      // Emit a new PI (or Checkout Session) with amount = r.expected_amount_cents
      // and mail the customer the corrected link.
    }
  }

  return new Response("ok", { status: 200 });
});
```

## 4. Client checkout requirements
- [ ] On `stripe.paymentIntents.create` (or Checkout Session), stamp
      `metadata.list_amount_cents`, `metadata.display_country`, and
      `metadata.product_id`. The webhook needs these to call `verify-ppp-pricing`.

## 5. Re-quote behaviour
- [ ] `reason === "arbitrage_detected"` → cancel PI, email customer explaining
      that display country must match card country, link to new checkout at
      `expected_amount_cents`.
- [ ] `reason === "amount_below_ppp_floor"` → cancel PI, email new checkout
      at `expected_amount_cents`.
- [ ] Log every re-quote to a `ppp_requotes` table for audit
      (payment_intent_id, card_country, display_country, provided, expected,
      reason, resolved_at).

## 6. Tests
- [ ] Run `test_edge_functions` — all PPP matrix cases green.
- [ ] Stripe CLI: `stripe trigger payment_intent.succeeded` with fixture card
      countries US, IN, MX, BR, and verify webhook decisions in edge logs.
- [ ] Manually confirm a re-quote via `/admin/ppp-requote` for one PI.

## 7. Go-live gate
- [ ] Stripe switched to live mode.
- [ ] `STRIPE_WEBHOOK_SECRET` rotated to the live-mode value.
- [ ] `verify-ppp-pricing` factors reviewed & signed off.
- [ ] `ComingSoonModal` disabled on all pay CTAs.

---

**Owner:** IAM ops. **Do not enable until post-launch.**