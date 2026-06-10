import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, AuthInput, AuthSubmit, SocialAuth } from "@/components/auth/AuthShell";
import { signInAdmin } from "@/lib/auth-mock";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signInAdmin(email, password);
      navigate({ to: "/admin" });
    }, 400);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your DevPay admin account."
      footer={
        <>
          New to the team?{" "}
          <Link to="/signup" className="font-semibold text-[#14B8A6] hover:underline">
            Create an admin account
          </Link>
        </>
      }
    >
      <SocialAuth mode="signin" />
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">

        <AuthInput
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@devpay.africa"
          autoComplete="email"
          required
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[#8890B5]">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#1E2D5C] bg-[#0A1330]" />
            Remember me
          </label>
          <a href="#" className="text-[#14B8A6] hover:underline">
            Forgot password?
          </a>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <AuthSubmit loading={loading}>Sign in to dashboard</AuthSubmit>
      </form>
    </AuthShell>
  );
}
