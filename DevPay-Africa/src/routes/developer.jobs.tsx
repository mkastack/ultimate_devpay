import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  Sparkles,
  Zap,
  LayoutGrid,
  List,
} from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { JobBrowseCard, type BrowseJob } from "@/components/dev-dashboard/JobBrowseCard";
import { jobMatches } from "@/lib/dev-mock-data";
import { ProposalDialog } from "@/components/dev-dashboard/ProposalDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/developer/jobs")({
  head: () => ({ meta: [{ title: "Browse Jobs — DevPay Africa" }] }),
  component: JobsPage,
});

const catalog: BrowseJob[] = [
  ...jobMatches.map((j, i) => ({
    ...j,
    description: [
      "Real-time charts, exports, and role-based access for merchant partners across West Africa.",
      "Smooth onboarding with MoMo verification, KYC hooks, and push notifications.",
      "Component library, Storybook docs, and design tokens for a growing fintech team.",
    ][i],
    category: ["Fintech", "Mobile", "Design"][i],
    experienceLevel: (["Intermediate", "Expert", "Expert"] as const)[i],
    location: "Accra, Ghana",
    featured: i === 0,
  })),
  {
    id: "j4",
    clientName: "Spintex Mart",
    clientVerified: false,
    title: "POS system for chain of supermarkets",
    description: "Multi-branch inventory sync, offline-first checkout, and daily sales reports for retail staff.",
    skills: [
      { name: "React", match: true },
      { name: "Node.js", match: true },
      { name: "Postgres", match: true },
    ],
    durationLabel: "5 weeks",
    proposalsCount: 14,
    budgetMinUsd: 2200,
    budgetMaxUsd: 4000,
    postedLabel: "3h ago",
    category: "Web",
    experienceLevel: "Expert",
    location: "Kumasi, Ghana",
  },
  {
    id: "j5",
    clientName: "MoMo Pay",
    clientVerified: true,
    title: "Edge function for transaction reconciliation",
    description: "Automated matching of wallet ledger entries with partner settlement files and alerting.",
    skills: [
      { name: "TypeScript", match: true },
      { name: "Cloudflare", match: false },
      { name: "Postgres", match: true },
    ],
    durationLabel: "1 week",
    proposalsCount: 4,
    budgetMinUsd: 400,
    budgetMaxUsd: 800,
    postedLabel: "6h ago",
    category: "Fintech",
    experienceLevel: "Intermediate",
    location: "Remote",
    featured: true,
  },
  {
    id: "j6",
    clientName: "Korle Hospital",
    clientVerified: true,
    title: "Patient queue dashboard for clinic operations",
    description: "Waiting-room display, SMS reminders, and admin tools for outpatient scheduling.",
    skills: [
      { name: "React", match: true },
      { name: "Tailwind", match: true },
      { name: "Firebase", match: false },
    ],
    durationLabel: "3 weeks",
    proposalsCount: 7,
    budgetMinUsd: 900,
    budgetMaxUsd: 1600,
    postedLabel: "1d ago",
    category: "Web",
    experienceLevel: "Entry",
    location: "Accra, Ghana",
  },
];

const categories = ["All", "Web", "Mobile", "Fintech", "Data", "Design"] as const;
const levels = ["All", "Entry", "Intermediate", "Expert"] as const;
const sorts = ["Best match", "Newest", "Budget: High", "Budget: Low", "Fewest proposals"] as const;

function JobsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Best match");
  const [view, setView] = useState<"list" | "compact">("list");
  const [proposal, setProposal] = useState<null | { title: string; min: number; max: number }>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = catalog.filter((j) => {
      const qOk =
        !q.trim() ||
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.clientName.toLowerCase().includes(q.toLowerCase()) ||
        j.skills.some((s) => s.name.toLowerCase().includes(q.toLowerCase()));
      const catOk = cat === "All" || j.category === cat;
      const lvlOk = level === "All" || j.experienceLevel === level;
      return qOk && catOk && lvlOk;
    });

    const matchOf = (j: BrowseJob) =>
      j.skills.length ? j.skills.filter((s) => s.match).length / j.skills.length : 0;

    if (sort === "Best match") list = [...list].sort((a, b) => matchOf(b) - matchOf(a));
    else if (sort === "Newest") list = [...list];
    else if (sort === "Budget: High") list = [...list].sort((a, b) => b.budgetMaxUsd - a.budgetMaxUsd);
    else if (sort === "Budget: Low") list = [...list].sort((a, b) => a.budgetMinUsd - b.budgetMinUsd);
    else if (sort === "Fewest proposals") list = [...list].sort((a, b) => a.proposalsCount - b.proposalsCount);

    return list;
  }, [q, cat, level, sort]);

  const stats = useMemo(() => {
    const matches = catalog.filter((j) => j.skills.some((s) => s.match)).length;
    const featured = catalog.filter((j) => j.featured).length;
    return { total: catalog.length, matches, featured };
  }, []);

  return (
    <>
      <DevDashboardHeader
        title="Browse Jobs"
        subtitle={`${filtered.length} open roles · curated for African developers`}
      />

      {/* Stats strip */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Open roles", value: stats.total, icon: Briefcase, accent: "var(--cyan-brand)" },
          { label: "Skill matches", value: stats.matches, icon: Sparkles, accent: "var(--gold-brand)" },
          { label: "Featured today", value: stats.featured, icon: Zap, accent: "#a855f7" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <s.icon className="h-4 w-4" style={{ color: s.accent }} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
                {s.label}
              </span>
            </div>
            <div className="mt-1 font-mono-nums text-[22px] font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="mb-6 rounded-2xl p-4 sm:p-5"
        style={{
          background: "linear-gradient(180deg, color-mix(in oklab, var(--surface) 90%, var(--cyan-brand) 10%), var(--surface))",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, company, or skill…"
            className="h-11 w-full rounded-xl bg-[color:var(--background)] pl-10 pr-4 text-[14px] text-white outline-none ring-0 placeholder:text-[color:var(--text-muted)] focus:outline focus:outline-2 focus:outline-offset-0"
            style={{ border: "1px solid var(--color-border)", outlineColor: "var(--cyan-brand)" }}
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className="h-8 rounded-full px-3.5 text-[12px] font-medium transition-all"
                style={{
                  background: cat === c ? "var(--cyan-brand)" : "color-mix(in oklab, var(--background) 80%, transparent)",
                  color: cat === c ? "var(--background)" : "var(--text-secondary)",
                  border: `1px solid ${cat === c ? "var(--cyan-brand)" : "var(--color-border)"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wide text-[color:var(--text-muted)] sm:inline">
              Level
            </span>
            {levels.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setLevel(e)}
                className="h-8 rounded-full px-3 text-[12px] font-medium transition-colors"
                style={{
                  background: level === e ? "rgba(245,166,35,0.14)" : "transparent",
                  color: level === e ? "var(--gold-brand)" : "var(--text-muted)",
                  border: `1px solid ${level === e ? "rgba(245,166,35,0.35)" : "var(--color-border)"}`,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--text-muted)]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <label className="sr-only" htmlFor="job-sort">Sort jobs</label>
            <select
              id="job-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
              className="rounded-lg bg-[color:var(--background)] px-2.5 py-1.5 text-[12px] text-white outline-none"
              style={{ border: "1px solid var(--color-border)" }}
            >
              {sorts.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
            <button
              type="button"
              onClick={() => setView("list")}
              className="grid h-8 w-8 place-items-center rounded-md transition-colors"
              style={{
                background: view === "list" ? "var(--cyan-brand)" : "transparent",
                color: view === "list" ? "var(--background)" : "var(--text-muted)",
              }}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("compact")}
              className="grid h-8 w-8 place-items-center rounded-md transition-colors"
              style={{
                background: view === "compact" ? "var(--cyan-brand)" : "transparent",
                color: view === "compact" ? "var(--background)" : "var(--text-muted)",
              }}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
        >
          <div
            className="mb-4 grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: "rgba(0,198,167,0.1)", color: "var(--cyan-brand)" }}
          >
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">No jobs match your filters</h3>
          <p className="mt-2 max-w-sm text-[13px] text-[color:var(--text-muted)]">
            Try clearing search or choosing a different category. New roles are posted daily across Africa.
          </p>
          <button
            type="button"
            onClick={() => { setQ(""); setCat("All"); setLevel("All"); }}
            className="mt-5 rounded-xl px-4 py-2 text-[13px] font-semibold"
            style={{ background: "var(--cyan-brand)", color: "var(--background)" }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className={view === "compact" ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>
          {filtered.map((j) => (
            <JobBrowseCard
              key={j.id}
              job={j}
              saved={saved.has(j.id)}
              onToggleSave={() => {
                setSaved((prev) => {
                  const next = new Set(prev);
                  if (next.has(j.id)) {
                    next.delete(j.id);
                    toast("Removed from saved");
                  } else {
                    next.add(j.id);
                    toast.success("Saved for later");
                  }
                  return next;
                });
              }}
              onApply={() => setProposal({ title: j.title, min: j.budgetMinUsd, max: j.budgetMaxUsd })}
            />
          ))}
        </div>
      )}

      <ProposalDialog
        open={!!proposal}
        onOpenChange={(v) => !v && setProposal(null)}
        jobTitle={proposal?.title}
        suggestedBudget={proposal ? { min: proposal.min, max: proposal.max } : undefined}
      />
    </>
  );
}
