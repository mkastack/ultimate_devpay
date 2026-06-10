import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createHireRequest } from "@/lib/hire.functions";
import { Plus, Trash2, Check } from "lucide-react";
import { fmtGHS } from "@/lib/format";

export type HireTarget = {
  proposalId: string;
  jobId: string;
  jobTitle: string;
  developerName: string;
  suggestedBid: number;
  suggestedDays: number;
};

type Milestone = { name: string; amount: number; due_days: number };

const STEPS = ["Budget", "Milestones", "Timeline", "Review"] as const;
const LS_KEY = (proposalId: string) => `devpay.hire-draft.${proposalId}`;

type Draft = {
  step: number;
  bid: number;
  budgetMin: number;
  budgetMax: number;
  milestones: Milestone[];
  days: number;
  deadline: string;
};

function friendlyError(raw: string): { title: string; description: string } {
  if (raw.startsWith("UNAPPROVED_JOB"))
    return { title: "This job isn't approved for hiring yet", description: "The job needs to be approved before you can send a hire request." };
  if (raw.startsWith("UNVERIFIED_DEVELOPER"))
    return { title: "Developer isn't verified", description: "We can only process hires for verified developers. Pick another candidate." };
  if (raw.startsWith("BID_OUT_OF_RANGE")) {
    const [, lo, hi] = raw.split(":");
    return { title: "Bid is outside the job's budget", description: `Bid must be between GHS ${lo} and GHS ${hi}.` };
  }
  if (raw.startsWith("MILESTONE_SUM_MISMATCH"))
    return { title: "Milestone amounts don't add up", description: "Milestone totals must equal the agreed bid." };
  if (raw.startsWith("DEADLINE_PAST"))
    return { title: "Deadline is in the past", description: "Pick a future delivery date." };
  return { title: "Could not create hire request", description: raw || "Please try again." };
}

