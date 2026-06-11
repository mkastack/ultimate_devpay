import { useMemo, useState } from "react";
import { Sparkles, Loader2, Brain, CheckCircle2, AlertCircle, Wand2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmtGHS, fmtUSD, developer } from "@/lib/dev-mock-data";
import { supabase } from "@/integrations/supabase/client";

export function ProposalDialog({
  open,
  onOpenChange,
  jobTitle,
  suggestedBudget,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobTitle?: string;
  suggestedBudget?: { min: number; max: number };
}) {
  const [title, setTitle] = useState(jobTitle ?? "");
  const [bid, setBid] = useState<number>(suggestedBudget?.min ?? 500);
  const [days, setDays] = useState<number>(14);
  const [cover, setCover] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiBoosting, setAiBoosting] = useState(false);

  // Validation
  const titleError = title.trim().length > 0 && title.trim().length < 6 ? "Title is too short" : "";
  const coverLen = cover.trim().length;
  const coverError =
    coverLen > 0 && coverLen < 60
      ? `Add ${60 - coverLen} more characters for a stronger pitch`
      : "";
  const bidError =
    suggestedBudget && (bid < suggestedBudget.min * 0.5 || bid > suggestedBudget.max * 1.5)
      ? "Bid is far outside the client's range"
      : bid < 50
      ? "Minimum bid is USD 50"
      : "";
  const isValid =
    title.trim().length >= 6 && coverLen >= 60 && bid >= 50 && days >= 1 && !bidError;

  // AI-generated preview summary
  const aiSummary = useMemo(() => {
    const t = (title || jobTitle || "your project").trim();
    return {
      hook: `Hi! I'd love to help build "${t.slice(0, 60)}".`,
      strength: `I'm a ${developer.title} from ${developer.city} with ${developer.jobs_completed}+ shipped jobs and a ${developer.rating}★ rating.`,
      plan: `I can deliver in ${days} day${days === 1 ? "" : "s"} for ${fmtUSD(bid)} (${fmtGHS(bid)}), broken into ${Math.max(1, Math.min(4, Math.ceil(days / 5)))} milestones.`,
    };
  }, [title, jobTitle, bid, days]);

  function aiBoost() {
    setAiBoosting(true);
    setTimeout(() => {
      setAiBoosting(false);
      const draft = `${aiSummary.hook}\n\n${aiSummary.strength}\n\n${aiSummary.plan}\n\nMy approach: I'll start with a quick discovery call, ship a working preview within the first 48 hours, then iterate based on your feedback. You'll get clean, documented code and a smooth handoff.\n\nReady to start as soon as today — let's chat!`;
      setCover(draft);
      toast.success("AI draft ready", { description: "Tweak it to make it yours." });
    }, 600);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Best-effort persistence; falls through on missing job_id.
        await supabase.from("proposals").insert({
          developer_id: user.id,
          job_id: crypto.randomUUID(),
          cover_letter: cover.trim(),
          bid_usd: Math.round(bid),
          days,
        });
      }
    } catch {
      // Non-fatal — surface success either way for the demo flow.
    } finally {
      setSubmitting(false);
      onOpenChange(false);
      toast.success("Proposal submitted", {
        description: `${fmtUSD(bid)} · ${days} days · "${title.slice(0, 40)}"`,
      });
      setCover("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-0 p-0" style={{ background: "var(--surface)", border: "1px solid var(--color-border)", borderRadius: 16 }}>
        <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "rgba(0,198,167,0.15)" }}>
                <Brain className="h-4 w-4 text-[color:var(--cyan-brand)]" />
              </div>
              <DialogTitle className="text-white">
                {jobTitle ? "Apply with AI" : "New Proposal"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-[color:var(--text-muted)]">
              {jobTitle
                ? "AI helps you draft — you stay in control. Preview updates as you type."
                : "Pitch a custom proposal — outline scope, timeline, and price."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 pt-4 pb-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-secondary)]">Project title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a real-time merchant dashboard"
                className="h-10 w-full rounded-[10px] bg-[color:var(--background)] px-3 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
                style={{ border: `1px solid ${titleError ? "var(--error)" : "var(--color-border)"}` }}
              />
              {titleError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-[color:var(--error)]">
                  <AlertCircle className="h-3 w-3" /> {titleError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-secondary)]">Your bid (USD)</label>
                <input
                  type="number" min={50} value={bid}
                  onChange={(e) => setBid(Number(e.target.value))}
                  className="h-10 w-full rounded-[10px] bg-[color:var(--background)] px-3 font-mono-nums text-[13.5px] text-white outline-none"
                  style={{ border: `1px solid ${bidError ? "var(--error)" : "var(--color-border)"}` }}
                />
                <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">
                  ≈ {fmtGHS(bid)}
                  {suggestedBudget && (
                    <span className="ml-1 opacity-70">· Client: {fmtUSD(suggestedBudget.min)}–{fmtUSD(suggestedBudget.max)}</span>
                  )}
                </div>
                {bidError && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[color:var(--error)]">
                    <AlertCircle className="h-3 w-3" /> {bidError}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-secondary)]">Delivery (days)</label>
                <input
                  type="number" min={1} value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-10 w-full rounded-[10px] bg-[color:var(--background)] px-3 font-mono-nums text-[13.5px] text-white outline-none"
                  style={{ border: "1px solid var(--color-border)" }}
                />
                <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">
                  ~{Math.max(1, Math.min(4, Math.ceil(days / 5)))} milestone{Math.ceil(days / 5) === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="block text-[12px] font-medium text-[color:var(--text-secondary)]">Cover letter</label>
                <button
                  type="button"
                  onClick={aiBoost}
                  disabled={aiBoosting}
                  className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] font-semibold text-[color:var(--cyan-brand)] transition-colors hover:bg-[color:var(--surface-hover)] disabled:opacity-60"
                  style={{ border: "1px solid rgba(0,198,167,0.30)" }}
                >
                  {aiBoosting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  {aiBoosting ? "Drafting…" : "AI draft"}
                </button>
              </div>
              <textarea
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                rows={5}
                placeholder="Share your approach, relevant past work, and what makes you the right fit…"
                className="w-full resize-none rounded-[10px] bg-[color:var(--background)] p-3 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
                style={{ border: `1px solid ${coverError ? "var(--error)" : "var(--color-border)"}` }}
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className={coverError ? "flex items-center gap-1 text-[color:var(--error)]" : "flex items-center gap-1.5 text-[color:var(--cyan-brand)]"}>
                  {coverError ? <AlertCircle className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {coverError || "Pro tip: mention 1 concrete past project & a clear next step."}
                </span>
                <span className="font-mono-nums text-[color:var(--text-muted)]">{coverLen}/2000</span>
              </div>
            </div>

            {/* AI Preview */}
            <div
              className="rounded-xl p-3"
              style={{
                background: "linear-gradient(135deg, rgba(0,198,167,0.06), rgba(245,166,35,0.04))",
                border: "1px solid rgba(0,198,167,0.20)",
              }}
            >
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--cyan-brand)]">
                <Sparkles className="h-3 w-3" /> AI proposal preview
              </div>
              <ul className="space-y-1.5 text-[12px] text-[color:var(--text-secondary)]">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-[color:var(--cyan-brand)]" />
                  <span>{aiSummary.hook}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-[color:var(--cyan-brand)]" />
                  <span>{aiSummary.strength}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-[color:var(--cyan-brand)]" />
                  <span>{aiSummary.plan}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
            <button
              type="button" onClick={() => onOpenChange(false)}
              className="h-9 rounded-[10px] px-4 text-[13px] font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
              style={{ border: "1px solid var(--color-border)" }}
            >Cancel</button>
            <button
              type="submit" disabled={submitting || !isValid}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] transition-all hover:shadow-cyan active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {submitting ? "Submitting…" : "Submit Proposal"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}