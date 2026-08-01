import { useEffect, useState } from "react";
import { MessageCircle, ArrowRight, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

type ContractCard = {
  id: string;
  clientName: string;
  clientVerified: boolean;
  title: string;
  milestoneCurrent: number;
  milestoneTotal: number;
  currentMilestoneLabel: string;
  agreedUsd: number;
  escrowUsd: number;
  status: string;
};

const statusColor: Record<string, string> = {
  active: "var(--cyan-brand)",
  completed: "#818CF8",
  disputed: "var(--error)",
  paused: "var(--gold-brand)",
};

const fmtGHS = (usd: number) =>
  `GHS ${(usd * 15.5).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtGHSDecimal = (usd: number) =>
  `GHS ${(usd * 15.5).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ContractsRow() {
  const { session } = useAuth();
  const [contracts, setContracts] = useState<ContractCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setContracts([]);
      setLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        const { data: contractData, error: contractError } = await supabase
          .from("contracts")
          .select("id, status, agreed_amount, client_id, job_id, created_at")
          .eq("developer_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (contractError) throw contractError;

        const rows = (contractData ?? []) as Array<{
          id: string;
          status?: string | null;
          agreed_amount?: number | null;
          client_id?: string | null;
          job_id?: string | null;
        }>;

        const clientIds = rows.map((item) => item.client_id).filter(Boolean) as string[];
        const jobIds = rows.map((item) => item.job_id).filter(Boolean) as string[];

        const profileMap = new Map<string, { full_name?: string | null; is_verified?: boolean | null }>();
        const jobMap = new Map<string, { title?: string | null }>();

        if (clientIds.length > 0) {
          const { data: profileRows } = await supabase
            .from("profiles")
            .select("id, full_name, is_verified")
            .in("id", clientIds);

          (profileRows ?? []).forEach((row: { id: string; full_name?: string | null; is_verified?: boolean | null }) => {
            profileMap.set(row.id, row);
          });
        }

        if (jobIds.length > 0) {
          const { data: jobRows } = await supabase
            .from("jobs")
            .select("id, title")
            .in("id", jobIds);

          (jobRows ?? []).forEach((row: { id: string; title?: string | null }) => {
            jobMap.set(row.id, row);
          });
        }

        const mapped = rows.map((item) => {
          const rawStatus = String(item.status ?? "active").toLowerCase();
          const normalizedStatus =
            rawStatus === "in_progress" || rawStatus === "accepted" || rawStatus === "locked" || rawStatus === "funded"
              ? "active"
              : rawStatus;

          const agreedUsd = Number(item.agreed_amount ?? 0);
          const profile = profileMap.get(item.client_id ?? "");
          const job = jobMap.get(item.job_id ?? "");

          return {
            id: item.id,
            clientName: profile?.full_name || "Client",
            clientVerified: Boolean(profile?.is_verified),
            title: job?.title || "Project in progress",
            milestoneCurrent: normalizedStatus === "completed" ? 3 : 1,
            milestoneTotal: 3,
            currentMilestoneLabel:
              normalizedStatus === "completed"
                ? "Final review ready"
                : normalizedStatus === "paused"
                  ? "Paused for now"
                  : "Work in progress",
            agreedUsd,
            escrowUsd: Math.max(0, Math.round(agreedUsd * 0.35)),
            status: normalizedStatus,
          } satisfies ContractCard;
        });

        if (active) {
          setContracts(mapped);
        }
      } catch (error) {
        console.error("Failed to load contracts", error);
        if (active) {
          setContracts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

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

      {loading ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--surface)] px-4 py-5 text-[13px] text-[color:var(--text-muted)]">
          Loading contracts…
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--surface)] px-4 py-5 text-[13px] text-[color:var(--text-muted)]">
          No active contracts yet.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {contracts.map((c) => (
            <article
              key={c.id}
              className="relative w-[285px] sm:w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="h-[3px] w-full" style={{ background: statusColor[c.status] || statusColor.active }} />
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
                    {fmtGHSDecimal(c.escrowUsd)} in escrow
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/developer/messages"
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
          ))}
        </div>
      )}
    </section>
  );
}