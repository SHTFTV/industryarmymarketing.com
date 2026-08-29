import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Mail, label: "Email", value: "colin@industryarmymarketing.com" },
  { icon: MapPin, label: "Address", value: "3645 Kingsway, Vancouver, BC V5R 5M1, Canada" },
];

const trades = [
  "Roofing","Framing","Drywall","Plumbing","Electrical","HVAC","Excavation",
  "Painting","Steel Stud","Foundations","Landscaping","Snow Removal",
  "Interior Design","General Contracting","Mining / Logistics","Health & Wellness","Other",
];

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(40, "Phone is too long")
    .regex(/^[+()\-\s\d]*$/, "Phone has invalid characters")
    .optional()
    .or(z.literal("")),
  trade: z.string().trim().min(1, "Pick your trade").max(60),
  city: z.string().trim().min(2, "City is required").max(80),
  message: z.string().trim().min(10, "Tell us a bit more (min 10 characters)").max(2000),
  // Honeypot — must be empty
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type LeadPayload = Omit<z.infer<typeof leadSchema>, "website"> & {
  source: string;
  submittedAt: string;
};

const fieldCls = "bg-card border-border focus:border-primary";
const errCls = "text-destructive text-xs mt-1";

interface ContactSectionProps {
  source?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  submitLabel?: string;
  successDescription?: string;
}

const ContactSection = ({
  source = "contact-page",
  eyebrow = "Get In Touch",
  title = "Contact Us",
  intro = "Have a question about our services? Ready to claim your territory? Fill out the form and our SEO experts will contact you soon.",
  submitLabel = "Send Message",
  successDescription = "We'll confirm availability in your city within 24 hours.",
}: ContactSectionProps) => {
  const [params] = useSearchParams();
  const tierParam = (params.get("tier") || "").toLowerCase();
  const tier: "directory" | "exclusive" | null =
    tierParam === "directory" || tierParam === "exclusive" ? tierParam : null;
  const prefillMessage = tier === "directory"
    ? "I'm interested in the $10/year Directory Listing. My trade and city are above — please confirm availability."
    : tier === "exclusive"
      ? "I'm interested in Exclusive Market Ownership. Please confirm my market rate and slot availability."
      : "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    trade: "",
    city: "",
    message: prefillMessage,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast({
        title: "Please fix the highlighted fields",
        description: "A few fields need your attention before we can send.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { website: _hp, ...clean } = parsed.data;
      const leadSource = tier ? `pricing-${tier}` : source;
      const { error } = await supabase.from("leads").insert({
        name: clean.name,
        email: clean.email,
        phone: clean.phone || null,
        trade: clean.trade,
        city: clean.city,
        message: clean.message,
        source: leadSource,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error) throw error;

      toast({
        title: "Message received",
        description: successDescription,
      });
      setForm({ name: "", email: "", phone: "", trade: "", city: "", message: "", website: "" });
      setErrors({});
    } catch (err) {
      console.error("[lead] submit failed", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or email colin@industryarmymarketing.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">{eyebrow}</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">{title}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <p className="text-muted-foreground leading-relaxed">{intro}</p>
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Full name *"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  className={fieldCls}
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  className={fieldCls}
                />
                {errors.email && <p className={errCls}>{errors.email}</p>}
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  className={fieldCls}
                />
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>
              <div>
                <Input
                  placeholder="City *"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  aria-invalid={!!errors.city}
                  className={fieldCls}
                />
                {errors.city && <p className={errCls}>{errors.city}</p>}
              </div>
            </div>
            <div>
              <select
                value={form.trade}
                onChange={(e) => set("trade", e.target.value)}
                aria-invalid={!!errors.trade}
                className="w-full h-10 rounded-md bg-card border border-border focus:border-primary focus:outline-none px-3 text-sm text-foreground"
              >
                <option value="">Select your trade *</option>
                {trades.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.trade && <p className={errCls}>{errors.trade}</p>}
            </div>
            <div>
              <Textarea
                placeholder="Tell us about your business and what you're looking for... *"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                aria-invalid={!!errors.message}
                rows={6}
                className={`${fieldCls} resize-none`}
              />
              {errors.message && <p className={errCls}>{errors.message}</p>}
            </div>
            {/* Honeypot — hidden from users, bots will fill it */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <Button variant="hero" size="lg" type="submit" disabled={submitting} className="self-end">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : submitLabel}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
