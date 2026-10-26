import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import "@/components/steel-drywall-marketing.css";

const recruitment = {
  stage: "BETA APPLICATIONS OPEN",
  headline: "Two good contractors. A stronger way to be found.",
  summary: "We’re looking for a couple of top-rated steel stud and drywall contractors to help shape IAM’s marketing beta. Applications are open outside British Columbia’s Lower Mainland.",
  eligibility: "This beta is for contractors based and operating outside the Lower Mainland, including Metro Vancouver and the Fraser Valley. Lower Mainland contractors are not being recruited in this intake.",
};
const references = [
  { name: "SteelStud.ca", tag: "THE WORK / THE REFERENCE", url: "https://www.steelstud.ca/", body: "A reference for explaining commercial framing, drywall, ceilings and coordinated interior work. Explore the service structure and real project evidence, then build around your own business and projects." },
  { name: "Drywallers.io", tag: "THE DRYWALL SIDE", url: "https://www.drywallers.io/", body: "Drywall installation, taping, finishing, repairs and planning resources. A relevant setting for answering the questions a builder or property owner asks before requesting a quote." },
  { name: "SteelStudContractors.com", tag: "THE FRAMING SIDE", url: "https://www.steelstudcontractors.com/", body: "A specialist steel stud destination for framing knowledge and project content. Discuss where your expertise fits and which pages and enquiry routes would support your actual service area." },
];
const routes = [
  ["SEO", "Get the service right.", "Steel stud framing, boarding, taping, suspended ceilings and tenant improvements each answer different searches. Give the work you actually perform a useful page, clear scope and direct enquiry route."],
  ["AEO", "Answer before the estimate.", "Explain what drawings you need, how framing and boarding scopes meet, what a finish level means and what affects an estimate. Give customers a useful answer and a practical next step."],
  ["GEO", "Make your expertise understandable.", "Keep company details, authorship, project credits and service descriptions consistent so search and AI systems can interpret the business and its work."],
  ["pSEO", "Connect services, cities and proof.", "Use a reusable publishing system to organise real services and markets. Each page adds a distinct project, buyer question or local scope, with your business accountable for the enquiry."],
];
const examples = [
  ["Steel stud framing", "Commercial partitions", "/services/steel-stud-framing", "Explain layouts, openings, backing and the information a general contractor needs for a framing quote."],
  ["Drywall & finishing", "A clear finishing scope", "/services/drywall-installation-finishing", "Describe boarding, taping and the specified finish, with your own approved photographs and estimate requirements."],
  ["Your actual city", "A service-area page", "/areas/your-city/drywall", "Add real service boundaries, project context and customer questions for a city you genuinely cover."],
  ["Your completed work", "An original project story", "/projects/your-commercial-fitout", "Show the work, credit the performing company and connect the reader directly to that company."],
];
const questions = [
  ["Who is the beta for?", "Established steel stud framing and drywall businesses outside the Lower Mainland, with strong public reviews or references, real project evidence and someone ready to contribute useful content. We’re looking for two good fits, with acceptance after review."],
  ["Are selected cities open yet?", "This is an initial contractor beta intake. Send your city and actual operating area for review. Selected-city recruitment can follow later; no city is reserved by opening this page or sending an application."],
  ["Does applying put my company on all three websites?", "We review the right brand, page and market fit with you. The written scope identifies placements, approved content, contact ownership, deliverables and price before activation."],
  ["How do you assess top-rated contractors?", "Send a public review-profile link, recent project examples and references where available. Ratings and experience are reviewed in context; a self-description alone does not establish approval or verification."],
  ["How much does participation cost?", "Beta scope and pricing are discussed before activation. IAM’s separate directory registration and broader marketing services have their own terms. Applying creates no subscription or payment commitment."],
];

