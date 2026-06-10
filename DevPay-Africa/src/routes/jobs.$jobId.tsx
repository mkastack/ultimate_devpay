import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Clock, DollarSign, CheckCircle2, ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { EscrowTimeline } from "@/components/EscrowTimeline";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({ meta: [{ title: "Job Details — DevPay Africa" }] }),
  component: JobDetail,
});

type JobRow = {
  id: string;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  duration: string | null;
  status: string;
  created_at: string;
  client_id: string;
};

type ProposalRow = {
  id: string;
  developer_id: string;
  cover_letter: string;
  bid_amount: number;
  delivery_days: number | null;
  status: string;
  created_at: string;
};

function JobDetail() {
  const { jobId } = Route.useParams();
  const { profile, session } = useAuth();
  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [escrowOpen, setEscrowOpen] = useState(false);

  // proposal form (developer)
  const [coverLetter, setCoverLetter] = useState("");
  const [bid, setBid] = useState("");
  const [days, setDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState<ProposalRow | null>(null);

  // proposals list (client owner)
  const [proposals, setProposals] = useState<ProposalRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: j } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      if (cancelled) return;
      setJob((j as JobRow) ?? null);

      if (j && session?.user) {
        if ((j as JobRow).client_id === session.user.id) {
          const { data: ps } = await supabase
            .from("proposals").select("*")
            .eq("job_id", jobId).order("created_at", { ascending: false });
          if (!cancelled) setProposals((ps as ProposalRow[]) ?? []);
        } else if (profile?.role === "developer") {
          const { data: existing } = await supabase
            .from("proposals").select("*")
            .eq("job_id", jobId).eq("developer_id", session.user.id).maybeSingle();
          if (!cancelled) setMine((existing as ProposalRow) ?? null);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [jobId, session?.user, profile?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) { toast.error("Sign in to submit"); return; }
    if (!job) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("proposals").insert({
      job_id: job.id,
      developer_id: session.user.id,
      cover_letter: coverLetter,
      bid_amount: Number(bid),
      delivery_days: days ? Number(days) : null,
      status: "pending",
    }).select().single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMine(data as ProposalRow);
    toast.success("Proposal sent! 🎉");
  };

  if (loading) {
    return <div className="min-h-screen"><SiteHeader /><div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <h1 className="font-display text-2xl font-bold">Job not found</h1>
          <p className="text-sm text-muted-foreground mt-2">It may have been closed or removed.</p>
          <Button asChild className="mt-6"><Link to="/jobs">Back to jobs</Link></Button>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === job.client_id;
  const isDev = profile?.role === "developer";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">← Back to jobs</Link>

        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                <span className="text-success">· {job.status}</span>
              </div>
              <h1 className="font-display text-3xl font-bold mt-3">{job.title}</h1>
              <div className="flex flex-wrap gap-4 mt-5 text-sm">
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> ${job.budget_min ?? "—"}{job.budget_max ? ` – $${job.budget_max}` : ""}</div>
                {job.duration && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {job.duration}</div>}
                <div className="flex items-center gap-2 text-success"><ShieldCheck className="h-4 w-4" /> Escrow protected</div>
              </div>
              {job.description && (
                <div className="mt-6 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
              )}
            </div>

            {/* Owner: see proposals */}
            {isOwner && (
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Proposals received ({proposals.length})</h3>
                {proposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No proposals yet. Share your job to attract developers.</p>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((p) => (
                      <div key={p.id} className="rounded-lg border border-border/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${p.bid_amount.toLocaleString()}</span>
                            {p.delivery_days && <span className="text-xs text-muted-foreground">· {p.delivery_days} days</span>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${p.status === "pending" ? "bg-accent/10 text-accent border-accent/30" : "bg-success/10 text-success border-success/30"}`}>{p.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{p.cover_letter}</p>
                        <div className="text-xs text-muted-foreground mt-2">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Developer: submit proposal */}
            {isDev && !isOwner && (
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h3 className="font-display text-lg font-semibold mb-1">Submit your proposal</h3>
                <p className="text-xs text-muted-foreground mb-4">Only the job owner will see your proposal.</p>
                {mine ? (
                  <div className="rounded-lg border border-success/30 bg-success/10 text-success p-4 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                      <div className="font-semibold">Proposal sent</div>
                      <div className="text-xs mt-1 text-success/80">Status: {mine.status} · ${mine.bid_amount.toLocaleString()}{mine.delivery_days ? ` · ${mine.delivery_days} days` : ""}</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Bid (USD)</Label>
                        <Input required type="number" min="1" step="1" className="mt-1.5" placeholder="3000" value={bid} onChange={(e) => setBid(e.target.value)} />
                      </div>
                      <div>
                        <Label>Delivery (days)</Label>
                        <Input type="number" min="1" className="mt-1.5" placeholder="21" value={days} onChange={(e) => setDays(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Cover letter</Label>
                      <Textarea required rows={6} className="mt-1.5" placeholder="Why you're the right fit, similar work, your approach…" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center">
                      <button type="button" onClick={() => setEscrowOpen(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> How escrow works
                      </button>
                      <Button type="submit" disabled={submitting} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                        {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending…</> : <>Submit Proposal <ArrowRight className="ml-2 h-4 w-4" /></>}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!session && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="text-sm">Sign in as a developer to submit a proposal.</div>
                </div>
                <Button asChild><Link to="/login">Sign in</Link></Button>
              </div>
            )}
            <div id="escrow" className="scroll-mt-24"><EscrowTimeline jobId={job.id} /></div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div className="font-display font-semibold mt-2">Escrow protected</div>
              <p className="text-xs text-muted-foreground mt-1">Funds held safely. Released only when work is approved.</p>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={escrowOpen} onOpenChange={setEscrowOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">How Escrow Works</DialogTitle>
            <DialogDescription>Safe for both sides. Always.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {[
              { t: "Client funds the project", d: "Money moves into a secure DevPay escrow wallet." },
              { t: "Escrow holds the funds", d: "Neither party can touch funds until conditions are met." },
              { t: "Developer ships the work", d: "Submit milestones for client review." },
              { t: "Funds released to dev", d: "Approved work pays out instantly to your wallet." },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-display font-bold shrink-0">{i + 1}</div>
                <div>
                  <div className="font-semibold flex items-center gap-2">{s.t}<CheckCircle2 className="h-4 w-4 text-success" /></div>
                  <div className="text-sm text-muted-foreground">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
