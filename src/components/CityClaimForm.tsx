import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const TRADES = [
  "Roofing", "Plumbing", "Electrical", "HVAC", "Gas Fitting", "Drywall",
  "Painting", "Framing", "Excavation", "Foundations", "Concrete", "Steel Stud",
  "Demolition", "Remodeling", "Finish Carpentry", "General Contracting",
  "Landscaping", "Snow Removal", "Cleaning", "Moving", "Other",
];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-.\s]*$/, "Phone can only contain digits and + - ( ) .")
    .optional()
    .or(z.literal("")),
  trade: z.string().min(1, "Pick your trade"),
  city: z.string().min(1).max(80),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

interface Props {
  cityName: string;
  cityRate: string;
  takenTrades?: string[];
}

const CityClaimForm = ({ cityName, cityRate, takenTrades = [] }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    trade: "",
    city: cityName,
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormState;
        fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    // Open mailto with prefilled payload
    const subject = `Claim Request — ${parsed.data.trade} in ${parsed.data.city}`;
    const body = [
      `Trade: ${parsed.data.trade}`,
      `City: ${parsed.data.city} (${cityRate})`,
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Phone: ${parsed.data.phone || "—"}`,
      "",
      parsed.data.message || "",
    ].join("\n");
    const mailto = `mailto:colin@industryarmymarketing.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    toast({
      title: "Request prepared",
      description: `Your email client opened with your ${parsed.data.trade} claim for ${parsed.data.city}. Hit send and Colin will confirm within 24 hours.`,
    });
    setSubmitting(false);
  };

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            Fast Claim · {cityName}
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Lock Your Trade In <span className="text-primary text-glow">{cityName}</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Pre-filled for {cityName}. Pick your trade and we'll confirm availability within 24 hours.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg bg-card border border-border p-6 md:p-8 space-y-5"
          noValidate
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-xs uppercase tracking-widest text-muted-foreground">City</Label>
              <div className="relative mt-2">
                <Input
                  id="city"
                  value={form.city}
                  readOnly
                  className="bg-secondary/40 border-border pr-9 text-foreground"
                  aria-label="City (prefilled)"
                />
                <Lock className="w-4 h-4 text-primary absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{cityRate} · prefilled from this page</p>
            </div>

            <div>
              <Label htmlFor="trade" className="text-xs uppercase tracking-widest text-muted-foreground">Trade</Label>
              <Select value={form.trade} onValueChange={(v) => update("trade", v)}>
                <SelectTrigger id="trade" className="mt-2 bg-card border-border">
                  <SelectValue placeholder="Pick your trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => {
                    const taken = takenTrades.includes(t);
                    return (
                      <SelectItem key={t} value={t} disabled={taken}>
                        {t}{taken ? " — taken" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.trade && <p className="text-destructive text-xs mt-1">{errors.trade}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Your Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={100}
                required
                className="mt-2 bg-card border-border focus:border-primary"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone <span className="opacity-60">(optional)</span></Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                inputMode="tel"
                maxLength={30}
                className="mt-2 bg-card border-border focus:border-primary"
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              maxLength={255}
              required
              className="mt-2 bg-card border-border focus:border-primary"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Anything we should know? <span className="opacity-60">(optional)</span></Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder={`e.g. "I want exclusive ${cityName} territory across two trades."`}
              className="mt-2 bg-card border-border focus:border-primary resize-none"
            />
            {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              We reply within 24 hours. No spam — your info goes straight to Colin.
            </p>
            <Button type="submit" variant="hero" size="lg" disabled={submitting}>
              {submitting ? "Preparing…" : `Claim My ${cityName} Trade`}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default CityClaimForm;