import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { lookupTierByPopulation, parsePopulation, formatSlotStatus } from "@/lib/pricing";

// Two-level taxonomy: pick a broad industry first, then narrow to a specific
// trade/service. The second level is optional so anyone can submit without
// hunting for the exact match.
const industries: { label: string; specialties: string[] }[] = [
  {
    label: "Construction Trades",
    specialties: [
      "Roofing", "Framing", "Drywall", "Plumbing", "Electrical", "HVAC",
      "Excavation", "Painting", "Steel Stud", "Foundations",
      "General Contracting", "Concrete", "Flooring", "Windows & Doors",
    ],
  },
  {
    label: "Property & Outdoor Services",
    specialties: [
      "Landscaping", "Snow Removal", "Interior Design", "Pool & Spa",
      "Fencing & Decks", "Cleaning Services",
    ],
  },
  {
    label: "Industrial & Logistics",
    specialties: [
      "Mining", "Trucking & Logistics", "Heavy Equipment", "Oil & Gas Services",
    ],
  },
  {
    label: "Health & Professional Services",
    specialties: [
      "Health & Wellness", "Dental", "Chiropractic", "Legal", "Accounting",
      "Real Estate",
    ],
  },
  {
    label: "Something Else",
    specialties: [],
  },
];

// Extra keywords per specialty so we can match free-text fields (business
// name, website, notes) against a specific trade. Keep keys aligned with
// the specialty labels above.
const specialtyKeywords: Record<string, string[]> = {
  Roofing: ["roof", "roofer", "shingle"],
  Framing: ["framing", "framer"],
  Drywall: ["drywall", "gyproc", "gypsum"],
  Plumbing: ["plumb", "plumber"],
  Electrical: ["electric", "electrician", "wiring"],
  HVAC: ["hvac", "heating", "cooling", "furnace", "air conditioning", "a/c"],
  Excavation: ["excavation", "excavator", "digging"],
  Painting: ["paint", "painter"],
  "Steel Stud": ["steel stud", "metal stud"],
  Foundations: ["foundation", "footing"],
  "General Contracting": ["general contractor", "gc ", "renovation", "remodel"],
  Concrete: ["concrete", "cement"],
  Flooring: ["flooring", "hardwood", "tile", "laminate"],
  "Windows & Doors": ["window", "door"],
  Landscaping: ["landscap", "lawn", "garden"],
  "Snow Removal": ["snow"],
  "Interior Design": ["interior design", "decorator"],
  "Pool & Spa": ["pool", "spa", "hot tub"],
  "Fencing & Decks": ["fence", "fencing", "deck"],
  "Cleaning Services": ["cleaning", "janitor", "maid"],
  Mining: ["mining", "mine "],
  "Trucking & Logistics": ["trucking", "logistics", "freight", "haul"],
  "Heavy Equipment": ["heavy equipment", "machinery"],
  "Oil & Gas Services": ["oil", "gas", "wellsite", "pipeline"],
  "Health & Wellness": ["wellness", "massage", "yoga", "fitness", "gym"],
  Dental: ["dental", "dentist", "ortho"],
  Chiropractic: ["chiro"],
  Legal: ["law ", "lawyer", "legal", "attorney"],
  Accounting: ["accounting", "accountant", "bookkeep", "tax"],
  "Real Estate": ["real estate", "realtor", "realty"],
};

type SpecialtySuggestion = {
  specialty: string;
  confidence: number; // 0–100
  reasons: string[];
};

