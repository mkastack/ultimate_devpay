import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function LayoutInner({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className="transition-[margin] duration-300 ease-out"
        style={{ marginLeft: `var(--sidebar-ml, 0px)` }}
      >
        <div
          className="mx-auto max-w-[1400px] px-4 py-5 pb-28 md:px-8 md:py-8 md:pb-8"
          style={
            {
              // applied via inline style swap on md+ via class below
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </main>
      <MobileBottomNav />
      {/* Inline style to set the sidebar margin only on md+ screens */}
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? "76px" : "260px"} !important; }
        }
      `}</style>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
