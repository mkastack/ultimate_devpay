import { FileText, Wallet, Briefcase, MessageCircle } from "lucide-react";
import { activities, type ActivityType } from "@/lib/dev-mock-data";

const styleByType: Record<ActivityType, { bg: string; color: string; Icon: typeof FileText }> = {
  proposal: { bg: "rgba(99,102,241,0.15)", color: "#818CF8", Icon: FileText },
  payment: { bg: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)", Icon: Wallet },
  contract: { bg: "rgba(245,166,35,0.15)", color: "var(--gold-brand)", Icon: Briefcase },
  message: { bg: "rgba(139,163,199,0.15)", color: "#8BA3C7", Icon: MessageCircle },
};

export function RecentActivity() {
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
        {activities.slice(0, 5).map((a) => {
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
        })}
      </ul>
    </div>
  );
}