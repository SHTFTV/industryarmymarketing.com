import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import Seo from "@/components/Seo";
import { breadcrumbList } from "@/lib/breadcrumb";

const Contact = () => (
  <Layout>
    <Seo
      title="Contact | Industry Army Marketing"
      description="Talk to IAM about brand identity, websites, apps, publishing and rollout, or joining the industry network."
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
      description="Tell us what you want to build: a brand identity, website, app, content rollout or industry-network presence. Include your audience and project priorities."
    />
    <ContactSection />
  </Layout>
);

export default Contact;