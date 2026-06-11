import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Search,
  Sparkles,
  FileText,
  Briefcase,
  Wallet,
  CreditCard,
  MessageCircle,
  User,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { counts, developer } from "@/lib/dev-mock-data";
import { useTheme } from "@/lib/theme-context";

type Item = {
  to: string;
  label: string;
  Icon: typeof Home;
  badge?: number;
  exact?: boolean;
};

const items: Item[] = [
  { to: "/developer", label: "Home", Icon: Home, exact: true },
  { to: "/developer/jobs", label: "Jobs", Icon: Search },
  { to: "/developer/jobs-for-you", label: "For You", Icon: Sparkles },
  { to: "/developer/proposals", label: "Bids", Icon: FileText, badge: counts.pendingProposals },
  { to: "/developer/contracts", label: "Deals", Icon: Briefcase, badge: counts.activeContracts },
  { to: "/developer/wallet", label: "Wallet", Icon: Wallet },
  { to: "/developer/payment-methods", label: "Pay", Icon: CreditCard },
  { to: "/developer/messages", label: "Chat", Icon: MessageCircle, badge: counts.unreadMessages },
  { to: "/developer/profile", label: "Profile", Icon: User },
  { to: "/developer/settings", label: "Settings", Icon: Settings },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const isProfile = pathname.startsWith("/developer/profile");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 pt-2 md:hidden">
      <nav
        className="mx-auto flex h-16 min-w-0 items-center gap-1 rounded-2xl border px-2 shadow-2xl backdrop-blur-xl"
        style={{
          background: "color-mix(in oklab, var(--surface) 96%, transparent)",
          borderColor: "var(--color-border)",
        }}
        aria-label="Primary"
      >
        <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch]">
          <div className="flex w-max items-center gap-0.5 pr-1">
            {items.map((it) => {
              const active = isActive(pathname, it.to, it.exact);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                  className="relative flex min-w-[56px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors"
                  style={
                    active
                      ? { background: "var(--cyan-brand)", color: "var(--background)" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <it.Icon className="h-[18px] w-[18px]" />
                  <span className="text-[10px] font-semibold leading-none">{it.label}</span>
                  {it.badge != null && it.badge > 0 && !active && (
                    <span
                      className="absolute right-1.5 top-1 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-bold"
                      style={{
                        background: "var(--cyan-brand)",
                        color: "var(--background)",
                        border: "1.5px solid var(--surface)",
                      }}
                    >
                      {it.badge > 9 ? "9+" : it.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-1.5 border-l pl-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-xl transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <Link
            to="/developer/profile"
            aria-label="Profile"
            className="grid h-9 w-9 place-items-center rounded-full font-display text-[11px] font-bold"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "#fff",
              border: isProfile ? "2px solid var(--cyan-brand)" : "2px solid transparent",
            }}
          >
            {initials(developer.full_name)}
          </Link>
        </div>
      </nav>
    </div>
  );
}
