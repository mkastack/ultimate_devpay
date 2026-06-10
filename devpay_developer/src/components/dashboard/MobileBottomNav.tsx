import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, Bell, HelpCircle, Sun, Moon } from "lucide-react";
import { counts, developer } from "@/lib/mock-data";
import { useTheme } from "@/lib/theme-context";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  const isHome = path === "/dashboard";
  const isMsg = path.startsWith("/dashboard/messages");
  const isProfile = path.startsWith("/dashboard/profile");

  const itemBase =
    "relative grid h-11 w-11 place-items-center rounded-full transition-colors";

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      aria-label="Primary"
    >
      <div
        className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-full px-2 py-1.5 shadow-xl"
        style={{
          background: "color-mix(in oklab, var(--surface) 96%, transparent)",
          backdropFilter: "blur(14px)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Link
          to="/dashboard"
          aria-label="Home"
          className={itemBase}
          style={{
            background: isHome ? "var(--cyan-brand)" : "transparent",
            color: isHome ? "var(--background)" : "var(--text-secondary)",
          }}
        >
          <Home className="h-5 w-5" />
        </Link>

        <Link
          to="/dashboard/messages"
          aria-label="Messages"
          className={itemBase}
          style={{
            background: isMsg ? "var(--cyan-brand)" : "transparent",
            color: isMsg ? "var(--background)" : "var(--text-secondary)",
          }}
        >
          <MessageCircle className="h-5 w-5" />
          {counts.unreadMessages > 0 && (
            <span
              className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-bold"
              style={{ background: "var(--cyan-brand)", color: "var(--background)", border: "1.5px solid var(--surface)" }}
            >
              {counts.unreadMessages}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className={itemBase}
          style={{ color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Link
          to="/dashboard/settings"
          aria-label="Help"
          className={itemBase}
          style={{ color: "var(--text-secondary)" }}
        >
          <HelpCircle className="h-5 w-5" />
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className={itemBase}
          style={{ color: "var(--text-secondary)" }}
        >
          <Bell className="h-5 w-5" />
          {counts.unreadNotifications > 0 && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ background: "#ef4444", boxShadow: "0 0 0 2px var(--surface)" }}
            />
          )}
        </button>

        <Link
          to="/dashboard/profile"
          aria-label="Profile"
          className="grid h-10 w-10 place-items-center rounded-full font-display text-[12px] font-bold"
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
  );
}