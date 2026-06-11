import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Lock, Smartphone, Wallet as WalletIcon, Download } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { fmtUSD, fmtGHS } from "@/lib/dev-mock-data";

export const Route = createFileRoute("/developer/wallet")({
  head: () => ({ meta: [{ title: "Wallet — DevPay Africa" }] }),
  component: WalletPage,
});

type TxType = "escrow_release" | "payout" | "escrow_hold" | "fee" | "deposit";
const txs: { id: string; type: TxType; label: string; sub: string; usd: number; status: "completed" | "pending"; date: string }[] = [
  { id: "t1", type: "escrow_release", label: "Milestone 2 released", sub: "Speedaf logistics tracker", usd: 450, status: "completed", date: "Today, 14:02" },
  { id: "t2", type: "payout", label: "MoMo withdrawal", sub: "MTN MoMo · ••••2341", usd: 800, status: "completed", date: "Yesterday, 09:11" },
  { id: "t3", type: "escrow_hold", label: "Escrow funded", sub: "Zeepay design system", usd: 1200, status: "completed", date: "Mon, 16:48" },
  { id: "t4", type: "fee", label: "Platform fee", sub: "5% on milestone 1", usd: 22.5, status: "completed", date: "Mon, 16:48" },
  { id: "t5", type: "escrow_release", label: "Milestone 1 released", sub: "Hubtel merchant dashboard", usd: 600, status: "completed", date: "Last week" },
  { id: "t6", type: "payout", label: "MoMo withdrawal", sub: "Vodafone Cash · ••••8812", usd: 350, status: "pending", date: "Last week" },
];

const meta: Record<TxType, { icon: typeof ArrowDownLeft; color: string; sign: "+" | "-" }> = {
  escrow_release: { icon: ArrowDownLeft, color: "var(--cyan-brand)", sign: "+" },
  payout: { icon: ArrowUpRight, color: "#F87171", sign: "-" },
  escrow_hold: { icon: Lock, color: "var(--gold-brand)", sign: "+" },
  fee: { icon: ArrowUpRight, color: "#94A3B8", sign: "-" },
  deposit: { icon: ArrowDownLeft, color: "var(--cyan-brand)", sign: "+" },
};

function WalletPage() {
  const available = 1247.5;
  const pending = 320;
  const lifetime = 8420;

  return (
    <>
      <DevDashboardHeader title="Wallet" subtitle="Your balance, MoMo withdrawals, and full transaction history." />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl p-6" style={{
          background: "linear-gradient(135deg, rgba(0,198,167,0.18), rgba(13,27,42,0.6))",
          border: "1px solid rgba(0,198,167,0.30)",
        }}>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[color:var(--cyan-brand)]">
            <WalletIcon className="h-4 w-4" /> Available balance
          </div>
          <div className="mt-3 font-mono-nums text-[44px] font-bold leading-none text-[color:var(--foreground)]">{fmtGHS(available)}</div>
          <div className="mt-1 font-mono-nums text-[13px] text-[color:var(--text-secondary)]">≈ {fmtUSD(available)}</div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13.5px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98]">
              <Smartphone className="h-4 w-4" /> Withdraw to MoMo
            </button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)]" style={{ border: "1px solid var(--color-border)" }}>
              <Download className="h-4 w-4" /> Statement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">In escrow</div>
            <div className="mt-2 font-mono-nums text-[22px] font-bold text-[color:var(--gold-brand)]">{fmtUSD(970)}</div>
            <div className="text-[11px] text-[color:var(--text-muted)]">across 3 contracts</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Pending payout</div>
            <div className="mt-2 font-mono-nums text-[22px] font-bold text-white">{fmtUSD(pending)}</div>
            <div className="text-[11px] text-[color:var(--text-muted)]">arrives in 1–2 days</div>
          </div>
          <div className="col-span-2 rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Lifetime earned</div>
            <div className="mt-2 font-mono-nums text-[26px] font-bold text-white">{fmtUSD(lifetime)} <span className="text-[12px] font-normal text-[color:var(--text-muted)]">({fmtGHS(lifetime)})</span></div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h3 className="font-display text-[15px] font-semibold text-white">Recent transactions</h3>
          <div className="flex gap-1.5">
            {["All", "Income", "Withdrawals", "Fees"].map((f, i) => (
              <button key={f} className="h-7 rounded-full px-2.5 text-[11.5px]" style={{
                background: i === 0 ? "rgba(0,198,167,0.12)" : "transparent",
                color: i === 0 ? "var(--cyan-brand)" : "var(--text-muted)",
                border: "1px solid var(--color-border)",
              }}>{f}</button>
            ))}
          </div>
        </div>
        {txs.map((t) => {
          const m = meta[t.type];
          const Icon = m.icon;
          return (
            <div key={t.id} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="grid h-9 w-9 place-items-center rounded-full" style={{ background: `${m.color}22` }}>
                <Icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium text-white">{t.label}</div>
                <div className="truncate text-[11.5px] text-[color:var(--text-muted)]">{t.sub} · {t.date}</div>
              </div>
              <div className="text-right">
                <div className="font-mono-nums text-[14px] font-semibold" style={{ color: m.color }}>
                  {m.sign}{fmtUSD(t.usd)}
                </div>
                <div className="mt-0.5 text-[11px]">
                  <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{
                    background: t.status === "completed" ? "rgba(0,198,167,0.12)" : "rgba(245,166,35,0.15)",
                    color: t.status === "completed" ? "var(--cyan-brand)" : "var(--gold-brand)",
                  }}>{t.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}