import { useState } from "react";
import { Search, Bell, Plus, LogOut, User as UserIcon, Settings as SettingsIcon, Sun, Moon, DollarSign, MessageSquare, FileText, Briefcase } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { developer, counts, activities, type Activity } from "@/lib/dev-mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProposalDialog } from "./ProposalDialog";
import { SearchDialog } from "./SearchDialog";
import { useTheme } from "@/lib/theme-context";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

interface NotificationItem extends Activity {
  read: boolean;
}

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [proposalOpen, setProposalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() =>
    activities.map((a: Activity, i: number) => ({ ...a, read: i >= counts.unreadNotifications }))
  );
  const unreadCount = notificationsList.filter((n: NotificationItem) => !n.read).length;

  const markAllRead = () => {
    setNotificationsList((prev: NotificationItem[]) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotificationsList((prev: NotificationItem[]) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const iconFor = (type: string) => {
    switch (type) {
      case "payment":
        return DollarSign;
      case "message":
        return MessageSquare;
      case "proposal":
        return FileText;
      default:
        return Briefcase;
    }
  };

  return (
    <div
      className="mb-5 flex items-center justify-between gap-3 pb-4"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[20px] font-bold text-white sm:text-[22px] truncate">{title}</h1>
        {subtitle && (
          <div className="mt-1 text-[12px] text-[color:var(--text-muted)] sm:text-[13px] leading-tight">{subtitle}</div>
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
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative grid h-10 w-10 place-items-center rounded-full bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--cyan-brand)] focus:outline-none"
              style={{ border: "1px solid var(--color-border)" }}
              type="button"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[color:var(--cyan-brand)]" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(92vw,360px)] p-0 border-0"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <div className="text-sm font-semibold text-white">Notifications</div>
                <div className="text-[11px] text-[color:var(--text-muted)]">
                  {unreadCount} unread
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[12px] font-medium text-[color:var(--cyan-brand)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-[color:var(--color-border)]">
              {notificationsList.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-[color:var(--text-muted)]">
                  You're all caught up.
                </div>
              ) : (
                notificationsList.map((n: NotificationItem) => {
                  const Icon = iconFor(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[color:var(--surface-hover)]"
                    >
                      <div
                        className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          background: n.read ? "transparent" : "var(--cyan-brand)",
                          marginTop: 14,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-white">{n.title}</div>
                        <div className="mt-0.5 text-[12px] text-[color:var(--text-secondary)] line-clamp-2">
                          {n.subtitle}
                        </div>
                        <div className="mt-1 text-[10px] text-[color:var(--text-muted)]">
                          {n.timeAgo}
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[color:var(--surface-hover)] text-[color:var(--text-secondary)]">
                        <Icon className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div
              className="border-t px-4 py-2.5 text-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Link
                to="/notifications"
                className="text-[12px] font-medium text-[color:var(--cyan-brand)] hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>
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