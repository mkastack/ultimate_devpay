import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCheck, ShieldCheck, MapPin, Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import type { PublicJobListing } from "@/lib/public-jobs-showcase";

const USD_TO_GHS = 15.5;

function fmtUSD(n: number) {
  return `USD ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtGHS(usd: number) {
  return `GHS ${(usd * USD_TO_GHS).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function JobPreviewDialog({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: PublicJobListing | null;
}) {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {job.clientName}
                {job.clientVerified && (
                  <span className="inline-flex items-center gap-0.5 text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">{job.title}</h2>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {job.location}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-bold text-primary">
                {fmtUSD(job.budget_min)} – {fmtUSD(job.budget_max).replace("USD ", "")}
              </div>
              <div className="text-xs text-muted-foreground">
                {fmtGHS(job.budget_min)} – {fmtGHS(job.budget_max).replace("GHS ", "")}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                {s}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Escrow protected · funds released on milestone approval
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.duration}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.proposalsCount} proposals</span>
            <span>{job.category} · {job.experienceLevel}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 flex-1 rounded-lg border text-sm font-semibold"
            >
              Close
            </button>
            <Link
              to="/developer/jobs"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" /> Submit Proposal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
