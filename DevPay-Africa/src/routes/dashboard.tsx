import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getHomePathForRole } from "@/lib/role-routes";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Redirecting — DevPay Africa" }] }),
  component: DashboardDispatcher,
});

function DashboardDispatcher() {
  const { profile, session, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const retried = useRef(false);

  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const devRole = url?.searchParams.get("dev_role") ?? (typeof window !== "undefined" ? localStorage.getItem("devpay_dev_role") : null);

  useEffect(() => {
    if (loading) return;

    if (devRole) {
      navigate({ to: devRole === "developer" ? "/developer" : "/client" });
      return;
    }

    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    if (profile) {
      navigate({ to: getHomePathForRole(profile.role) });
      return;
    }

    if (!retried.current) {
      retried.current = true;
      void refreshProfile();
      return;
    }

    toast.error("Could not load your profile. Try signing out and back in.");
    navigate({ to: "/login" });
  }, [profile, session, loading, navigate, devRole, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse">Entering your workspace…</p>
      </div>
    </div>
  );
}
