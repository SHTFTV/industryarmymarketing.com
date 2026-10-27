# IAM build journal

This is the existing IAM React/Vite app in artifacts/industry-army, published from the canonical SHTFTV/industryarmymarketing.com repository to the existing Vercel project industryarmymarketing. Preserve routes, account settings, forms and private records.

Add future build-journal entries to artifacts/industry-army/src/data/buildJournal.json, newest first. Keep old publishedAt values unchanged. Each entry follows the existing BlogPost shape, has category Build Journal, a real ISO publication time, a human-readable full date, unique slug/title/description, relevant credited hero, 1200x630 share image and useful sources/project links. Rich-content paragraphs support inline Markdown links. Use contactBusiness rambo or plowwow for those company-focused stories; their existing floating cards are reused. Other entries use iam. Other clients need their verified existing card before publication. Never publish customer details from email or logs.

The journal is merged into the ordinary blog archive without relying on database rows, ranked in the homepage's four latest dated cards, and prerendered at build time alongside / and /blog. Existing archive content stays intact. scripts/build-journal.mjs includes journal URLs in sitemap.xml and rss.xml. For daily publishing, append a substantive entry and its assets; do not rerun historical local preparation scripts or regenerate old dates.

Build from the workspace root with pnpm run build. Current pnpm-workspace.yaml excludes Mac native binaries; those were supplied locally for preview only. Production Linux settings and lockfile were retained. Preview dist using a local static server and verify actual custom-domain production after publishing. Inspect desktop and 390px phone, images/captions, links, business cards, OG/canonical/schema, journal discovery, and the preserved original IAM YouTube film. Do not submit the enquiry form or claim inbox delivery unless separately tested with authorization.

Daily heartbeat: IAM daily build journal, 8:30 p.m. America/Vancouver. Record actual published URL and source evidence in a local ledger. Only describe releases as live after verification. Clearly distinguish beta, planned work, concepts, pending distribution and practical lessons. The October 25 launch has four articles about verified recent work, not four new product launches. PlowWow advanced scanning, AR, billing and bylaw features remain planned or under evaluation.

October 25 owner-authorised portfolio batch: 25 original brand stories are in buildJournal.json, with a manifest in brandPortfolio.json and individual public/brand-portfolio/ artwork. These are manual portfolio notes, not 25 new product launches or measured client-results claims. Preserve their actual dates, brand-status language and IAM marketing enquiry ownership. The commercial hub is /brand-creation-management-vancouver. Its service intent differs from the brand-specific article intents; keep the cross-links and avoid cloning Vancouver service-page copy into every article. New stories should add substantive developments, not reissue this batch.

## October 25: SEO market planning section
- `/seo` is a browsable directory of 60 named markets (16 Canada, 40 United States, 4 Mexico), not every North American municipality.
- `/seo/vancouver` owns the dedicated Vancouver search-service guide. The existing `/brand-creation-management-vancouver` hub retains the brand identity/management and portfolio scope.
- `seoMarkets.json` holds distinct illustrative buyer briefs, questions and evidence checklists. Do not describe these as local offices, client results, market research or guaranteed service delivery. Mexico content is English planning content, not a promise of Spanish-language production.
- Prerender every listed route through build-journal.mjs; keep unique canonical metadata and city share cards. Unknown `/seo/:city` routes use the existing noindex not-found component.
- Existing `/cities` territory pages are legacy and were not audited or endorsed by this release. Do not copy their old pricing, exclusivity, domain-age or lead promises into the new section.

## Mark Ett public IAM assistant
- Shared Layout mounts MarkEttAssistant; the bot is labelled AI and uses the approved officer artwork, not another brand mascot.
- `/api/mark-ett` is a server-side Vercel Function. Its public brief is intentionally separate from the older MarkEtt funding briefing; never import confidential plans, historical price promises or unverified capabilities.
- Authentication remains server-only via Vercel OIDC or existing AI_GATEWAY_API_KEY. No credentials in browser bundles. Model ID google/gemini-2.5-flash was checked against the live model catalogue before launch.
- Chat does not capture a lead, send email, execute actions or save transcripts in app storage. It links visitors to IAM's actual contact form. The AI provider receives submitted messages; do not claim provider zero retention.
- Input length/history limits, same-origin browser checks, provider timeout and best-effort per-instance throttling are included. In-memory throttling is not a durable/global abuse or billing cap. Do not describe it as such.
- Regression checks must include a real generated reply, failure state, no invented prices or guaranteed rankings, close/reopen/new-chat controls, phone layout and preservation of existing pages.

## IAM pSEO positioning and price boundaries
- Homepage positions IAM as a pSEO powerhouse built around its own industry brands, with a linked 25-brand showcase and 60 market briefs derived from source manifests.
- Published hub entry price is $10/year for business registration and a directory listing on ONE relevant hub site. Availability and applicable terms must be confirmed; never imply it purchases all network sites, a city partnership or full SEO delivery.
- Brand creation, websites, apps and SEO retain separate agreed deliverables/pricing. Broad service copy describes work that can be commissioned, not work included automatically in hub registration.
- The agency-pricing context links to Ahrefs' survey of 439 providers, updated August 15, 2024. This is background, not a like-for-like savings calculation or a claim IAM beats every competitor's quote. Compare billing period, scope and currency.
- OIDC for the existing IAM project was explicitly approved by the user on October 25 and enabled alone. A broader autoExposeSystemEnvs change was rejected and was not applied. AI replies still require a new deployment and a real end-to-end check before being called live.

## Owner-approved construction campaign articles

Only new IAM construction campaign entries set `campaignSite` to the audited source hostname (for example `buildershaus.com` or `roofers.io`) and optionally `campaignLabel` to a short brand/industry label. Retain `contactBusiness: "iam"`. `CampaignContactCard` then supplies the shared native hide/reopen control with the stable summary `IAM · Construction marketing`; it links only to `https://www.industryarmymarketing.com/contact?request=guest-post&ref_site=ENCODED_HOSTNAME`. Do not supply a URL, path or query in `campaignSite`. Unflagged archive entries render no campaign card, and named client cards stay unchanged.

The first BuildersHaus guide preserves its actual October 27 publication time and approved BuildersHaus visual strip. Future articles must supply relevant permission-cleared hero/share artwork and an appropriate narrow visual treatment; the shared card is not a substitute for topic-specific imagery or an excuse to clone the first story. One source brand and distinct useful contractor topic per campaign article. No source-site upload form, lead delivery, rankings or ownership transfer should be implied without evidence.
