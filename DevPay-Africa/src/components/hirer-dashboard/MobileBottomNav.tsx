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
import { client } from "@/lib/hirer-mock-data";

type Item = { to: string; label: string; Icon: typeof Home; dot?: boolean; exact?: boolean };

const items: Item[] = [
  { to: "/client", label: "Home", Icon: Home, exact: true },
  { to: "/client/post-job", label: "Post", Icon: PlusCircle },
  { to: "/client/developers", label: "Devs", Icon: Users },
  { to: "/client/jobs", label: "Jobs", Icon: Briefcase },
  { to: "/client/proposals", label: "Bids", Icon: FileText },
  { to: "/client/contracts", label: "Deals", Icon: Handshake },
  { to: "/client/payments", label: "Pay", Icon: Wallet },
  { to: "/client/messages", label: "Chat", Icon: MessageCircle, dot: client.unread_messages > 0 },
  { to: "/client/settings", label: "Settings", Icon: Settings },
];

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 pt-2 md:hidden">
      <nav
        className="mx-auto flex h-16 min-w-0 items-center gap-1 rounded-2xl border px-2 shadow-2xl backdrop-blur-xl"
        style={{
          background: "rgba(15, 25, 45, 0.92)",
          borderColor: "var(--border)",
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
                      ? { background: "var(--gold)", color: "var(--background)" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <it.Icon className="h-[18px] w-[18px]" />
                  <span className="text-[10px] font-semibold leading-none">{it.label}</span>
                  {it.dot && !active && (
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

        <div
          className="flex shrink-0 items-center gap-1.5 border-l pl-2"
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
