import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Building2, ShieldCheck, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/client/payouts")({
  head: () => ({ meta: [{ title: "Payout Settings — DevPay Africa" }] }),
  component: Payouts,
});

type PM = { id: string; method: string; provider: string | null; account_number: string; account_name: string; is_primary: boolean; is_verified: boolean };

function Payouts() {
  const { session } = useAuth();
  const [tab, setTab] = useState<"momo" | "bank">("momo");
  const [methods, setMethods] = useState<PM[]>([]);
  const [form, setForm] = useState({ provider: "MTN MoMo", account_number: "", account_name: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!session?.user) return;
    const { data } = await supabase.from("payout_methods").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setMethods((data as PM[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [session?.user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setBusy(true);
    const { error } = await supabase.from("payout_methods").insert({
      user_id: session.user.id,
      method: tab,
      provider: tab === "momo" ? form.provider : form.provider || "Bank",
      account_number: form.account_number,
      account_name: form.account_name,
      is_primary: methods.length === 0,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Payout method saved");
    setForm({ provider: tab === "momo" ? "MTN MoMo" : "", account_number: "", account_name: "" });
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1fr,300px] gap-6">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="font-display text-2xl font-bold">Payout Settings</h2></div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Configure how you receive your refunds and partner payments. DevPay Africa uses secure escrow protocols to ensure every payment is verified and delivered globally within 24 hours of approval.</p>

          <div className="mt-6 flex border-b border-border/60">
            <button onClick={() => setTab("momo")} className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === "momo" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Smartphone className="h-4 w-4" /> Mobile Money</button>
            <button onClick={() => setTab("bank")} className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === "bank" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Building2 className="h-4 w-4" /> Bank Transfer</button>
          </div>

          <form onSubmit={save} className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold">Primary Wallet Details</h3>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"><Lock className="h-3 w-3" /> Encrypted</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{tab === "momo" ? "Network Provider" : "Bank Name"}</Label>
                {tab === "momo" ? (
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
                    <option>MTN MoMo</option><option>AirtelTigo</option><option>Vodafone Cash</option><option>Orange Money</option>
                  </select>
                ) : (
                  <Input className="mt-1.5" placeholder="e.g. GTBank" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                )}
              </div>
              <div>
                <Label>{tab === "momo" ? "Wallet Number" : "Account / IBAN"}</Label>
                <Input required className="mt-1.5" placeholder={tab === "momo" ? "+233 24 XXX XXXX" : "GB29 NWBK …"} value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Account Holder Name (must match your ID)</Label>
                <Input required className="mt-1.5" placeholder="As it appears on your ID" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
                <div className="text-xs text-muted-foreground mt-1.5">Mismatched names will cause a delay in verification.</div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="submit" disabled={busy} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save & Verify Method"}
              </Button>
            </div>
          </form>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : methods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payout methods yet. Add one above to start receiving funds.</p>
            ) : (
              methods.map((m) => (
                <div key={m.id} className="rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
                      {m.method === "momo" ? <Smartphone className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    {m.is_verified ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/30 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/30">Pending</span>
                    )}
                  </div>
                  <div className="font-display text-lg font-bold mt-3">{m.provider ?? m.method}</div>
                  <div className="text-xs text-muted-foreground">{m.account_number}</div>
                  {m.is_primary && <div className="text-xs text-primary mt-1">Primary method</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "var(--gradient-hero, var(--gradient-primary))" }} />
            <ShieldCheck className="h-7 w-7 text-primary" />
            <div className="font-display text-lg font-bold mt-3">Security Notice</div>
            <p className="text-xs text-muted-foreground mt-2">For your protection, any changes to payout methods require 2FA verification and trigger a 24-hour security hold on withdrawals.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-sm space-y-3">
            <div className="font-display font-semibold">Common Questions</div>
            <div><div className="font-medium">How long do payouts take?</div><div className="text-xs text-muted-foreground">Mobile Money is typically instant; bank transfers within 24h.</div></div>
            <div><div className="font-medium">What are the fees?</div><div className="text-xs text-muted-foreground">DevPay Africa charges a flat 1% global processing fee.</div></div>
            <div><div className="font-medium">Global coverage?</div><div className="text-xs text-muted-foreground">Payouts to 40+ African nations through local partners.</div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
