import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/integrations/supabase/auth-context";
import type { UserRole } from "@/integrations/supabase/client";
import { getHomePathForRole } from "@/lib/role-routes";

/** Redirects to /login when unauthenticated, or to the right dashboard when role mismatches. */
export function useRequireAuth(requiredRole?: UserRole) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (requiredRole && profile && profile.role !== requiredRole) {
      navigate({ to: getHomePathForRole(profile.role) });
    }
  }, [session, profile, loading, requiredRole, navigate]);

  return { session, profile, loading, ready: !loading && !!session };
}
