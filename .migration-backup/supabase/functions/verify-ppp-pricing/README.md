# verify-ppp-pricing

Server-side PPP validator. Canonical source of truth for card-country
pricing at checkout. Called by the Stripe webhook (post-launch) on every
`payment_intent.created` / `payment_intent.succeeded` event to detect
arbitrage and enforce the PPP floor.

**Endpoint:** `POST {SUPABASE_URL}/functions/v1/verify-ppp-pricing`
**Auth:** none (JWT verification disabled). Trusted callers only — the
Stripe webhook verifies its own signature upstream. Do not expose to the
browser directly for anything you would not accept as a public read.

---

## Request body

```json
{
  "card_country":       "US",     // required, ISO 3166-1 alpha-2, 2 chars
  "amount_cents":       1000,     // required, int, 0..10_000_000
  "list_amount_cents":  1000,     // required, int, 1..10_000_000
  "product_id":         "eyespyr-slot-vancouver", // optional, <=120 chars
  "display_country":    "US"      // optional, ISO 3166-1 alpha-2
}
```

| Field                | Type   | Required | Notes                                              |
| -------------------- | ------ | -------- | -------------------------------------------------- |
| `card_country`       | string | yes      | From Stripe: `charges.data[0].payment_method_details.card.country` |
| `amount_cents`       | int    | yes      | The amount actually being charged (PaymentIntent.amount) |
| `list_amount_cents`  | int    | yes      | The full USD list price in cents ($10 slot = 1000) |
| `product_id`         | string | no       | Echoed back — for audit logs                       |
| `display_country`    | string | no       | The country the visitor selected on-site. Defaults to `card_country`. Used to detect arbitrage. |

## Response body (always HTTP 200 when input is valid)

```json
{
  "valid":                 true,
  "reason":                "ok",
  "card_country":          "US",
  "card_factor":           1.0,
  "display_country":       "US",
  "display_factor":        1.0,
  "list_amount_cents":     1000,
  "expected_amount_cents": 1000,
  "provided_amount_cents": 1000,
  "product_id":            null
}
```

| Field                   | Type          | Notes                                          |
| ----------------------- | ------------- | ---------------------------------------------- |
| `valid`                 | bool          | `true` iff `!arbitrage && !underpaid`          |
| `reason`                | enum          | `ok` \| `arbitrage_detected` \| `amount_below_ppp_floor` |
| `card_country`          | string        | Uppercased ISO code                            |
| `card_factor`           | number        | PPP multiplier for card country (1.0 = flat)   |
| `display_country`       | string        | Uppercased ISO code                            |
| `display_factor`        | number        | PPP multiplier for the display country         |
| `list_amount_cents`     | int           | Echo of input                                  |
| `expected_amount_cents` | int           | The amount that SHOULD be charged given card_country. Use this to re-quote. |
| `provided_amount_cents` | int           | Echo of `amount_cents`                         |
| `product_id`            | string \| null| Echo of input                                  |

## Rules

- **Arbitrage:** `display_factor < card_factor` → `reason = arbitrage_detected`.
  Visitor picked a cheaper country than their card supports. Re-quote to
  `expected_amount_cents` (which is computed from `card_country`, not `display_country`).
- **Underpayment:** `amount_cents + 50 < expected_amount_cents` →
  `reason = amount_below_ppp_floor`. Re-quote to `expected_amount_cents`.
- **Tolerance:** ±$0.50 to absorb rounding.
- **Unknown country:** falls back to factor `1.0` (flat USD).
- **Rounding:** `expected_amount_cents = max(100, round(list_cents/100 * factor) * 100)`.

## Error responses

| Status | Body                                       | Cause                        |
| ------ | ------------------------------------------ | ---------------------------- |
| 400    | `{"error":"invalid_json"}`                 | Body was not JSON            |
| 400    | `{"error":"invalid_input","details":{…}}`  | Zod validation failed        |
| 405    | `{"error":"method_not_allowed"}`           | Not POST / OPTIONS           |

## Tests

See `index_test.ts`. Run with the `test_edge_functions` tool.