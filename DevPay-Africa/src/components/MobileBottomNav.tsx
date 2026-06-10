import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageSquare, Wallet, User, Bell } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import type { LucideIcon } from "lucide-react";
import logoImg from "@/assets/devpay-logo.png";

type Item = { to: string; icon: LucideIcon; label: string; dot?: boolean };

export function MobileBottomNav({ items }: { items?: Item[] }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useAuth();
  const initial = (profile?.full_name?.[0] ?? "U").toUpperCase();

  const defaults: Item[] = items ?? [
    { to: profile?.role === "developer" ? "/developer" : "/client", icon: Home, label: "Home" },
    { to: "/jobs", icon: MessageSquare, label: "Jobs" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
      <div className="mx-auto flex items-center justify-between gap-1 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl pl-2 pr-2 py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
        <Link to="/" aria-label="DevPay Africa home" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mr-1">
          <img src={logoImg} alt="DevPay Africa" className="h-7 w-7 object-contain" />
        </Link>
        {defaults.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to + it.label}
              to={it.to}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={it.label}
            >
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          );
        })}
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Link>
        <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] font-display text-sm font-bold text-primary-foreground">
          {initial}
        </div>
      </div>
    </div>
  );
}
