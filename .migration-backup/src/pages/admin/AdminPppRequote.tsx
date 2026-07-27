import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PPP_COUNTRIES } from "@/data/pppFactors";

// Internal-only tool. Given a PaymentIntent id, its card_country, its
// amount, and its list amount, call verify-ppp-pricing. If the response
// is arbitrage_detected or amount_below_ppp_floor, offer a one-click
// "re-quote" action that (once Stripe is live) will cancel the PI and
// generate a new checkout at expected_amount_cents. Until Stripe is
// wired, the action just shows the corrected amount and copies the
// Stripe CLI command to run manually.

type VerifyResponse = {
  valid: boolean;
  reason: "ok" | "arbitrage_detected" | "amount_below_ppp_floor";
  card_country: string;
  card_factor: number;
  display_country: string;
  display_factor: number;
  list_amount_cents: number;
  expected_amount_cents: number;
  provided_amount_cents: number;
  product_id: string | null;
};

const AdminPppRequote = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [pi, setPi] = useState("");
  const [cardCountry, setCardCountry] = useState("US");
  const [displayCountry, setDisplayCountry] = useState("US");
  const [amount, setAmount] = useState("1000");
  const [list, setList] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setAuthChecked(true);
      if (!session) navigate("/admin/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
      if (!data.session) navigate("/admin/login", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const verify = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke<VerifyResponse>(
        "verify-ppp-pricing",
        {
          body: {
            card_country: cardCountry,
            amount_cents: Number(amount),
            list_amount_cents: Number(list),
            display_country: displayCountry,
            product_id: pi || undefined,
          },
        },
      );
      if (error) throw error;
      setResult(data as VerifyResponse);
    } catch (e) {
      toast({
        title: "Verify failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requote = () => {
    if (!result) return;
    const cmd = `stripe payment_intents cancel ${pi} && stripe payment_intents create --amount ${result.expected_amount_cents} --currency usd --metadata list_amount_cents=${result.list_amount_cents} --metadata display_country=${result.card_country}`;
    navigator.clipboard.writeText(cmd).catch(() => {});
    toast({
      title: "Re-quote command copied",
      description:
        "Post-launch this will execute automatically. For now, paste into Stripe CLI.",
    });
  };

  if (!authChecked) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }
  if (!authed) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">PPP Re-Quote</h1>
          <p className="text-sm text-muted-foreground">
            Manually verify a PaymentIntent against{" "}
            <code>verify-ppp-pricing</code> and generate a re-quote when
            arbitrage or underpayment is detected.
          </p>
          <p className="text-xs text-amber-500 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Post-launch tool. Stripe webhook not connected yet.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
          <div className="sm:col-span-2">
            <Label htmlFor="pi">PaymentIntent ID (optional)</Label>
            <Input
              id="pi"
              placeholder="pi_3O..."
              value={pi}
              onChange={(e) => setPi(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cc">Card country (ISO-2)</Label>
            <select
              id="cc"
              className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
              value={cardCountry}
              onChange={(e) => setCardCountry(e.target.value)}
            >
              {PPP_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="dc">Display country (ISO-2)</Label>
            <select
              id="dc"
              className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
              value={displayCountry}
              onChange={(e) => setDisplayCountry(e.target.value)}
            >
              {PPP_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amt">Amount (cents)</Label>
            <Input
              id="amt"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lst">List amount (cents)</Label>
            <Input
              id="lst"
              type="number"
              value={list}
              onChange={(e) => setList(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Button onClick={verify} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verify PPP
            </Button>
          </div>
        </section>

        {result && (
          <section
            className={`rounded-lg border p-4 space-y-3 ${
              result.valid ? "border-emerald-500/50" : "border-red-500/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {result.valid ? "Valid" : "Invalid"} · {result.reason}
              </h2>
              {!result.valid && (
                <Button size="sm" variant="destructive" onClick={requote}>
                  Cancel & re-quote at ${(result.expected_amount_cents / 100).toFixed(2)}
                </Button>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Card country</dt>
              <dd>
                {result.card_country} (factor {result.card_factor})
              </dd>
              <dt className="text-muted-foreground">Display country</dt>
              <dd>
                {result.display_country} (factor {result.display_factor})
              </dd>
              <dt className="text-muted-foreground">Provided</dt>
              <dd>${(result.provided_amount_cents / 100).toFixed(2)}</dd>
              <dt className="text-muted-foreground">Expected</dt>
              <dd className="font-semibold">
                ${(result.expected_amount_cents / 100).toFixed(2)}
              </dd>
              <dt className="text-muted-foreground">List</dt>
              <dd>${(result.list_amount_cents / 100).toFixed(2)}</dd>
            </dl>

            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default AdminPppRequote;