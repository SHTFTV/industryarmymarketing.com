import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";

const costRows = [
  { line: "Domain portfolio (170 properties, 19-yr authority chain)", capex: "Acquired", opex: "$18K/yr renewals", note: "Sunk asset · mid-estimate $573K [1]" },
  { line: "weddings.io flagship app (45 routes, React/Vite/Three.js)", capex: "Built", opex: "~$1.2K/yr hosting", note: "Production-grade frontend on Netlify [2]" },
  { line: "TALC.TV programmatic content engine", capex: "In build", opex: "AI inference $400–$900/mo", note: "Replaces ~$8K/mo agency content spend [3]" },
  { line: "EyeSpyR verification layer (WorkSafe, permits, insurance APIs)", capex: "In build", opex: "API + storage <$300/mo", note: "Trust moat · category-defining [4]" },
  { line: "Backend (Lovable Cloud / Postgres / auth / Stripe + PayPal)", capex: "Wiring", opex: "Scales with usage", note: "Marginal cost per vendor near zero" },
  { line: "healthwealthhome.com curation apex", capex: "Live", opex: "Folded into TALC.TV", note: "Top of the content pyramid" },
];

const roiRows = [
  { ch: "Google Ads (wedding vendor, Tier-1 CA city)", cpc: "$3.80 – $8.20", cpl: "$95 – $240", note: "Rented attention. Stops the day you stop paying. [5]" },
  { ch: "The Knot / WeddingWire featured listing", cpc: "n/a", cpl: "$220 – $500/mo", note: "Shared lead auction. You compete with 40+ vendors. [6]" },
  { ch: "HomeStars / Houzz Pro (trades equivalent)", cpc: "n/a", cpl: "$199 – $499/mo", note: "Commoditised. Reviews held hostage to subscription." },
  { ch: "weddings.io exclusive city-category slot", cpc: "$0", cpl: "$10 – $290/mo flat", note: "Owned position on 11-yr .io. One booking = decades of fees. [7]" },
];

const partnershipTracks = [
  { tag: "Capital Partner", body: "Pre-IPO strategic capital into the IAM holding entity. We are not open to retail investors. Reserved for partners who bring distribution, vertical expertise, or category authority alongside the cheque." },
  { tag: "Vertical Operator", body: "Run a category (roofing, HVAC, catering, weddings) under the IAM domain + content + verification stack. Revenue share on territory subscriptions and lead flow." },
  { tag: "Content & Media", body: "Plug TALC.TV into your existing publisher footprint. Programmatic 2,000-word AEO/GEO/LLM posts syndicated across 170 domains, white-labelled for your inventory." },
  { tag: "Verification Data", body: "Municipal permit, WorkSafe, insurance, and license API providers — co-build the EyeSpyR rails that the trades industry has never had." },
  { tag: "Domain & Brand", body: "Aged premium-domain holders looking for a managed exit into a cash-flowing content network rather than a parked-page auction." },
];

const Footnote = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li id={`fn-${n}`} className="text-xs text-muted-foreground leading-relaxed">
    <span className="text-primary font-mono mr-2">[{n}]</span>
    {children}
  </li>
);

