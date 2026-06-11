import { Crown, Check, Zap, CreditCard, Sparkles } from "lucide-react";
import { developer } from "@/lib/dev-mock-data";

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
  const current = developer.subscription_plan;
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
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[12.5px] font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <CreditCard className="h-3.5 w-3.5" /> Manage billing
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = current === p.id || (current === "free" && p.id === "free");
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
    </section>
  );
}