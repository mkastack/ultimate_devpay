import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  MessageCircle,
  Briefcase,
  Users,
  FileText,
  Handshake,
  Wallet,
  Settings,
  PlusCircle,
} from "lucide-react";
import { ProfileAvatarButton } from "./ProfilePopover";
import { NotificationsPopover } from "./NotificationsPopover";
import { SearchPopover } from "./SearchPopover";
import { client } from "@/lib/mock-data";

type Item = { to: string; label: string; Icon: typeof Home; dot?: boolean };

const items: Item[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/post-job", label: "Post", Icon: PlusCircle },
  { to: "/developers", label: "Devs", Icon: Users },
  { to: "/jobs", label: "Jobs", Icon: Briefcase },
  { to: "/proposals", label: "Bids", Icon: FileText },
  { to: "/contracts", label: "Contracts", Icon: Handshake },
  { to: "/payments", label: "Pay", Icon: Wallet },
  { to: "/messages", label: "Chat", Icon: MessageCircle, dot: client.unread_messages > 0 },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 pt-2 md:hidden">
      <nav
        className="mx-auto flex h-16 items-center gap-1 rounded-2xl border px-2 shadow-2xl backdrop-blur-xl"
        style={{
          background: "rgba(15, 25, 45, 0.92)",
          borderColor: "var(--border)",
        }}
      >
        {/* Scrollable tabs */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0.5">
            {items.map((it) => {
              const isActive =
                pathname === it.to ||
                (it.to !== "/" && pathname.startsWith(it.to));
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-label={it.label}
                  className="relative flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors"
                  style={
                    isActive
                      ? { background: "var(--gold)", color: "var(--background)" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <it.Icon className="h-[18px] w-[18px]" />
                  <span className="text-[10px] font-semibold leading-none">
                    {it.label}
                  </span>
                  {it.dot && !isActive && (
                    <span
                      className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--destructive)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Fixed right cluster: search + bell + avatar */}
        <div
          className="flex items-center gap-1.5 border-l pl-2"
          style={{ borderColor: "var(--border)" }}
        >
          <SearchPopover size={36} />
          <NotificationsPopover size={36} />
          <ProfileAvatarButton size={36} />
        </div>
      </nav>
    </div>
  );
}
