import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export const Route = createFileRoute("/debug/impersonate")({
  head: () => ({ meta: [{ title: "Impersonate — DevPay Africa (dev)" }] }),
  component: Impersonate,
});

function makeMockProfile(role: "developer" | "client") {
  return {
    id: `mock_${role}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    full_name: role === "developer" ? "Dev User" : "Client User",
    username: role === "developer" ? "dev_user" : "client_user",
    email: role === "developer" ? "dev@example.com" : "client@example.com",
    avatar_url: null,
    country: null,
    is_verified: true,
  };
}

function Impersonate() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const go = async (role: "developer" | "client") => {
    setBusy(true);
    const p = makeMockProfile(role);
    setUser(p as any);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("devpay_dev_role", role);
      }
      await new Promise((r) => setTimeout(r, 200));
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-2xl border border-border text-center">
        <h2 className="font-display text-2xl mb-4">Impersonate (dev only)</h2>
        <p className="text-sm text-muted-foreground mb-4">Simulate a signed-in session locally.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => go("developer")} disabled={busy} className="btn">Sign in as Developer</button>
          <button onClick={() => go("client")} disabled={busy} className="btn">Sign in as Client</button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <Link to="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
