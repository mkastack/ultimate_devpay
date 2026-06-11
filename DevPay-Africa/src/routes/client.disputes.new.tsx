import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/client/disputes/new")({
  validateSearch: (s: Record<string, unknown>) => ({ jobId: typeof s.jobId === "string" ? s.jobId : "" }),
  head: () => ({ meta: [{ title: "File a Dispute — DevPay Africa" }] }),
  component: NewDispute,
});

const reasons = [
  { id: "quality", label: "Quality of Work", desc: "Deliverables don't match agreed specifications." },
  { id: "deadline", label: "Missed Deadline", desc: "Freelancer failed to deliver within the agreed timeframe." },
  { id: "communication", label: "Communication Issues", desc: "Extended period of inactivity or unresponsiveness." },
  { id: "other", label: "Other", desc: "The issue doesn't fit into the categories above." },
];

function NewDispute() {
  const { jobId } = Route.useSearch();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("quality");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("full_refund");
  const [busy, setBusy] = useState(false);
  const [escrow, setEscrow] = useState({ total: 0, status: "active" });

  useEffect(() => {
    if (!jobId) return;
    try {
      supabase.from("milestones").select("amount,status").eq("job_id", jobId).then(({ data }) => {
        const total = (data ?? []).reduce((s: number, m: { amount: number }) => s + Number(m.amount), 0);
        setEscrow({ total, status: "active" });
      });
    } catch (err) {
      console.error("[disputes] fetch milestones error:", err);
    }
  }, [jobId]);

  const submit = async () => {
    if (!session?.user || !jobId) { toast.error("Missing job"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("disputes").insert({
        job_id: jobId, opened_by: session.user.id, reason, description, proposed_resolution: resolution, status: "open",
      });
      if (error) throw error;

      toast.success("Dispute filed successfully.");
      navigate({ to: "/client/projects/$jobId", params: { jobId } });
    } catch (err) {
      console.error("[disputes] submit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit dispute");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate({ to: "/client/projects/$jobId", params: { jobId } })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3.5 w-3.5" /> Project</button>
      <h2 className="font-display text-3xl font-bold">File a Dispute</h2>

      <div className="grid lg:grid-cols-[1fr,300px] gap-6 mt-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-display font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}>
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <div className={`text-xs ${s === step ? "text-primary font-medium" : "text-muted-foreground"}`}>{["Project Details", "Dispute Reason", "Evidence"][s - 1]}</div>
                {s < 3 && <div className={`flex-1 h-px ${s < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 className="font-display text-xl font-bold">Project Details</h3>
              <p className="text-sm text-muted-foreground mt-2">Confirm the project you want to dispute. The mediation team will use this context.</p>
              <div className="mt-5 rounded-lg border border-border/60 bg-surface/40 p-4 text-sm">Job ID: <span className="font-mono text-xs">{jobId || "missing"}</span></div>
              <div className="flex justify-end mt-6"><Button onClick={() => setStep(2)} disabled={!jobId} className="bg-[image:var(--gradient-primary)] text-primary-foreground">Continue</Button></div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-display text-xl font-bold">Define Dispute Reason</h3>
              <p className="text-sm text-muted-foreground mt-2">Please provide specific details about why you're initiating this dispute.</p>
              <Label className="mt-5 block">Primary Reason for Dispute</Label>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {reasons.map((r) => {
                  const active = reason === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setReason(r.id)}
                      className={`text-left rounded-xl border p-4 transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-surface/40 hover:border-primary/40"}`}>
                      <div className="font-medium flex items-center gap-2">
                        <span className={`h-3.5 w-3.5 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-border"}`} />
                        {r.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5">
                <Label>Detailed Issue Description</Label>
                <Textarea rows={6} className="mt-1.5" placeholder="Describe the issue in detail. Include specific examples of where the work falls short…" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="mt-5">
                <Label>Proposed Resolution</Label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <option value="full_refund">Full Refund (${escrow.total.toFixed(2)})</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="revision">Request Revision</option>
                  <option value="release">Release as-is</option>
                </select>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button disabled={!description.trim()} onClick={() => setStep(3)} className="bg-[image:var(--gradient-primary)] text-primary-foreground">Continue to Evidence</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-display text-xl font-bold">Supporting Evidence</h3>
              <p className="text-sm text-muted-foreground mt-2">Optionally attach screenshots or documents (coming soon — text submission is enough to open the case).</p>
              <div className="mt-5 rounded-xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Drag & drop files here<br /><span className="text-xs">PDF, PNG, JPG up to 10MB</span>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button disabled={busy} onClick={submit} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                  {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Filing…</> : "Submit Dispute"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /><div className="font-display font-semibold">Escrow Protection Active</div></div>
            <div className="mt-3 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Project total</span><span>${escrow.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Funds in escrow</span><span className="font-semibold">${escrow.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-warning font-medium">In Dispute</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Funds are securely held by DevPay Africa. No payments will be released until the dispute is resolved.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="font-display font-semibold mb-3">Mediation Process</div>
            <ol className="space-y-3 text-sm">
              <li><div className="font-medium">1. Negotiation Phase</div><div className="text-xs text-muted-foreground">Freelancer has 48h to respond and propose a counter-resolution.</div></li>
              <li><div className="font-medium">2. DevPay Review</div><div className="text-xs text-muted-foreground">If no agreement, an independent mediator reviews logs & evidence.</div></li>
              <li><div className="font-medium">3. Final Ruling</div><div className="text-xs text-muted-foreground">Binding decision within 5–7 business days; funds distributed accordingly.</div></li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
