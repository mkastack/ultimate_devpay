import { Wallet, Briefcase, FileText, Star } from "lucide-react";
import { developer, counts, fmtGHS, fmtUSD } from "@/lib/dev-mock-data";

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
      <div className={`mt-3 font-mono-nums text-[34px] font-bold leading-none ${m.valueClass ?? "text-white"}`}>
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
  const totalEarnedUsd = 312.9;

  const metrics: Metric[] = [
    {
      label: "Total Earned",
      value: fmtGHS(totalEarnedUsd),
      secondary: `≈ ${fmtUSD(totalEarnedUsd)}`,
      trend: <span style={{ color: "var(--cyan-brand)" }}>↑ +23% vs last month</span>,
      icon: Wallet,
      iconBg: "rgba(245,166,35,0.15)",
      iconColor: "var(--gold-brand)",
    },
    {
      label: "Active Contracts",
      value: String(counts.activeContracts),
      trend: <span style={{ color: "var(--gold-brand)" }}>2 deadlines this week</span>,
      icon: Briefcase,
      iconBg: "rgba(0,198,167,0.15)",
      iconColor: "var(--cyan-brand)",
    },
    {
      label: "Pending Proposals",
      value: String(counts.pendingProposals),
      trend: <span className="text-[color:var(--text-secondary)]">3 viewed by clients</span>,
      icon: FileText,
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "#818CF8",
    },
    {
      label: "Your Rating",
      value: developer.rating.toFixed(1),
      valueClass: "text-[color:var(--gold-brand)]",
      secondary: <StarRow rating={developer.rating} />,
      trend: <span className="text-[color:var(--text-muted)]">({developer.rating_count} reviews)</span>,
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