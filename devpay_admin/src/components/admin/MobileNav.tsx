import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, Users, ListTodo, DollarSign, MoreHorizontal, X,
  BarChart3, Activity, Code2, Briefcase, Shield, Inbox, FileCheck,
  CreditCard, Lock, ArrowDownCircle, TrendingUp, AlertTriangle,
  Cpu, Bell, Megaphone, Star, Settings, ClipboardList, Sun, Moon,
  LogOut, User as UserIcon,
} from "lucide-react";
import devpayLogo from "@/assets/devpay-logo.png";
import { useAdminPrefs } from "./admin-prefs";
import { getCurrentAdmin, signOutAdmin } from "@/lib/auth-mock";


const primary = [
  { to: "/admin", label: "Home", icon: Home, match: (p: string) => p === "/admin" },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/jobs", label: "Jobs", icon: ListTodo },
  { to: "/admin/revenue", label: "Money", icon: DollarSign },
];

const moreSections: { label: string; items: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; urgent?: boolean }[] }[] = [
  { label: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: Home },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/realtime", label: "Real-time Monitor", icon: Activity },
  ]},
  { label: "Users", items: [
    { to: "/admin/users", label: "All Users", icon: Users },
    { to: "/admin/developers", label: "Developers", icon: Code2 },
    { to: "/admin/clients", label: "Clients", icon: Briefcase },
    { to: "/admin/verification", label: "Verification", icon: Shield, badge: 18, urgent: true },
  ]},
  { label: "Marketplace", items: [
    { to: "/admin/jobs", label: "All Jobs", icon: ListTodo },
    { to: "/admin/proposals", label: "Proposals", icon: Inbox },
    { to: "/admin/contracts", label: "Contracts", icon: FileCheck },
  ]},
  { label: "Financial", items: [
    { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
    { to: "/admin/escrow", label: "Escrow", icon: Lock },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownCircle, badge: 47, urgent: true },
    { to: "/admin/revenue", label: "Revenue", icon: TrendingUp },
    { to: "/admin/disputes", label: "Disputes", icon: AlertTriangle, badge: 12, urgent: true },
  ]},
  { label: "Platform", items: [
    { to: "/admin/ai-logs", label: "AI Logs", icon: Cpu },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
  ]},
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [openMore, setOpenMore] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const { theme, toggleTheme } = useAdminPrefs();
  const admin = getCurrentAdmin();
  const displayName = admin?.name?.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) || "Admin";
  const email = admin?.email || "admin@devpay.africa";
  const initial = displayName.charAt(0).toUpperCase();

  const isActive = (to: string, match?: (p: string) => boolean) =>
    match ? match(pathname) : pathname === to || pathname.startsWith(to + "/");

  function handleLogout() {
    signOutAdmin();
    navigate({ to: "/login" });
  }


  return (
    <>
      {/* Floating theme toggle — doesn't interfere with the tab bar */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        aria-pressed={theme === "light"}
        className="fixed right-3 bottom-20 z-40 grid h-11 w-11 place-items-center rounded-full border border-[#1C2040] bg-[#0D0F1A]/95 text-[#8890B5] shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl hover:text-white md:hidden"
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden" aria-label="Primary">
        <div className="flex items-center justify-between gap-1 rounded-full border border-[#1C2040] bg-[#0D0F1A]/95 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {primary.map((t) => {
            const active = isActive(t.to, t.match);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`grid h-11 w-11 place-items-center rounded-full transition-all ${
                  active
                    ? "bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] text-white shadow-[0_4px_12px_rgba(30,58,138,0.5)]"
                    : "text-[#8890B5] hover:text-white"
                }`}
                aria-label={t.label}
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            );
          })}
          <button
            onClick={() => setOpenMore(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full text-[#8890B5] hover:text-white"
            aria-label="More"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FF4D6A]" />
          </button>
          <button
            onClick={() => setOpenProfile(true)}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#1E3A8A] bg-[#12152A] font-display text-[12px] font-bold text-white"
            aria-label="Profile"
          >
            {initial}
          </button>

        </div>
      </nav>

      {/* More sheet */}
      {openMore && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenMore(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-[#1C2040] bg-[#07080F] pb-8">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1C2040] bg-[#07080F] px-5 pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <img src={devpayLogo} alt="" className="h-7 w-7 object-contain" />
                <div className="font-display text-[14px] font-bold text-white">
                  DevPay <span className="text-[#00C6A7]">Africa</span>
                </div>
                <span className="ml-1 rounded-full bg-[rgba(30,58,138,0.2)] px-2 py-[2px] font-sans text-[9px] font-bold uppercase tracking-wider text-[#3B82F6]">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                  aria-pressed={theme === "light"}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#1C2040] text-[#8890B5] hover:text-white"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setOpenMore(false)}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#1C2040] text-[#8890B5] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="px-4 pt-4">
              {moreSections.map((sec) => (
                <div key={sec.label} className="mb-4">
                  <div className="mb-2 px-2 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#3D4466]">
                    {sec.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sec.items.map((it) => {
                      const active = isActive(it.to);
                      const Icon = it.icon;
                      return (
                        <Link
                          key={it.to + it.label}
                          to={it.to}
                          onClick={() => setOpenMore(false)}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 ${
                            active
                              ? "border-[#1E3A8A] bg-[rgba(30,58,138,0.12)]"
                              : "border-[#1C2040] bg-[#0D0F1A]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#3B82F6]" : "text-[#8890B5]"}`} />
                          <span className={`flex-1 truncate text-[12px] ${active ? "font-semibold text-white" : "text-[#8890B5]"}`}>
                            {it.label}
                          </span>
                          {it.badge && (
                            <span className={`grid h-[16px] min-w-[16px] place-items-center rounded-full px-1 font-sans text-[9px] font-bold text-white ${it.urgent ? "bg-[#FF4D6A]" : "bg-[#1E3A8A]"}`}>
                              {it.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile sheet */}
      {openProfile && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpenProfile(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-[#1C2040] bg-[#07080F] pb-8">
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#1C2040]" />
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#1E3A8A] bg-[#12152A] font-display text-[16px] font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="truncate font-sans text-[14px] font-semibold text-white">{displayName}</div>
                <div className="truncate font-sans text-[11.5px] text-[#8890B5]">{email}</div>
                <div className="mt-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">Super Admin</div>
              </div>
            </div>
            <div className="px-3">
              <button
                onClick={() => { setOpenProfile(false); navigate({ to: "/admin/settings" }); }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-[#1C2040] bg-[#0D0F1A] px-3 py-3 text-left font-sans text-[13px] text-white"
              >
                <UserIcon className="h-4 w-4 text-[#8890B5]" /> Account settings
              </button>
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-[#FF4D6A]/30 bg-[#FF4D6A]/10 px-3 py-3 text-left font-sans text-[13px] font-semibold text-[#FF4D6A]"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

