## Scope

The bundle has 17 HTML pages. **3 already exist** as React routes (`index`, `how-it-works`, `pricing`) — I'll leave those alone (their React versions reflect current memory rules like "$10 across all tiers"; old HTML may drift from this).

**14 new pages to port** as React routes:

| New route | Source HTML | Purpose |
|---|---|---|
| `/scan-wizard` | scan-wizard.html | I‑Spy‑R "Analyze My Business" wizard |
| `/network` | network.html | Full domain network |
| `/eyespyr` | eyespyr.html | EyeSpyr verification |
| `/builder` | builder.html | Web builder |
| `/blog` | blog.html | Blog index |
| `/investors` | investors.html | Investor relations |
| `/dashboard` | DASHBOARD.html | I‑Spy‑R client portal (static marketing version) |
| `/wall-of-love` | WALL-OF-LOVE.html | Reviews showcase |
| `/legal` | LEGAL-HUB.html | lawyersadvice.co hub |
| `/niches/steel-stud` | STEEL-STUD.html | steelstud.ca niche |
| `/niches/mining-logistics` | MINING-LOGISTICS.html | Mining & heavy-haul hub |
| `/local/vancouver` | VANCOUVER-LOCAL.html | Hyper-local (distinct from `/cities/vancouver`) |
| `/local/surrey` | SURREY-LOCAL.html | Hyper-local |
| `/local/langley` | LANGLEY-LOCAL.html | Hyper-local |

## How content is ported

Source HTML is plain static markup with its own inline styling. I'll **extract the content/copy/structure only** and rebuild each page using existing primitives:

- `Layout` (navbar + footer)
- `PageHeader` (eyebrow + title + highlight + description)
- `Seo` for per-route title/description/canonical/JSON-LD
- Tailwind + framer-motion in the existing dark tactical / neon-green / Bebas Neue + Inter style
- shadcn `Card`, `Button`, etc. for sections

Forms (scan-wizard) become local React state with a submit stub (no backend wiring — that's a separate request). Pricing inside ported pages will be normalized to the **$10 tier rule** from project memory; any conflicting numbers in the source HTML are dropped.

## Reusable components extracted

To avoid 14 copy-pasted page shells:

- `src/components/FeatureGrid.tsx` — icon + title + body grid (used by network, eyespyr, builder, niches)
- `src/components/StepList.tsx` — numbered step list (scan-wizard, builder)
- `src/components/TestimonialCard.tsx` — used by wall-of-love, local pages
- `src/components/CtaBanner.tsx` — bottom CTA used across most ported pages

## Routing + nav

- Register all 14 routes in `src/App.tsx` above the catch-all.
- Add the most user-facing ones to the navbar/footer: **Network, EyeSpyr, Wall of Love, Blog, Legal**. Niche/local/dashboard/investors/scan-wizard remain reachable via in-page links and direct URL.

## SEO

- Each new page gets `<Seo>` with unique title, description, canonical path, og:* fallbacks.
- Add all 14 new paths to `scripts/generate-sitemap.ts` and `scripts/verify-live-sitemap.ts` (expected-route list + city-style entries).
- Add JSON-LD where it helps: `Article` for `/blog` posts (placeholder list for now), `LocalBusiness` for `/local/*`, `Service` for `/niches/*`.

## Out of scope (this pass)

- Backend Python scripts in the bundle (`SCAN_WIZARD_API.py`, `WHATSAPP_LEAD_SERVER.py`, etc.) — pure marketing port only.
- Real blog post content — `/blog` ships with structure + 0–3 placeholder posts; tell me when you want real posts.
- Wiring contact/scan-wizard forms to email or DB — submit currently logs locally.
- Legal `.docx` files — separate task if you want them as `/legal/privacy`, `/legal/terms`, `/legal/notice` pages.

## Verification

After implementation: build, click through each route in the preview, and re-run `bunx tsx scripts/verify-live-sitemap.ts` (after publish) to confirm all routes appear.

---

**Confirm to proceed**, or tell me to drop/add specific pages from the list.
