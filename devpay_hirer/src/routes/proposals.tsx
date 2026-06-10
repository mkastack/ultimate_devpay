import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import { proposalsByJob } from "@/lib/mock-data";
import { fmtGHS, initials } from "@/lib/format";
import { toast } from "sonner";
import { HireDialog, type HireTarget } from "@/components/client/HireDialog";

export const Route = createFileRoute("/proposals")({
  head: () => ({ meta: [{ title: "Proposals · DevPay Africa" }] }),
  component: ProposalsPage,
});

function ProposalsPage() {
  const navigate = useNavigate();
  const [target, setTarget] = useState<HireTarget | null>(null);
  const [open, setOpen] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      toast.success(next.has(id) ? "Added to shortlist" : "Removed from shortlist");
      return next;
    });
  };

  const openHire = (
    proposalId: string,
    jobId: string,
    jobTitle: string,
    devName: string,
    bid: number,
    days: number,
  ) => {
    setTarget({ proposalId, jobId, jobTitle, developerName: devName, suggestedBid: bid, suggestedDays: days });
    setOpen(true);
  };


  return (
    <DashboardLayout>
      <TopBar title="Proposals" subtitle="Review and hire developers" />

      <div className="space-y-7">
        {proposalsByJob.map((g) => (
          <div key={g.job_id}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">{g.job_title}</h2>
              <span
                className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
              >
                {g.proposals.length} proposals
              </span>
            </div>
            <div className="space-y-3">
              {g.proposals.map((p) => {
                const isShortlisted = shortlisted.has(p.id);
                return (
                <div
                  key={p.id}
                  className="rounded-xl border bg-card p-4 sm:p-5 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                        style={{
                          borderColor: "var(--cyan)",
                          background: "rgba(0,198,167,0.10)",
                          color: "var(--cyan)",
                        }}
                      >
                        {initials(p.dev.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{p.dev.name}</span>
                          <span className="font-mono text-[12px]" style={{ color: "var(--gold)" }}>
                            ⭐ {p.dev.rating} · {p.dev.jobs} jobs
                          </span>
                          {p.ai_generated && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
                            >
                              ✨ AI Assisted
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            🤖 AI Match:
                          </span>
                          <div
                            className="h-1.5 max-w-[200px] flex-1 overflow-hidden rounded-full"
                            style={{ background: "var(--card-hover)" }}
                          >
                            <div
                              className="h-full"
                              style={{
                                width: `${p.ai_match}%`,
                                background: "linear-gradient(90deg, #00C6A7, #0087FF)",
                              }}
                            />
                          </div>
                          <span className="font-mono text-[12px] font-bold" style={{ color: "var(--cyan)" }}>
                            {p.ai_match}%
                          </span>
                        </div>
                        <p className="mt-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                          {p.preview}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 border-t sm:border-t-0 pt-3 sm:pt-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="font-mono text-lg font-bold text-foreground">{fmtGHS(p.bid)}</div>
                        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                          {p.days} days · {p.hours_ago}h ago
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleShortlist(p.id)}
                          className="h-9 rounded-md border px-3 text-[12px] font-semibold transition-colors"
                          style={{
                            borderColor: "var(--gold)",
                            color: isShortlisted ? "var(--background)" : "var(--gold)",
                            background: isShortlisted ? "var(--gold)" : "transparent",
                          }}
                        >
                          {isShortlisted ? "★ Shortlisted" : "★ Shortlist"}
                        </button>
                        <button
                          onClick={() => openHire(p.id, g.job_id, g.job_title, p.dev.name, p.bid, p.days)}
                          className="h-9 rounded-md px-4 text-[12px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
                          style={{ color: "var(--background)" }}
                        >
                          Hire Now →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <HireDialog
        open={open}
        onOpenChange={setOpen}
        target={target}
        onSuccess={(r) => navigate({ to: "/contracts", search: { hire: r.hire_id } as any })}
      />
    </DashboardLayout>
  );
}

