import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, AuthInput, AuthSubmit, SocialAuth } from "@/components/auth/AuthShell";
import { signUpAdmin } from "@/lib/auth-mock";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signUpAdmin(name, email, password);
      navigate({ to: "/admin" });
    }, 400);
  }

  return (
    <AuthShell
      title="Create admin account"
      subtitle="Provision a new operator for the DevPay control center."
      footer={
        <>
          Already have access?{" "}
          <Link to="/login" className="font-semibold text-[#14B8A6] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SocialAuth mode="signup" />
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">

        <AuthInput
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Ada Lovelace"
          autoComplete="name"
          required
        />
        <AuthInput
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@devpay.africa"
          autoComplete="email"
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 chars"
            autoComplete="new-password"
            required
          />
          <AuthInput
            label="Confirm"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-[#8890B5]">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-3.5 w-3.5 rounded border-[#1E2D5C] bg-[#0A1330]"
          />
          <span>
            I agree to the DevPay{" "}
            <a href="#" className="text-[#14B8A6] hover:underline">
              Admin Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#14B8A6] hover:underline">
              Security Policy
            </a>
            .
          </span>
        </label>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <AuthSubmit loading={loading}>Create account</AuthSubmit>
      </form>
    </AuthShell>
  );
}
