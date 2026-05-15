import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import BrandsSection from "@/components/BrandsSection";
import CitiesPreview from "@/components/CitiesPreview";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ContractorTradesGrid from "@/components/ContractorTradesGrid";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <ContractorTradesGrid limit={12} showCta />
      <PricingSection />
      <CitiesPreview />
      <BrandsSection />
      <AboutSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
