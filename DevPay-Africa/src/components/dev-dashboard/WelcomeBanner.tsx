import { ArrowRight } from "lucide-react";
import { developer, counts, greeting } from "@/lib/dev-mock-data";

export function WelcomeBanner() {
  const firstName = developer.full_name.split(" ")[0];

  return (
    <div
      className="force-white relative mb-7 overflow-hidden rounded-[20px] px-8 py-7"
      style={{
        background:
          "linear-gradient(135deg, #1A4A2E 0%, #0F2A1E 50%, #0A1F16 100%)",
        border: "1px solid rgba(0,198,167,0.15)",
      }}
    >
      {/* Decorative bracket+shield SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2"
        width="180" height="180" viewBox="0 0 180 180" fill="none"
        style={{ opacity: 0.08 }}
      >
        <path d="M55 30 L25 90 L55 150" stroke="#00C6A7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M125 30 L155 90 L125 150" stroke="#00C6A7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M90 50 L60 65 V100 C60 125 75 140 90 145 C105 140 120 125 120 100 V65 Z" stroke="#00C6A7" strokeWidth="6" fill="none" strokeLinejoin="round" />
      </svg>

      {/* Pro badge top-right */}
      {developer.subscription_plan === "pro" && (
        <span
          className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: "rgba(245,166,35,0.15)",
            border: "1px solid rgba(245,166,35,0.30)",
            color: "var(--gold-brand)",
          }}
        >
          ⭐ Pro Developer
        </span>
      )}

      <div className="relative z-10 max-w-[60%]">
        <div className="font-display text-[26px] font-bold text-white">
          {greeting()}, {firstName} 👋
        </div>
        <div className="mt-2 text-[15px] text-white/70">
          You have {counts.pendingProposals} pending proposals and {counts.activeContracts} active contracts.
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--cyan-brand)] px-5 text-[14px] font-semibold text-[color:var(--background)] transition-all hover:scale-[1.02] hover:shadow-cyan active:scale-[0.98]"
          >
            Browse New Jobs <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}