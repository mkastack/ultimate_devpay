import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { AdminPrefsProvider, useAdminPrefs } from "@/components/admin/admin-prefs";
import { getCurrentAdmin } from "@/lib/auth-mock";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getCurrentAdmin()) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);
  if (!ready) return null;
  return (
    <AdminPrefsProvider>
      <Shell />
    </AdminPrefsProvider>
  );
}

function Shell() {
  const { collapsed } = useAdminPrefs();
  return (
    <div className="admin-root min-h-screen bg-[#07080F] text-white transition-colors">
      <AdminSidebar />
      <main
        className={`min-h-screen px-4 pb-28 pt-5 md:px-8 md:pb-7 md:pt-7 transition-[margin] duration-200 ${
          collapsed ? "md:ml-[72px]" : "md:ml-[240px]"
        }`}
      >
        <div className="md:overflow-x-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
