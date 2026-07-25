import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { flushCtaAttribution } from "@/lib/analytics";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ComingSoonModal from "@/components/ComingSoonModal";
import Index from "./pages/Index.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Pricing from "./pages/Pricing.tsx";
import Contractors from "./pages/Contractors.tsx";
import ServiceProfessionals from "./pages/ServiceProfessionals.tsx";
import Backlinks from "./pages/Backlinks.tsx";
import DofollowBacklinks from "./pages/DofollowBacklinks.tsx";
import Industries from "./pages/Industries.tsx";
import Contact from "./pages/Contact.tsx";
import CityPage from "./pages/CityPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Network from "./pages/Network.tsx";
import EyeSpyr from "./pages/EyeSpyr.tsx";
import Builder from "./pages/Builder.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Investors from "./pages/Investors.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Legal from "./pages/Legal.tsx";
import SteelStud from "./pages/SteelStud.tsx";
import MiningLogistics from "./pages/MiningLogistics.tsx";
import ScanWizard from "./pages/ScanWizard.tsx";
import LocalVancouver from "./pages/local/Vancouver.tsx";
import LocalSurrey from "./pages/local/Surrey.tsx";
import LocalLangley from "./pages/local/Langley.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLeads from "./pages/admin/AdminLeads.tsx";
import AdminProposals from "./pages/admin/AdminProposals.tsx";
import AdminPppRequote from "./pages/admin/AdminPppRequote.tsx";
import PwaCheck from "./pages/PwaCheck.tsx";
import RssPreview from "./pages/RssPreview.tsx";
import DomainSetup from "./pages/DomainSetup.tsx";
import GuestPost from "./pages/GuestPost.tsx";
import ContractorCityPage from "./pages/ContractorCityPage.tsx";
import SyncAccount from "./pages/SyncAccount.tsx";
import SeoAudit from "./pages/SeoAudit.tsx";
import SeoAuditDetail from "./pages/SeoAuditDetail.tsx";
import WeddingsEcosystem from "./pages/WeddingsEcosystem.tsx";
import StaticHtmlPage from "./pages/StaticHtmlPage.tsx";
import SiteMap from "./pages/SiteMap.tsx";
import SeoPackages from "./pages/SeoPackages.tsx";
import SeoPackageDetail from "./pages/SeoPackageDetail.tsx";
import LeadGeneration from "./pages/services/LeadGeneration.tsx";
import WebDevelopment from "./pages/services/WebDevelopment.tsx";
import SocialMedia from "./pages/services/SocialMedia.tsx";
import AffordableSeo from "./pages/services/AffordableSeo.tsx";
import DofollowBacklinksService from "./pages/services/DofollowBacklinksService.tsx";
import ServiceThankYou from "./pages/services/ServiceThankYou.tsx";
import AdminServiceLeads from "./pages/admin/AdminServiceLeads.tsx";
import AdminBlogPosts from "./pages/admin/AdminBlogPosts.tsx";
import AdminSubmissionLog from "./pages/admin/AdminSubmissionLog.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import SecurityFindings from "./pages/SecurityFindings.tsx";
import AIIndexingAudit from "./pages/AIIndexingAudit.tsx";
import { legacyRedirectRoutes } from "./components/LegacyRedirects";
import featuredBattle from "@/assets/blog/weddings-vs-aiweddings-battle.png.asset.json";

const SITE = "https://industryarmymarketing.com";
const battleImageAbs = `${SITE}${featuredBattle.url}`;

const caseStudyJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE}/case-studies/brand-defense-global-territory#article`,
    headline: "Brand Defense: Global Territory — the Weddings.io case study",
    name: "Brand Defense: Global Territory",
    description:
      "How Industry Army Marketing defended weddings.io (registered 2015) against the aiweddings.io AI-wrapper challenger — territory ownership, receipts, and the brand-defense model.",
    url: `${SITE}/case-studies/brand-defense-global-territory`,
    inLanguage: "en-CA",
    isPartOf: { "@id": `${SITE}/#website` },
    image: {
      "@type": "ImageObject",
      url: battleImageAbs,
      caption:
        "Weddings.io vs aiweddings.io — Industry Army Marketing Brand Defense case study",
    },
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Industry Army Marketing", url: SITE },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Industry Army Marketing",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/case-studies/brand-defense-global-territory`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: `${SITE}/case-studies` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Brand Defense: Global Territory",
        item: `${SITE}/case-studies/brand-defense-global-territory`,
      },
    ],
  },
];

const towerBlogJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE}/blog/aiweddings-tower-on-our-land#article`,
    headline:
      "You Built Your Tower on Our Land: aiweddings.io, weddings.io, and Why This Is a Risky Place to Plant a Flag",
    name: "You Built Your Tower on Our Land",
    description:
      "The public timeline and proof trail behind weddings.io's 2015 registration and the aiweddings.io challenge — companion piece to the Brand Defense case study.",
    url: `${SITE}/blog/aiweddings-tower-on-our-land`,
    inLanguage: "en-CA",
    isPartOf: { "@id": `${SITE}/#website` },
    image: {
      "@type": "ImageObject",
      url: battleImageAbs,
      caption:
        "Weddings.io vs aiweddings.io — companion post to the Industry Army Marketing Brand Defense case study",
    },
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Industry Army Marketing", url: SITE },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Industry Army Marketing",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/blog/aiweddings-tower-on-our-land`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: "You Built Your Tower on Our Land",
        item: `${SITE}/blog/aiweddings-tower-on-our-land`,
      },
    ],
  },
];

const queryClient = new QueryClient();

// Fires home_cta_conversion on route entries that match a pending CTA click.
const CtaAttributionListener = () => {
  const location = useLocation();
  useEffect(() => {
    flushCtaAttribution(location.pathname);
  }, [location.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* reducedMotion="always" forces motion components to skip their initial
        hidden state and render at the final `animate` state immediately.
        This guarantees content is visible on first paint and in full-page
        captures (screenshots, crawlers) regardless of IntersectionObserver. */}
    <MotionConfig reducedMotion="always">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ComingSoonModal />
        <BrowserRouter>
        <CtaAttributionListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/seo-packages" element={<SeoPackages />} />
          <Route path="/seo-packages/:slug" element={<SeoPackageDetail />} />
          <Route path="/services/lead-generation" element={<LeadGeneration />} />
          <Route path="/services/web-development" element={<WebDevelopment />} />
          <Route path="/services/social-media" element={<SocialMedia />} />
          <Route path="/services/affordable-seo" element={<AffordableSeo />} />
          <Route path="/services/dofollow-backlinks" element={<DofollowBacklinksService />} />
          <Route path="/services/:slug/thank-you" element={<ServiceThankYou />} />
          <Route path="/admin/service-leads" element={<AdminServiceLeads />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/service-professionals" element={<ServiceProfessionals />} />
          <Route path="/backlinks" element={<Backlinks />} />
          <Route path="/dofollow-backlinks" element={<DofollowBacklinks />} />
          <Route path="/guest-post" element={<GuestPost />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cities/:city" element={<CityPage />} />
          <Route path="/contractors/:trade/:city" element={<ContractorCityPage />} />
          <Route path="/scan-wizard" element={<ScanWizard />} />
          <Route path="/sync-account" element={<SyncAccount />} />
          <Route path="/seo-audit" element={<SeoAudit />} />
          <Route path="/seo-audit/:id" element={<SeoAuditDetail />} />
          <Route path="/network" element={<Network />} />
          <Route path="/eyespyr" element={<EyeSpyr />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/niches/steel-stud" element={<SteelStud />} />
          <Route path="/niches/mining-logistics" element={<MiningLogistics />} />
          <Route path="/local/vancouver" element={<LocalVancouver />} />
          <Route path="/local/surrey" element={<LocalSurrey />} />
          <Route path="/local/langley" element={<LocalLangley />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/proposals" element={<AdminProposals />} />
          <Route path="/admin/ppp-requote" element={<AdminPppRequote />} />
          <Route path="/admin/blog" element={<AdminBlogPosts />} />
          <Route path="/admin/submission-log" element={<AdminSubmissionLog />} />
          <Route path="/pwa-check" element={<PwaCheck />} />
          <Route path="/rss-preview" element={<RssPreview />} />
          <Route path="/domain-setup" element={<DomainSetup />} />
          <Route path="/weddings-ecosystem" element={<WeddingsEcosystem />} />
          <Route path="/sitemap" element={<SiteMap />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/ai-indexing-audit" element={<AIIndexingAudit />} />
          <Route path="/security-findings" element={<SecurityFindings />} />
          {/* Case study consolidated into the standard blog roll — 301 to the blog post. */}
          <Route
            path="/case-studies/brand-defense-global-territory"
            element={<Navigate to="/blog/brand-defense-global-territory" replace />}
          />
          <Route
            path="/blog/aiweddings-tower-on-our-land"
            element={
              <StaticHtmlPage
                src="/blog/aiweddings-tower-on-our-land.html"
                title="You Built Your Tower on Our Land: aiweddings.io, weddings.io, and Why This Is a Risky Place to Plant a Flag"
                description="The public timeline and proof trail behind weddings.io's 2015 registration and the aiweddings.io challenge — companion piece to the Brand Defense case study."
                path="/blog/aiweddings-tower-on-our-land"
                image={featuredBattle.url}
                imageAlt="Weddings.io vs aiweddings.io — companion post to the Industry Army Marketing Brand Defense case study"
                jsonLd={towerBlogJsonLd}
              />
            }
          />
          <Route
            path="/blog/iam-perspective-committed-people-not-capital"
            element={
              <StaticHtmlPage
                src="/blog/iam-perspective-committed-people-not-capital.html"
                title="IAM Perspective: Committed People, Not Committed Capital — A Builder's Response to the Legacy-Media Wedding Tech Wave"
                description="Industry Army Marketing's builder response to WeddingSaaS.com's analysis of legacy media acquiring the wedding tech stack — why the IAM ecosystem model bets on committed people over committed capital."
                path="/blog/iam-perspective-committed-people-not-capital"
                image="/blog-assets/iam-perspective-committed-people.jpg"
                imageAlt="IAM Perspective — committed people, not committed capital"
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {legacyRedirectRoutes()}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
