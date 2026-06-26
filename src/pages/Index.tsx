import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";
import FlagshipBrandsSection from "@/components/FlagshipBrandsSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import BrandsSection from "@/components/BrandsSection";
import CitiesPreview from "@/components/CitiesPreview";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ContractorTradesGrid from "@/components/ContractorTradesGrid";
import LatestBlogPosts from "@/components/LatestBlogPosts";

const Index = () => {
  return (
    <Layout>
      <Seo
        title="Industry Army Marketing | Contractor SEO & Territory Marketing"
        description="Permanent dofollow backlinks and exclusive city-trade territories on 20+ year-old industry domains. One contractor per trade per city — pricing scales with city population."
        path="/"
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
      <FlagshipBrandsSection />
      <ServicesSection />
      <ContractorTradesGrid limit={12} showCta />
      <PricingSection />
      <CitiesPreview />
      <BrandsSection />
      <AboutSection />
      <LatestBlogPosts />
      <ContactSection />
    </Layout>
  );
};

export default Index;
