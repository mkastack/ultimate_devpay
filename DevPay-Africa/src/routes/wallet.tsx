import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, FileText, Briefcase, Wallet as WalletIcon, User, Settings, ArrowDownToLine, Smartphone, CreditCard, Loader2, ShieldCheck, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { clientNav } from "./client";
import { developerNav } from "./developer";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — DevPay Africa" }] }),
  component: WalletPage,
});

type Tx = {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
};

type Wd = { id: string; amount: number; method: string; destination: string | null; status: string; created_at: string };

const badge: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/30",
  processing: "bg-accent/10 text-accent border-accent/30",
  pending: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

type MS = {
  id: string;
  job_id: string;
  title: string;
  amount: number;
  status: string;
  job?: { id: string; title: string; client_id: string } | null;
};

type Bucket = "escrow" | "pending" | "released";

function WalletPage() {
  const { ready } = useRequireAuth();
  const { session, profile } = useAuth();
  const nav = profile?.role === "developer" ? developerNav : clientNav;
  const [tx, setTx] = useState<Tx[]>([]);
  const [wd, setWd] = useState<Wd[]>([]);
  const [ms, setMs] = useState<MS[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [active, setActive] = useState<Bucket | null>(null);

  // withdraw form
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"momo" | "bank">("momo");
  const [destination, setDestination] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN MoMo");
  const [bankName, setBankName] = useState("GCB Bank");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!session?.user) return;
    setLoadingData(true);
    const [{ data: txs }, { data: wds }, { data: mss }] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawals").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("milestones").select("id,job_id,title,amount,status,job:jobs(id,title,client_id)").order("created_at", { ascending: false }),
    ]);
    setTx((txs as Tx[]) ?? []);
    setWd((wds as Wd[]) ?? []);
    setMs((mss as any[]) ?? []);
    setLoadingData(false);
  };

  useEffect(() => { refresh(); }, [session?.user]);

  const balance = tx.reduce((sum, t) => {
    if (t.status !== "completed") return sum;
    const sign = ["payment", "release", "deposit", "credit"].includes(t.type) ? 1 : -1;
    return sum + sign * Number(t.amount);
  }, 0)
    - wd.filter((w) => ["pending", "processing", "completed"].includes(w.status))
        .reduce((s, w) => s + Number(w.amount), 0);

  // Milestone-based buckets (drives clickable cards)
  const buckets = useMemo(() => {
    const inEscrow = ms.filter((m) => ["pending", "in_progress"].includes(m.status));
    const pending = ms.filter((m) => ["submitted", "approved"].includes(m.status));
    const released = ms.filter((m) => m.status === "released");
    const sum = (arr: MS[]) => arr.reduce((s, m) => s + Number(m.amount), 0);
    return {
      escrow: { items: inEscrow, total: sum(inEscrow) },
      pending: { items: pending, total: sum(pending) },
      released: { items: released, total: sum(released) },
    };
  }, [ms]);

  const lifetime = tx.filter((t) => t.status === "completed" && ["payment", "release", "deposit", "credit"].includes(t.type)).reduce((s, t) => s + Number(t.amount), 0);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error("Enter an amount"); return; }
    if (amt > balance) { toast.error("Amount exceeds available balance"); return; }
    setSubmitting(true);
    const providerStr = method === "momo" ? momoNetwork : bankName;
    const { error } = await supabase.from("withdrawals").insert({
      user_id: session.user.id,
      amount: amt,
      method: method === "momo" ? "Mobile Money" : "Bank Transfer",
      destination: `${providerStr} · ${destination}`,
      status: "pending",
      currency: "USD",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Withdrawal requested successfully! 💰");
    setOpen(false);
    setAmount(""); setDestination("");
    refresh();
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <DashboardShell nav={nav} title="Wallet">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)" }} />
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Available Balance (Dual Currency)
          </div>
          <div className="mt-3 space-y-1">
            <div className="font-display text-5xl font-black text-gradient-brand">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold text-muted-foreground font-sans">USD</span>
            </div>
            <div className="text-base font-display font-semibold text-foreground/80 flex items-center gap-1">
              <span>₵{(balance * 14.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-muted-foreground font-sans uppercase">GH₵ (1 USD = 14.50 GHS)</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[image:var(--gradient-primary)] text-primary-foreground" disabled={balance <= 0}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Withdraw funds</DialogTitle>
                  <DialogDescription>Request a payout. Available: ${balance.toFixed(2)} (₵{(balance * 14.5).toFixed(2)})</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div><Label>Amount (USD)</Label><Input required type="number" min="1" step="0.01" max={balance} className="mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                  <div>
                    <Label>Method</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button type="button" onClick={() => setMethod("momo")} className={`rounded-md border p-3 text-sm flex items-center gap-2 transition-colors ${method === "momo" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                        <Smartphone className="h-4 w-4" /> Mobile Money
                      </button>
                      <button type="button" onClick={() => setMethod("bank")} className={`rounded-md border p-3 text-sm flex items-center gap-2 transition-colors ${method === "bank" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                        <CreditCard className="h-4 w-4" /> Bank
                      </button>
                    </div>
                  </div>

                  {method === "momo" ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Select Mobile Money Network</Label>
                        <select
                          value={momoNetwork}
                          onChange={(e) => setMomoNetwork(e.target.value)}
                          className="w-full mt-1.5 rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                        >
                          <option value="MTN MoMo">MTN Mobile Money 🇬🇭</option>
                          <option value="Telecel Cash">Telecel Cash 🇬🇭</option>
                          <option value="AirtelTigo Money">AirtelTigo Money 🇬🇭</option>
                        </select>
                      </div>
                      <div>
                        <Label>Mobile Money Phone Number</Label>
                        <Input
                          required
                          className="mt-1.5 text-foreground"
                          placeholder="+233 24 000 0000"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Select Bank Name</Label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full mt-1.5 rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                        >
                          <option value="GCB Bank">GCB Bank (Ghana Commercial Bank)</option>
                          <option value="Ecobank Ghana">Ecobank Ghana</option>
                          <option value="Stanbic Bank">Stanbic Bank Ghana</option>
                          <option value="Absa Bank Ghana">Absa Bank Ghana</option>
                          <option value="Fidelity Bank">Fidelity Bank Ghana</option>
                        </select>
                      </div>
                      <div>
                        <Label>Account Number / IBAN</Label>
                        <Input
                          required
                          className="mt-1.5 text-foreground"
                          placeholder="GH12GCBB001002003004"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="submit" disabled={submitting} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : "Request payout"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Payment Status</div>
          <p className="text-[11px] text-muted-foreground mt-1">Click a status to see jobs and jump to the escrow timeline.</p>
          <div className="mt-3 space-y-2">
            {([
              { key: "escrow",   label: "In Escrow",         icon: ShieldCheck,  cls: { ring: "border-accent/50 bg-accent/10",     text: "text-accent" },  data: buckets.escrow },
              { key: "pending",  label: "Pending Approval",  icon: Clock,        cls: { ring: "border-warning/50 bg-warning/10",   text: "text-warning" }, data: buckets.pending },
              { key: "released", label: "Released Payouts",  icon: CheckCircle2, cls: { ring: "border-success/50 bg-success/10",   text: "text-success" }, data: buckets.released },
            ] as const).map(({ key, label, icon: Icon, cls, data }) => {
              const isOpen = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(isOpen ? null : key)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${isOpen ? cls.ring : "border-border/60 hover:bg-surface/60"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className={`h-4 w-4 ${cls.text}`} /> {label}
                      <span className="text-[11px] text-muted-foreground">({data.items.length})</span>
                    </div>
                    <div className={`font-semibold ${cls.text} flex items-center gap-1`}>
                      ${data.total.toFixed(2)}
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {active && (
            <div className="mt-3 rounded-xl border border-border/60 bg-surface/40 divide-y divide-border/40 max-h-56 overflow-y-auto">
              {buckets[active].items.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground">No jobs in this status yet.</p>
              ) : (
                buckets[active].items.map((m) => {
                  const job = m.job;
                  const isClient = job?.client_id === session?.user?.id;
                  const to = isClient ? "/client/projects/$jobId" : "/jobs/$jobId";
                  return (
                    <Link
                      key={m.id}
                      to={to}
                      params={{ jobId: m.job_id }}
                      hash="escrow"
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-surface transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{job?.title ?? "Untitled job"}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{m.title}</div>
                      </div>
                      <div className="text-sm font-semibold ml-3 whitespace-nowrap">${Number(m.amount).toFixed(2)}</div>
                    </Link>
                  );
                })
              )}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime</div>
            <div className="font-display text-xl font-bold">${lifetime.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Withdrawals */}
      <div className="rounded-2xl border border-border/60 bg-card mt-6 overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Withdrawals</h3>
          <span className="text-xs text-muted-foreground">{wd.length} total</span>
        </div>
        {loadingData ? (
          <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : wd.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">No withdrawals yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">Date</th><th className="text-left px-6 py-3">Method</th><th className="text-right px-6 py-3">Amount</th><th className="text-right px-6 py-3">Status</th></tr>
            </thead>
            <tbody>
              {wd.map((w) => (
                <tr key={w.id} className="border-t border-border/40">
                  <td className="px-6 py-4 text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{w.method}{w.destination ? ` · ${w.destination}` : ""}</td>
                  <td className="px-6 py-4 text-right font-semibold">-${Number(w.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right"><span className={`text-xs px-2.5 py-1 rounded-full border ${badge[w.status] ?? badge.pending}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-border/60 bg-card mt-6 overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h3 className="font-display text-lg font-semibold">Transaction History</h3>
        </div>
        {loadingData ? (
          <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : tx.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">No transactions yet. Once you start earning or paying, they'll show up here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">Date</th><th className="text-left px-6 py-3">Description</th><th className="text-right px-6 py-3">Amount</th><th className="text-right px-6 py-3">Status</th></tr>
            </thead>
            <tbody>
              {tx.map((t) => {
                const positive = ["payment", "release", "deposit", "credit"].includes(t.type);
                return (
                  <tr key={t.id} className="border-t border-border/40 hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{t.description ?? t.type}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${positive ? "text-success" : "text-foreground"}`}>{positive ? "+" : "-"}${Number(t.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right"><span className={`text-xs px-2.5 py-1 rounded-full border ${badge[t.status] ?? badge.pending}`}>{t.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
