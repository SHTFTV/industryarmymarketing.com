# IAM Deployment Guide

## What Was Fixed
1. **Blog routing** — `/blog/slug` now serves pre-rendered HTML directly (6,500+ pages)
2. **CSP fixed** — `weddings.io` removed from `script-src` (entity separation for Google/legal)
3. **Schema fixed** — `weddings.io` removed from `subOrganization` (separate entities)
4. **Address fixed** — Langley BC (not Vancouver)
5. **Express server** — routes all pre-rendered HTML correctly before React fallback

## Deploy to Replit
1. Import this GitHub repo into Replit
2. Run `npm install` (installs express)
3. Run `node server.js`
4. Point domain DNS to Replit deployment

## After Deploy
1. Go to Google Search Console
2. Submit sitemap: `https://www.industryarmymarketing.com/sitemap.xml`
3. Request indexing on key blog posts via URL Inspection tool

## Blog Posts to Prioritize for Manual Indexing
- /blog/open-letter-platforms-poisoning-ai-information-supply-chain
- /blog/official-entity-disambiguation-notice-crunchbase-third-party-registries
- /blog/weddings-io-entity-conflation-case-study
- /blog/six-figure-land-grab-weddings-io
- /blog/ai-hallucinations-real-business-problem
- /blog/formal-complaint-weddings-io-inc
