import { MessageCircle, ArrowRight, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { contracts, conversations, fmtGHS, fmtGHSDecimal } from "@/lib/dev-mock-data";

const statusColor: Record<string, string> = {
  active: "var(--cyan-brand)",
  completed: "#818CF8",
  disputed: "var(--error)",
  paused: "var(--gold-brand)",
};

export function ContractsRow() {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[18px] font-semibold text-white">Active Contracts</h2>
          <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[color:var(--cyan-brand)] px-1.5 text-[11px] font-bold text-[color:var(--background)]">
            {contracts.length}
          </span>
        </div>
        <Link to="/developer/contracts" className="text-[13px] text-[color:var(--cyan-brand)] hover:underline">
          View all →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {contracts.map((c) => {
          const thread = conversations.find((m) => m.name === c.clientName)?.id;
          return (
          <article
            key={c.id}
            className="relative w-[285px] sm:w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-[3px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="h-[3px] w-full"
              style={{ background: statusColor[c.status] }}
            />
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--surface-hover)] text-[11px] font-bold text-[color:var(--cyan-brand)]">
                  {c.clientName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="text-[14px] font-semibold text-white">{c.clientName}</div>
                {c.clientVerified && (
                  <span
                    className="rounded-full px-2 py-[2px] text-[11px]"
                    style={{
                      background: "rgba(0,198,167,0.15)",
                      color: "var(--cyan-brand)",
                    }}
                  >
                    Verified ✓
                  </span>
                )}
              </div>

              <h3 className="mb-3 line-clamp-2 text-[16px] font-semibold leading-snug text-white">
                {c.title}
              </h3>

              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Milestone {c.milestoneCurrent} of {c.milestoneTotal}
                </div>
                <div className="mt-1.5 flex gap-[3px]">
                  {Array.from({ length: c.milestoneTotal }).map((_, i) => {
                    const done = i < c.milestoneCurrent - 1;
                    const active = i === c.milestoneCurrent - 1;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${active ? "animate-soft-pulse" : ""}`}
                        style={{
                          background: done || active ? "var(--cyan-brand)" : "var(--color-border)",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[12px] text-[color:var(--text-secondary)]">
                  {c.currentMilestoneLabel}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="font-mono-nums text-[18px] font-bold text-white">
                  {fmtGHS(c.agreedUsd)}
                </div>
                <div className="flex items-center gap-1 font-mono-nums text-[13px] text-[color:var(--gold-brand)]">
                  <Lock className="h-3 w-3" />
                  {fmtGHSDecimal(c.escrowUsd).replace("GHS ", "GHS ")} in escrow
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/developer/messages"
                  search={{ thread }}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold text-[color:var(--text-secondary)] transition-colors hover:text-white"
                  style={{
                    background: "var(--surface-hover)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Message
                </Link>
                <Link
                  to="/developer/contracts"
                  search={{ contract: c.id }}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[color:var(--cyan-brand)] text-[13px] font-semibold text-[color:var(--background)] transition-all hover:scale-[1.02] hover:shadow-cyan active:scale-[0.98]"
                >
                  View Contract <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}