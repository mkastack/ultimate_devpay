import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Lock, Smartphone, Wallet as WalletIcon, Download, CheckCircle2, Loader2 } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { fmtUSD, fmtGHS } from "@/lib/dev-mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/developer/wallet")({
  head: () => ({ meta: [{ title: "Wallet — DevPay Africa" }] }),
  component: WalletPage,
});

type TxType = "escrow_release" | "payout" | "escrow_hold" | "fee" | "deposit";

interface Transaction {
  id: string;
  type: TxType;
  label: string;
  sub: string;
  usd: number;
  status: "completed" | "pending";
  date: string;
}

const meta: Record<TxType, { icon: any; color: string; sign: "+" | "-" }> = {
  escrow_release: { icon: ArrowDownLeft, color: "var(--cyan-brand)", sign: "+" },
  payout: { icon: ArrowUpRight, color: "#F87171", sign: "-" },
  escrow_hold: { icon: Lock, color: "var(--gold-brand)", sign: "+" },
  fee: { icon: ArrowUpRight, color: "#94A3B8", sign: "-" },
  deposit: { icon: ArrowDownLeft, color: "var(--cyan-brand)", sign: "+" },
};

function WalletPage() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");

  const [walletRow, setWalletRow] = useState<any>(null);

  // Dialog states
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [momoNumber, setMomoNumber] = useState("0551234567");
  const [provider, setProvider] = useState("mtn");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawInProgress, setWithdrawInProgress] = useState(false);

  const [statementOpen, setStatementOpen] = useState(false);
  const [statementMonth, setStatementMonth] = useState("June 2026");

  const fetchData = async () => {
    if (!userId) return;
    try {
      // 1. Fetch wallet
      let walletData = null;
      const { data: byUserId, error: errUserId } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!errUserId && byUserId) {
        walletData = byUserId;
      } else {
        const { data: byId } = await supabase
          .from("wallets")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (byId) {
          walletData = byId;
        }
      }

      if (walletData) {
        setWalletRow(walletData);
        const balKey = Object.keys(walletData).find(k => ["balance", "balance_usd", "available_balance", "balanceusd"].includes(k.toLowerCase()));
        const pendKey = Object.keys(walletData).find(k => ["pending", "pending_balance", "pending_amount", "pendingamount"].includes(k.toLowerCase()));
        const lifeKey = Object.keys(walletData).find(k => ["lifetime", "lifetime_earned", "lifetimeearned"].includes(k.toLowerCase()));

        setBalance(Number(balKey ? walletData[balKey] : 0));
        setPending(Number(pendKey ? walletData[pendKey] : 0));
        setLifetime(Number(lifeKey ? walletData[lifeKey] : 0));
      }

      // 2. Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      const mappedTxs: Transaction[] = (txData || []).map((t: any) => {
        const rawType = (t.type || "").toLowerCase();
        let type: TxType = "escrow_release";
        if (rawType.includes("release") || rawType === "income") type = "escrow_release";
        else if (rawType.includes("payout") || rawType.includes("withdraw")) type = "payout";
        else if (rawType.includes("hold") || rawType.includes("escrow")) type = "escrow_hold";
        else if (rawType.includes("fee")) type = "fee";
        else if (rawType.includes("deposit")) type = "deposit";

        return {
          id: t.id || String(Math.random()),
          type,
          label: t.label || t.description || (type === "payout" ? "MoMo withdrawal" : "Transaction"),
          sub: t.sub || (t.description && t.description !== t.label ? t.description : "") || (type === "payout" ? "MTN MoMo" : "Processed"),
          usd: Number(t.amount ?? t.usd ?? t.usd_amount ?? 0),
          status: t.status === "pending" ? "pending" : "completed",
          date: t.created_at ? new Date(t.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "Just now",
        };
      });

      setTxList(mappedTxs);

      if (walletData && !walletData.lifetime && !walletData.lifetime_earned && !walletData.lifetimeearned) {
        const calculatedLifetime = mappedTxs
          .filter(t => t.type === "escrow_release" || t.type === "deposit")
          .reduce((sum, t) => sum + t.usd, 0);
        setLifetime(calculatedLifetime);
      }
    } catch (err) {
      console.error("[wallet] load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchData();

    // Subscribe to transactions
    const ch = supabase
      .channel("wallet-transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, authLoading]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");

    const amountUSD = parseFloat(withdrawAmount);
    if (!amountUSD || amountUSD <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }

    if (amountUSD > balance) {
      setWithdrawError("Insufficient balance.");
      return;
    }

    if (!momoNumber || momoNumber.length < 9) {
      setWithdrawError("Please enter a valid Mobile Money number.");
      return;
    }

    setWithdrawInProgress(true);

    try {
      const providerName = provider === "mtn" ? "MTN MoMo" : provider === "telecel" ? "Telecel Cash" : "AirtelTigo Money";
      const last4 = momoNumber.slice(-4);
      const description = `MoMo withdrawal to ${providerName} · ••••${last4}`;

      // Insert transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        amount: amountUSD,
        type: "payout",
        description: description,
        status: "completed"
      });

      if (txError) throw txError;

      // Update wallet balance
      if (walletRow) {
        const balKey = Object.keys(walletRow).find(k => ["balance", "balance_usd", "available_balance", "balanceusd"].includes(k.toLowerCase())) || "balance";
        const newBalance = balance - amountUSD;
        const keyField = walletRow.user_id ? "user_id" : "id";

        const { error: walletUpdateErr } = await supabase
          .from("wallets")
          .update({ [balKey]: newBalance })
          .eq(keyField, userId);

        if (walletUpdateErr) throw walletUpdateErr;
      }

      setWithdrawSuccess(true);
      setWithdrawAmount("");
      toast.success("Withdrawal completed");
      fetchData();
    } catch (err: any) {
      console.error("[withdrawal] failed:", err);
      setWithdrawError(err.message || "Failed to process withdrawal. Please try again.");
      toast.error("Withdrawal failed");
    } finally {
      setWithdrawInProgress(false);
    }
  };

  const handleDownloadStatement = () => {
    setStatementOpen(false);
    const element = document.createElement("a");
    const file = new Blob([`DevPay Africa Statement - ${statementMonth}\nBalance: ${fmtGHS(balance)} (${fmtUSD(balance)})\n\nTransactions:\n` + 
      txList.map(t => `${t.date} - ${t.label} (${t.sub}): - $${t.usd}`).join("\n")
    ], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = `DevPay_Statement_${statementMonth.replace(" ", "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredTxs = txList.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Income") return t.type === "escrow_release" || t.type === "deposit";
    if (filter === "Withdrawals") return t.type === "payout";
    if (filter === "Fees") return t.type === "fee";
    return true;
  });

  if (loading || authLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--cyan-brand)]" />
      </div>
    );
  }

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
          <div className="mt-3 font-mono-nums text-[30px] xs:text-[44px] font-bold leading-none text-[color:var(--foreground)]">{fmtGHS(balance)}</div>
          <div className="mt-1 font-mono-nums text-[13px] text-[color:var(--text-secondary)]">≈ {fmtUSD(balance)}</div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setWithdrawSuccess(false);
                setWithdrawError("");
                setWithdrawOpen(true);
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13.5px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98]"
            >
              <Smartphone className="h-4 w-4" /> Withdraw to MoMo
            </button>
            <button
              onClick={() => setStatementOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)]"
              style={{ border: "1px solid var(--color-border)" }}
            >
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h3 className="font-display text-[15px] font-semibold text-white">Recent transactions</h3>
          <div className="flex flex-wrap gap-1.5">
            {["All", "Income", "Withdrawals", "Fees"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="h-7 rounded-full px-2.5 text-[11.5px] transition-colors"
                style={{
                  background: filter === f ? "rgba(0,198,167,0.12)" : "transparent",
                  color: filter === f ? "var(--cyan-brand)" : "var(--text-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {filteredTxs.length === 0 ? (
          <div className="py-8 text-center text-sm text-[color:var(--text-muted)]">No transactions found matching this filter.</div>
        ) : (
          filteredTxs.map((t) => {
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
          })
        )}
      </div>

      {/* MoMo Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="border-[var(--color-border)] bg-[var(--surface)] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Mobile Money Withdrawal
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--text-secondary)]">
              Instantly withdraw funds directly to your preferred mobile wallet.
            </DialogDescription>
          </DialogHeader>

          {withdrawSuccess ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--cyan-brand)] mb-3" />
              <h4 className="text-lg font-semibold text-white">Withdrawal Initiated!</h4>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                The funds have been sent successfully to your wallet. It may take up to 5 minutes to reflect.
              </p>
              <button
                onClick={() => setWithdrawOpen(false)}
                className="mt-6 w-full h-11 rounded-xl bg-[color:var(--cyan-brand)] text-[color:var(--background)] font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 py-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1.5">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mtn", label: "MTN MoMo" },
                    { id: "telecel", label: "Telecel" },
                    { id: "airteltigo", label: "AirtelTigo" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className="h-11 rounded-lg border text-xs font-semibold transition-colors"
                      style={{
                        background: provider === p.id ? "rgba(0,198,167,0.15)" : "transparent",
                        borderColor: provider === p.id ? "var(--cyan-brand)" : "var(--color-border)",
                        color: provider === p.id ? "var(--cyan-brand)" : "var(--text-secondary)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1.5">
                  Mobile Money Number
                </label>
                <input
                  type="text"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="e.g. 0551234567"
                  className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                    Amount (USD)
                  </label>
                  <span className="text-[11px] text-[color:var(--text-muted)] font-mono">
                    Max: ${balance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[color:var(--text-muted)] font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] pl-8 pr-16 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(balance.toFixed(2))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--cyan-brand)] hover:underline"
                  >
                    Use Max
                  </button>
                </div>
                {withdrawAmount && (
                  <p className="mt-1 text-xs text-[color:var(--text-muted)] font-mono">
                    ≈ {fmtGHS(parseFloat(withdrawAmount) || 0)}
                  </p>
                )}
              </div>

              {withdrawError && (
                <p className="text-xs text-red-400 font-semibold">{withdrawError}</p>
              )}

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  disabled={withdrawInProgress}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[color:var(--cyan-brand)] text-[color:var(--background)] px-5 text-sm font-semibold hover:shadow-cyan transition-shadow flex items-center justify-center gap-2"
                  disabled={withdrawInProgress}
                >
                  {withdrawInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Statement Download Dialog */}
      <Dialog open={statementOpen} onOpenChange={setStatementOpen}>
        <DialogContent className="border-[var(--color-border)] bg-[var(--surface)] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-[color:var(--cyan-brand)]" /> Download Statement
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--text-secondary)]">
              Choose the statement period you want to download.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1.5">
                Select Month
              </label>
              <select
                value={statementMonth}
                onChange={(e) => setStatementMonth(e.target.value)}
                className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)]"
              >
                <option value="June 2026">June 2026</option>
                <option value="May 2026">May 2026</option>
                <option value="April 2026">April 2026</option>
                <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
                <option value="Full Year 2025">Full Year 2025</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <button
                onClick={() => setStatementOpen(false)}
                className="h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadStatement}
                className="h-11 rounded-lg bg-[color:var(--cyan-brand)] text-[color:var(--background)] px-5 text-sm font-semibold hover:shadow-cyan transition-shadow"
              >
                Download TXT
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}