// Score every specialty in the chosen industry against the user's free-text
// fields. Stronger signals (exact label, hits in the business name/website)
// boost the confidence; multiple distinct keyword hits stack.
const scoreSpecialty = (
  industryLabel: string,
  fields: { business: string; website: string; notes: string },
): SpecialtySuggestion | null => {
  const industry = industries.find((i) => i.label === industryLabel);
  if (!industry || industry.specialties.length === 0) return null;

  const sources: { name: string; text: string; weight: number }[] = [
    { name: "business name", text: fields.business.toLowerCase(), weight: 3 },
    { name: "website", text: fields.website.toLowerCase(), weight: 2 },
    { name: "notes", text: fields.notes.toLowerCase(), weight: 1 },
  ].filter((s) => s.text.trim().length > 0);
  if (sources.length === 0) return null;

  let best: SpecialtySuggestion | null = null;
  for (const s of industry.specialties) {
    const label = s.toLowerCase();
    const keys = specialtyKeywords[s] ?? [];
    let score = 0;
    const reasons: string[] = [];
    for (const src of sources) {
      if (src.text.includes(label)) {
        score += 4 * src.weight;
        reasons.push(`matches "${s}" in ${src.name}`);
        continue;
      }
      const hit = keys.find((k) => k && src.text.includes(k));
      if (hit) {
        score += 2 * src.weight;
        reasons.push(`"${hit.trim()}" in ${src.name}`);
      }
    }
    if (score === 0) continue;
    // Normalize: 12 ≈ exact label in business name → 100%.
    const confidence = Math.min(100, Math.round((score / 12) * 100));
    if (!best || confidence > best.confidence) {
      best = { specialty: s, confidence, reasons };
    }
  }
  return best;
};
const yearsOptions = ["Less than 1","1–3","3–5","5–10","10+"];
const provinces = ["BC","AB","ON","MB","SK","QC","NS","Other"];
// Mid-bracket population samples — each falls inside a hardcoded matrix row.
const popOptions: { label: string; value: number }[] = [
  { label: "Under 100K", value: 50_000 },
  { label: "100K – 250K", value: 200_000 },
  { label: "250K – 500K", value: 400_000 },
  { label: "500K – 1M", value: 750_000 },
  { label: "1M – 2M", value: 1_500_000 },
  { label: "2M – 5M", value: 3_500_000 },
  { label: "Over 5M", value: 8_000_000 },
];

interface FormState {
  business: string; website: string; industry: string; trade: string; years: string;
  city: string; province: string; population: string;
  name: string; email: string; phone: string; notes: string;
}

const empty: FormState = {
  business: "", website: "", industry: "", trade: "", years: "",
  city: "", province: "BC", population: "",
  name: "", email: "", phone: "", notes: "",
};

// Persist the user's accepted/overridden industry + trade so the next scan
// starts pre-filled. Kept intentionally minimal — no PII.
const TRADE_PREF_KEY = "iam.scanWizard.tradePref.v1";
type TradePref = { industry: string; trade: string };

const loadTradePref = (): TradePref | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRADE_PREF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TradePref>;
    if (typeof parsed.industry !== "string") return null;
    return { industry: parsed.industry, trade: parsed.trade ?? "" };
  } catch {
    return null;
  }
};

const saveTradePref = (pref: TradePref) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRADE_PREF_KEY, JSON.stringify(pref));
  } catch {
    /* storage disabled — silently ignore */
  }
};

const clearTradePref = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRADE_PREF_KEY);
  } catch {
    /* noop */
  }
};

const inputCls = "w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors";
const labelCls = "block text-muted-foreground text-xs uppercase tracking-widest mb-2";