function BetaApplication() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const city = String(data.get("city") || "").trim();
    const excluded = /\b(vancouver|surrey|burnaby|richmond|langley|abbotsford|chilliwack|coquitlam|port moody|delta|new westminster|new west|maple ridge|pitt meadows|white rock|mission|hope|agassiz|harrison|kent|anmore|belcarra|lions bay|bowen island|metro vancouver|lower mainland|fraser valley)\b/i;
    if (data.get("region") === "British Columbia" && excluded.test(city)) {
      setDraft("");
      setError("This intake excludes the Lower Mainland, including Metro Vancouver and the Fraser Valley. We are reviewing contractors based and operating outside that region.");
      return;
    }
    const fields = [
      ["Name", "name"], ["Reply email", "email"], ["Company", "company"],
      ["Website", "businessUrl"], ["Trade", "trade"], ["City / province or state / country", "city"],
      ["Operating region", "region"], ["Actual service area", "serviceArea"], ["Public reviews / references", "reviews"],
      ["Project examples", "projects"], ["What we want to grow", "message"],
    ];
    const body = ["Steel stud & drywall marketing — beta application", "", ...fields.map(([label, key]) => `${label}: ${String(data.get(key) || "").trim()}`), "", "I confirm this application is for a contractor based and operating outside the Lower Mainland.", "Source: https://www.industryarmymarketing.com/steel-stud-drywall-marketing"].join("\n");
    setError("");
    setDraft("mailto:colin@industryarmymarketing.com?subject=" + encodeURIComponent("Steel stud & drywall beta — " + city) + "&body=" + encodeURIComponent(body));
  }
  return <section className="sd-application sd-wrap sd-section" id="apply"><div><p className="sd-kicker">APPLY / TWO BETA PLACES</p><h2>Bring your work.<br/>Tell us your city.</h2><p>{recruitment.eligibility}</p><p>We’re looking for quality work, credible reviews and contractors willing to help develop a useful industry presence. Send the evidence behind your reputation.</p><p>Your application goes to <a href="mailto:colin@industryarmymarketing.com">colin@industryarmymarketing.com</a>. Prepare the brief, then review and send it in your email app.</p><small>Applications are reviewed individually. Acceptance, scope, pricing and any future city arrangement are confirmed directly.</small></div><form onSubmit={prepare} onChange={() => { setDraft(""); setError(""); }}>
    <div className="sd-fields"><label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label><label>Reply email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label></div>
    <label>Company name<input name="company" autoComplete="organization" required maxLength={150}/></label>
    <label>Company website<input name="businessUrl" type="url" placeholder="https://" required maxLength={500}/></label>
    <label>Your trade<select name="trade" required defaultValue=""><option value="" disabled>Select your work</option><option>Steel stud framing</option><option>Drywall installation & finishing</option><option>Steel stud framing & drywall</option></select></label>
    <label>Operating region<select name="region" required defaultValue=""><option value="" disabled>Select your region</option><option>British Columbia</option><option>Other Canadian province or territory</option><option>United States</option><option>Other country</option></select></label>
    <label>City, province/state and country<input name="city" required maxLength={150} placeholder="e.g. Kelowna, BC, Canada"/></label>
    <label>Actual service area<input name="serviceArea" required maxLength={300}/></label>
    <label>Public review profile or references<textarea name="reviews" required maxLength={700} rows={2} placeholder="Link to your Google reviews or describe the references available"/></label>
    <label>Project examples<textarea name="projects" required maxLength={700} rows={2} placeholder="Links to your own completed work and photographs"/></label>
    <label>What kind of work do you want more of?<textarea name="message" required maxLength={700} rows={3}/></label>
    <label className="sd-confirm"><input name="outsideLowerMainland" type="checkbox" required/>I confirm our business is based and operating outside the Lower Mainland for this beta application.</label>
    {error && <p className="sd-error" role="alert">{error}</p>}
    <button type="submit">Prepare my beta application ↗</button><p className="sd-small">This prepares an email draft. Review and send it from your email app to apply.</p>
    {draft && <div className="sd-draft" role="status"><strong>Your application draft is ready.</strong><p>Nothing has been sent yet.</p><a href={draft}>Open my application email to Colin ↗</a></div>}
  </form></section>;
}

