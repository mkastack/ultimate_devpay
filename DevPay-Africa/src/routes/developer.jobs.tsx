import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, BadgeCheck, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { jobMatches, fmtUSD } from "@/lib/dev-mock-data";
import { ProposalDialog } from "@/components/dev-dashboard/ProposalDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/developer/jobs")({
  head: () => ({ meta: [{ title: "Browse Jobs — DevPay Africa" }] }),
  component: JobsPage,
});

const extra = [
  { id: "j4", clientName: "Spintex Mart", clientVerified: false, title: "POS system for chain of supermarkets", skills: [{ name: "React", match: true }, { name: "Node.js", match: true }, { name: "Postgres", match: true }], durationLabel: "5 weeks", proposalsCount: 14, budgetMinUsd: 2200, budgetMaxUsd: 4000, postedLabel: "3h ago" },
  { id: "j5", clientName: "MoMo Pay", clientVerified: true, title: "Edge function for transaction reconciliation", skills: [{ name: "TypeScript", match: true }, { name: "Cloudflare", match: false }, { name: "Postgres", match: true }], durationLabel: "1 week", proposalsCount: 4, budgetMinUsd: 400, budgetMaxUsd: 800, postedLabel: "6h ago" },
  { id: "j6", clientName: "Korle Hospital", clientVerified: true, title: "Patient queue dashboard for clinic operations", skills: [{ name: "React", match: true }, { name: "Tailwind", match: true }, { name: "Firebase", match: false }], durationLabel: "3 weeks", proposalsCount: 7, budgetMinUsd: 900, budgetMaxUsd: 1600, postedLabel: "1d ago" },
];
const allJobs = [...jobMatches, ...extra];

const categories = ["All", "Web", "Mobile", "Fintech", "Data", "Design"] as const;
const exp = ["All", "Entry", "Intermediate", "Expert"] as const;

function JobsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [level, setLevel] = useState<(typeof exp)[number]>("All");
  const [proposal, setProposal] = useState<null | { title: string; min: number; max: number }>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => allJobs.filter((j) => (!q.trim() || j.title.toLowerCase().includes(q.toLowerCase()))),
    [q],
  );

  return (
    <>
      <DevDashboardHeader title="Browse Jobs" subtitle={`${filtered.length} jobs matched to your skills`} />

      <div className="mb-5 rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for jobs by title, skill, or company…"
              className="h-10 w-full rounded-[10px] bg-[color:var(--background)] pl-9 pr-3 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className="h-9 rounded-full px-3 text-[12.5px] font-medium transition-colors" style={{
                background: cat === c ? "var(--cyan-brand)" : "var(--background)",
                color: cat === c ? "var(--background)" : "var(--text-secondary)",
                border: "1px solid var(--color-border)",
              }}>{c}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {exp.map((e) => (
              <button key={e} type="button" onClick={() => setLevel(e)} className="h-9 rounded-full px-3 text-[12.5px] font-medium transition-colors" style={{
                background: level === e ? "rgba(245,166,35,0.15)" : "transparent",
                color: level === e ? "var(--gold-brand)" : "var(--text-muted)",
                border: "1px solid var(--color-border)",
              }}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((j) => (
          <article key={j.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--text-secondary)]">
                  {j.clientName}
                  {j.clientVerified && <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />}
                  <span className="text-[color:var(--text-muted)]">· {j.postedLabel}</span>
                </div>
                <h3 className="mt-1 text-[15.5px] font-semibold text-white">{j.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {j.skills.map((s) => (
                    <span key={s.name} className="rounded-full px-2.5 py-0.5 text-[11.5px]" style={{
                      background: s.match ? "rgba(0,198,167,0.12)" : "var(--surface-hover)",
                      color: s.match ? "var(--cyan-brand)" : "var(--text-secondary)",
                      border: s.match ? "1px solid rgba(0,198,167,0.25)" : "1px solid transparent",
                    }}>
                      {s.match && "✓ "}{s.name}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[color:var(--text-muted)]">
                  <span>{j.durationLabel}</span>
                  <span>{j.proposalsCount} proposals</span>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <div className="font-mono-nums text-[15px] font-bold text-[color:var(--gold-brand)]">{fmtUSD(j.budgetMinUsd)} – {fmtUSD(j.budgetMaxUsd)}</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSaved((s) => {
                        const n = new Set(s);
                        if (n.has(j.id)) { n.delete(j.id); toast("Removed from saved"); }
                        else { n.add(j.id); toast.success("Saved for later"); }
                        return n;
                      });
                    }}
                    className="grid h-9 w-9 place-items-center rounded-[10px] hover:text-[color:var(--cyan-brand)]"
                    style={{ border: "1px solid var(--color-border)", color: saved.has(j.id) ? "var(--cyan-brand)" : "var(--text-muted)" }}
                    aria-label="Save"
                  >
                    <Bookmark className="h-4 w-4" fill={saved.has(j.id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProposal({ title: j.title, min: j.budgetMinUsd, max: j.budgetMaxUsd })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Submit Proposal <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <ProposalDialog
        open={!!proposal}
        onOpenChange={(v) => !v && setProposal(null)}
        jobTitle={proposal?.title}
        suggestedBudget={proposal ? { min: proposal.min, max: proposal.max } : undefined}
      />
    </>
  );
}