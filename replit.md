# Industry Army Marketing

Territory-locked marketing for trades and service businesses. The 250 Scale: $10–$50/slot/month. TALC.tv $10/post. EyeSpyr verification. Any city. Any trade.

## Run & Operate

- Workflows manage all services automatically in Replit
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v3 + shadcn/ui (`artifacts/industry-army/`)
- Routing: react-router-dom (BrowserRouter)
- Backend data/auth: Supabase (existing project — see env vars below)
- API server scaffold: Express 5 (`artifacts/api-server/`) — not yet used by the frontend
- DB scaffold: PostgreSQL + Drizzle ORM (`lib/db/`) — not yet used

## Where things live

- `artifacts/industry-army/src/` — all React pages, components, hooks, data
- `artifacts/industry-army/src/integrations/supabase/` — Supabase client + type definitions
- `artifacts/industry-army/src/pages/admin/` — admin-only pages (require Supabase auth)
- `artifacts/industry-army/src/data/` — static blog posts and other data
- `artifacts/industry-army/public/` — static assets, favicons, PWA manifest

## Supabase credentials required

The app connects to an external Supabase project for auth, database, and edge functions.
Add these as Replit Secrets:

- `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://xxxx.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key

Without these, the public marketing pages load fine, but forms, admin pages, and SEO audit features won't work.

## Architecture decisions

- Supabase is kept as-is (not migrated to Replit DB) — the app uses edge functions and RLS policies that would require significant re-implementation to replace.
- Tailwind v3 (not v4) with PostCSS — the original app used Tailwind v3; the scaffold's `@tailwindcss/vite` plugin was swapped for the standard PostCSS setup.
- React Router (BrowserRouter) — the original app uses react-router-dom; NOT wouter (the Replit scaffold default).
- CSP meta tag removed from index.html — the original strict sha256 CSP blocked Vite HMR in dev.

## User preferences

_Populate as needed._

## Gotchas

- Do NOT run `pnpm dev` at the workspace root — artifacts run via managed workflows.
- The `predev`/`prebuild` scripts in the original `package.json` used `bun` and generated sitemaps/RSS — these are not wired in Replit; the static files they generated are already in `public/`.
- `tailwind.config.ts` uses `require()` for plugins (CommonJS-compatible) even though the rest of the workspace is ESM.

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup.
