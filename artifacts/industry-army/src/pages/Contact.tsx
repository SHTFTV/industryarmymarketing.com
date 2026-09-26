import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";

const Contact = () => (
  <Layout>
    <Seo
      title="Contact | Industry Army Marketing"
      description="Ask about contractor marketing, industry listings, guest posts, or a network partnership. Tell us your trade and city."
      path="/contact"
      jsonLd={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ])}
    />
    <PageHeader
      eyebrow="Get In Touch"
      title="Grow With"
      highlight="Your Industry"
      description="Tell us your industry, city, and what you need: marketing, a listing, guest posting, or a partnership."
    />
    <ContactSection />
  </Layout>
);

export default Contact;