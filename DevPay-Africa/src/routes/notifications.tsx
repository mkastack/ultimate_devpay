import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Loader2, MessageSquare, Briefcase, DollarSign, FileText, LayoutDashboard, Wallet as WalletIcon, User as UserIcon, Settings } from "lucide-react";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DevPay Africa" }] }),
  component: NotificationsPage,
});

type Notif = {
  id: string;
  user_id: string;
  type: string | null;
  title: string;
  message: string | null;
  read: boolean | null;
  link: string | null;
  created_at: string;
};

const iconFor = (type: string | null) => {
  switch (type) {
    case "payment": return DollarSign;
    case "proposal": return FileText;
    case "job": return Briefcase;
    case "message": return MessageSquare;
    default: return Bell;
  }
};

function NotificationsPage() {
  const { ready, profile } = useRequireAuth();
  const { session } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const nav = profile?.role === "client"
    ? [
        { to: "/client", label: "Overview", icon: LayoutDashboard },
        { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
        { to: "/wallet", label: "Payments", icon: WalletIcon },
        { to: "/notifications", label: "Notifications", icon: Bell },
        { to: "/profile", label: "Profile", icon: UserIcon },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/client", label: "Overview", icon: LayoutDashboard },
        { to: "/jobs", label: "Jobs", icon: Briefcase },
        { to: "/wallet", label: "Wallet", icon: WalletIcon },
        { to: "/notifications", label: "Notifications", icon: Bell },
        { to: "/profile", label: "Profile", icon: UserIcon },
        { to: "/settings", label: "Settings", icon: Settings },
      ];

  const refresh = async () => {
    if (!session?.user) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error && !/relation .* does not exist/i.test(error.message)) {
      // table missing is OK — render empty state
      console.warn(error.message);
    }
    setItems((data as Notif[]) ?? []);
    setLoadingData(false);
  };

  useEffect(() => { refresh(); }, [session?.user]);

  const markAllRead = async () => {
    if (!session?.user) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
    if (error) { toast.error(error.message); return; }
    toast.success("All caught up");
    refresh();
  };

  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const unread = items.filter((n) => !n.read);

  return (
    <DashboardShell nav={nav} title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-muted-foreground">Real-time alerts on jobs, proposals, and payouts</div>
          <div className="font-display text-2xl font-bold mt-1">
            {unread.length > 0 ? `${unread.length} new` : "You're all caught up"}
          </div>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loadingData ? (
          <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <div className="font-display text-lg font-semibold mt-4">Nothing here yet</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              We'll let you know about new proposals, payments, and messages the moment they happen.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {items.map((n) => {
              const Icon = iconFor(n.type);
              const Row = (
                <div className={`flex gap-4 p-4 md:p-5 transition-colors ${n.read ? "" : "bg-primary/5"}`}>
                  <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${n.read ? "bg-surface text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 justify-between">
                      <div className="font-medium truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground shrink-0">{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                    {n.message && <div className="text-sm text-muted-foreground mt-0.5">{n.message}</div>}
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
                </div>
              );
              return (
                <li key={n.id} onClick={() => !n.read && markOne(n.id)} className="cursor-pointer hover:bg-surface/40">
                  {n.link ? <Link to={n.link as "/"}>{Row}</Link> : Row}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