export default function SteelDrywallMarketing() {
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle("iam-steel-hero-visible", entry.isIntersecting));
    observer.observe(element);
    return () => { observer.disconnect(); document.body.classList.remove("iam-steel-hero-visible"); };
  }, []);
  return <Layout><Seo title="Steel Stud & Drywall Contractor Marketing Beta | IAM" description="Apply for IAM’s steel stud and drywall marketing beta. Two top-rated contractors sought outside the Lower Mainland. SEO, AEO, GEO and pSEO built around real work." path="/steel-stud-drywall-marketing" image="/steel-drywall-marketing/steel-drywall-beta-share.jpg" imageAlt="IAM steel stud and drywall marketing beta, with steel partition framing from the SteelStud.ca archive" jsonLd={[{"@context":"https://schema.org","@type":"Service",name:"Steel stud and drywall contractor marketing",serviceType:"Contractor SEO, AEO, GEO and programmatic SEO",url:"https://www.industryarmymarketing.com/steel-stud-drywall-marketing",provider:{"@type":"Organization",name:"Industry Army Marketing",url:"https://www.industryarmymarketing.com/"}},{"@context":"https://schema.org","@type":"FAQPage",mainEntity:questions.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]}/><div className="sd-page">
    <section className="sd-hero" ref={hero}><div className="sd-wrap sd-hero-grid"><div><p className="sd-kicker">IAM / STEEL STUD & DRYWALL / {recruitment.stage}</p><h1>Your work builds walls.<br/><span>Let’s build your presence.</span></h1><p className="sd-deck">Steel stud & drywall contractor marketing.</p><p>{recruitment.summary}</p><div className="sd-actions"><a href="#apply">Apply for the beta ↗</a><a className="sd-secondary" href="#trade-network">Explore the three references ↓</a></div><p className="sd-small">Initial beta intake · Two contractors sought · Outside the Lower Mainland</p></div><figure className="sd-hero-photo"><img src="/steel-drywall-marketing/steelstud-partitions.jpg" alt="Steel stud interior partitions with backing and board during a commercial buildout" width={1400} height={787} fetchPriority="high"/><img className="sd-iam-seal" src="/brand-journal/iam-seal.webp" alt="Industry Army Marketing" width={160} height={160}/><figcaption>Interior partition framing · <a href="https://www.steelstud.ca/">SteelStud.ca project archive</a>. Reference imagery, not a beta applicant’s project.</figcaption></figure></div></section>
    <nav className="sd-route-bar sd-wrap" aria-label="Steel stud and drywall marketing sections"><a href="#trade-network">The network</a><a href="#marketing-routes">SEO · AEO · GEO · pSEO</a><a href="#page-plan">Your page plan</a><a href="#beta-fit">Beta fit</a><a href="#apply">Apply</a></nav>
    <section className="sd-wrap sd-section" id="trade-network"><p className="sd-kicker">THREE REFERENCES / ONE CONNECTED INDUSTRY</p><h2>Built around the trade.<br/>Grounded in real work.</h2><div className="sd-brand-grid">{references.map(b=><article key={b.name}><p className="sd-kicker">{b.tag}</p><h3>{b.name}</h3><p>{b.body}</p><a href={b.url}>Explore {b.name} ↗</a></article>)}</div><p className="sd-small">Your own identity and enquiry ownership stay clear. The beta review defines the relevant destination and scope for your business.</p></section>
    <section className="sd-dark" id="marketing-routes"><div className="sd-wrap sd-section"><p className="sd-kicker">FOUR WAYS TO ORGANISE YOUR PRESENCE</p><h2>From the search<br/>to the scope of work.</h2><div className="sd-route-stack">{routes.map(([tag,title,body])=><article key={tag}><span className="sd-tag">{tag}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="sd-small">GEO means generative engine optimisation. Local city targeting is part of SEO. Publication is measured separately from rankings, AI citations and enquiries.</p></div></section>
    <section className="sd-wrap sd-section" id="page-plan"><p className="sd-kicker">THE PAGE PLAN / SERVICES + CITIES + PROJECTS</p><h2>Give every route a reason.</h2><p className="sd-intro">Start with the work you do and the customers you want. These example routes show how a contractor’s content can fit together. They are planning examples, not live city openings.</p><div className="sd-example-grid">{examples.map(([tag,title,route,body])=><article key={route}><p className="sd-kicker">{tag}</p><h3>{title}</h3><code>{route}</code><p>{body}</p></article>)}</div><div className="sd-actions"><a href="#apply">Discuss my trade & city ↗</a><Link className="sd-secondary" to="/seo">Explore IAM’s market briefs</Link></div></section>
    <section className="sd-fit" id="beta-fit"><div className="sd-wrap sd-section"><p className="sd-kicker">A SMALL INTAKE / HELP SHAPE THE BETA</p><h2>{recruitment.headline}</h2><div className="sd-fit-grid"><article><h3>A reputation we can review.</h3><p>Bring your review profile, recent references and approved project photographs. Tell us who performed the work, your actual service area and the projects you want more of.</p></article><article><h3>A practical publishing partnership.</h3><p>We plan the pages, attribution, review process and enquiry destination together. You contribute trade knowledge and real work; IAM develops the agreed marketing and publishing structure.</p></article><article><h3>Outside the Lower Mainland.</h3><p>{recruitment.eligibility}</p></article></div><p>We’re starting with two contractors. As the beta develops, recruitment can move to selected cities. The current invitation is to apply for review.</p></div></section>
    <section className="sd-wrap sd-section"><p className="sd-kicker">BEFORE YOU APPLY</p><h2>A few useful answers.</h2><div className="sd-faq">{questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <BetaApplication/>
    <section className="sd-closing sd-wrap"><p>Part of IAM’s contractor marketing network.</p><Link to="/contractors">Contractor marketing ↗</Link><Link to="/snow-removal-marketing">Snow removal marketing ↗</Link><Link to="/mission">IAM’s mission & client beta ↗</Link></section>
  </div></Layout>;
}
