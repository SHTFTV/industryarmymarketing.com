# Industry Army Marketing

Marketing site for Industry Army Marketing. React + Vite + Tailwind.

## Entry Points
- **HTML entry:** `index.html` (loads `/src/main.tsx`)
- **App bootstrap:** `src/main.tsx` → renders `src/App.tsx`
- **Build tool:** Vite 5 (`vite.config.ts`)
- **Production output:** `dist/` (static — `index.html`, `assets/`, `sitemap.xml`, `rss.xml`, `robots.txt`)

## Develop
```
bun install
bun run dev
```

## Build
```
bun run build
```
Output is in `dist/`. Deploy that directory to any static host (Netlify, Vercel, Cloudflare Pages).

See `DEPLOYMENT.md` for the full deployment checklist.
