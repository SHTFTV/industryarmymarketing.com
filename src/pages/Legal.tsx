import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import FeatureGrid from "@/components/FeatureGrid";

const topics = [
  { icon: "📜", title: "Lien Rights in BC", body: "Understanding BC's Builders Lien Act — when you can file, how long you have, and how to protect your right to payment on construction projects." },
  { icon: "📝", title: "Contract Basics", body: "What every contractor needs in writing before starting work. Scope, payment terms, change orders, and dispute resolution clauses that hold up in court." },
  { icon: "🛡️", title: "WSBC & Insurance", body: "WorkSafeBC requirements for contractors in BC. What coverage you need, when subcontractors become your responsibility, and how to stay compliant." },
  { icon: "💰", title: "GST/HST for Trades", body: "When you're required to register, how to collect properly, and common billing mistakes that expose you to CRA liability." },
  { icon: "⚠️", title: "Deficiency Claims", body: "How to respond to a deficiency claim without admitting liability. The difference between warranty work and a change-of-mind dispute." },
  { icon: "🤝", title: "Subcontractor Agreements", body: "Key clauses when hiring subcontractors: indemnification, insurance requirements, payment terms, and how to avoid inheriting their tax problems." },
];

const docs = [
  { title: "Privacy Policy", body: "PIPEDA-compliant privacy policy governing all data collected through IAM platforms and services." },
  { title: "Terms of Service", body: "Full terms and conditions for use of the IAM platform, including SLA commitments and territory rules." },
  { title: "Legal Notice", body: "Trademark notice, intellectual property rights, and contact information for legal inquiries." },
];

const Legal = () => (
  <Layout>
    <Seo
      title="Legal Hub — lawyersadvice.co | IAM"
      description="IAM's legal resources portal for contractors, trades, and small businesses. Powered by lawyersadvice.co — straight answers, no jargon."
      path="/legal"
    />
    <PageHeader
      eyebrow="lawyersadvice.co"
      title="Legal"
      highlight="Hub"
      description="IAM's legal resources portal for contractors, trades, and small businesses. Powered by lawyersadvice.co — straight answers, no jargon."
    />
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">For Contractors</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">Legal Questions Contractors Ask</h2>
        <FeatureGrid features={topics} />
        <p className="text-muted-foreground text-xs mt-8 leading-relaxed max-w-3xl">
          The information on this page is for general educational purposes only and does not constitute legal advice. For advice specific to your situation, consult a qualified BC lawyer.
        </p>
      </div>
    </section>
    <section className="py-20 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">IAM Legal Documents</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-10">Our Legal Docs</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {docs.map((d) => (
            <div key={d.title} className="p-6 rounded-md bg-card border border-border">
              <h3 className="font-display text-2xl text-foreground mb-2">{d.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm mt-10">
          All legal inquiries: <span className="text-primary">legal@industryarmymarketing.com</span>
        </p>
      </div>
    </section>
  </Layout>
);

export default Legal;