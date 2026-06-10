import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Redirecting — DevPay Africa" }] }),
  component: DashboardDispatcher,
});


function DashboardDispatcher() {
  const { profile, session, loading } = useAuth();
  const navigate = useNavigate();

  // dev override: allow forcing a role via query `?dev_role=developer` or localStorage `devpay_dev_role`
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const devRole = url?.searchParams.get("dev_role") ?? (typeof window !== "undefined" ? localStorage.getItem("devpay_dev_role") : null);

  // Helpful debug logs for diagnosing spinner state
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("DashboardDispatcher state:", { loading, session, profile, devRole });
  }, [loading, session, profile, devRole]);

  useEffect(() => {
    if (loading) return;
    // If a dev override is present, use it immediately (dev helper)
    if (devRole) {
      if (devRole === "developer") navigate({ to: "/developer" });
      else navigate({ to: "/client" });
      return;
    }
    if (!session) return;
    if (profile) {
      if (profile.role === "developer") {
        navigate({ to: "/developer" });
      } else {
        navigate({ to: "/client" });
      }
    }
  }, [profile, session, loading, navigate, devRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse">Entering your workspace…</p>
      </div>
    </div>
  );
}
