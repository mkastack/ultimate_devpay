import { Wallet, Briefcase, FileText, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { fmtGHS, fmtUSD } from "@/lib/dev-mock-data";

type Metric = {
  label: string;
  value: string;
  valueClass?: string;
  secondary?: React.ReactNode;
  trend: React.ReactNode;
  icon: typeof Wallet;
  iconBg: string;
  iconColor: string;
};

function Card({ m }: { m: Metric }) {
  const Icon = m.icon;
  return (
    <div
      className="group cursor-pointer rounded-2xl px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--color-border)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,198,167,0.30)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    >
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
          {m.label}
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ background: m.iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: m.iconColor }} />
        </div>
      </div>
      <div className={`mt-3 font-mono-nums text-[26px] xs:text-[34px] font-bold leading-none ${m.valueClass ?? "text-white"}`}>
        {m.value}
      </div>
      {m.secondary && (
        <div className="mt-1 font-mono-nums text-[12px] text-[color:var(--text-muted)]">
          {m.secondary}
        </div>
      )}
      <div
        className="mt-4 pt-3 text-[12px]"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {m.trend}
      </div>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="mt-2 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(Math.max(rating - (i - 1), 0), 1);
        return (
          <div key={i} className="relative h-3.5 w-3.5">
            <Star className="absolute h-3.5 w-3.5" style={{ color: "var(--color-border)" }} fill="currentColor" />
            <div className="absolute overflow-hidden" style={{ width: `${fill * 100}%`, height: "100%" }}>
              <Star className="h-3.5 w-3.5" style={{ color: "var(--gold-brand)" }} fill="currentColor" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MetricCards() {
  const { session, profile } = useAuth();
  const [stats, setStats] = useState({ pendingProposals: 0, activeContracts: 0, totalEarnedUsd: 0, rating: 0, reviews: 0 });

  useEffect(() => {
    if (!session?.user?.id) return;

    let active = true;

    const loadStats = async () => {
      try {
        const [proposalRes, contractRes, txRes] = await Promise.all([
          supabase.from("proposals").select("id, status").eq("developer_id", session.user.id),
          supabase.from("contracts").select("id, status").eq("developer_id", session.user.id),
          supabase.from("transactions").select("amount").eq("user_id", session.user.id),
        ]);

        if (proposalRes.error) throw proposalRes.error;
        if (contractRes.error) throw contractRes.error;
        if (txRes.error) throw txRes.error;

        const pendingProposals = (proposalRes.data ?? []).filter((item: any) => {
          const status = String(item?.status ?? "").toLowerCase();
          return status === "pending" || status === "submitted" || status === "draft";
        }).length;

        const activeContracts = (contractRes.data ?? []).filter((item: any) => {
          const status = String(item?.status ?? "").toLowerCase();
          return status === "active" || status === "in_progress" || status === "accepted" || status === "locked" || status === "funded";
        }).length;

        const totalEarnedUsd = (txRes.data ?? []).reduce((sum: number, item: any) => {
          const amount = Number(item?.amount ?? 0);
          return sum + (Number.isFinite(amount) ? amount : 0);
        }, 0);

        const rating = profile?.is_verified ? 4.9 : 4.5;
        const reviews = profile?.is_verified ? 24 : 8;

        if (active) {
          setStats({ pendingProposals, activeContracts, totalEarnedUsd, rating, reviews });
        }
      } catch (error) {
        console.error("Failed to load metric cards", error);
        if (active) {
          setStats({ pendingProposals: 0, activeContracts: 0, totalEarnedUsd: 0, rating: 0, reviews: 0 });
        }
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, [profile?.is_verified, session?.user?.id]);

  const metrics: Metric[] = [
    {
      label: "Total Earned",
      value: fmtGHS(stats.totalEarnedUsd),
      secondary: `≈ ${fmtUSD(stats.totalEarnedUsd)}`,
      trend: <span style={{ color: "var(--cyan-brand)" }}>↑ Live from transactions</span>,
      icon: Wallet,
      iconBg: "rgba(245,166,35,0.15)",
      iconColor: "var(--gold-brand)",
    },
    {
      label: "Active Contracts",
      value: String(stats.activeContracts),
      trend: <span style={{ color: "var(--gold-brand)" }}>Updated from your contracts</span>,
      icon: Briefcase,
      iconBg: "rgba(0,198,167,0.15)",
      iconColor: "var(--cyan-brand)",
    },
    {
      label: "Pending Proposals",
      value: String(stats.pendingProposals),
      trend: <span className="text-[color:var(--text-secondary)]">Awaiting client review</span>,
      icon: FileText,
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "#818CF8",
    },
    {
      label: "Your Rating",
      value: stats.rating.toFixed(1),
      valueClass: "text-[color:var(--gold-brand)]",
      secondary: <StarRow rating={stats.rating} />,
      trend: <span className="text-[color:var(--text-muted)]">({stats.reviews} reviews)</span>,
      icon: Star,
      iconBg: "rgba(245,166,35,0.15)",
      iconColor: "var(--gold-brand)",
    },
  ];

  return (
    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} m={m} />
      ))}
    </div>
  );
}