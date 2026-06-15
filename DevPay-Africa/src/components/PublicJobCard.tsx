import { Link } from "@tanstack/react-router";
import { useAuth } from "@/integrations/supabase/auth-context";
import {
  BadgeCheck,
  ShieldCheck,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Star,
} from "lucide-react";
import type { PublicJobListing } from "@/lib/public-jobs-showcase";

const USD_TO_GHS = 15.5;

function fmtUSD(n: number) {
  return `USD ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtGHS(usd: number) {
  return `GHS ${(usd * USD_TO_GHS).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const levelColor: Record<PublicJobListing["experienceLevel"], string> = {
  Entry: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Expert: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

export function PublicJobCard({
  job,
  isPreview,
  onDeveloperPreview,
}: {
  job: PublicJobListing;
  isPreview?: boolean;
  onDeveloperPreview?: (job: PublicJobListing) => void;
}) {
  const { profile } = useAuth();
  const isDeveloper = profile?.role === "developer";
  const detailTo = "/jobs/$jobId";
  const detailParams = { jobId: job.id };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_50px_-24px_rgba(0,198,167,0.35)]"
    >
      {job.featured && (
        <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-[image:var(--gradient-primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Featured
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Client */}
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-[12px] font-bold text-primary ring-1 ring-primary/20">
            {initials(job.clientName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{job.clientName}</span>
              {job.clientVerified && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {job.location}
            </div>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <div className="font-display text-lg font-bold text-primary">
              {fmtUSD(job.budget_min)} – {fmtUSD(job.budget_max).replace("USD ", "")}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {fmtGHS(job.budget_min)} – {fmtGHS(job.budget_max).replace("GHS ", "")}
            </div>
          </div>
        </div>

        {/* Title & copy */}
        <h3 className="font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
          {job.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {job.category}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${levelColor[job.experienceLevel]}`}
          >
            {job.experienceLevel}
          </span>
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Escrow */}
        <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
          <ShieldCheck className="h-3.5 w-3.5" /> Escrow protected
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {job.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {job.proposalsCount} proposals
            </span>
            <span>{timeAgo(job.created_at)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">4.9</span>
            </div>
            {isPreview && isDeveloper ? (
              <button
                type="button"
                onClick={() => onDeveloperPreview?.(job)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                Preview <ArrowRight className="h-4 w-4" />
              </button>
            ) : isPreview ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
              >
                Log in to apply <ArrowRight className="h-4 w-4" />
              </Link>
            ) : isDeveloper ? (
              <button
                type="button"
                onClick={() => onDeveloperPreview?.(job)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                Preview <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to={detailTo}
                params={detailParams}
                className="inline-flex items-center gap-1 rounded-lg bg-[image:var(--gradient-primary)] px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
              >
                View & Apply <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile budget */}
        <div className="mt-3 border-t border-border/30 pt-3 sm:hidden">
          <div className="font-display text-base font-bold text-primary">
            {fmtUSD(job.budget_min)} – {fmtUSD(job.budget_max).replace("USD ", "")}
          </div>
          <div className="text-[11px] text-muted-foreground">
            ≈ {fmtGHS(job.budget_min)} – {fmtGHS(job.budget_max).replace("GHS ", "")}
          </div>
        </div>
      </div>
    </article>
  );
}
