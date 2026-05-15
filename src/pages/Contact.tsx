import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";

const Contact = () => (
  <Layout>
    <PageHeader
      eyebrow="Get In Touch"
      title="Let's Lock In"
      highlight="Your Territory"
      description="Tell us your trade and your city. We'll confirm availability within 24 hours and get you live on the network within 48."
    />
    <ContactSection />
  </Layout>
);

export default Contact;