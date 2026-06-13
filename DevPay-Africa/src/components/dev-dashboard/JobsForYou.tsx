import { Sparkles, Clock, Users } from "lucide-react";
import { jobMatches, fmtGHS } from "@/lib/dev-mock-data";

export function JobsForYou() {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[18px] font-semibold text-white">Jobs For You 🤖</h2>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)" }}
          >
            <Sparkles className="h-3 w-3" /> AI Matched
          </span>
        </div>
        <button type="button" className="text-[13px] text-[color:var(--cyan-brand)] hover:underline">
          Browse all jobs →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {jobMatches.map((j) => (
          <article
            key={j.id}
            className="flex flex-col sm:flex-row items-stretch gap-4 rounded-[14px] p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--surface-hover)] text-[11px] font-bold text-[color:var(--cyan-brand)]">
                    {j.clientName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <span className="text-[13px] text-[color:var(--text-secondary)]">{j.clientName}</span>
                  {j.clientVerified && (
                    <span
                      className="rounded-full px-1.5 py-[1px] text-[10px]"
                      style={{ background: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)" }}
                    >
                      Verified ✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[color:var(--text-muted)]">Posted {j.postedLabel}</div>
              </div>
              <h3 className="mb-2 text-[16px] font-semibold leading-snug text-white">{j.title}</h3>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full px-2.5 py-[3px] text-[12px]"
                    style={{
                      background: s.match ? "rgba(0,198,167,0.10)" : "var(--surface-hover)",
                      color: s.match ? "var(--cyan-brand)" : "var(--text-secondary)",
                      border: `1px solid ${s.match ? "rgba(0,198,167,0.30)" : "var(--color-border)"}`,
                    }}
                  >
                    {s.match ? "✓ " : ""}{s.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[color:var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {j.durationLabel}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {j.proposalsCount} proposals</span>
              </div>
            </div>
            <div
              className="flex flex-col gap-3 pt-3 border-t mt-3 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0 sm:mt-0 sm:pl-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between w-full sm:flex-col sm:items-end sm:justify-start gap-1">
                <span className="text-[11px] text-[color:var(--text-muted)] uppercase tracking-wider sm:hidden">Budget</span>
                <div className="font-mono-nums text-[15px] sm:text-[16px] font-bold text-[color:var(--cyan-brand)] text-right sm:text-right">
                  {fmtGHS(j.budgetMinUsd)} – {fmtGHS(j.budgetMaxUsd).replace("GHS ", "")}
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-[color:var(--gold-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5" /> Apply with AI
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}