import { CheckCircle2, Clock3, LockKeyhole, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import { breadcrumbList } from "@/lib/breadcrumb";

const steps = [
  {
    icon: MapPin,
    title: "Territory review",
    body: "We check your trade, city, service area, and whether the territory is still open.",
  },
  {
    icon: CheckCircle2,
    title: "Contractor review",
    body: "We look for a real operating business, credible work and creators ready to share useful project content and help grow the network.",
  },
  {
    icon: Clock3,
    title: "Limited activation",
    body: "City pages are held for the right-fit partners. Applying does not reserve a page or guarantee acceptance; scope, content expectations and pricing are agreed before activation.",
  },
];

const ContractorApply = () => (
  <Layout>
    <Seo
      title="Apply for Contractor Territory | Industry Army Marketing"
      description="Apply for IAM's City-Page Partnership, a separate upgrade from $10/year hub registration. Selected creators contribute content and help grow the industry network."
      path="/apply/contractors"
      jsonLd={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Contractors", path: "/contractors" },
        { name: "Apply", path: "/apply/contractors" },
      ])}
    />
    <PageHeader
      eyebrow="Applications Open · Onboarding Limited"
      title="Apply For Your"
      highlight="City-Page Partnership"
      description="This is a separate upgrade from $10/year registration on one hub site. We are holding city pages for the right-fit creators who contribute useful content and help grow their industry hub and the wider network."
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground">
        <LockKeyhole className="h-4 w-4 text-primary" />
        One contractor per trade, per territory
      </div>
    </PageHeader>

    <section className="border-y border-border bg-card/30 py-16">
      <div className="container mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
        {steps.map((step) => (
          <article key={step.title} className="rounded-lg border border-border bg-card p-7">
            <step.icon className="mb-4 h-8 w-8 text-primary" />
            <h2 className="font-display text-2xl text-foreground">{step.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </article>
        ))}
      </div>
    </section>

    <ContactSection
      source="contractor-application"
      eyebrow="Contractor Application"
      title="Join The Review Queue"
      intro="Tell us about your business, city and the hub site you want to work with. In your message, include examples or links to project photos, videos or articles, and explain the content you could contribute. We review fit first, then discuss scope, content expectations and separate pricing."
      submitLabel="Submit Application"
      successDescription="Application received. We'll review your trade and territory and contact you with the next available step."
    />
  </Layout>
);

export default ContractorApply;
