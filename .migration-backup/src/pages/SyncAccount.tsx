import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

const SyncAccount = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/scan-wizard", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/scan-wizard", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/scan-wizard` },
        });
        if (error) throw error;
        toast.success("Account created — your trade will now sync.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in — pulling your saved trade.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <Seo
        title="Sync My Trade Across Devices | IAM"
        description="Create a free account or sign in to sync your saved industry and trade selection across every device you use."
        path="/sync-account"
      />
      <PageHeader
        eyebrow="Cross-Device Sync"
        title="Sync My"
        highlight="Trade"
        description="Sign in to carry your saved industry and trade across every device. No spam, ever."
      />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-md">
          <form
            onSubmit={submit}
            className="flex flex-col gap-4 p-8 rounded-lg bg-card border border-border"
          >
            <h2 className="font-display text-3xl text-foreground mb-2">
              {mode === "signup" ? "Create Sync Account" : "Sign In to Sync"}
            </h2>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border"
            />
            <Input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-background border-border"
            />
            <Button type="submit" variant="hero" size="lg" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Working…
                </>
              ) : mode === "signup" ? (
                "Create account & sync"
              ) : (
                "Sign in & sync"
              )}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-sm text-muted-foreground hover:text-primary text-center"
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "First time? Create an account"}
            </button>
            <Link
              to="/scan-wizard"
              className="text-xs text-muted-foreground hover:text-primary text-center mt-2"
            >
              ← Back to scan (skip sync)
            </Link>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default SyncAccount;