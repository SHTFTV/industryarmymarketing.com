import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { CheckCircle2, Send } from "lucide-react";

export type ServiceSlug =
  | "lead-generation"
  | "web-development"
  | "social-media"
  | "affordable-seo"
  | "dofollow-backlinks";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z
    .string()
    .trim()
    .min(3, "Email is required")
    .max(255)
    .email("Enter a valid email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  trade: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  timeline: z.string().trim().max(60).optional().or(z.literal("")),
  project_description: z.string().trim().max(4000).optional().or(z.literal("")),
});

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const KEY = "iam_session_id";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

interface BidRequestFormProps {
  service: ServiceSlug;
  serviceLabel: string;
  /** Optional heading override */
  heading?: string;
  /** Optional subheading override */
  subheading?: string;
}

const BidRequestForm = ({
  service,
  serviceLabel,
  heading,
  subheading,
}: BidRequestFormProps) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || submitted) return;
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      city: String(fd.get("city") ?? ""),
      trade: String(fd.get("trade") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      project_description: String(fd.get("project_description") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (k && !map[k]) map[k] = issue.message;
      }
      setErrors(map);
      trackEvent("bid_form_validation_failed", { service });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const clean = parsed.data;
    const path =
      typeof window !== "undefined" ? window.location.pathname : null;
    const referrer =
      typeof document !== "undefined" ? document.referrer || null : null;
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent || null : null;
    try {
      // Generate the id client-side so we can attribute the thank-you
      // event without needing SELECT access to service_leads (anon has
      // INSERT-only privileges under RLS).
      const leadId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : null;
      const { error } = await supabase
        .from("service_leads")
        .insert({
        id: leadId ?? undefined,
        service,
        name: clean.name,
        email: clean.email,
        phone: clean.phone || null,
        company: clean.company || null,
        city: clean.city || null,
        trade: clean.trade || null,
        budget: clean.budget || null,
        timeline: clean.timeline || null,
        project_description: clean.project_description || null,
        session_id: sessionId(),
        referrer,
        user_agent: userAgent,
        page_path: path,
        });
      if (error) throw error;
      trackEvent("bid_form_submitted", {
        service,
        lead_id: leadId,
        has_phone: !!clean.phone,
        has_company: !!clean.company,
        has_city: !!clean.city,
        budget: clean.budget || null,
        timeline: clean.timeline || null,
      });
      setSubmitted(true);
      toast({
        title: "Bid request received",
        description: `Your ${serviceLabel} inquiry is tagged and queued. We reply within 1 business day.`,
      });
      formEl.reset();
      navigate(`/services/${service}/thank-you`, {
        state: { leadId, fromForm: true },
      });
    } catch (err) {
      trackEvent("bid_form_submit_failed", { service });
      toast({
        title: "Something went wrong",
        description: "Please try again or email hello@industryarmymarketing.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        id={`bid-${service}`}
        className="p-8 rounded-lg bg-primary/10 border border-primary text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl mb-2">Bid request received</h3>
        <p className="text-muted-foreground">
          Your inquiry is tagged to <span className="text-primary">{serviceLabel}</span> and
          logged. We reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      id={`bid-${service}`}
      onSubmit={onSubmit}
      noValidate
      className="p-6 md:p-8 rounded-lg bg-card border border-border space-y-5"
      aria-label={`Bid request form for ${serviceLabel}`}
    >
      <div>
        <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-1">
          Bid Request · {serviceLabel}
        </p>
        <h3 className="font-display text-2xl md:text-3xl">
          {heading ?? "Submit your bid request"}
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          {subheading ??
            "Every inquiry is tagged to this service and captured with attribution. No shared leads. No dropped submissions."}
        </p>
      </div>

      <input type="hidden" name="service" value={service} />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`bid-${service}-name`}>Name *</Label>
          <Input
            id={`bid-${service}-name`}
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor={`bid-${service}-email`}>Email *</Label>
          <Input
            id={`bid-${service}-email`}
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`bid-${service}-phone`}>Phone</Label>
          <Input
            id={`bid-${service}-phone`}
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
          />
        </div>
        <div>
          <Label htmlFor={`bid-${service}-company`}>Business name</Label>
          <Input
            id={`bid-${service}-company`}
            name="company"
            maxLength={200}
            autoComplete="organization"
          />
        </div>
        <div>
          <Label htmlFor={`bid-${service}-city`}>City / market</Label>
          <Input id={`bid-${service}-city`} name="city" maxLength={120} />
        </div>
        <div>
          <Label htmlFor={`bid-${service}-trade`}>Trade / industry</Label>
          <Input id={`bid-${service}-trade`} name="trade" maxLength={120} />
        </div>
        <div>
          <Label htmlFor={`bid-${service}-budget`}>Budget</Label>
          <Input
            id={`bid-${service}-budget`}
            name="budget"
            maxLength={60}
            placeholder="$10 / $499 / $1,499 / open"
          />
        </div>
        <div>
          <Label htmlFor={`bid-${service}-timeline`}>Timeline</Label>
          <Input
            id={`bid-${service}-timeline`}
            name="timeline"
            maxLength={60}
            placeholder="ASAP / 30 days / Q1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`bid-${service}-desc`}>Project details</Label>
        <Textarea
          id={`bid-${service}-desc`}
          name="project_description"
          maxLength={4000}
          rows={4}
          placeholder="Tell us what you're bidding on, the target city, and how you want inquiries routed."
        />
      </div>

      <Button type="submit" variant="hero" size="lg" disabled={submitting}>
        <Send className="w-4 h-4 mr-2" />
        {submitting ? "Submitting..." : `Submit ${serviceLabel} Bid Request`}
      </Button>
      <p className="text-xs text-muted-foreground">
        By submitting you agree we may contact you about this bid. We never share
        or resell inquiries.
      </p>
    </form>
  );
};

export default BidRequestForm;