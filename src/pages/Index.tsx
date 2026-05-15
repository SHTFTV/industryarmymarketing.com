import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import BrandsSection from "@/components/BrandsSection";
import CitiesPreview from "@/components/CitiesPreview";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <CitiesPreview />
      <BrandsSection />
      <AboutSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
