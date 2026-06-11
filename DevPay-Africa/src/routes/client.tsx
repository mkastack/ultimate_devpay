import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/hirer-dashboard/Sidebar";
import { MobileBottomNav } from "@/components/hirer-dashboard/MobileBottomNav";
import { SidebarProvider, useSidebar } from "@/components/hirer-dashboard/sidebar-context";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";

export const Route = createFileRoute("/client")({
  head: () => ({ meta: [{ title: "Hirer Dashboard — DevPay Africa" }] }),
  component: ClientLayout,
});

function ClientLayout() {
  return (
    <SidebarProvider>
      <ClientShell />
    </SidebarProvider>
  );
}

function ClientShell() {
  const { ready, session } = useRequireAuth("client");
  const { collapsed } = useSidebar();

  if (!ready || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="transition-[margin] duration-300 ease-out" style={{ marginLeft: 0 }}>
        <div className="mx-auto max-w-[1400px] px-4 py-5 pb-28 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? 76 : 260}px !important; }
        }
      `}</style>
    </div>
  );
}
