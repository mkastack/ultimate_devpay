import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Users, Briefcase, Inbox, FileCheck,
  CreditCard, MessageCircle, Settings as SettingsIcon, PlusCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import logo from "@/assets/devpay-logo.png";
import { client } from "@/lib/mock-data";
import { useSidebar } from "./sidebar-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  to: string;
  label: string;
  Icon: typeof Home;
  badge?: number;
};

const items: NavItem[] = [
  { to: "/", label: "Overview", Icon: Home },
  { to: "/post-job", label: "Post a Job", Icon: PlusCircle },
  { to: "/developers", label: "Browse Developers", Icon: Users },
  { to: "/jobs", label: "My Jobs", Icon: Briefcase, badge: client.open_jobs_count },
  { to: "/proposals", label: "Proposals", Icon: Inbox, badge: client.new_proposals_count },
  { to: "/contracts", label: "Active Contracts", Icon: FileCheck, badge: client.active_contracts_count },
  { to: "/payments", label: "Payments", Icon: CreditCard },
  { to: "/messages", label: "Messages", Icon: MessageCircle, badge: client.unread_messages },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggle } = useSidebar();

  const width = collapsed ? 76 : 260;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-border bg-background transition-[width] duration-300 ease-out md:flex"
        style={{ width }}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center pt-6 ${collapsed ? "justify-center px-2 pb-5" : "justify-between px-4 pb-5"}`}>
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <img src={logo} alt="DevPay Africa" className="h-9 w-9 flex-shrink-0" />
            {!collapsed && (
              <div className="whitespace-nowrap font-display text-lg font-bold tracking-tight text-foreground">
                DevPay <span style={{ color: "var(--gold)" }}>Africa</span>
              </div>
            )}
          </Link>
        </div>
        <div className="mx-3 border-b border-border" />

        {/* Nav */}
        <nav className={`flex-1 pt-4 ${collapsed ? "px-2" : "px-3"}`}>
          {!collapsed && (
            <div
              className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{ color: "var(--text-muted)" }}
            >
              Main Menu
            </div>
          )}
          <div className="space-y-1">
            {items.map((it) => {
              const isActive = pathname === it.to || (it.to !== "/" && pathname.startsWith(it.to));
              const link = (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-label={it.label}
                  className={`group relative flex h-11 items-center rounded-[10px] transition-colors duration-200 ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(245,166,35,0.10)",
                          boxShadow: collapsed ? "none" : "inset 3px 0 0 var(--gold)",
                        }
                      : undefined
                  }
                >
                  <it.Icon
                    className="h-[20px] w-[20px] flex-shrink-0"
                    style={{ color: isActive ? "var(--gold)" : "var(--text-muted)" }}
                  />
                  {!collapsed && (
                    <span
                      className="flex-1 truncate text-sm"
                      style={{
                        color: isActive ? "#fff" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {it.label}
                    </span>
                  )}
                  {it.badge ? (
                    collapsed ? (
                      <span
                        className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                        style={{ background: "var(--gold)", color: "var(--background)" }}
                      >
                        {it.badge}
                      </span>
                    ) : (
                      <span
                        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold"
                        style={{ background: "var(--gold)", color: "var(--background)" }}
                      >
                        {it.badge}
                      </span>
                    )
                  ) : null}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={it.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {it.label}
                    {it.badge ? ` · ${it.badge}` : ""}
                  </TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className={`border-t border-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex h-9 items-center rounded-[10px] border border-border text-sm transition-colors hover:bg-[var(--card-hover)] ${
              collapsed ? "w-9 justify-center" : "w-full justify-center gap-2 px-3"
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
