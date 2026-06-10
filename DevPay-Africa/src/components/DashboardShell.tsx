import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Bell, LogOut, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useAuth } from "@/integrations/supabase/auth-context";
import { MobileBottomNav } from "./MobileBottomNav";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function DashboardShell({
  nav,
  children,
  title,
}: {
  nav: NavItem[];
  children: React.ReactNode;
  title: string;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = (profile?.full_name?.[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border/60 bg-sidebar shrink-0">
        <div className="px-5 py-5 border-b border-border/60"><Logo /></div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/60">
          <div className="rounded-lg bg-[image:var(--gradient-primary)] p-3 text-primary-foreground">
            <div className="font-display font-semibold text-sm">Upgrade to Pro</div>
            <div className="text-xs opacity-90 mt-0.5">Featured profile + AI tools</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
          <h1 className="font-display text-xl font-bold">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-9 w-64 h-9 bg-surface border-border/60" />
            </div>
            <Link to="/notifications" aria-label="Notifications" className="relative h-9 w-9 rounded-lg border border-border/60 bg-surface flex items-center justify-center hover:border-primary/40">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center font-display font-bold text-primary-foreground text-sm hover:opacity-90">
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{profile?.full_name ?? "Account"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{profile?.role ?? ""}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/wallet">Wallet</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export function StatCard({
  label, value, hint, accent,
}: { label: string; value: string; hint?: string; accent?: "primary" | "accent" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-bold mt-2 ${accent === "primary" ? "text-primary" : accent === "accent" ? "text-accent" : ""}`}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