const ScanWizard = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(empty);
  const [suggestion, setSuggestion] = useState<SpecialtySuggestion | null>(null);
  const [tradeLocked, setTradeLocked] = useState(false); // user accepted or chose manually
  const [preloadedFromPref, setPreloadedFromPref] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncedFromCloud, setSyncedFromCloud] = useState(false);

  // Watch auth state so we can show sync status and load cloud preferences.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // When the user signs in, pull their saved trade from the cloud. If they have
  // a local pref but no cloud row yet, push the local pref up so it survives.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: row, error } = await supabase
        .from("user_trade_preferences")
        .select("industry, trade")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || error) return;
      if (row && (row.industry || row.trade)) {
        setData((d) => ({ ...d, industry: row.industry, trade: row.trade }));
        setTradeLocked(true);
        setPreloadedFromPref(true);
        setSyncedFromCloud(true);
        saveTradePref({ industry: row.industry, trade: row.trade });
      } else {
        // No cloud row yet — seed it from whatever's local so future devices pick it up.
        const local = loadTradePref();
        if (local && (local.industry || local.trade)) {
          await supabase.from("user_trade_preferences").upsert({
            user_id: user.id,
            industry: local.industry,
            trade: local.trade,
          });
          setSyncedFromCloud(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Single source of truth for persisting the trade pref. Always writes local;
  // additionally pushes to the cloud when the user is signed in.
  const persistPref = (pref: TradePref) => {
    saveTradePref(pref);
    if (user) {
      void supabase
        .from("user_trade_preferences")
        .upsert({ user_id: user.id, industry: pref.industry, trade: pref.trade });
    }
  };

  // Preload last saved industry/trade on first mount.
  useEffect(() => {
    const pref = loadTradePref();
    if (!pref) return;
    setData((d) => ({ ...d, industry: pref.industry, trade: pref.trade }));
    setTradeLocked(true); // treat preloaded as user's confirmed choice
    setPreloadedFromPref(true);
  }, []);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  // Re-score against the latest fields. Updates the suggestion meter and,
  // when the user hasn't locked their choice yet, pre-fills the trade.
  const refreshSuggestion = (next: FormState) => {
    const s = scoreSpecialty(next.industry, {
      business: next.business,
      website: next.website,
      notes: next.notes,
    });
    setSuggestion(s);
    if (s && !tradeLocked) {
      setData((d) => ({ ...d, trade: s.specialty }));
    }
    return s;
  };

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

          <div className="mb-4 p-3 rounded-md border border-border bg-card/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            {user ? (
              <>
                <span className="text-muted-foreground">
                  <span className="text-primary">●</span> Syncing trade as{" "}
                  <span className="text-foreground font-semibold">{user.email}</span>
                  {syncedFromCloud && (
                    <span className="ml-2 text-muted-foreground/70">· loaded from cloud</span>
                  )}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary underline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSyncedFromCloud(false);
                    toast.success("Signed out. Local trade still saved on this device.");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">
                  Want your trade saved on every device?
                </span>
                <Link
                  to="/sync-account"
                  className="text-primary hover:underline font-semibold uppercase tracking-widest"
                >
                  Sign in to sync →
                </Link>
              </>
            )}
          </div>
          <div className="p-8 rounded-lg bg-card border border-border">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-foreground mb-2">Your Business</h2>
                  <p className="text-muted-foreground text-sm mb-6">Tell us about your company so we can pull your reputation data.</p>
                  <div className="grid gap-4">
                    <div>
                      <label className={labelCls}>Business Name *</label>
                      <input
                        className={inputCls}
                        value={data.business}
                        onChange={(e) => {
                          const next = { ...data, business: e.target.value };
                          setData(next);
                          refreshSuggestion(next);
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Your Website</label>
                      <input
                        className={inputCls}
                        value={data.website}
                        onChange={(e) => {
                          const next = { ...data, website: e.target.value };
                          setData(next);
                          refreshSuggestion(next);
                        }}
                        placeholder="https://"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Your Industry *</label>
                      <select
                        className={inputCls}
                        value={data.industry}
                        onChange={(e) => {
                          const next = { ...data, industry: e.target.value, trade: "" };
                          setTradeLocked(false);
                          setData(next);
                          refreshSuggestion(next);
                          if (e.target.value) {
                            persistPref({ industry: e.target.value, trade: "" });
                          } else {
                            clearTradePref();
                          }
                          setPreloadedFromPref(false);
                        }}
                      >
                        <option value="">Select your industry…</option>
                        {industries.map((g) => (
                          <option key={g.label} value={g.label}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Specific Trade or Service <span className="normal-case tracking-normal text-[10px] text-muted-foreground/70">(optional)</span>
                      </label>
                      {(() => {
                        const selected = industries.find((i) => i.label === data.industry);
                        const specialties = selected?.specialties ?? [];
                        if (!data.industry) {
                          return (
                            <input
                              className={`${inputCls} opacity-60`}
                              placeholder="Pick an industry first…"
                              disabled
                            />
                          );
                        }
                        if (specialties.length === 0) {
                          return (
                            <input
                              className={inputCls}
                              value={data.trade}
                              onChange={(e) => set("trade", e.target.value)}
                              placeholder="Describe your trade or service"
                            />
                          );
                        }
                        const isAutoPick =
                          !!suggestion &&
                          !tradeLocked &&
                          data.trade === suggestion.specialty;
                        return (
                          <>
                            <select
                              className={inputCls}
                              value={data.trade}
                              onChange={(e) => {
                                setTradeLocked(true);
                                set("trade", e.target.value);
                                persistPref({ industry: data.industry, trade: e.target.value });
                                setPreloadedFromPref(false);
                              }}
                            >
                              <option value="">Any / not listed</option>
                              {specialties.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                              <option value="Other">Other — tell us in notes</option>
                            </select>
                            {suggestion && (
                              <div className="mt-3 p-3 rounded-md border border-primary/30 bg-primary/5">
                                <div className="flex items-center justify-between gap-3 text-xs">
                                  <span className="text-muted-foreground uppercase tracking-widest">
                                    {isAutoPick ? "Auto-picked" : "Suggested"}: <span className="text-foreground font-semibold normal-case tracking-normal">{suggestion.specialty}</span>
                                  </span>
                                  <span className="font-display text-primary">{suggestion.confidence}%</span>
                                </div>
                                <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${suggestion.confidence}%` }}
                                  />
                                </div>
                                {suggestion.reasons.length > 0 && (
                                  <p className="mt-2 text-[11px] text-muted-foreground">
                                    Based on: {suggestion.reasons.join("; ")}
                                  </p>
                                )}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {isAutoPick ? (
                                    <Button
                                      type="button"
                                      variant="hero"
                                      size="sm"
                                      onClick={() => {
                                        setTradeLocked(true);
                                        toast.success(`Locked in ${suggestion.specialty}.`);
                                        persistPref({ industry: data.industry, trade: suggestion.specialty });
                                        setPreloadedFromPref(false);
                                      }}
                                    >
                                      ✓ Accept {suggestion.specialty}
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setTradeLocked(false);
                                        set("trade", suggestion.specialty);
                                        persistPref({ industry: data.industry, trade: suggestion.specialty });
                                        setPreloadedFromPref(false);
                                      }}
                                    >
                                      Use suggestion
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setTradeLocked(true);
                                      set("trade", "");
                                      persistPref({ industry: data.industry, trade: "" });
                                      setPreloadedFromPref(false);
                                    }}
                                  >
                                    Override / pick myself
                                  </Button>
                                </div>
                              </div>
                            )}
                            {preloadedFromPref && (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                Preloaded from your last scan.{" "}
                                <button
                                  type="button"
                                  className="underline hover:text-primary"
                                  onClick={() => {
                                    clearTradePref();
                                    setPreloadedFromPref(false);
                                    setTradeLocked(false);
                                    setData((d) => ({ ...d, industry: "", trade: "" }));
                                    setSuggestion(null);
                                  }}
                                >
                                  Clear
                                </button>
                              </p>
                            )}
                          </>
                        );
                      })()}
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
                    <Button variant="hero" onClick={() => setStep(1)} disabled={!data.business || !data.industry}>
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
                        {popOptions.map((p) => <option key={p.label} value={String(p.value)}>{p.label}</option>)}
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
                  {(() => null)()}
                  <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Your Score</p>
                  <div className="text-center py-8">
                    <p className="font-display text-7xl text-primary text-glow">4.2</p>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest mt-2">EyeSpyr Score: STRONG</p>
                    <p className="text-primary mt-6 font-semibold">✓ TERRITORY AVAILABLE</p>
                    <p className="text-muted-foreground max-w-md mx-auto mt-3 text-sm leading-relaxed">
                      Your business has solid fundamentals. Claiming your exclusive territory now locks out competitors in {data.city || "your city"} across the IAM domain network.
                    </p>
                    {(() => {
                      const tier = lookupTierByPopulation(parsePopulation(data.population));
                      if (!tier) {
                        return (
                          <div className="mt-8 inline-block p-6 rounded-lg bg-background border border-primary/40">
                            <p className="font-display text-3xl text-primary">Select a population to see your rate</p>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-8 inline-block p-6 rounded-lg bg-background border border-primary/40 text-left">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">{tier.row.populationLabel}</p>
                          <p className="font-display text-5xl text-primary text-glow mt-1">${tier.row.pricePerSlot} <span className="text-base text-muted-foreground">/ slot / month</span></p>
                          <p className="text-sm text-foreground mt-2">{formatSlotStatus(tier.row, 0)} · {tier.row.status}</p>
                          <p className="text-xs text-muted-foreground mt-1">Hardcoded rate — slot 1 = slot {tier.row.slots}. SOLD OUT only when all {tier.row.slots} are filled.</p>
                        </div>
                      );
                    })()}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button variant="hero" size="lg" onClick={() => window.location.assign("/contact")}>Claim My Territory</Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          const pref = loadTradePref();
                          setStep(0);
                          setData({
                            ...empty,
                            industry: pref?.industry ?? "",
                            trade: pref?.trade ?? "",
                          });
                          setTradeLocked(!!pref);
                          setPreloadedFromPref(!!pref);
                          setSuggestion(null);
                        }}
                      >
                        Run Another Scan
                      </Button>
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