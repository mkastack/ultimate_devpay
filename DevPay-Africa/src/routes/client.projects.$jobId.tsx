import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Send, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { toast } from "sonner";
import { EscrowTimeline } from "@/components/EscrowTimeline";

export const Route = createFileRoute("/client/projects/$jobId")({
  head: () => ({ meta: [{ title: "Project — DevPay Africa" }] }),
  component: ProjectDetail,
});

type Job = { id: string; title: string; description: string; status: string; budget_min: number | null; budget_max: number | null; client_id: string };
type Milestone = { id: string; title: string; amount: number; due_date: string | null; status: string; position: number };
type Msg = { id: string; sender_id: string; body: string; created_at: string };

const statusColor: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-accent/10 text-accent border-accent/30",
  submitted: "bg-warning/10 text-warning border-warning/30",
  approved: "bg-success/10 text-success border-success/30",
  released: "bg-success/10 text-success border-success/30",
  disputed: "bg-destructive/10 text-destructive border-destructive/30",
};

function ProjectDetail() {
  const { jobId } = useParams({ from: "/client/projects/$jobId" });
  const { session } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: j }, { data: ms }, { data: mg }] = await Promise.all([
          supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
          supabase.from("milestones").select("*").eq("job_id", jobId).order("position"),
          supabase.from("project_messages").select("*").eq("job_id", jobId).order("created_at"),
        ]);
        setJob((j as Job) ?? null);
        setMilestones((ms as Milestone[]) ?? []);
        setMessages((mg as Msg[]) ?? []);
        setLoading(false);
      } catch (err) {
        console.error("[project-detail] load error:", err);
        setLoading(false);
      }
    })();

    const ch = supabase
      .channel(`job-${jobId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages", filter: `job_id=eq.${jobId}` },
        (p) => setMessages((m) => [...m, p.new as Msg]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "milestones", filter: `job_id=eq.${jobId}` },
        (p) => setMilestones((arr) => arr.map((x) => (x.id === (p.new as Milestone).id ? (p.new as Milestone) : x))))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [jobId]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!draft.trim() || !session?.user) return;
    const body = draft.trim();
    setDraft("");
    try {
      const { error } = await supabase.from("project_messages").insert({ job_id: jobId, sender_id: session.user.id, body });
      if (error) throw error;
    } catch (error) {
      console.error("[project-detail] send message error:", error);
      toast.error("Failed to send message");
    }
  };

  const approveMilestone = async (m: Milestone) => {
    setBusy(m.id);
    try {
      const { error } = await supabase.from("milestones").update({ status: "released", approved_at: new Date().toISOString() }).eq("id", m.id);
      if (error) throw error;

      // Log transaction
      await supabase.from("transactions").insert({
        user_id: session?.user?.id,
        amount: Number(m.amount),
        type: "release",
        description: `Released Milestone: "${m.title}" for job ${job?.title}`,
        status: "completed"
      });

      toast.success("Funds released to developer");
    } catch (error) {
      console.error("[project-detail] approve milestone error:", error);
      toast.error("Failed to release funds");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!job) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  const totalBudget = milestones.reduce((s, m) => s + Number(m.amount), 0) || (job.budget_max ?? 0);
  const releasedBudget = milestones.filter((m) => m.status === "released").reduce((s, m) => s + Number(m.amount), 0);

  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-6">
      <div>
        <Link to="/client" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3.5 w-3.5" /> Projects</Link>
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">{job.title}</h2>
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${statusColor[job.status] ?? statusColor.pending}`}>{job.status}</span>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-primary">${totalBudget.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total budget</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">{job.description}</p>
          <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span><span className="font-medium text-primary">Escrow active.</span> ${ (totalBudget - releasedBudget).toFixed(2)} held securely.</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card mt-6 overflow-hidden">
          <div className="p-5 border-b border-border/40 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Milestones</h3>
            <Link to="/client/disputes/new" search={{ jobId }} className="text-xs text-destructive hover:underline flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> File a dispute</Link>
          </div>
          {milestones.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">No milestones yet.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {milestones.map((m, i) => (
                <div key={m.id} className="p-5 flex flex-wrap items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="flex-1 min-w-[180px]">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.due_date ? `Due ${new Date(m.due_date).toLocaleDateString()}` : "No due date"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold">${Number(m.amount).toFixed(2)}</div>
                    <span className={`inline-block mt-1 text-[10px] uppercase px-2 py-0.5 rounded-full border ${statusColor[m.status] ?? statusColor.pending}`}>{m.status}</span>
                  </div>
                  {m.status === "submitted" ? (
                    <Button size="sm" disabled={busy === m.id} onClick={() => approveMilestone(m)} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                      {busy === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve</>}
                    </Button>
                  ) : m.status === "released" || m.status === "approved" ? (
                    <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Released</span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Awaiting</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="escrow" className="mt-6 scroll-mt-24">
          <EscrowTimeline jobId={jobId} />
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-card flex flex-col h-[640px]">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="font-display font-semibold">Project Chat</div>
          <span className="h-2 w-2 rounded-full bg-success" />
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === session?.user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-surface"}`}>
                    {m.body}
                    <div className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-border/40 flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="bg-surface border-border/60" />
          <Button type="submit" size="icon" className="bg-[image:var(--gradient-primary)] text-primary-foreground"><Send className="h-4 w-4" /></Button>
        </form>
      </aside>
    </div>
  );
}
