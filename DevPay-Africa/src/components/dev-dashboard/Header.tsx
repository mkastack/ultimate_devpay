import { useState } from "react";
import { Search, Bell, Plus, LogOut, User as UserIcon, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { developer, counts } from "@/lib/dev-mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProposalDialog } from "./ProposalDialog";
import { SearchDialog } from "./SearchDialog";
import { useTheme } from "@/lib/theme-context";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [proposalOpen, setProposalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle } = useTheme();
  return (
    <div
      className="mb-5 flex items-center justify-between gap-3 pb-4"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="min-w-0">
        <h1 className="font-display text-[20px] font-bold text-white sm:text-[22px] truncate">{title}</h1>
        {subtitle && (
          <div className="mt-1 text-[12px] text-[color:var(--text-muted)] sm:text-[13px] truncate">{subtitle}</div>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--cyan-brand)]"
          style={{ border: "1px solid var(--color-border)" }}
          type="button"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={toggle}
          className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-all hover:text-[color:var(--cyan-brand)]"
          style={{ border: "1px solid var(--color-border)" }}
          type="button"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <Sun
            className="absolute h-4 w-4 transition-all duration-300"
            style={{
              opacity: theme === "light" ? 1 : 0,
              transform: theme === "light" ? "rotate(0) scale(1)" : "rotate(90deg) scale(0)",
            }}
          />
          <Moon
            className="absolute h-4 w-4 transition-all duration-300"
            style={{
              opacity: theme === "dark" ? 1 : 0,
              transform: theme === "dark" ? "rotate(0) scale(1)" : "rotate(-90deg) scale(0)",
            }}
          />
        </button>
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--cyan-brand)]"
          style={{ border: "1px solid var(--color-border)" }}
          type="button"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {counts.unreadNotifications > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[color:var(--cyan-brand)]" />
          )}
        </button>
        <button
          onClick={() => setProposalOpen(true)}
          className="hidden md:flex h-10 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[14px] font-semibold text-[color:var(--background)] transition-all hover:scale-[1.02] hover:shadow-cyan active:scale-[0.98]"
          type="button"
        >
          <Plus className="h-4 w-4" /> New Proposal
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Open profile"
              className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--surface-hover)] font-display text-[13px] font-bold text-[color:var(--cyan-brand)] outline-none transition-transform hover:scale-[1.04]"
              style={{
                border: developer.subscription_plan === "pro"
                  ? "2px solid var(--gold-brand)"
                  : "2px solid var(--color-border)",
              }}
            >
              {initials(developer.full_name)}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-72 border-0 p-0"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--surface-hover)] font-display font-bold text-[color:var(--cyan-brand)]"
                  style={{
                    border: developer.subscription_plan === "pro"
                      ? "2px solid var(--gold-brand)"
                      : "2px solid var(--color-border)",
                  }}
                >
                  {initials(developer.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-white">{developer.full_name}</div>
                  <div className="truncate text-[12px] text-[color:var(--text-muted)]">@{developer.username}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {developer.subscription_plan === "pro" ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                    style={{
                      background: "rgba(245,166,35,0.15)",
                      border: "1px solid rgba(245,166,35,0.30)",
                      color: "var(--gold-brand)",
                    }}
                  >
                    ⭐ Pro Developer
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-[color:var(--surface-hover)] px-2.5 py-[3px] text-[11px] font-bold text-[color:var(--text-secondary)]">
                    Free Plan
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative grid place-items-center">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-[color:var(--cyan-brand)] opacity-60" />
                    <span className="h-2 w-2 rounded-full bg-[color:var(--cyan-brand)]" />
                  </span>
                  <span className="text-[11.5px] text-[color:var(--cyan-brand)]">Available for work</span>
                </span>
              </div>
            </div>

            <div className="h-px bg-[color:var(--color-border)]" />

            <div className="p-1.5">
              <Link
                to="/developer/profile"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-white"
              >
                <UserIcon className="h-4 w-4" /> View profile
              </Link>
              <Link
                to="/developer/settings"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-white"
              >
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ProposalDialog open={proposalOpen} onOpenChange={setProposalOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

export { DashboardHeader as DevDashboardHeader };