import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import ContractorHero from "@/components/ContractorHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NotFound from "./NotFound";

// Pre-bundle every contractor data file so dynamic routes resolve at runtime.
const dataModules = import.meta.glob("../data/contractors/*.ts");

type Section = { id: string; heading: string | null; content: string };
type PageData = {
  slug: string;
  url: string;
  h1: string;
  city: string;
  citySlug: string;
  region: string;
  country: string;
  trade: string;
  tradeLabel: string;
  population: number;
  monthlyRate: number;
  domain: string;
  lat: number;
  lng: number;
  neighborhoods: string[];
  landmarks: string[];
  sisterCities: string[];
  relatedTrades: string[];
  meta: Record<string, string>;
  mapConfig: { center: { lat: number; lng: number }; zoom: number };
  schemas: object[];
  sections: Section[];
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ContractorCityPage = () => {
  const { trade, city } = useParams<{ trade: string; city: string }>();
  const [data, setData] = useState<PageData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!trade || !city) {
      setStatus("missing");
      return;
    }
    const key = `../data/contractors/${trade}__${city}.ts`;
    const loader = dataModules[key];
    if (!loader) {
      setStatus("missing");
      return;
    }
    loader().then((mod) => {
      setData((mod as { pageData: PageData }).pageData);
      setStatus("ready");
    });
  }, [trade, city]);

  if (status === "missing") return <NotFound />;
  if (status === "loading" || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
          Loading territory…
        </div>
      </Layout>
    );
  }

  const { meta } = data;
  const faqSection = data.sections.find((s) => s.id === "faq");
  const geoSection = data.sections.find((s) => s.id === "geo-llm");
  const contentSections = data.sections.filter(
    (s) => s.id !== "faq" && s.id !== "geo-llm" && s.id !== "map"
  );

  const faqItems = faqSection
    ? faqSection.content
        .split(/\n\n(?=\*\*Q:)/g)
        .map((block) => {
          const m = block.match(/^\*\*Q:\s*(.+?)\*\*\s*\n+([\s\S]*)$/);
          if (!m) return null;
          return { q: m[1].trim(), a: m[2].trim() };
        })
        .filter((x): x is { q: string; a: string } => !!x)
    : [];

  const mapSrc = `https://www.google.com/maps?q=${data.lat},${data.lng}(${encodeURIComponent(
    data.landmarks[0] ?? data.city
  )})&z=${data.mapConfig.zoom}&output=embed`;

  return (
    <Layout>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={meta.canonical} />
        <meta property="og:title" content={meta.og_title} />
        <meta property="og:description" content={meta.og_description} />
        <meta property="og:image" content={meta.og_image} />
        <meta property="og:type" content={meta.og_type} />
        <meta property="og:url" content={meta.canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.og_title} />
        <meta name="twitter:description" content={meta.og_description} />
        <meta name="twitter:image" content={meta.og_image} />
        <meta name="geo.region" content={meta.geo_region} />
        <meta name="geo.placename" content={meta.geo_placename} />
        <meta name="geo.position" content={meta.geo_position} />
        <meta name="ICBM" content={meta.geo_position?.replace(";", ", ")} />
        {data.schemas.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <ContractorHero
        imageSrc="/CONTRACTOR_SEO.png"
        h1={data.h1}
        city={`${data.city}${data.region ? `, ${data.region}` : ""}`}
        trade={data.tradeLabel}
        rate={data.monthlyRate}
      />

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border"
      >
        <ol className="flex flex-wrap gap-2">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li>/</li>
          <li><Link to="/contractors" className="hover:text-primary">Contractors</Link></li>
          <li>/</li>
          <li>
            <Link to={`/contractors`} className="hover:text-primary">
              {data.tradeLabel}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">{data.city}</li>
        </ol>
      </nav>

      {/* Content + Map */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <article className="min-w-0 space-y-12">
            {contentSections.map((section) => (
              <div key={section.id} id={section.id}>
                {section.heading && (
                  <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                    {section.heading}
                  </h2>
                )}
                <div className="prose prose-invert prose-headings:font-display prose-a:text-primary prose-strong:text-foreground max-w-none text-muted-foreground">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {faqItems.length > 0 && (
              <div id="faq">
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  {faqSection?.heading}
                </h2>
                <Accordion type="single" collapsible className="border border-border rounded-lg bg-card">
                  {faqItems.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                      <AccordionTrigger className="text-left font-display text-lg">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        <ReactMarkdown>{item.a}</ReactMarkdown>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {geoSection && (
              <div id="geo-llm">
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  {geoSection.heading}
                </h2>
                <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm leading-relaxed p-6 rounded-lg border border-primary/40 border-glow bg-card text-foreground overflow-x-auto">
                  {geoSection.content}
                </pre>
              </div>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4" id="map">
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                title={`Map of ${data.city}`}
                src={mapSrc}
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Landmarks</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.landmarks.map((l) => (
                  <li key={l}>• {l}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Sister cities */}
      {data.sisterCities.length > 0 && (
        <section className="border-t border-border bg-background py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl text-foreground mb-8">
              {data.tradeLabel} in nearby cities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.sisterCities.map((c) => (
                <Link
                  key={c}
                  to={`/contractors/${data.trade}/${slugify(c)}`}
                  className="p-5 rounded-lg border border-border bg-card hover:border-primary/40 hover:border-glow transition-all"
                >
                  <div className="font-display text-xl text-foreground">{c}</div>
                  <div className="text-primary text-sm font-mono mt-1">${data.monthlyRate}/month</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-3">
                    View Territory →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related trades */}
      {data.relatedTrades.length > 0 && (
        <section className="border-t border-border gradient-tactical py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl text-foreground mb-8">
              Other trades in {data.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.relatedTrades.map((t) => (
                <Link
                  key={t}
                  to={`/contractors/${t}/${data.citySlug}`}
                  className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:border-glow transition-all"
                >
                  <div className="font-display text-xl text-foreground capitalize">{t}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-primary mt-2">
                    {data.city} Territory →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA strip */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl mb-4">
            Lock Your {data.city} {data.tradeLabel} Territory
          </h2>
          <p className="font-mono text-sm uppercase tracking-[0.2em] mb-6">
            ${data.monthlyRate}/month · No Setup Fee · Cancel Anytime
          </p>
          <Button variant="heroOutline" size="lg" asChild className="bg-background text-foreground border-foreground hover:bg-background/90">
            <Link to="/scan-wizard">Request Your Free Scan</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default ContractorCityPage;