import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmtUSD, fmtGHS } from "@/lib/mock-data";

export function ReleaseDialog({
  open, onOpenChange, contract,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contract?: { id: string; title: string; clientName: string; escrowUsd: number; currentMilestoneLabel: string; milestoneCurrent: number; milestoneTotal: number };
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!contract) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      setNote("");
      toast.success("Release requested", {
        description: `${contract!.clientName} will be notified to approve ${fmtUSD(contract!.escrowUsd)}.`,
      });
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 p-0" style={{ background: "var(--surface)", border: "1px solid var(--color-border)", borderRadius: 16 }}>
        <form onSubmit={submit}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-white">Request milestone release</DialogTitle>
            <DialogDescription className="text-[color:var(--text-muted)]">
              {contract.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 pt-4 pb-2">
            <div className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between text-[12px] text-[color:var(--text-muted)]">
                <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Escrow amount</span>
                <span>Milestone {contract.milestoneCurrent}/{contract.milestoneTotal}</span>
              </div>
              <div className="mt-1 font-mono-nums text-[22px] font-bold text-[color:var(--cyan-brand)]">{fmtUSD(contract.escrowUsd)}</div>
              <div className="text-[11.5px] text-[color:var(--text-muted)]">{fmtGHS(contract.escrowUsd)}</div>
              <div className="mt-2 text-[12.5px] text-[color:var(--text-secondary)]">{contract.currentMilestoneLabel}</div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-secondary)]">Message to client (optional)</label>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Quick summary of what was delivered…"
                className="w-full resize-none rounded-[10px] bg-[color:var(--background)] p-3 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
                style={{ border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 rounded-[10px] px-4 text-[13px] font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]" style={{ border: "1px solid var(--color-border)" }}>Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98] disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Sending…" : "Send Request"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}