import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, BarChart3, Bell, Briefcase, ClipboardList, Code2,
  CreditCard, Cpu, FileCheck, Home, Inbox, ListTodo, Lock, Settings, Shield,
  Star, TrendingUp, Users, AlertTriangle, ArrowDownCircle, Megaphone,
  ChevronsLeft, ChevronsRight, Sun, Moon,
} from "lucide-react";
import devpayLogo from "@/assets/devpay-logo.png";
import { useAdminPrefs } from "./admin-prefs";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { count: number; urgent?: boolean };
};

type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: Home },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/realtime", label: "Real-time Monitor", icon: Activity },
    ],
  },
  {
    label: "Users",
    items: [
      { to: "/admin/users", label: "All Users", icon: Users, badge: { count: 5247 } },
      { to: "/admin/developers", label: "Developers", icon: Code2 },
      { to: "/admin/clients", label: "Clients", icon: Briefcase },
      { to: "/admin/verification", label: "Verification Queue", icon: Shield, badge: { count: 18, urgent: true } },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { to: "/admin/jobs", label: "All Jobs", icon: ListTodo },
      { to: "/admin/proposals", label: "Proposals", icon: Inbox },
      { to: "/admin/contracts", label: "Active Contracts", icon: FileCheck },
    ],
  },
  {
    label: "Financial",
    items: [
      { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
      { to: "/admin/escrow", label: "Escrow Monitor", icon: Lock, badge: { count: 342 } },
      { to: "/admin/withdrawals", label: "Withdrawal Queue", icon: ArrowDownCircle, badge: { count: 47, urgent: true } },
      { to: "/admin/revenue", label: "Revenue Analytics", icon: TrendingUp },
      { to: "/admin/disputes", label: "Disputes", icon: AlertTriangle, badge: { count: 12, urgent: true } },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/ai-logs", label: "AI Logs", icon: Cpu },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
    ],
  },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggleCollapsed, theme, toggleTheme } = useAdminPrefs();

  return (
    <aside
      className={`fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[#1C2040] bg-[#07080F] transition-[width] duration-200 md:flex ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className={`flex items-center justify-between px-3 pt-5 pb-4 ${collapsed ? "flex-col gap-3" : ""}`}>
        <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <img src={devpayLogo} alt="DevPay Africa" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <div className="font-display text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
              DevPay <span className="text-[#00C6A7]">Africa</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[#1C2040] bg-[#12152A] text-[#8890B5] hover:border-[#1E3A8A] hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="inline-flex items-center rounded-full bg-[rgba(30,58,138,0.20)] px-2 py-[3px] font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#3B82F6]">
            Admin Panel
          </div>
        </div>
      )}

      <div className="mx-3 mb-2 h-px bg-[#1C2040]" />



      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {sections.map((section, idx) => (
          <div key={section.label} className={idx === 0 ? "mt-1" : "mt-3"}>
            {!collapsed && (
              <div className="px-2 pb-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#3D4466]">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.to === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex h-10 items-center rounded-[10px] transition-all duration-150 ${
                      collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
                    } ${
                      isActive
                        ? "bg-[rgba(30,58,138,0.12)] shadow-[inset_3px_0_0_#1E3A8A]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-[#3B82F6]" : "text-[#3D4466]"}`} />
                    {!collapsed && (
                      <>
                        <span className={`flex-1 truncate text-[13px] ${isActive ? "font-semibold text-white" : "text-[#8890B5]"}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 font-sans text-[10px] font-bold text-white ${item.badge.urgent ? "bg-[#FF4D6A]" : "bg-[#1E3A8A]"}`}>
                            {item.badge.count > 999 ? `${Math.floor(item.badge.count / 1000)}k` : item.badge.count}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className={`absolute right-1.5 top-1.5 grid h-[14px] min-w-[14px] place-items-center rounded-full px-1 font-sans text-[9px] font-bold text-white ${item.badge.urgent ? "bg-[#FF4D6A]" : "bg-[#1E3A8A]"}`}>
                        {item.badge.count > 99 ? "99+" : item.badge.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1C2040] px-3 py-3">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className={`mb-2 flex h-9 w-full items-center rounded-[10px] border border-[#1C2040] bg-[#12152A] text-[#8890B5] transition-colors hover:border-[#1E3A8A] hover:text-white ${
            collapsed ? "justify-center" : "gap-2 px-3"
          }`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && (
            <span className="font-sans text-[12px] font-medium">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          )}
        </button>
        {!collapsed && (
          <>
            <div className="flex items-center gap-2">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span className="font-sans text-[11px] text-[#10B981]">All Systems Operational</span>
            </div>
            <div className="mt-1 font-sans text-[10px] text-[#3D4466]">v2.4.1</div>
          </>
        )}
        {collapsed && (
          <div className="mt-1 flex justify-center">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          </div>
        )}
      </div>
    </aside>
  );
}
