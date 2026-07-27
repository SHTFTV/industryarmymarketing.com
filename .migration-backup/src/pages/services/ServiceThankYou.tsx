import { useEffect } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SERVICE_LABELS: Record<string, string> = {
  "lead-generation": "Lead Generation",
  "web-development": "Web Development",
  "social-media": "Social Media",
  "affordable-seo": "Affordable SEO",
  "dofollow-backlinks": "Dofollow Backlinks",
};

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("iam_session_id");
  } catch {
    return null;
  }
}

const ServiceThankYou = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const label = slug ? SERVICE_LABELS[slug] : undefined;

  useEffect(() => {
    if (!slug || !label) return;
    const state = (location.state ?? {}) as { leadId?: string; fromForm?: boolean };
    trackEvent("bid_success", {
      service: slug,
      session_id: sessionId(),
      lead_id: state.leadId ?? null,
      from_form: !!state.fromForm,
    });
  }, [slug, label, location.state]);

  if (!slug || !label) {
    return <Navigate to="/services" replace />;
  }

  const path = `/services/${slug}/thank-you`;

  return (
    <Layout>
      <Seo
        title={`Bid Received — ${label} | Industry Army Marketing`}
        description={`Your ${label} bid request has been received and tagged. Our team replies within one business day.`}
        path={path}
        noindex
      />
      <section className="py-24 bg-background min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-2">
            Bid Received · {label}
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            You're on the front line.
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your {label} bid request is captured, tagged, and queued. A human
            reviews every submission — no shared queue, no auto-responders, no
            spam funnels. Expect a reply within one business day at the email
            you provided.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-10 text-left">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">Step 1</div>
              <p className="text-sm">We match your city + trade to open slots in the IAM network.</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">Step 2</div>
              <p className="text-sm">We reply with slot availability, ETAs, and a $10 invoice.</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">Step 3</div>
              <p className="text-sm">Placement goes live, Google indexes within 72h, ranking follows.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to={`/services/${slug}`}>
                Back to {label} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/"><Home className="w-4 h-4 mr-2" />Home</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Not what you expected? Email{" "}
            <a href="mailto:hello@industryarmymarketing.com" className="text-primary hover:underline">
              hello@industryarmymarketing.com
            </a>{" "}
            and reference this page.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceThankYou;