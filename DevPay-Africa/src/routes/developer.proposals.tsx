import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Calendar, DollarSign, Clock, ArrowRight, Eye } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/developer/proposals")({
  head: () => ({ meta: [{ title: "My Proposals — DevPay Africa" }] }),
  component: DeveloperProposals,
});

type ProposalWithJob = {
  id: string;
  developer_id: string;
  job_id: string;
  cover_letter: string;
  bid_amount: number;
  delivery_days: number | null;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    status: string;
    budget_min: number | null;
    budget_max: number | null;
  } | null;
};

function DeveloperProposals() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithJob[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "closed">("all");

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("proposals")
          .select("*, job:jobs(id, title, status, budget_min, budget_max)")
          .eq("developer_id", session.user.id)
          .order("created_at", { ascending: false });

        setProposals((data as any[]) ?? []);
      } catch (err) {
        console.error("Error loading proposals:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user]);

  // Filter proposals
  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (filter === "all") return true;
      if (filter === "pending") return ["pending", "submitted"].includes(p.status);
      if (filter === "accepted") return ["accepted", "hired"].includes(p.status);
      if (filter === "closed") return ["rejected", "closed", "declined"].includes(p.status);
      return true;
    });
  }, [proposals, filter]);

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
        <h1 className="font-display text-2xl font-bold">My Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage your submitted bids and active contracts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-4">
        {([
          { key: "all", label: `All (${proposals.length})` },
          { key: "accepted", label: `Active/Hired (${proposals.filter(p => ["accepted", "hired"].includes(p.status)).length})` },
          { key: "pending", label: `Pending (${proposals.filter(p => ["pending", "submitted"].includes(p.status)).length})` },
          { key: "closed", label: `Closed (${proposals.filter(p => ["rejected", "closed", "declined"].includes(p.status)).length})` }
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold mt-4">No proposals found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {filter === "all" ? "You haven't submitted any proposals yet." : `You have no ${filter} proposals.`}
          </p>
          {filter === "all" && (
            <Button asChild className="mt-5 bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Link to="/jobs">Browse Open Jobs</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const isHired = ["accepted", "hired"].includes(p.status);
            const isClosed = ["rejected", "closed", "declined"].includes(p.status);
            
            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 ${
                  isHired ? "border-primary/20 bg-primary/5" : "border-border/60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        isHired ? "bg-success/15 text-success border-success/35" : 
                        isClosed ? "bg-destructive/15 text-destructive border-destructive/35" : 
                        "bg-accent/15 text-accent border-accent/35"
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted on {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold mt-1">
                      {p.job?.title ?? "Untitled Job Posting"}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center text-primary font-display font-bold text-lg">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      {p.bid_amount.toLocaleString()}
                    </div>
                    {p.delivery_days && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.delivery_days} days delivery
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Cover Letter</div>
                  <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-3">
                    {p.cover_letter}
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/jobs/$jobId" params={{ jobId: p.job_id }}>
                      <Eye className="mr-2 h-4 w-4" /> View Job Post
                    </Link>
                  </Button>
                  {isHired && (
                    <Button asChild size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                      <Link to="/jobs/$jobId" params={{ jobId: p.job_id }} hash="escrow">
                        Manage Escrow <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
