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
    body: "We look for a real operating business, credible work, and a strong fit for the network.",
  },
  {
    icon: Clock3,
    title: "Limited activation",
    body: "Applications stay active while onboarding opens in controlled batches. Good operators are not turned away.",
  },
];

const ContractorApply = () => (
  <Layout>
    <Seo
      title="Apply for Contractor Territory | Industry Army Marketing"
      description="Apply for a selective contractor marketing territory. IAM reviews one contractor per trade and city, with limited onboarding and no shared-lead auction."
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
      highlight="Contractor Territory"
      description="We are building the construction network carefully. Tell us where you operate and what you do. If your territory is available, your application enters the review queue for the next activation window."
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
      intro="Applications are open even when a territory is not being activated immediately. Give us enough detail to understand your company, service area, and the kind of work you want more of."
      submitLabel="Submit Application"
      successDescription="Application received. We'll review your trade and territory and contact you with the next available step."
    />
  </Layout>
);

export default ContractorApply;
