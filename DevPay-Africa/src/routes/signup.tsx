import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Code2, Briefcase, Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/integrations/supabase/client";
import { formatAuthError } from "@/integrations/supabase/auth-errors";
import { getHomePathForRole } from "@/lib/role-routes";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — DevPay Africa" }] }),
  component: SignUp,
});

function SignUp() {
  const { signUp, resendConfirmation, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!confirmSent && !loading && session && profile) {
      navigate({ to: getHomePathForRole(profile.role) });
    }
  }, [confirmSent, loading, session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setBusy(true);
    try {
      const { needsConfirmation, email } = await signUp({ ...form, role });
      if (needsConfirmation) {
        setConfirmSent(email);
      } else {
        toast.success("Account created — welcome!");
        navigate({ to: getHomePathForRole(role), replace: true });
      }
    } catch (err) {
      const msg = formatAuthError(err);
      setError(
        msg.includes("already registered")
          ? "This email is already registered. Try logging in instead."
          : msg
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!confirmSent) return;
    setResending(true);
    try {
      await resendConfirmation(confirmSent);
      toast.success("Confirmation email sent again");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend");
    } finally {
      setResending(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    if (role) {
      localStorage.setItem("devpay_oauth_role", role);
    }

    const home = role ? getHomePathForRole(role) : "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${home}` },
    });
    if (error) toast.error(error.message);
  };

  if (confirmSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="container mx-auto px-4 py-6"><Logo /></header>
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold mt-4">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a confirmation link to <span className="text-foreground font-medium">{confirmSent}</span>.
              Click the link to activate your account, then come back and log in.
            </p>
            <div className="mt-6 space-y-2">
              <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend confirmation email"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Back to login</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-success" /> Don't see it? Check spam or promotions.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-6"><Logo /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {!role ? (
            <div>
              <h1 className="font-display text-3xl font-bold text-center">Join DevPay Africa</h1>
              <p className="text-center text-muted-foreground mt-2">Choose how you want to start</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { k: "developer" as const, icon: Code2, t: "I'm a Developer", d: "Earn globally" },
                  { k: "client" as const, icon: Briefcase, t: "I'm a Client", d: "Hire top talent" },
                ].map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setRole(o.k)}
                    className="rounded-xl border border-border bg-card p-6 text-left hover:border-primary hover:-translate-y-1 transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <o.icon className="h-5 w-5" />
                    </div>
                    <div className="font-display font-semibold mt-3">{o.t}</div>
                    <div className="text-xs text-muted-foreground mt-1">{o.d}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-6">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={`rounded-2xl border bg-card p-8 ${
                role === "client" ? "border-accent/40 shadow-[0_0_60px_-20px_oklch(0.78_0.15_75/0.5)]" : "border-primary/40 shadow-[var(--shadow-glow)]"
              }`}
            >
              <button type="button" onClick={() => setRole(null)} className="text-xs text-muted-foreground mb-4 hover:text-foreground">← Back</button>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-3 ${
                role === "client" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
              }`}>
                {role === "client" ? <><Briefcase className="h-3 w-3" /> Hiring talent</> : <><Code2 className="h-3 w-3" /> Earning globally</>}
              </div>
              <h1 className="font-display text-2xl font-bold">
                {role === "client" ? "Create your client account" : "Create your developer account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {role === "client" ? "Post jobs, hire top African talent, pay securely with escrow." : "Free forever. We only take 7% when you get paid."}
              </p>
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
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-4">
                <div><Label>{role === "client" ? "Your name or company" : "Full name"}</Label><Input required className="mt-1.5" placeholder={role === "client" ? "Acme Inc." : "Ada Lovelace"} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div><Label>Email</Label><Input required type="email" className="mt-1.5" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input required type="password" minLength={6} className="mt-1.5" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              </div>
              <Button type="submit" disabled={busy} className={`w-full mt-6 h-11 text-primary-foreground ${
                role === "client" ? "bg-[image:var(--gradient-accent)]" : "bg-[image:var(--gradient-primary)]"
              }`}>
                {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account…</> : role === "client" ? "Start hiring" : "Start earning"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
