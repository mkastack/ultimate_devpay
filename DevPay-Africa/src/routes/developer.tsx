import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2, LayoutDashboard, FileText, Briefcase, CreditCard, User, Settings } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";

export const developerNav = [
  { to: "/developer", label: "Overview", icon: LayoutDashboard },
  { to: "/developer/proposals", label: "My Proposals", icon: FileText },
  { to: "/developer/active-jobs", label: "Active Jobs", icon: Briefcase },
  { to: "/wallet", label: "Wallet", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/profile", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/developer")({
  head: () => ({ meta: [{ title: "Developer Dashboard — DevPay Africa" }] }),
  component: DeveloperLayout,
});

function DeveloperLayout() {
  const { session, profile } = useRequireAuth("developer");
  
  // Redirect if not authenticated or role mismatch
  if (!session) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  
  if (profile && profile.role !== "developer") {
    // Wrong role — redirect to client
    window.location.href = "/client";
    return null;
  }
  
  return (
    <DashboardShell nav={developerNav} title="Developer Workspace">
      <Outlet />
    </DashboardShell>
  );
}
