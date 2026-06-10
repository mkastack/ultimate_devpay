import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { SidebarUIProvider, useSidebarUI } from "@/components/dashboard/sidebar-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarUIProvider>
      <DashboardShell />
    </SidebarUIProvider>
  );
}

function DashboardShell() {
  const { collapsed } = useSidebarUI();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main
        className="transition-[margin] duration-200 ease-out"
        style={{ marginLeft: 0 }}
      >
        <div
          className="mx-auto max-w-[1400px] px-4 pt-4 pb-24 sm:px-6 sm:pt-5 md:px-8 md:pt-6 md:pb-8"
          style={{ paddingLeft: undefined }}
        >
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
      {/* desktop spacer via inline style to support dynamic sidebar width */}
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? 76 : 240}px !important; }
        }
      `}</style>
    </div>
  );
}