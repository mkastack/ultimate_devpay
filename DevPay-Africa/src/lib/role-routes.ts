import type { UserRole } from "@/integrations/supabase/client";

export function getHomePathForRole(role: UserRole | null | undefined) {
  if (role === "developer") return "/developer" as const;
  if (role === "client") return "/client" as const;
  return "/dashboard" as const;
}
