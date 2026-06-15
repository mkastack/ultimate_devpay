import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCheck, MapPin, Star, Briefcase } from "lucide-react";
import type { HirerDeveloper } from "@/lib/hirer-developer-catalog";
import { initials } from "@/lib/hirer-format";

export function DeveloperProfileDialog({
  open,
  onOpenChange,
  developer,
  onHire,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  developer: HirerDeveloper | null;
  onHire?: () => void;
}) {
  if (!developer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Developer profile</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 text-lg font-bold"
            style={{
              borderColor: developer.top ? "var(--gold)" : "var(--cyan)",
              background: "var(--card-hover)",
              color: developer.top ? "var(--gold)" : "var(--cyan)",
            }}
          >
            {initials(developer.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{developer.name}</h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{developer.title}</p>
            <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <MapPin className="h-3 w-3" /> {developer.location}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {developer.rating}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Rating</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
              <Briefcase className="h-3.5 w-3.5" /> {developer.jobs}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Jobs</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">GHS {developer.rate}/hr</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Rate</div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {developer.bio}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {developer.skills.map((s) => (
            <span
              key={s}
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{ background: "rgba(0,198,167,0.1)", color: "var(--cyan)", border: "1px solid rgba(0,198,167,0.2)" }}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 flex-1 rounded-lg border text-sm font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Close
          </button>
          {onHire && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onHire();
              }}
              className="h-10 flex-1 rounded-lg text-sm font-semibold gold-gradient shadow-gold"
              style={{ color: "var(--background)" }}
            >
              Hire Now →
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
