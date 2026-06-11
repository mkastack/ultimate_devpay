import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dev-dashboard/Sidebar";
import { MobileBottomNav } from "@/components/dev-dashboard/MobileBottomNav";
import { SidebarUIProvider, useSidebarUI } from "@/components/dev-dashboard/sidebar-context";
import { ThemeProvider } from "@/lib/theme-context";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";

export const Route = createFileRoute("/developer")({
  head: () => ({ meta: [{ title: "Developer Dashboard — DevPay Africa" }] }),
  component: DeveloperLayout,
});

function DeveloperLayout() {
  return (
    <ThemeProvider>
      <SidebarUIProvider>
        <DeveloperShell />
      </SidebarUIProvider>
    </ThemeProvider>
  );
}

function DeveloperShell() {
  const { ready, session } = useRequireAuth("developer");
  const { collapsed } = useSidebarUI();

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
      <main
        className="transition-[margin] duration-200 ease-out"
        style={{ marginLeft: 0 }}
      >
        <div className="mx-auto max-w-[1400px] px-4 pt-4 pb-24 sm:px-6 sm:pt-5 md:px-8 md:pt-6 md:pb-8">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? 76 : 240}px !important; }
        }
      `}</style>
    </div>
  );
}