export function HireDialog({
  open,
  onOpenChange,
  target,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: HireTarget | null;
  onSuccess?: (result: { hire_id: string; contract_id: string; escrow_id: string; escrow_status: string }) => void;
}) {
  const submit = useServerFn(createHireRequest);
  const [step, setStep] = useState(0);
  const [bid, setBid] = useState(0);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [days, setDays] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from localStorage on open, or seed defaults from target
  useEffect(() => {
    if (!target) return;
    hydrated.current = false;
    let restored = false;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LS_KEY(target.proposalId));
        if (raw) {
          const d = JSON.parse(raw) as Draft;
          setStep(d.step ?? 0);
          setBid(d.bid);
          setBudgetMin(d.budgetMin);
          setBudgetMax(d.budgetMax);
          setMilestones(d.milestones ?? []);
          setDays(d.days);
          setDeadline(d.deadline);
          restored = true;
          if (open) toast.message("Restored your saved progress", { description: "Picked up where you left off." });
        }
      } catch {
        /* ignore corrupt draft */
      }
    }
    if (!restored) {
      setStep(0);
      setBid(target.suggestedBid);
      setBudgetMin(Math.round(target.suggestedBid * 0.8));
      setBudgetMax(Math.round(target.suggestedBid * 1.2));
      setDays(target.suggestedDays);
      const d = new Date();
      d.setDate(d.getDate() + target.suggestedDays);
      setDeadline(d.toISOString().slice(0, 10));
      const m1 = Math.round(target.suggestedBid * 0.3);
      const m2 = Math.round(target.suggestedBid * 0.4);
      setMilestones([
        { name: "Kickoff & design", amount: m1, due_days: Math.max(1, Math.round(target.suggestedDays * 0.3)) },
        { name: "Build & integrate", amount: m2, due_days: Math.max(2, Math.round(target.suggestedDays * 0.6)) },
        { name: "Final delivery", amount: target.suggestedBid - m1 - m2, due_days: target.suggestedDays },
      ]);
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.proposalId, open]);

  // Persist draft on every change
  useEffect(() => {
    if (!target || !hydrated.current || typeof window === "undefined") return;
    const draft: Draft = { step, bid, budgetMin, budgetMax, milestones, days, deadline };
    try {
      localStorage.setItem(LS_KEY(target.proposalId), JSON.stringify(draft));
    } catch {
      /* quota */
    }
  }, [target, step, bid, budgetMin, budgetMax, milestones, days, deadline]);

  const milestoneSum = useMemo(() => milestones.reduce((a, m) => a + (Number(m.amount) || 0), 0), [milestones]);
  const sumOk = Math.abs(milestoneSum - bid) < 0.01;

  if (!target) return null;

  const clearDraft = () => {
    if (typeof window !== "undefined") localStorage.removeItem(LS_KEY(target.proposalId));
  };

  const updateMs = (i: number, patch: Partial<Milestone>) =>
    setMilestones((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (bid <= 0) return "Bid must be positive";
      if (budgetMax < budgetMin) return "Budget max must be ≥ min";
      if (bid < budgetMin || bid > budgetMax) return "Bid must sit within your budget range";
    }
    if (s === 1) {
      if (milestones.length < 1) return "Add at least one milestone";
      if (milestones.some((m) => !m.name.trim() || m.amount <= 0 || m.due_days < 1)) return "Fill out every milestone";
      if (!sumOk) return `Milestones (${fmtGHS(milestoneSum)}) must equal bid (${fmtGHS(bid)})`;
    }
    if (s === 2) {
      if (days < 1 || days > 365) return "Days must be between 1 and 365";
      if (!deadline) return "Pick a deadline";
      if (new Date(deadline).getTime() < Date.now() - 86_400_000) return "Deadline must be in the future";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    for (let i = 0; i < 3; i++) {
      const err = validateStep(i);
      if (err) {
        setStep(i);
        return toast.error(err);
      }
    }
    setBusy(true);
    try {
      let sid = "ssr";
      if (typeof window !== "undefined") {
        sid = localStorage.getItem("devpay.session_id") || crypto.randomUUID();
        localStorage.setItem("devpay.session_id", sid);
      }
      const result = await submit({
        data: {
          session_id: sid,
          job_id: target.jobId,
          job_title: target.jobTitle,
          developer_name: target.developerName,
          bid_amount: bid,
          days,
          budget_min: budgetMin,
          budget_max: budgetMax,
          deadline,
          milestones,
        },
      });
      toast.success(`Hire request approved for ${target.developerName}`, {
        description: "Contract created · escrow is pending funding.",
      });
      clearDraft();
      onOpenChange(false);
      onSuccess?.(result);
    } catch (e: any) {
      const { title, description } = friendlyError(String(e?.message ?? ""));
      toast.error(title, { description });
      // Stay on review step so user can fix or pick another developer
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hire {target.developerName}</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: i <= step ? "var(--gold)" : "var(--card-hover)",
                  color: i <= step ? "var(--background)" : "var(--text-muted)",
                }}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 flex-1" style={{ background: i < step ? "var(--gold)" : "var(--border)" }} />
              )}
            </div>
          ))}
        </div>
        <div className="text-[11px] uppercase tracking-wider mb-3 flex items-center justify-between" style={{ color: "var(--text-muted)" }}>
          <span>Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <button
            type="button"
            onClick={() => { clearDraft(); toast.message("Draft cleared"); onOpenChange(false); }}
            className="text-[10px] underline-offset-2 hover:underline"
          >
            Discard draft
          </button>
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              For <span className="font-semibold text-foreground">{target.jobTitle}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Budget min (GHS)</Label>
                <Input type="number" min={0} value={budgetMin} onChange={(e) => setBudgetMin(+e.target.value)} />
              </div>
              <div>
                <Label>Budget max (GHS)</Label>
                <Input type="number" min={0} value={budgetMax} onChange={(e) => setBudgetMax(+e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Agreed bid (GHS)</Label>
              <Input type="number" min={0} value={bid} onChange={(e) => setBid(+e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-xs flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Sum of milestones</span>
              <span className={sumOk ? "text-foreground font-mono" : "font-mono"} style={{ color: sumOk ? undefined : "#ef4444" }}>
                {fmtGHS(milestoneSum)} / {fmtGHS(bid)}
              </span>
            </div>
            {milestones.map((m, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex gap-2">
                  <Input placeholder="Milestone name" value={m.name} onChange={(e) => updateMs(i, { name: e.target.value })} />
                  <Button variant="ghost" size="icon" onClick={() => setMilestones((p) => p.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Amount (GHS)</Label>
                    <Input type="number" min={0} value={m.amount} onChange={(e) => updateMs(i, { amount: +e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-[10px]">Due (days)</Label>
                    <Input type="number" min={1} max={365} value={m.due_days} onChange={(e) => updateMs(i, { due_days: +e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMilestones((p) => [...p, { name: "", amount: 0, due_days: 7 }])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" /> Add milestone
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <Label>Estimated days</Label>
              <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(+e.target.value)} />
            </div>
            <div>
              <Label>Final deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2 text-sm">
            <Row k="Job" v={target.jobTitle} />
            <Row k="Developer" v={target.developerName} />
            <Row k="Budget range" v={`${fmtGHS(budgetMin)} – ${fmtGHS(budgetMax)}`} />
            <Row k="Agreed bid" v={fmtGHS(bid)} />
            <Row k="Timeline" v={`${days} days · due ${deadline}`} />
            <div className="mt-2">
              <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Milestones
              </div>
              <ul className="space-y-1">
                {milestones.map((m, i) => (
                  <li key={i} className="flex justify-between text-[13px]">
                    <span>{i + 1}. {m.name} <span style={{ color: "var(--text-muted)" }}>· day {m.due_days}</span></span>
                    <span className="font-mono">{fmtGHS(m.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="gold-gradient text-background">Next →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={busy} className="gold-gradient text-background">
              {busy ? "Sending..." : "Confirm hire"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b pb-1" style={{ borderColor: "var(--border)" }}>
      <span style={{ color: "var(--text-muted)" }}>{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}
