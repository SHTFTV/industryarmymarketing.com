---
name: IAM prerendered server setup
description: How the Industry Army Marketing site serves its 6,500+ pre-rendered pages via the legacy Express server
---
The site is served by `server.cjs` (CommonJS copy of the original Lovable `server.js`) in the industry-army artifact, not by Vite dev/static serve. It serves `dist/public`, which the Vite build populates with index.html + all prerendered pages (they live in the artifact's `public/` dir and get copied at build time).

**Why:** SEO — Google must see pre-rendered HTML at clean URLs (`/blog/:slug` etc.); static serve with SPA rewrite would shadow them.

Images use Lovable CDN paths (`/__l5e/assets-v1/<uuid>/<file>`); the files are now vendored locally under `public/__l5e/`. If new ones appear broken, download them from `https://3828fa67-cce6-4f91-91b7-6ad5eab42230.lovableproject.com/<same path>` (the custom domain blocks this container's TLS).

**How to apply:** after any frontend change, run the artifact build (`PORT`+`BASE_PATH` env required) and restart the workflow — there is no HMR. Requires Express 4 (route pattern `:slug*` breaks on Express 5). Root package.json is `"type":"module"`, so the server must stay `.cjs`.
