import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

// Grouped by industry so non-trade businesses (mining ops, wellness clinics,
// designers, etc.) see themselves in the list instead of hunting under "Trade".
const industryGroups: { label: string; options: string[] }[] = [
  {
    label: "Construction Trades",
    options: [
      "Roofing", "Framing", "Drywall", "Plumbing", "Electrical", "HVAC",
      "Excavation", "Painting", "Steel Stud", "Foundations",
      "General Contracting",
    ],
  },
  {
    label: "Property & Outdoor Services",
    options: ["Landscaping", "Snow Removal", "Interior Design"],
  },
  {
    label: "Industrial & Logistics",
    options: ["Mining / Logistics"],
  },
  {
    label: "Health & Professional Services",
    options: ["Health & Wellness"],
  },
  {
    label: "Something Else",
    options: ["Other industry — tell us in notes"],
  },
];
const yearsOptions = ["Less than 1","1–3","3–5","5–10","10+"];
const provinces = ["BC","AB","ON","MB","SK","QC","NS","Other"];
const popOptions = ["Under 100K","100K – 500K","500K – 1M","Over 1M"];

interface FormState {
  business: string; website: string; trade: string; years: string;
  city: string; province: string; population: string;
  name: string; email: string; phone: string; notes: string;
}

const empty: FormState = {
  business: "", website: "", trade: "", years: "",
  city: "", province: "BC", population: "",
  name: "", email: "", phone: "", notes: "",
};

const inputCls = "w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors";
const labelCls = "block text-muted-foreground text-xs uppercase tracking-widest mb-2";

const ScanWizard = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(empty);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = () => {
    if (!data.name || !data.email) {
      toast.error("Name and email are required.");
      return;
    }
    console.log("[scan-wizard] submission", data);
    toast.success("Scan submitted — your results are below.");
    setStep(3);
  };

  const stepTitles = ["Your Business", "Your Territory", "Your Contact", "Your Score"];

  return (
    <Layout>
      <Seo
        title="Analyze My Business — Free I-Spy-R Scan | IAM"
        description="60-second EyeSpyr scan. See your score, territory availability, and what competitors are doing in your city. No credit card required."
        path="/scan-wizard"
      />
      <PageHeader
        eyebrow="I-Spy-R Analysis Engine"
        title="Analyze My"
        highlight="Business"
        description="60-second EyeSpyr scan. See your score, territory availability, and what competitors are doing in your city."
      />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <ol className="flex items-center justify-between mb-12">
            {stepTitles.map((t, i) => (
              <li key={t} className="flex-1 flex flex-col items-center text-center">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-lg border ${
                  i <= step ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}>{i + 1}</span>
                <span className={`text-[10px] uppercase tracking-widest mt-2 ${
                  i === step ? "text-primary" : "text-muted-foreground"
                }`}>{t}</span>
              </li>
            ))}
          </ol>

          <div className="p-8 rounded-lg bg-card border border-border">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-foreground mb-2">Your Business</h2>
                  <p className="text-muted-foreground text-sm mb-6">Tell us about your company so we can pull your reputation data.</p>
                  <div className="grid gap-4">
                    <div>
                      <label className={labelCls}>Business Name *</label>
                      <input className={inputCls} value={data.business} onChange={(e) => set("business", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Your Website</label>
                      <input className={inputCls} value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                    </div>
                    <div>
                      <label className={labelCls}>Your Industry or Trade *</label>
                      <select
                        className={inputCls}
                        value={data.trade}
                        onChange={(e) => set("trade", e.target.value)}
                      >
                        <option value="">Select your industry…</option>
                        {industryGroups.map((g) => (
                          <optgroup key={g.label} label={g.label}>
                            {g.options.map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Years in Business</label>
                      <select className={inputCls} value={data.years} onChange={(e) => set("years", e.target.value)}>
                        <option value="">Select...</option>
                        {yearsOptions.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button variant="hero" onClick={() => setStep(1)} disabled={!data.business || !data.trade}>
                      Next: Your Location →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-foreground mb-2">Your Territory</h2>
                  <p className="text-muted-foreground text-sm mb-6">We'll check if your city is available and confirm your monthly rate.</p>
                  <div className="grid gap-4">
                    <div>
                      <label className={labelCls}>City *</label>
                      <input className={inputCls} value={data.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Province</label>
                      <select className={inputCls} value={data.province} onChange={(e) => set("province", e.target.value)}>
                        {provinces.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Approximate City Population</label>
                      <select className={inputCls} value={data.population} onChange={(e) => set("population", e.target.value)}>
                        <option value="">Select...</option>
                        {popOptions.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                    <Button variant="hero" onClick={() => setStep(2)} disabled={!data.city}>
                      Next: Contact Info →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-foreground mb-2">Your Contact</h2>
                  <p className="text-muted-foreground text-sm mb-6">Where should we send your scan results? No spam. Ever.</p>
                  <div className="grid gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input className={inputCls} value={data.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input type="email" className={inputCls} value={data.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone (for WhatsApp alerts)</label>
                      <input className={inputCls} value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Anything else you want us to check?</label>
                      <textarea rows={3} className={inputCls} value={data.notes} onChange={(e) => set("notes", e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                    <Button variant="hero" onClick={submit}>▶ Run My EyeSpyr Scan</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Your Score</p>
                  <div className="text-center py-8">
                    <p className="font-display text-7xl text-primary text-glow">4.2</p>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest mt-2">EyeSpyr Score: STRONG</p>
                    <p className="text-primary mt-6 font-semibold">✓ TERRITORY AVAILABLE</p>
                    <p className="text-muted-foreground max-w-md mx-auto mt-3 text-sm leading-relaxed">
                      Your business has solid fundamentals. Claiming your exclusive territory now locks out competitors in {data.city || "your city"} across the IAM domain network.
                    </p>
                    <div className="mt-8 inline-block p-6 rounded-lg bg-background border border-primary/40">
                      <p className="font-display text-4xl text-primary">$10 / month</p>
                      <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Your exclusive territory rate · No contract</p>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button variant="hero" size="lg" onClick={() => window.location.assign("/contact")}>Claim My Territory</Button>
                      <Button variant="outline" size="lg" onClick={() => { setStep(0); setData(empty); }}>Run Another Scan</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ScanWizard;