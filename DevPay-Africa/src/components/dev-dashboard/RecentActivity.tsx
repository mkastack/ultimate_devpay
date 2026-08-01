import { useEffect, useState } from "react";
import { FileText, Wallet, Briefcase, MessageCircle } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

type ActivityType = "proposal" | "payment" | "contract" | "message";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timeAgo: string;
};

const styleByType: Record<ActivityType, { bg: string; color: string; Icon: typeof FileText }> = {
  proposal: { bg: "rgba(99,102,241,0.15)", color: "#818CF8", Icon: FileText },
  payment: { bg: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)", Icon: Wallet },
  contract: { bg: "rgba(245,166,35,0.15)", color: "var(--gold-brand)", Icon: Briefcase },
  message: { bg: "rgba(139,163,199,0.15)", color: "#8BA3C7", Icon: MessageCircle },
};

function formatRelativeTime(iso: string | null) {
  if (!iso) return "Recently updated";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function fmtUSD(amount: number) {
  return `USD ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RecentActivity() {
  const { session } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      setActivities([]);
      return;
    }

    let active = true;

    const loadActivity = async () => {
      try {
        const [proposalRes, contractRes, txRes] = await Promise.all([
          supabase
            .from("proposals")
            .select("id, status, created_at")
            .eq("developer_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("contracts")
            .select("id, status, created_at, agreed_amount")
            .eq("developer_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("transactions")
            .select("id, type, amount, status, created_at")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (proposalRes.error) throw proposalRes.error;
        if (contractRes.error) throw contractRes.error;
        if (txRes.error) throw txRes.error;

        const mapped: ActivityItem[] = [
          ...(proposalRes.data ?? []).map((item: any) => ({
            id: `proposal-${item.id}`,
            type: "proposal" as const,
            title: `Proposal ${String(item.status ?? "updated").toLowerCase()}`,
            subtitle: "Your bid is now visible in the dashboard",
            timeAgo: formatRelativeTime(item.created_at),
          })),
          ...(contractRes.data ?? []).map((item: any) => ({
            id: `contract-${item.id}`,
            type: "contract" as const,
            title: `Contract ${String(item.status ?? "updated").toLowerCase()}`,
            subtitle: `Agreed ${fmtUSD(Number(item.agreed_amount ?? 0))}`,
            timeAgo: formatRelativeTime(item.created_at),
          })),
          ...(txRes.data ?? []).map((item: any) => ({
            id: `payment-${item.id}`,
            type: "payment" as const,
            title: item.type === "payout" ? "Payment received" : "Transaction updated",
            subtitle: `${String(item.status ?? "updated").toUpperCase()} · ${fmtUSD(Number(item.amount ?? 0))}`,
            timeAgo: formatRelativeTime(item.created_at),
          })),
        ].sort((a, b) => b.timeAgo.localeCompare(a.timeAgo));

        if (active) {
          setActivities(mapped.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load recent activity", error);
        if (active) {
          setActivities([]);
        }
      }
    };

    void loadActivity();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  return (
    <div
      className="flex h-full flex-col rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[16px] font-semibold text-white">Recent Activity</div>
        <button className="text-[13px] text-[color:var(--cyan-brand)] hover:underline" type="button">
          See all →
        </button>
      </div>
      <ul className="mt-4 flex-1">
        {activities.length === 0 ? (
          <li className="py-3 text-[13px] text-[color:var(--text-muted)]">No recent activity yet.</li>
        ) : (
          activities.map((a) => {
            const s = styleByType[a.type];
            const Icon = s.Icon;
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{ background: s.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-white">{a.title}</div>
                  <div className="truncate text-[12px] text-[color:var(--text-muted)]">{a.subtitle}</div>
                </div>
                <div className="shrink-0 text-[11px] text-[color:var(--text-muted)]">{a.timeAgo}</div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}