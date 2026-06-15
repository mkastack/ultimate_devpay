import {
  BadgeCheck,
  Bookmark,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { fmtGHS, fmtUSD } from "@/lib/dev-mock-data";

export type BrowseJob = {
  id: string;
  clientName: string;
  clientVerified: boolean;
  title: string;
  description: string;
  skills: { name: string; match: boolean }[];
  durationLabel: string;
  proposalsCount: number;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  postedLabel: string;
  category: string;
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  location?: string;
  featured?: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function matchScore(skills: BrowseJob["skills"]) {
  if (!skills.length) return 0;
  return Math.round((skills.filter((s) => s.match).length / skills.length) * 100);
}

const levelStyles: Record<BrowseJob["experienceLevel"], { bg: string; color: string }> = {
  Entry: { bg: "rgba(56,189,248,0.12)", color: "#38bdf8" },
  Intermediate: { bg: "rgba(245,166,35,0.12)", color: "var(--gold-brand)" },
  Expert: { bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
};

export function JobBrowseCard({
  job,
  saved,
  onToggleSave,
  onApply,
}: {
  job: BrowseJob;
  saved: boolean;
  onToggleSave: () => void;
  onApply: () => void;
}) {
  const score = matchScore(job.skills);
  const highMatch = score >= 66;
  const level = levelStyles[job.experienceLevel];

  return (
    <article
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(145deg, color-mix(in oklab, var(--surface) 96%, white 4%), var(--surface))",
        border: highMatch
          ? "1px solid color-mix(in oklab, var(--cyan-brand) 35%, var(--color-border))"
          : "1px solid var(--color-border)",
        boxShadow: highMatch
          ? "0 0 0 1px rgba(0,198,167,0.06), 0 12px 40px -24px rgba(0,198,167,0.25)"
          : "0 8px 32px -24px rgba(0,0,0,0.45)",
      }}
    >
      {job.featured && (
        <div
          className="absolute right-0 top-0 rounded-bl-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            background: "linear-gradient(135deg, var(--gold-brand), #f59e0b)",
            color: "var(--background)",
          }}
        >
          Featured
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            {/* Client row */}
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-[12px] font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(0,198,167,0.2), rgba(99,102,241,0.2))",
                  color: "var(--cyan-brand)",
                  border: "1px solid rgba(0,198,167,0.2)",
                }}
              >
                {initials(job.clientName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[color:var(--text-secondary)]">
                    {job.clientName}
                  </span>
                  {job.clientVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[color:var(--cyan-brand)]">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                </div>
                {job.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[color:var(--text-muted)]">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </div>
                )}
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:ml-0">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                >
                  {job.category}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: level.bg, color: level.color }}
                >
                  {job.experienceLevel}
                </span>
              </div>
            </div>

            {/* Title & description */}
            <h3 className="font-display text-[17px] font-semibold leading-snug text-white sm:text-[18px]">
              {job.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--text-muted)]">
              {job.description}
            </p>

            {/* Skills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                  style={{
                    background: s.match ? "rgba(0,198,167,0.1)" : "color-mix(in oklab, var(--surface-hover) 80%, transparent)",
                    color: s.match ? "var(--cyan-brand)" : "var(--text-secondary)",
                    border: `1px solid ${s.match ? "rgba(0,198,167,0.22)" : "var(--color-border)"}`,
                  }}
                >
                  {s.match ? "✓" : "○"} {s.name}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[color:var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {job.durationLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {job.proposalsCount} proposals
              </span>
              <span>Posted {job.postedLabel}</span>
            </div>
          </div>

          {/* Right column: match + budget + actions */}
          <div className="flex w-full shrink-0 flex-col gap-4 border-t pt-4 lg:w-[220px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5"
            style={{ borderColor: "var(--color-border)" }}
          >
            {/* Match + Budget Row (flex layout that stacks on mobile, aligns side-by-side on tablet, and stacks on desktop) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-4">
              {/* Match Badge */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 shrink-0 justify-center sm:justify-start lg:justify-center"
                style={{
                  background: highMatch ? "rgba(0,198,167,0.08)" : "var(--surface-hover)",
                  border: `1px solid ${highMatch ? "rgba(0,198,167,0.2)" : "var(--color-border)"}`,
                }}
              >
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: highMatch ? "var(--cyan-brand)" : "var(--text-muted)" }}
                />
                <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-start sm:gap-0 lg:items-center lg:w-full lg:justify-center">
                  <div
                    className="font-mono-nums text-[16px] lg:text-[18px] font-bold leading-none"
                    style={{ color: highMatch ? "var(--cyan-brand)" : "var(--text-secondary)" }}
                  >
                    {score}%
                  </div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">skill match</div>
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-0.5 justify-center text-center sm:text-right lg:text-left">
                <span className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider lg:hidden">Budget</span>
                <div className="font-mono-nums text-[15px] sm:text-[16px] font-bold text-[color:var(--gold-brand)]">
                  {fmtUSD(job.budgetMinUsd)} – {fmtUSD(job.budgetMaxUsd).replace("USD ", "")}
                </div>
                <div className="text-[11.5px] text-[color:var(--text-muted)]">
                  {fmtGHS(job.budgetMinUsd)} – {fmtGHS(job.budgetMaxUsd).replace("GHS ", "")}
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex gap-2 lg:flex-col">
              <button
                type="button"
                onClick={onToggleSave}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors hover:border-[color:var(--cyan-brand)]"
                style={{
                  border: "1px solid var(--color-border)",
                  color: saved ? "var(--cyan-brand)" : "var(--text-muted)",
                  background: saved ? "rgba(0,198,167,0.08)" : "transparent",
                }}
                aria-label={saved ? "Remove from saved" : "Save job"}
              >
                <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={onApply}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-all active:scale-[0.98] lg:flex-none"
                style={{
                  background: "var(--cyan-brand)",
                  color: "var(--background)",
                  boxShadow: "0 4px 20px -6px rgba(0,198,167,0.5)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Submit Proposal</span>
                <span className="sm:hidden">Apply</span>
                <ArrowRight className="h-4 w-4 opacity-80" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
