import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { proposalsByJob } from "@/lib/hirer-mock-data";
import { fmtGHS, initials } from "@/lib/hirer-format";
import { toast } from "sonner";
import { HireDialog, type HireTarget } from "@/components/hirer-dashboard/HireDialog";
import { DeveloperProfileDialog } from "@/components/hirer-dashboard/DeveloperProfileDialog";
import { getHirerDeveloperByName, type HirerDeveloper } from "@/lib/hirer-developer-catalog";
import { hireTargetFromDeveloper } from "@/lib/hirer-hire-flow";

export const Route = createFileRoute("/client/proposals")({
  head: () => ({ meta: [{ title: "Proposals · DevPay Africa" }] }),
  component: ProposalsPage,
});

function ProposalsPage() {
  const navigate = useNavigate();
  const [target, setTarget] = useState<HireTarget | null>(null);
  const [open, setOpen] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [profileDev, setProfileDev] = useState<HirerDeveloper | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
    <>
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
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full">
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
                          <span className="font-mono text-[12px] whitespace-nowrap" style={{ color: "var(--gold)" }}>
                            ⭐ {p.dev.rating} · {p.dev.jobs} jobs
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {p.ai_generated && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
                            >
                              ✨ AI Assisted
                            </span>
                          )}
                          <span className="text-[11px] text-[color:var(--text-muted)] sm:hidden">
                            Posted {p.hours_ago}h ago
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 w-full">
                          <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>
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
                          <span className="font-mono text-[12px] font-bold text-[color:var(--cyan)] shrink-0">
                            {p.ai_match}%
                          </span>
                        </div>
                        <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--text-secondary)]">
                          {p.preview}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full flex-row items-center justify-between gap-3 border-t pt-3 mt-1 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0 sm:mt-0 sm:w-auto shrink-0" style={{ borderColor: "var(--border)" }}>
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-base font-bold text-foreground">{fmtGHS(p.bid)}</div>
                        <div className="text-[12px] text-[color:var(--text-secondary)] whitespace-nowrap">
                          {p.days} days <span className="hidden sm:inline">· {p.hours_ago} hrs ago</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const dev = getHirerDeveloperByName(p.dev.name);
                            if (dev) { setProfileDev(dev); setProfileOpen(true); }
                          }}
                          className="h-8 rounded-md border px-2.5 text-[11px] font-semibold transition-colors"
                          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => openHire(p.id, g.job_id, g.job_title, p.dev.name, p.bid, p.days)}
                          className="h-8 rounded-md px-3 text-[11px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold text-[color:var(--background)]"
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
        onSuccess={(r) => navigate({ to: "/client/contracts", search: { hire: r.hire_id } as any })}
      />
      <DeveloperProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        developer={profileDev}
        onHire={
          profileDev
            ? () => {
                setTarget(hireTargetFromDeveloper(profileDev));
                setOpen(true);
              }
            : undefined
        }
      />
    </>
  );
}

