import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Search, FileText, Briefcase, Wallet, MessageCircle, User, Settings,
  ChevronLeft, ChevronRight, Zap, Crown, Sparkles, CreditCard,
} from "lucide-react";
import { developer, counts } from "@/lib/dev-mock-data";
import { useSidebarUI } from "./sidebar-context";
import logo from "@/assets/devpay-logo.png";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  badge: number;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/developer", label: "Overview", icon: Home, badge: 0, exact: true },
  { to: "/developer/jobs", label: "Browse Jobs", icon: Search, badge: 0 },
  { to: "/developer/jobs-for-you", label: "Jobs For You", icon: Sparkles, badge: 0 },
  { to: "/developer/proposals", label: "My Proposals", icon: FileText, badge: counts.pendingProposals },
  { to: "/developer/contracts", label: "Active Contracts", icon: Briefcase, badge: counts.activeContracts },
  { to: "/developer/wallet", label: "Wallet", icon: Wallet, badge: 0 },
  { to: "/developer/payment-methods", label: "Payment Methods", icon: CreditCard, badge: 0 },
  { to: "/developer/messages", label: "Messages", icon: MessageCircle, badge: counts.unreadMessages },
  { to: "/developer/profile", label: "My Profile", icon: User, badge: 0 },
  { to: "/developer/settings", label: "Settings", icon: Settings, badge: 0 },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggle } = useSidebarUI();
  const width = collapsed ? 76 : 240;

  return (
    <aside
      className="fixed left-0 top-0 z-50 hidden h-screen flex-col bg-background transition-[width] duration-200 ease-out md:flex"
      style={{ width, borderRight: "1px solid var(--color-border)" }}
    >
      {/* Top: logo + collapse toggle */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"} pt-4 pb-3`}>
        <Link to="/developer" className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="DevPay Africa" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <span className="font-display text-[15px] font-bold text-white truncate">
              DevPay <span className="text-[color:var(--cyan-brand)]">Africa</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            className="grid h-7 w-7 place-items-center rounded-md text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--cyan-brand)]"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={toggle}
          className="mx-auto mb-2 grid h-7 w-7 place-items-center rounded-md text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--cyan-brand)]"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div className="mx-3 h-px bg-[color:var(--color-border)]" />

      {/* Menu — fills available space, no scroll */}
      <nav className="flex flex-1 flex-col px-2 pt-3 pb-3 overflow-hidden">
        {!collapsed && (
          <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
            Menu
          </div>
        )}
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to as string}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex h-10 items-center rounded-[10px] transition-colors duration-150 ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
                  style={{
                    background: active ? "rgba(0,198,167,0.10)" : "transparent",
                    boxShadow: active && !collapsed ? "inset 3px 0 0 var(--cyan-brand)" : "none",
                  }}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0 transition-colors"
                    style={{ color: active ? "var(--cyan-brand)" : "var(--text-muted)" }}
                  />
                  {!collapsed && (
                    <span
                      className="flex-1 text-[13.5px] transition-colors"
                      style={{
                        color: active ? "#fff" : "var(--text-secondary)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                  {item.badge > 0 && (
                    <span
                      className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[10px] font-bold ${collapsed ? "absolute right-1 top-1" : ""}`}
                      style={{ background: "var(--cyan-brand)", color: "var(--background)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto" />

        {/* Upgrade CTA — expanded */}
        {!collapsed && developer.subscription_plan !== "pro" && (
          <div className="px-2 pt-3">
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(0,198,167,0.06)",
                border: "1px solid rgba(0,198,167,0.15)",
              }}
            >
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
                Upgrade to Pro <Zap className="h-3.5 w-3.5 text-[color:var(--gold-brand)]" />
              </div>
              <div className="mt-0.5 text-[11px] text-[color:var(--text-secondary)]">
                AI proposals + lower fees
              </div>
              <button
                className="mt-2.5 h-8 w-full rounded-lg bg-[color:var(--cyan-brand)] text-[12.5px] font-semibold text-[color:var(--background)] transition-all hover:shadow-cyan active:scale-[0.98]"
                type="button"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Pro badge — expanded + pro */}
        {!collapsed && developer.subscription_plan === "pro" && (
          <div className="px-2 pt-3">
            <div
              className="flex items-center gap-2 rounded-xl p-3"
              style={{
                background: "rgba(245,166,35,0.06)",
                border: "1px solid rgba(245,166,35,0.20)",
              }}
            >
              <Crown className="h-4 w-4 text-[color:var(--gold-brand)]" />
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-white">Pro Developer</div>
                <div className="text-[10.5px] text-[color:var(--text-secondary)]">All features unlocked</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed footer — fills bottom gap */}
        {collapsed && (
          <div className="mt-3 flex flex-col items-center gap-2 pb-1">
            <div className="h-px w-8 bg-[color:var(--color-border)]" />
            <div
              title={developer.subscription_plan === "pro" ? "Pro Developer" : "Upgrade to Pro"}
              className="grid h-9 w-9 place-items-center rounded-[10px]"
              style={{
                background:
                  developer.subscription_plan === "pro"
                    ? "rgba(245,166,35,0.10)"
                    : "rgba(0,198,167,0.10)",
                border:
                  developer.subscription_plan === "pro"
                    ? "1px solid rgba(245,166,35,0.25)"
                    : "1px solid rgba(0,198,167,0.20)",
              }}
            >
              {developer.subscription_plan === "pro" ? (
                <Crown className="h-4 w-4 text-[color:var(--gold-brand)]" />
              ) : (
                <Zap className="h-4 w-4 text-[color:var(--cyan-brand)]" />
              )}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}