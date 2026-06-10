import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2, DollarSign, Calendar, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/developer/active-jobs")({
  head: () => ({ meta: [{ title: "Active Jobs — DevPay Africa" }] }),
  component: DeveloperActiveJobs,
});

type ProposalWithJob = {
  id: string;
  developer_id: string;
  job_id: string;
  bid_amount: number;
  delivery_days: number | null;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string | null;
    budget_min: number | null;
    budget_max: number | null;
    created_at: string;
    client_id: string;
    client?: {
      full_name: string;
      email: string;
    } | null;
  } | null;
};

function DeveloperActiveJobs() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState<ProposalWithJob[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      try {
        // Fetch proposals where developer has been accepted/hired
        const { data } = await supabase
          .from("proposals")
          .select("*, job:jobs(*)")
          .eq("developer_id", session.user.id)
          .in("status", ["accepted", "hired"])
          .order("created_at", { ascending: false });

        const proposalsWithClients = (data as any[]) ?? [];

        // For each job, fetch the client profile details
        await Promise.all(
          proposalsWithClients.map(async (p) => {
            if (p.job && p.job.client_id) {
              const { data: clientData } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", p.job.client_id)
                .maybeSingle();
              p.job.client = clientData;
            }
          })
        );

        setActiveJobs(proposalsWithClients);
      } catch (err) {
        console.error("Error loading active jobs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Active Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your active milestones, submit deliverables, and track escrow payments.</p>
      </div>

      {activeJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold mt-4">No active jobs yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any active contracts at the moment. Browse available listings and submit proposals to win projects.
          </p>
          <Button asChild className="mt-5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Link to="/jobs">Browse Open Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeJobs.map((p) => {
            const clientName = p.job?.client?.full_name ?? "Verified Hirer";
            const clientEmail = p.job?.client?.email ?? "";
            
            return (
              <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                        In Progress
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Started on {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold">
                      {p.job?.title ?? "Active Contract"}
                    </h3>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Client: <span className="font-medium text-foreground">{clientName}</span></span>
                      {clientEmail && <span>Contact: <span className="text-foreground">{clientEmail}</span></span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="text-xs text-muted-foreground">Contract Value</div>
                    <div className="flex items-center text-primary font-display font-bold text-lg">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      {p.bid_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15 mt-1">
                      <ShieldCheck className="h-3 w-3" /> 100% Escrow Active
                    </div>
                  </div>
                </div>

                {p.job?.description && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2 border-l-2 border-border pl-3 py-1">
                    {p.job.description}
                  </p>
                )}

                <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Protecting your earnings: Escrow automatically secures all milestone values.
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/jobs/$jobId" params={{ jobId: p.job_id }}>
                        View Contract
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                      <Link to="/jobs/$jobId" params={{ jobId: p.job_id }} hash="escrow">
                        Submit Deliverable <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
