import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, DollarSign, Calendar, ShieldCheck, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/client/active-contracts")({
  head: () => ({ meta: [{ title: "Active Contracts — DevPay Africa" }] }),
  component: ClientActiveContracts,
});

type ProposalWithDevAndJob = {
  id: string;
  bid_amount: number;
  status: string;
  created_at: string;
  developer_id: string;
  job_id: string;
  developer?: {
    full_name: string;
    email: string;
  } | null;
  job: {
    id: string;
    title: string;
    description: string | null;
  } | null;
};

function ClientActiveContracts() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ProposalWithDevAndJob[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      try {
        // Fetch proposals where job client_id = session.user.id and status = accepted/hired
        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, title, description")
          .eq("client_id", session.user.id);

        if (jobs && jobs.length > 0) {
          const jobIds = jobs.map((j) => j.id);
          const { data: props } = await supabase
            .from("proposals")
            .select("*")
            .in("job_id", jobIds)
            .in("status", ["accepted", "hired"])
            .order("created_at", { ascending: false });

          const activeContracts = (props as any[]) ?? [];

          // Map job and developer details
          await Promise.all(
            activeContracts.map(async (c) => {
              c.job = jobs.find((j) => j.id === c.job_id) || null;
              const { data: dev } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", c.developer_id)
                .maybeSingle();
              c.developer = dev;
            })
          );

          setContracts(activeContracts);
        }
      } catch (err) {
        console.error("Error loading client active contracts:", err);
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
        <h1 className="font-display text-2xl font-bold">Active Contracts</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage active deliverables, approve milestones, and release escrow payouts securely.</p>
      </div>

      {contracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold mt-4">No active contracts</h3>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any active developer contracts currently.
          </p>
          <Button asChild className="mt-5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Link to="/client/talent">Find Vetted Talent</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => {
            const devName = c.developer?.full_name ?? "Vetted Developer";
            const devEmail = c.developer?.email ?? "";
            
            return (
              <div key={c.id} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                        Active Project
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Started on {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold">
                      {c.job?.title ?? "Untitled Agreement"}
                    </h3>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Developer: <span className="font-medium text-foreground">{devName}</span></span>
                      {devEmail && <span>Contact: <span className="text-foreground">{devEmail}</span></span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="text-xs text-muted-foreground">Contract Escrow Value</div>
                    <div className="flex items-center text-primary font-display font-bold text-lg">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      {c.bid_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15 mt-1">
                      <ShieldCheck className="h-3 w-3" /> Fully Funded In Escrow
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Review and release milestones from your secure client dashboard.
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/jobs/$jobId" params={{ jobId: c.job_id }}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                      <Link to="/jobs/$jobId" params={{ jobId: c.job_id }} hash="escrow">
                        Manage Milestones <ArrowRight className="ml-2 h-4 w-4" />
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
