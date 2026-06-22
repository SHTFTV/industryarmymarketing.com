# Deployment Checklist

Static Vite + React build. Deploy the `dist/` folder to any static host.

## 1. Prerequisites

- Node 20+ and Bun installed (`bun --version`).
- Repo cloned and on the branch you intend to ship.
- Access to your hosting provider (Lovable, Netlify, Vercel, or Cloudflare Pages).

## 2. Environment Variables

Set these in your host's dashboard (and locally in `.env` for dev). All are public, prefixed `VITE_` so they're inlined at build time.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Lovable Cloud / Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |

Server-only secrets (e.g. `LOVABLE_API_KEY`) belong on edge functions, **not** in the client build.

## 3. Pre-Flight Checks

Run locally before pushing:

```bash
bun install
bun run lint
bunx vitest run
bunx tsx scripts/validate-rss.ts
bunx tsx scripts/validate-sitemap.ts https://industryarmymarketing.com
node scripts/check-wording.mjs
```

All must pass. Fix failures before continuing.

## 4. Build

```bash
bun install --frozen-lockfile
bun run build
```

Output: `dist/`. Verify it contains `index.html`, `assets/`, `sitemap.xml`, `rss.xml`, `robots.txt`.

Optional smoke test:

```bash
bunx vite preview --port 4173
# open http://localhost:4173 and click through key routes
```

## 5. Hosting

### Option A — Lovable (recommended)
1. Click **Publish** in the Lovable editor.
2. First publish creates `<slug>.lovable.app`.
3. Connect a custom domain in **Project Settings → Domains** (A record `@` and `www` → `185.158.133.1`, plus the `_lovable` TXT).
4. SSL auto-provisions once DNS verifies.

### Option B — Netlify / Vercel / Cloudflare Pages
- **Build command:** `bun run build`
- **Publish directory:** `dist`
- **Node version:** 20
- **SPA fallback:** rewrite all paths to `/index.html` (Netlify: `_redirects` with `/* /index.html 200`; Vercel: handled by framework preset; Cloudflare Pages: enable SPA mode).
- Add the env vars from section 2.

## 6. Post-Deploy Verification

- [ ] `https://<domain>/` loads, no console errors
- [ ] Deep links work on refresh (e.g. `/blog`, `/pricing`)
- [ ] `/sitemap.xml` and `/rss.xml` return 200
- [ ] `/robots.txt` references the correct sitemap URL
- [ ] OG image + meta render in a social debugger
- [ ] `bunx tsx scripts/verify-live-sitemap.ts` passes
- [ ] `bunx tsx scripts/check-dns-propagation.ts --once` passes (custom domain only)

## 7. Rollback

- **Lovable:** re-publish a prior commit from the editor history.
- **Netlify/Vercel/CF Pages:** promote a previous deploy from the dashboard.
