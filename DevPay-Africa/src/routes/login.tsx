import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatAuthError } from "@/integrations/supabase/auth-errors";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { SentryErrorTest } from "@/components/SentryErrorTest";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — DevPay Africa" }] }),
  component: Login,
});

function Login() {
  const { signIn, session, profile, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => {
    if (session && profile) navigate({ to: "/dashboard" });
  }, [session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsConfirm(false);
    setBusy(true);
    try {
      await signIn(form.email, form.password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = formatAuthError(err);
      if (/confirm/i.test(msg) || /not confirmed/i.test(msg)) {
        setNeedsConfirm(true);
        setError("Please confirm your email before logging in.");
      } else if (/invalid login/i.test(msg)) {
        setError("Wrong email or password.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendConfirmation(form.email);
      toast.success("Confirmation email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend");
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-6"><Logo /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your DevPay account</p>
          <div className="grid grid-cols-2 gap-2 mt-6">
            <Button type="button" variant="outline" className="h-10" onClick={() => handleOAuth("google")}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
              Google
            </Button>
            <Button type="button" variant="outline" className="h-10" onClick={() => handleOAuth("github")}>
              <Github className="h-4 w-4 mr-2" />GitHub
            </Button>
          </div>
          <div className="relative my-5 text-center text-xs text-muted-foreground">
            <span className="bg-card px-3 relative z-10">or with email</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
                {needsConfirm && (
                  <button type="button" onClick={handleResend} className="underline mt-1 hover:no-underline">
                    Resend confirmation email
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div><Label>Email</Label><Input required type="email" className="mt-1.5" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input required type="password" className="mt-1.5" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={busy} className="w-full mt-6 bg-[image:var(--gradient-primary)] text-primary-foreground h-11">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in…</> : "Log in"}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
          <div className="mt-6 pt-4 border-t border-border flex justify-center">
            <SentryErrorTest />
          </div>
        </form>
      </main>
    </div>
  );
}
