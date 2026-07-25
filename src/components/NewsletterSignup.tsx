import { useState } from "react";
import { z } from "zod";
import { Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z
  .string()
  .trim()
  .min(5, "Enter a valid email")
  .max(255, "Email is too long")
  .email("Enter a valid email");

interface Props {
  source?: string;
  variant?: "sidebar" | "footer";
  heading?: string;
  description?: string;
}

export default function NewsletterSignup({
  source,
  variant = "footer",
  heading = "Get the next dispatch",
  description = "Tactical SEO intel, brand-defense case studies, and category-domain playbooks. No spam.",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setState("error");
      setMessage(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setState("submitting");
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.toLowerCase(), source: source ?? null });
    if (error && !/(duplicate|unique)/i.test(error.message)) {
      setState("error");
      setMessage("Could not subscribe right now. Try again shortly.");
      return;
    }
    setState("success");
    setMessage("You're on the list.");
    setEmail("");
  };

  const isSidebar = variant === "sidebar";

  return (
    <aside
      aria-labelledby={`newsletter-${variant}-heading`}
      className={`rounded-lg border border-border bg-card ${
        isSidebar ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="text-primary text-xs uppercase tracking-[0.3em]">Newsletter</p>
      </div>
      <h3
        id={`newsletter-${variant}-heading`}
        className={`font-display text-foreground ${isSidebar ? "text-xl" : "text-2xl"} mb-2`}
      >
        {heading}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`newsletter-${variant}-email`} className="sr-only">
          Email address
        </label>
        <Input
          id={`newsletter-${variant}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={255}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={message ? `newsletter-${variant}-msg` : undefined}
          disabled={state === "submitting" || state === "success"}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={state === "submitting" || state === "success"}
          className="shrink-0"
        >
          {state === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : state === "success" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : null}
          {state === "success" ? "Subscribed" : "Subscribe"}
        </Button>
      </form>
      {message && (
        <p
          id={`newsletter-${variant}-msg`}
          role={state === "error" ? "alert" : "status"}
          className={`mt-3 text-sm ${
            state === "error" ? "text-destructive" : "text-primary"
          }`}
        >
          {message}
        </p>
      )}
    </aside>
  );
}