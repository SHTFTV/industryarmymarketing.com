import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import Seo from "@/components/Seo";

const Contact = () => (
  <Layout>
    <Seo
      title="Contact IAM | Industry Army Marketing"
      description="Get in touch with Industry Army Marketing. Tell us your trade and your city — we'll confirm availability within 24 hours and get you live on the network within 48."
      path="/contact"
    />
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