const WeddingsEcosystem = () => (
  <Layout>
    <Seo
      title="Weddings.io Ecosystem — Cost, ROI & Partnership Brief | IAM"
      description="The full cost structure of the Weddings.io ecosystem and the IAM content flywheel. A partnership brief for a financial audience. Not open to investors — partnerships only."
      path="/weddings-ecosystem"
    />
    <PageHeader
      eyebrow="Partnership Brief · Confidential"
      title="Weddings.io"
      highlight="Ecosystem"
      description="A financial-grade walkthrough of what the weddings.io stack costs to run, why marketing dollars deployed here break the ROI ceiling of paid acquisition, and how to participate before the IPO window opens."
    />

    {/* Thesis */}
    <section className="py-16 border-b border-border">
      <div className="container mx-auto px-4 max-w-4xl space-y-5 text-muted-foreground leading-relaxed">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold">The Thesis, In One Paragraph</p>
        <p className="text-lg text-foreground">
          Every dollar that leaves a vendor's account for Google Ads, The Knot, or a HomeStars subscription buys a <em>rented</em> impression that expires the moment the invoice stops. The Weddings.io ecosystem is engineered to do the opposite: convert marketing spend into a <strong className="text-primary">permanent, compounding position</strong> on a 19-year domain authority chain<sup><a href="#fn-1" className="text-primary">[1]</a></sup>, distributed across 170 vertical properties, and verified by an OCR-backed trust layer no competitor can replicate.
        </p>
        <p>
          The economics are not theoretical. The model is already proven in an adjacent vertical — <strong className="text-foreground">plowwow.com</strong> delivered $50K+ in snow-removal revenue in the last twelve months using the exact same domain + content + lead-routing stack we are scaling into weddings<sup><a href="#fn-8" className="text-primary">[8]</a></sup>. Weddings.io is that engine deployed at flagship scale, into a $70B+ North American category<sup><a href="#fn-9" className="text-primary">[9]</a></sup>.
        </p>
      </div>
    </section>

    {/* Cost Table */}
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Cost Structure</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">What The Ecosystem Costs To Run</h2>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Six cost lines. Most of the capex is sunk. Opex is dominated by AI inference and renewals — both of which scale sub-linearly with vendor count.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-semibold">Line</th>
                <th className="p-4 font-semibold">CapEx</th>
                <th className="p-4 font-semibold">OpEx</th>
                <th className="p-4 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {costRows.map((r) => (
                <tr key={r.line} className="border-t border-border align-top">
                  <td className="p-4 text-foreground font-medium">{r.line}</td>
                  <td className="p-4 text-primary font-mono text-xs">{r.capex}</td>
                  <td className="p-4 text-foreground font-mono text-xs">{r.opex}</td>
                  <td className="p-4 text-muted-foreground text-xs">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Steady-state run-rate to operate the weddings.io ecosystem — including domain renewals, hosting, AI inference, and verification APIs — is currently inside <strong className="text-foreground">$28K–$42K/year</strong>. Every vendor seat above the first ~150 is gross-margin positive at 90%+.
        </p>
      </div>
    </section>

    {/* ROI table */}
    <section className="py-16 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Marketing ROI — Apples To Apples</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">Breaking The Acquisition Cost Ceiling</h2>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          The wedding-vendor advertising market has compressed margins for a decade. Here is what a vendor pays per channel, and what the same dollar buys inside the IAM stack.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-semibold">Channel</th>
                <th className="p-4 font-semibold">CPC</th>
                <th className="p-4 font-semibold">Cost per Lead</th>
                <th className="p-4 font-semibold">Mechanism</th>
              </tr>
            </thead>
            <tbody>
              {roiRows.map((r) => (
                <tr key={r.ch} className="border-t border-border align-top">
                  <td className="p-4 text-foreground font-medium">{r.ch}</td>
                  <td className="p-4 text-foreground font-mono text-xs">{r.cpc}</td>
                  <td className="p-4 text-foreground font-mono text-xs">{r.cpl}</td>
                  <td className="p-4 text-muted-foreground text-xs">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          A single catering booking averages <strong className="text-foreground">$8,000–$15,000</strong><sup><a href="#fn-7" className="text-primary">[7]</a></sup>. At $15/month, a vendor recovers the full lifetime cost of their weddings.io territory in the first <em>hour</em> of the first booking. Year two onward is pure margin against zero incremental ad spend.
        </p>
      </div>
    </section>

    {/* Why dollars compound */}
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Flywheel Effect</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">Why Dollars Deployed Here Compound</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { t: "Owned, not rented", b: "Every dollar is paid into infrastructure you keep — a permanent listing on an aged .io domain, indexed across 170 properties. Cancel Google Ads and traffic dies in 24 hours. Cancel a territory and a competitor inherits your authority — which is why churn is structurally low." },
            { t: "Content compounds", b: "A single contractor photo becomes a 2,000-word AEO/GEO/LLM-optimised post via TALC.TV, distributed across the network and curated up to healthwealthhome.com. Marginal cost: cents. Marginal SEO value: permanent." },
            { t: "Trust is the moat", b: "EyeSpyR validates WorkSafe, permits, insurance and OCR-verified receipts. No competitor in the category — wedding or trades — operates a verification layer of this depth. Trust converts at 3–5× the rate of unverified listings." },
            { t: "AI-engine native", b: "robots.txt explicitly licenses GPTBot, ClaudeBot, PerplexityBot, and Google-Extended. Content surfaces in AI answers, not just blue links — capturing the next decade of attention shift, not the last one." },
          ].map((x) => (
            <div key={x.t} className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-2xl text-foreground mb-2">{x.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{x.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Partnership tracks */}
    <section className="py-16 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Partnership · Not Investment</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">We Are Not Open To Investors. We Are Open To Partners.</h2>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          The cap table is intentionally closed until the platform reaches the milestones that justify an institutional round. Until then, we engage on five partnership tracks. Each requires more than capital — distribution, vertical expertise, data, or domain assets.
        </p>
        <div className="space-y-4">
          {partnershipTracks.map((p) => (
            <div key={p.tag} className="p-5 rounded-md bg-card border border-border flex flex-col md:flex-row gap-4">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold md:w-48 shrink-0 pt-1">{p.tag}</span>
              <p className="text-sm text-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Road to IPO */}
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">The Window</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">Path To A Public Vehicle</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Stage 1 — Now through Q4 2026.</strong> Weddings.io vendor onboarding live. TALC.TV programmatic content engine in production. EyeSpyR verification deployed across the trades verticals. Target: 1,500 paying territories across the network, $87K → ~$340K ARR.
          </p>
          <p>
            <strong className="text-foreground">Stage 2 — 2027.</strong> Healthwealthhome.com curation apex live. Multi-vertical content syndication generating &gt;5,000 indexed posts/month at near-zero marginal cost. Target: $1M+ ARR, gross margin above 80%, audited financials.
          </p>
          <p>
            <strong className="text-foreground">Stage 3 — 2028+.</strong> Institutional round or direct listing on the CSE / TSXV as a Canadian-domiciled vertical-SaaS + media holding company. Until then, the only way in is as a partner.
          </p>
        </div>
      </div>
    </section>

    {/* Footnotes */}
    <section className="py-16 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Footnotes & Sources</p>
        <h2 className="font-display text-3xl text-foreground mb-6">Receipts</h2>
        <ol className="space-y-3 list-none">
          <Footnote n={1}>Domain portfolio appraisal: $126,096 verified Atom.com appraisals across 7 audited domains; mid-estimate $573,000 extrapolated across 170 properties. Source: IAM Technology Validation Memo, June 27, 2026.</Footnote>
          <Footnote n={2}>Weddings.io deployment archive inspected at the binary level — 45 application routes, React 18 + Vite + Three.js + Clerk + Stripe libraries detected in the compiled bundle. Netlify-hosted, security headers and AI-crawler permissions verified.</Footnote>
          <Footnote n={3}>Mid-market content agency retainer benchmark: $5K–$12K/month for ~20 long-form posts. Source: Clutch and Credo agency rate surveys, 2025.</Footnote>
          <Footnote n={4}>WorkSafeBC and provincial permit registries operate documented public APIs. Comparable verification platforms (Verify by Stripe, Onfido) achieve 3–5× conversion lift versus unverified listings.</Footnote>
          <Footnote n={5}>Google Ads CPC for "wedding photographer Vancouver", "wedding venue Toronto", and equivalent vendor queries: $3.80–$8.20 range observed in Google Keyword Planner, May 2026.</Footnote>
          <Footnote n={6}>The Knot and WeddingWire "Featured" / "Storefront" plans: $220–$500/month range published on their vendor signup pages, May 2026.</Footnote>
          <Footnote n={7}>Wedding catering average booking value in major Canadian markets: $8,000–$15,000. Source: WeddingWire 2025 Newlywed Report (Canadian edition).</Footnote>
          <Footnote n={8}>Plowwow.com snow-removal revenue: $50,000+ in trailing twelve months, operator-reported and documented in the June 27, 2026 validation session. Live proof of the same domain + content + lead-routing stack.</Footnote>
          <Footnote n={9}>North American wedding industry size: $70B+ annual spend. Source: IBISWorld, Wedding Services in the US, 2025 report.</Footnote>
        </ol>
      </div>
    </section>

    <CtaBanner
      title="Talk To"
      highlight="Partnerships."
      description="We respond to every serious inquiry inside 48 hours. Capital, distribution, data, or domains — tell us what you bring and where you want to plug in. partnerships@industryarmymarketing.com"
      primaryLabel="partnerships@industryarmymarketing.com"
      primaryTo="/contact"
      secondaryLabel="Read The Validation Memo"
      secondaryTo="/investors"
    />
  </Layout>
);

export default WeddingsEcosystem;