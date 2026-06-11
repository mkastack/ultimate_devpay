import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Lock, MessageCircle, ArrowUpRight } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { contracts, conversations, fmtUSD, fmtGHS } from "@/lib/dev-mock-data";
import { ReleaseDialog } from "@/components/dev-dashboard/ReleaseDialog";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/developer/contracts")({
  head: () => ({ meta: [{ title: "Contracts — DevPay Africa" }] }),
  component: ContractsPage,
});

function ContractsPage() {
  const [release, setRelease] = useState<(typeof contracts)[number] | null>(null);
  const totalEscrow = contracts.reduce((s, c) => s + c.escrowUsd, 0);
  const totalAgreed = contracts.reduce((s, c) => s + c.agreedUsd, 0);

  return (
    <>
      <DevDashboardHeader title="Active Contracts" subtitle="Milestones, escrow, and payment releases — one card per contract." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Active</div>
          <div className="mt-2 font-mono-nums text-[28px] font-bold text-white">{contracts.length}</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">In Escrow</div>
          <div className="mt-2 font-mono-nums text-[28px] font-bold text-[color:var(--cyan-brand)]">{fmtUSD(totalEscrow)}</div>
          <div className="text-[11.5px] text-[color:var(--text-muted)]">{fmtGHS(totalEscrow)}</div>
        </div>
        <div className="col-span-2 rounded-2xl p-4 sm:col-span-1" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Total Agreed</div>
          <div className="mt-2 font-mono-nums text-[28px] font-bold text-[color:var(--gold-brand)]">{fmtUSD(totalAgreed)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {contracts.map((c) => {
          const pct = Math.round((c.milestoneCurrent / c.milestoneTotal) * 100);
          const thread = conversations.find((m) => m.name === c.clientName)?.id;
          return (
            <div key={c.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--text-secondary)]">
                    {c.clientName}
                    {c.clientVerified && <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-white">{c.title}</div>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)" }}>Active</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[12px] text-[color:var(--text-muted)]">
                  <span>Milestone {c.milestoneCurrent} of {c.milestoneTotal}</span>
                  <span className="font-mono-nums">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-hover)]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--cyan-brand), #4ADE80)" }} />
                </div>
                <div className="mt-2 text-[12.5px] text-[color:var(--text-secondary)]">{c.currentMilestoneLabel}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
                <div>
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]"><Lock className="h-3 w-3" /> Escrow</div>
                  <div className="mt-1 font-mono-nums text-[15px] font-semibold text-[color:var(--cyan-brand)]">{fmtUSD(c.escrowUsd)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Agreed</div>
                  <div className="mt-1 font-mono-nums text-[15px] font-semibold text-white">{fmtUSD(c.agreedUsd)}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRelease(c)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] transition-all hover:shadow-cyan active:scale-[0.98]"
                >
                  Request Release <ArrowUpRight className="h-4 w-4" />
                </button>
                <Link to="/developer/messages" search={{ thread }} className="grid h-9 w-9 place-items-center rounded-[10px] text-[color:var(--text-secondary)] hover:text-white" style={{ border: "1px solid var(--color-border)" }} aria-label="Message">
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <ReleaseDialog open={!!release} onOpenChange={(v) => !v && setRelease(null)} contract={release ?? undefined} />
    </>
  );
}