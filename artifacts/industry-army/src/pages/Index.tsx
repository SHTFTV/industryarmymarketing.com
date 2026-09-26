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
        description="Contractor marketing, business listings, and exclusive market opportunities. Directory listings start at $10/year; contact IAM for your market rate."
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
