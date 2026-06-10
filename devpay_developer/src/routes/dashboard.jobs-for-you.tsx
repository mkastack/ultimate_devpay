import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles, BadgeCheck, Bookmark, Clock, Users, MapPin, TrendingUp,
  Zap, Target, Brain, ArrowRight, Filter, RefreshCw, Star, DollarSign,
  CheckCircle2, AlertCircle, Flame, WifiOff,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ProposalDialog } from "@/components/dashboard/ProposalDialog";
import { jobMatches, fmtUSD, fmtGHS, developer } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/jobs-for-you")({
  head: () => ({
    meta: [
      { title: "Jobs For You — DevPay Africa" },
      { name: "description", content: "AI-matched jobs tailored to your skills and history." },
    ],
  }),
  component: JobsForYouPage,
});

type Enriched = (typeof jobMatches)[number] & {
  matchScore: number;
  matchReasons: string[];
  clientLocation: string;
  clientSpentUsd: number;
  clientRating: number;
  clientHireRate: number;
  paymentVerified: boolean;
  competition: "low" | "medium" | "high";
  hot: boolean;
  estimatedEarningsUsd: number;
};

const enriched: Enriched[] = [
  {
    ...jobMatches[0],
    matchScore: 96, matchReasons: ["3/3 skills match", "Recently completed similar Hubtel-style dashboard", "Budget in your top range"],
    clientLocation: "Accra, Ghana", clientSpentUsd: 24500, clientRating: 4.9, clientHireRate: 87,
    paymentVerified: true, competition: "low", hot: true, estimatedEarningsUsd: 1300,
  },
  {
    ...jobMatches[1],
    matchScore: 91, matchReasons: ["React Native is your #1 skill", "MoMo experience verified", "Client hired 8 devs from Ghana"],
    clientLocation: "Lagos, Nigeria", clientSpentUsd: 11200, clientRating: 4.7, clientHireRate: 72,
    paymentVerified: true, competition: "medium", hot: true, estimatedEarningsUsd: 1900,
  },
  {
    ...jobMatches[2],
    matchScore: 84, matchReasons: ["TypeScript + Tailwind match", "Design systems is a growth skill for you"],
    clientLocation: "Accra, Ghana", clientSpentUsd: 48000, clientRating: 5.0, clientHireRate: 92,
    paymentVerified: true, competition: "low", hot: false, estimatedEarningsUsd: 2200,
  },
];

const filters = ["All matches", "Top picks", "Hot 🔥", "New today", "Long-term", "Short gigs"] as const;

function scoreColor(s: number) {
  if (s >= 90) return "var(--cyan-brand)";
  if (s >= 75) return "var(--gold-brand)";
  return "var(--text-muted)";
}

function JobsForYouPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All matches");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [proposal, setProposal] = useState<null | { title: string; min: number; max: number }>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  function refresh() {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Matches refreshed");
    }, 700);
  }

  const list = useMemo(() => {
    let l = [...enriched];
    if (filter === "Top picks") l = l.filter((j) => j.matchScore >= 90);
    if (filter === "Hot 🔥") l = l.filter((j) => j.hot);
    return l.sort((a, b) => b.matchScore - a.matchScore);
  }, [filter]);

  const avgMatch = Math.round(enriched.reduce((s, j) => s + j.matchScore, 0) / enriched.length);
  const potentialEarnings = enriched.reduce((s, j) => s + j.estimatedEarningsUsd, 0);

  return (
    <>
      <DashboardHeader
        title="Jobs For You"
        subtitle={`AI-matched from ${enriched.length * 17}+ open jobs · refreshed just now`}
      />

      {/* AI Insight banner */}
      <section
        className="mb-6 overflow-hidden rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,198,167,0.10), rgba(245,166,35,0.06))",
          border: "1px solid rgba(0,198,167,0.20)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: "rgba(0,198,167,0.15)" }}
            >
              <Brain className="h-5 w-5 text-[color:var(--cyan-brand)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[16px] font-semibold text-white">
                  Good news, {developer.full_name.split(" ")[0]}
                </h2>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                  style={{ background: "rgba(0,198,167,0.18)", color: "var(--cyan-brand)" }}
                >
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
                Your skill score is <span className="font-semibold text-white">{developer.ai_skill_score}/100</span>.
                We found <span className="font-semibold text-[color:var(--cyan-brand)]">{enriched.length} strong matches</span> worth up to{" "}
                <span className="font-semibold text-[color:var(--gold-brand)]">{fmtUSD(potentialEarnings)}</span> ({fmtGHS(potentialEarnings)}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-[color:var(--surface)] px-4 text-[13px] font-medium text-white hover:bg-[color:var(--surface-hover)]"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Target} label="Avg match" value={`${avgMatch}%`} tone="cyan" />
          <Stat icon={TrendingUp} label="Potential" value={fmtUSD(potentialEarnings)} tone="gold" />
          <Stat icon={Flame} label="Hot jobs" value={String(enriched.filter((j) => j.hot).length)} tone="cyan" />
          <Stat icon={Zap} label="Proposals left" value={`${developer.proposals_limit - developer.proposals_used}/${developer.proposals_limit}`} tone="gold" />
        </div>
      </section>

      {/* Filter chips */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-muted)]" />
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="h-8 shrink-0 rounded-full px-3 text-[12.5px] font-medium transition-colors"
              style={{
                background: active ? "var(--cyan-brand)" : "var(--surface)",
                color: active ? "var(--background)" : "var(--text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Job cards */}
      <div className="space-y-4">
        {error ? (
          <div
            className="rounded-2xl p-8 text-center sm:p-10"
            style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
          >
            <div
              className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <WifiOff className="h-5 w-5 text-[color:var(--error)]" />
            </div>
            <h3 className="font-display text-[16px] font-semibold text-white">Couldn't load matches</h3>
            <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : loading ? (
          <>
            <JobSkeleton />
            <JobSkeleton />
            <JobSkeleton />
          </>
        ) : list.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center sm:p-10"
            style={{ background: "var(--surface)", border: "1px dashed var(--color-border)" }}
          >
            <div
              className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full"
              style={{ background: "rgba(0,198,167,0.12)" }}
            >
              <AlertCircle className="h-5 w-5 text-[color:var(--cyan-brand)]" />
            </div>
            <h3 className="font-display text-[16px] font-semibold text-white">No matches for this filter</h3>
            <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
              Try switching to "All matches" or refresh to fetch new jobs.
            </p>
            <button
              type="button"
              onClick={() => setFilter("All matches")}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-[10px] bg-[color:var(--surface-hover)] px-4 text-[13px] font-semibold text-white"
              style={{ border: "1px solid var(--color-border)" }}
            >
              Show all matches
            </button>
          </div>
        ) : list.map((j) => {
          const isSaved = saved.has(j.id);
          return (
            <article
              key={j.id}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Match ring + content */}
              <div className="flex flex-col gap-5 lg:flex-row">
                {/* LEFT: Match score */}
                <div className="flex shrink-0 items-start gap-4 lg:w-[180px] lg:flex-col lg:items-center lg:gap-2">
                  <MatchRing score={j.matchScore} />
                  <div className="flex flex-col gap-1 lg:items-center">
                    {j.hot && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                        style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold-brand)" }}
                      >
                        <Flame className="h-3 w-3" /> Trending
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                      style={{
                        background:
                          j.competition === "low"
                            ? "rgba(0,198,167,0.12)"
                            : j.competition === "medium"
                            ? "rgba(245,166,35,0.12)"
                            : "rgba(239,68,68,0.12)",
                        color:
                          j.competition === "low"
                            ? "var(--cyan-brand)"
                            : j.competition === "medium"
                            ? "var(--gold-brand)"
                            : "#ef4444",
                      }}
                    >
                      {j.competition === "low" ? "Low competition" : j.competition === "medium" ? "Medium competition" : "High competition"}
                    </span>
                  </div>
                </div>

                {/* MIDDLE: Job details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[12.5px] text-[color:var(--text-secondary)]">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--surface-hover)] text-[10px] font-bold text-[color:var(--cyan-brand)]">
                      {j.clientName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium text-white">{j.clientName}</span>
                    {j.clientVerified && <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />}
                    {j.paymentVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--text-muted)]">
                        <CheckCircle2 className="h-3 w-3 text-[color:var(--cyan-brand)]" /> Payment verified
                      </span>
                    )}
                    <span className="text-[color:var(--text-muted)]">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--text-muted)]">
                      <MapPin className="h-3 w-3" /> {j.clientLocation}
                    </span>
                  </div>

                  <h3 className="mb-2 text-[16px] font-semibold leading-snug text-white">{j.title}</h3>

                  {/* Why it matches */}
                  <div
                    className="mb-3 rounded-lg p-2.5"
                    style={{ background: "rgba(0,198,167,0.06)", border: "1px solid rgba(0,198,167,0.15)" }}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--cyan-brand)]">
                      <Sparkles className="h-3 w-3" /> Why this fits you
                    </div>
                    <ul className="space-y-0.5">
                      {j.matchReasons.map((r) => (
                        <li key={r} className="flex items-start gap-1.5 text-[12px] text-[color:var(--text-secondary)]">
                          <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-[color:var(--cyan-brand)]" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {j.skills.map((s) => (
                      <span
                        key={s.name}
                        className="rounded-full px-2.5 py-[3px] text-[11.5px]"
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-muted)]">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {j.durationLabel}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {j.proposalsCount} proposals</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-[color:var(--gold-brand)]" /> {j.clientRating.toFixed(1)} client</span>
                    <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" /> {fmtUSD(j.clientSpentUsd)} spent</span>
                    <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {j.clientHireRate}% hire rate</span>
                    <span>· Posted {j.postedLabel}</span>
                  </div>
                </div>

                {/* RIGHT: Budget + actions */}
                <div className="flex shrink-0 flex-col gap-3 lg:w-[200px] lg:items-end">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">Budget</div>
                    <div className="font-mono-nums text-[18px] font-bold text-[color:var(--cyan-brand)]">
                      {fmtUSD(j.budgetMinUsd)}–{fmtUSD(j.budgetMaxUsd)}
                    </div>
                    <div className="font-mono-nums text-[11.5px] text-[color:var(--text-muted)]">
                      ≈ {fmtGHS(j.budgetMinUsd)}–{fmtGHS(j.budgetMaxUsd)}
                    </div>
                    <div
                      className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px]"
                      style={{ background: "rgba(245,166,35,0.10)", color: "var(--gold-brand)" }}
                    >
                      <TrendingUp className="h-3 w-3" /> Est. earn {fmtUSD(j.estimatedEarningsUsd)}
                    </div>
                  </div>
                  <div className="flex w-full gap-2 lg:flex-col">
                    <button
                      type="button"
                      onClick={() => setProposal({ title: j.title, min: j.budgetMinUsd, max: j.budgetMaxUsd })}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] transition-transform hover:shadow-cyan active:scale-[0.98]"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Apply with AI <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                      className="grid h-10 w-10 place-items-center rounded-[10px] hover:text-[color:var(--cyan-brand)] lg:w-full"
                      style={{
                        border: "1px solid var(--color-border)",
                        color: isSaved ? "var(--cyan-brand)" : "var(--text-muted)",
                      }}
                      aria-label="Save"
                    >
                      <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
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

function JobSkeleton() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex shrink-0 items-center gap-4 lg:w-[180px] lg:flex-col">
          <div className="skeleton h-[72px] w-[72px] rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-6 rounded-full" />
            <div className="skeleton h-3 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-16 w-full rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-16 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-14 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 lg:w-[200px] lg:items-end">
          <div className="space-y-2 lg:text-right">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
          <div className="flex w-full gap-2 lg:flex-col">
            <div className="skeleton h-10 flex-1 rounded-[10px]" />
            <div className="skeleton h-10 w-10 rounded-[10px] lg:w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, tone,
}: { icon: typeof Target; label: string; value: string; tone: "cyan" | "gold" }) {
  const color = tone === "cyan" ? "var(--cyan-brand)" : "var(--gold-brand)";
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-[color:var(--text-muted)]">
        <Icon className="h-3 w-3" style={{ color }} /> {label}
      </div>
      <div className="mt-0.5 font-mono-nums text-[16px] font-bold text-white">{value}</div>
    </div>
  );
}

function MatchRing({ score }: { score: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = scoreColor(score);
  return (
    <div className="relative grid h-[72px] w-[72px] place-items-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} stroke="var(--color-border)" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={r} stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono-nums text-[16px] font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] uppercase tracking-wider text-[color:var(--text-muted)]">match</span>
      </div>
    </div>
  );
}