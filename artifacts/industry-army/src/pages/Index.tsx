import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import featuredBattle from "@/assets/blog/weddings-vs-aiweddings-battle.png.asset.json";
import HeroSection from "@/components/HeroSection";
import FlagshipBrandsSection from "@/components/FlagshipBrandsSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ContractorTradesGrid from "@/components/ContractorTradesGrid";
import LatestBlogPosts from "@/components/LatestBlogPosts";

const Index = () => {
  return (
    <Layout>
      <Seo
        title="Industry Army Marketing | Contractor SEO & Territory Marketing"
        description="Register on one industry hub site for $10/year. Apply separately for a city-page partnership built around useful content and growing the IAM network."
        path="/"
        image={featuredBattle.url}
        imageAlt="Weddings.io vs aiweddings.io — Industry Army Marketing Battle for the Brand case study"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Industry Army Marketing",
          email: "colin@industryarmymarketing.com",
          priceRange: "$10+",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Vancouver",
            addressRegion: "BC",
            addressCountry: "CA",
          },
          areaServed: ["Vancouver", "Surrey", "Calgary", "Edmonton", "Toronto", "Kelowna"],
        }}
      />
      <HeroSection />
      <section id="network-results" aria-labelledby="network-results-title" className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-3">Industry experience and real outcomes</p>
          <h2 id="network-results-title" className="font-display text-4xl md:text-6xl text-foreground">
            Years of groundwork. A network to grow together.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-3xl">
            We have spent years doing SEO for LSFencing and building websites around the
            industries we work in. Now we are inviting more businesses and content creators
            to help fill those hubs with useful listings, projects and expertise.
          </p>
          <article className="mt-8 rounded-lg border border-border bg-background p-6 md:p-8">
            <p className="text-primary text-sm font-semibold mb-3">Long-term industry work</p>
            <h3 className="font-display text-2xl md:text-3xl text-foreground">LSFencing: years of SEO work</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
              Our work with LSFencing spans years of SEO. Alongside that work, we have built
              layers of industry websites to support discovery and participation. That
              experience informs how we develop IAM's industry hubs and invite businesses to join.
            </p>
          </article>
          <article className="mt-8 rounded-lg border border-primary/30 bg-background p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <a href="https://steelstud.ca/" className="text-primary underline font-semibold">Steelstud.ca</a>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Closed deal</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-foreground">Southpointe Academy school project</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
              The enquiry for this school dropped-ceiling project came through Steelstud.ca,
              part of the IAM network, and was referred to Rambo Wall &amp; Ceiling. The project
              was subsequently awarded to Rambo. It is one documented example of an
              industry website generating an enquiry that turned into a job.
            </p>
            <ol className="grid gap-4 sm:grid-cols-3 mt-6" aria-label="Project enquiry to closed deal">
              <li className="rounded border border-border p-4"><span className="text-primary font-semibold">1. Industry site</span><p className="mt-1 text-foreground">Steelstud.ca</p></li>
              <li className="rounded border border-border p-4"><span className="text-primary font-semibold">2. Project enquiry</span><p className="mt-1 text-foreground">School dropped ceiling</p></li>
              <li className="rounded border border-border p-4"><span className="text-primary font-semibold">3. Business outcome</span><p className="mt-1 text-foreground">Closed deal</p></li>
            </ol>
          </article>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Help build a useful destination for your industry. Register on one industry hub
            for $10/year so visitors can find your business. For creators ready to contribute useful
            content and help grow the network, city-page partnerships are a separate upgrade
            offered after a fit review.
          </p>
          <div className="flex flex-wrap gap-6 mt-4">
            <Link to="/pricing" className="text-primary underline font-semibold">Compare registration and city-page partnerships</Link>
            <Link to="/contact?request=marketing&ref_page=%2F%23network-results" className="text-primary underline font-semibold">Discuss your industry</Link>
          </div>
        </div>
      </section>
      <ServicesSection />
      <ContractorTradesGrid limit={12} showCta />
      <PricingSection />
      <FlagshipBrandsSection />
      <AboutSection />
      <LatestBlogPosts />
      <ContactSection />
    </Layout>
  );
};

export default Index;
