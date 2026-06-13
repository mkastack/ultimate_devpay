
import { useState } from "react";
import { Crown, Check, Zap, CreditCard, Sparkles, Smartphone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { developer } from "@/lib/dev-mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const plans = [
  {
    id: "free",
    name: "Starter",
    priceUsd: 0,
    tagline: "Get started for free",
    features: ["5 proposals / month", "Standard payouts", "Community support"],
    accent: "var(--text-secondary)",
  },
  {
    id: "pro",
    name: "Pro Developer",
    priceUsd: 12,
    tagline: "Most popular",
    features: [
      "Unlimited AI proposals",
      "Lower 5% platform fee",
      "Priority MoMo payouts",
      "Featured profile badge",
    ],
    accent: "var(--cyan-brand)",
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    priceUsd: 29,
    tagline: "For top earners",
    features: [
      "Everything in Pro",
      "0% platform fee on first 5 jobs",
      "Dedicated account manager",
      "Early access to enterprise jobs",
    ],
    accent: "var(--gold-brand)",
  },
];

export function SubscriptionOffer() {
  const [currentPlan, setCurrentPlan] = useState(developer.subscription_plan);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [payMethod, setPayMethod] = useState<"card" | "momo" | "usdc">("card");
  
  // MoMo Details
  const [provider, setProvider] = useState("mtn");
  const [momoNumber, setMomoNumber] = useState("0551234567");

  // Payment Status
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeClick = (p: typeof plans[0]) => {
    setSelectedPlan(p);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setCurrentPlan(selectedPlan?.id as any);
      developer.subscription_plan = selectedPlan?.id as any;
    }, 1200);
  };

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[16px] font-bold text-white sm:text-[18px]">
            Plans & Billing
          </h2>
          <p className="text-[12.5px] text-[color:var(--text-muted)]">
            Upgrade to unlock more proposals, lower fees, and faster payouts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            alert("Manage billing layout configured. Under simulated sandbox.");
          }}
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[12.5px] font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <CreditCard className="h-3.5 w-3.5" /> Manage billing
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id || (currentPlan === "free" && p.id === "free");
          return (
            <div
              key={p.id}
              className="relative flex flex-col rounded-2xl p-4"
              style={{
                background: p.highlight
                  ? "linear-gradient(160deg, rgba(0,198,167,0.10), transparent 60%), var(--surface)"
                  : "var(--surface)",
                border: p.highlight
                  ? "1px solid rgba(0,198,167,0.35)"
                  : "1px solid var(--color-border)",
                boxShadow: p.highlight ? "0 10px 30px -18px rgba(0,198,167,0.55)" : "none",
              }}
            >
              {p.highlight && (
                <span
                  className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--cyan-brand)", color: "var(--background)" }}
                >
                  <Sparkles className="h-3 w-3" /> POPULAR
                </span>
              )}

              <div className="flex items-center gap-2">
                {p.id === "elite" ? (
                  <Crown className="h-4 w-4" style={{ color: p.accent }} />
                ) : p.id === "pro" ? (
                  <Zap className="h-4 w-4" style={{ color: p.accent }} />
                ) : (
                  <CreditCard className="h-4 w-4" style={{ color: p.accent }} />
                )}
                <div className="text-[13.5px] font-semibold text-white">{p.name}</div>
              </div>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-[26px] font-bold text-white">
                  ${p.priceUsd}
                </span>
                <span className="text-[12px] text-[color:var(--text-muted)]">/ month</span>
              </div>
              <div className="text-[11.5px] text-[color:var(--text-muted)]">{p.tagline}</div>

              <ul className="mt-3 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12.5px] text-[color:var(--text-secondary)]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: p.accent }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => handleUpgradeClick(p)}
                className="mt-4 h-9 w-full rounded-[10px] text-[13px] font-semibold transition-all active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
                style={
                  isCurrent
                    ? {
                        background: "var(--surface-hover)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--color-border)",
                      }
                    : p.highlight
                      ? {
                          background: "var(--cyan-brand)",
                          color: "var(--background)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--color-border)",
                        }
                }
              >
                {isCurrent ? "Current plan" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-[12px] text-[color:var(--text-muted)]"
        style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
      >
        <span className="inline-flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5" />
          Pay with Card, Mobile Money (MTN, Vodafone, AirtelTigo), or USDC.
        </span>
        <span>Cancel anytime · Prices in USD</span>
      </div>

      {/* Subscription Upgrade Checkout Dialog */}
      <Dialog open={selectedPlan !== null} onOpenChange={(open) => { if (!open) setSelectedPlan(null); }}>
        <DialogContent className="border-[var(--color-border)] bg-[var(--surface)] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              Upgrade to {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--text-secondary)]">
              Complete your subscription of ${selectedPlan?.priceUsd}/month.
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--cyan-brand)] mb-3" />
              <h4 className="text-lg font-semibold text-white">Upgrade Successful!</h4>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                You are now subscribed to the <strong>{selectedPlan?.name}</strong> plan. Features are unlocked immediately.
              </p>
              <button
                onClick={() => setSelectedPlan(null)}
                className="mt-6 w-full h-11 rounded-xl bg-[color:var(--cyan-brand)] text-[color:var(--background)] font-semibold"
              >
                Start Using Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "card", label: "Debit/Credit Card" },
                    { id: "momo", label: "Mobile Money" },
                    { id: "usdc", label: "USDC Crypto" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className="h-12 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                      style={{
                        background: payMethod === m.id ? "rgba(0,198,167,0.15)" : "transparent",
                        borderColor: payMethod === m.id ? "var(--cyan-brand)" : "var(--color-border)",
                        color: payMethod === m.id ? "var(--cyan-brand)" : "var(--text-secondary)",
                      }}
                    >
                      {m.id === "card" && <CreditCard className="h-4 w-4" />}
                      {m.id === "momo" && <Smartphone className="h-4 w-4" />}
                      {m.id === "usdc" && <ShieldCheck className="h-4 w-4" />}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="•••• •••• •••• 4242"
                      className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="•••"
                        className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "momo" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1.5">
                      MoMo Provider
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
                          className="h-10 rounded-lg border text-xs font-semibold transition-colors"
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 0551234567"
                      className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] px-3 text-sm text-white focus:outline-none focus:border-[var(--cyan-brand)] font-mono"
                    />
                  </div>
                </div>
              )}

              {payMethod === "usdc" && (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--surface-hover)] p-3 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                    Send exactly
                  </div>
                  <div className="text-xl font-bold font-mono text-[color:var(--cyan-brand)] mb-2">
                    {selectedPlan?.priceUsd}.00 USDC
                  </div>
                  <div className="text-[11px] text-[color:var(--text-muted)] truncate mb-2">
                    Network: Arbitrum One
                  </div>
                  <div className="text-[10px] bg-black/40 p-2 rounded text-[color:var(--text-secondary)] font-mono select-all truncate">
                    0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="h-11 rounded-lg bg-[color:var(--cyan-brand)] text-[color:var(--background)] px-5 text-sm font-semibold hover:shadow-cyan transition-shadow disabled:opacity-50"
                >
                  {isProcessing ? "Authorizing..." : `Pay $${selectedPlan?.priceUsd}.00`}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}