import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Eye, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { proposals, fmtUSD, fmtGHS } from "@/lib/dev-mock-data";
import { ProposalDialog } from "@/components/dev-dashboard/ProposalDialog";

export const Route = createFileRoute("/developer/proposals")({
  head: () => ({ meta: [{ title: "My Proposals — DevPay Africa" }] }),
  component: ProposalsPage,
});

type Status = "pending" | "accepted" | "rejected" | "withdrawn";
const statusMeta: Record<Status, { label: string; bg: string; fg: string; icon: typeof Clock }> = {
  pending: { label: "Pending", bg: "rgba(245,166,35,0.15)", fg: "var(--gold-brand)", icon: Clock },
  accepted: { label: "Accepted", bg: "rgba(0,198,167,0.15)", fg: "var(--cyan-brand)", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.15)", fg: "#F87171", icon: XCircle },
  withdrawn: { label: "Withdrawn", bg: "rgba(148,163,184,0.15)", fg: "#94A3B8", icon: XCircle },
};

const rows = [
  ...proposals,
  { id: "p4", title: "Inventory PWA for Makola wholesalers", bidUsd: 780, days: 18, status: "pending" as Status },
  { id: "p5", title: "Stripe + Paystack dual-gateway checkout", bidUsd: 1100, days: 12, status: "accepted" as Status },
  { id: "p6", title: "Replatform Shopify storefront to Next.js", bidUsd: 2400, days: 30, status: "rejected" as Status },
];

function ProposalsPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const visible = useMemo(
    () => (q.trim() ? rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())) : rows),
    [q],
  );
  const totals = {
    pending: rows.filter((r) => r.status === "pending").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    winRate: Math.round((rows.filter((r) => r.status === "accepted").length / rows.length) * 100),
    viewed: 9,
  };

  return (
    <>
      <DevDashboardHeader title="My Proposals" subtitle="Every bid you've sent — pending, viewed, accepted, rejected." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Pending", v: totals.pending, c: "var(--gold-brand)" },
          { l: "Accepted", v: totals.accepted, c: "var(--cyan-brand)" },
          { l: "Win Rate", v: `${totals.winRate}%`, c: "#A78BFA" },
          { l: "Viewed by clients", v: totals.viewed, c: "var(--text-secondary)" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--text-muted)]">{s.l}</div>
            <div className="mt-2 font-mono-nums text-[26px] font-bold" style={{ color: s.c as string }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search proposals…"
            className="h-10 w-full rounded-[10px] bg-[color:var(--surface)] pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
            style={{ border: "1px solid var(--color-border)" }}
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13.5px] font-semibold text-[color:var(--background)] transition-all hover:scale-[1.02] hover:shadow-cyan active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Proposal
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
        <div className="hidden grid-cols-[1fr_120px_90px_120px_60px] gap-4 border-b px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--text-muted)] sm:grid" style={{ borderColor: "var(--color-border)" }}>
          <div>Job</div><div>Bid</div><div>Days</div><div>Status</div><div></div>
        </div>
        {visible.length === 0 && (
          <div className="px-5 py-10 text-center text-[13px] text-[color:var(--text-muted)]">No proposals match "{q}".</div>
        )}
        {visible.map((r) => {
          const m = statusMeta[r.status];
          const Icon = m.icon;
          return (
            <div key={r.id} className="grid grid-cols-1 gap-2 border-b px-5 py-4 last:border-0 sm:grid-cols-[1fr_120px_90px_120px_60px] sm:items-center sm:gap-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium text-white">{r.title}</div>
                <div className="mt-0.5 text-[12px] text-[color:var(--text-muted)]">Submitted recently</div>
              </div>
              <div className="font-mono-nums text-[14px] text-white">{fmtUSD(r.bidUsd)}<div className="text-[11px] text-[color:var(--text-muted)]">{fmtGHS(r.bidUsd)}</div></div>
              <div className="font-mono-nums text-[13.5px] text-[color:var(--text-secondary)]">{r.days}d</div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: m.bg, color: m.fg }}>
                  <Icon className="h-3 w-3" /> {m.label}
                </span>
              </div>
              <button className="justify-self-start sm:justify-self-end grid h-8 w-8 place-items-center rounded-md text-[color:var(--text-muted)] hover:bg-[color:var(--surface-hover)] hover:text-white" aria-label="View">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <ProposalDialog open={open} onOpenChange={setOpen} />
    </>
  );
}