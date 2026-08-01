import { useEffect, useState } from "react";
import { Sparkles, Clock, Users } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

type JobMatchItem = {
  id: string;
  clientName: string;
  clientVerified: boolean;
  title: string;
  durationLabel: string;
  proposalsCount: number;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  postedLabel: string;
};

const fmtGHS = (usd: number) =>
  `GHS ${(usd * 15.5).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function JobsForYou() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<JobMatchItem[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      setJobs([]);
      return;
    }

    let active = true;

    const loadJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, budget_min, budget_max, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (!active) return;

        const mapped = (data ?? []).map((item: any) => ({
          id: item.id,
          clientName: "Open Job",
          clientVerified: false,
          title: item.title || "Open role",
          durationLabel: "Flexible",
          proposalsCount: 0,
          budgetMinUsd: Number(item.budget_min ?? 0),
          budgetMaxUsd: Number(item.budget_max ?? 0),
          postedLabel: item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently posted",
        }));

        setJobs(mapped);
      } catch (error) {
        console.error("Failed to load jobs for you", error);
        if (active) setJobs([]);
      }
    };

    void loadJobs();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

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
        {jobs.length === 0 ? (
          <div className="rounded-[14px] p-5 text-[13px] text-[color:var(--text-muted)]" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            No matching jobs available right now.
          </div>
        ) : (
          jobs.map((j) => (
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
          ))
        )}
      </div>
    </section>
  );
}