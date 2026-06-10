import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { StatCard } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users, ShieldCheck, ArrowRight, DollarSign, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/client/")({
  head: () => ({ meta: [{ title: "Hirer Overview — DevPay Africa" }] }),
  component: ClientOverview,
});

type JobRow = {
  id: string;
  title: string;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
};

function ClientOverview() {
  const { profile, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [counts, setCounts] = useState({
    activeProjects: 0,
    totalSpent: 0,
    devsHired: 0,
    openJobs: 0
  });

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      try {
        // 1. Fetch all client's jobs
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .eq("client_id", session.user.id)
          .order("created_at", { ascending: false });
        
        const clientJobs = (jobsData as JobRow[]) ?? [];
        setJobs(clientJobs);

        // 2. Fetch proposals for these jobs
        const jobIds = clientJobs.map(j => j.id);
        let proposalsData: any[] = [];
        let activeProjectsCount = 0;
        let uniqueDevs = new Set<string>();

        if (jobIds.length > 0) {
          const { data: pData } = await supabase
            .from("proposals")
            .select("*")
            .in("job_id", jobIds);
          proposalsData = pData ?? [];
          
          proposalsData.forEach(p => {
            if (["accepted", "hired"].includes(p.status)) {
              activeProjectsCount++;
              uniqueDevs.add(p.developer_id);
            }
          });
        }

        // 3. Fetch completed payments/milestones/transactions to compute Total Spent
        const { data: txData } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", session.user.id)
          .eq("status", "completed");

        const spentAmount = (txData ?? [])
          .filter(t => ["payment", "release", "debit"].includes(t.type))
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // 4. Calculate open jobs count
        const openJobsCount = clientJobs.filter(j => j.status === "open").length;

        setCounts({
          activeProjects: activeProjectsCount,
          totalSpent: spentAmount,
          devsHired: uniqueDevs.size,
          openJobs: openJobsCount
        });
      } catch (err) {
        console.error("Error loading client dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Hirer";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prominent Post a New Job CTA at Top */}
      <div className="relative rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="text-xs uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Vetted African Tech Experts
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-foreground">Need features built? Post a job today.</h2>
          <p className="text-sm text-muted-foreground max-w-xl">Post your requirements, match with elite developers instantly, and pay securely using escrow protection.</p>
        </div>
        <div className="relative z-10 flex gap-2.5 shrink-0">
          <Button asChild variant="outline" className="border-border/60">
            <Link to="/client/talent"><Users className="mr-2 h-4 w-4" /> Find Talent</Link>
          </Button>
          <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)]">
            <Link to="/client/post-job"><Plus className="mr-2 h-4 w-4" /> Post a New Job</Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={counts.activeProjects.toString()} hint="Contracts in progress" accent="primary" />
        <StatCard label="Total Spent" value={`$${counts.totalSpent.toLocaleString()}`} hint="Successfully paid out" accent="accent" />
        <StatCard label="Developers Hired" value={counts.devsHired.toString()} hint="Vetted experts on team" />
        <StatCard label="Open Jobs" value={counts.openJobs.toString()} hint="Accepting active proposals" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Your Projects list */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Active Job Posts & Projects
            </h3>
            <Link to="/client/active-contracts" className="text-xs text-primary hover:underline flex items-center gap-1">
              Active Contracts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No projects yet. Post your first to get matched with vetted African talent.</p>
              <Button asChild className="mt-4 bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Link to="/client/post-job">Post a Job</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((j) => (
                <Link key={j.id} to="/jobs/$jobId" params={{ jobId: j.id }} className="block rounded-xl border border-border/40 p-4 hover:border-primary/40 hover:bg-surface/30 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">{j.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Posted on {new Date(j.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-display font-bold">{j.budget_min ? `$${j.budget_min.toLocaleString()}` : "—"}{j.budget_max ? ` – $${j.budget_max.toLocaleString()}` : ""}</div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border mt-1.5 inline-block ${
                        j.status === "open" ? "bg-accent/10 text-accent border-accent/25" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                      }`}>
                        {j.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Security / Escrow Info card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mt-4">100% Escrow Protected</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Funds are held securely by DevPay Africa until you approve each milestone. Rest easy knowing payments are tied directly to verified deliverables.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/30 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-surface/60 p-3">
              <div className="text-muted-foreground">Standard Fee</div>
              <div className="font-display text-lg font-bold text-primary mt-0.5">7%</div>
            </div>
            <div className="rounded-lg bg-surface/60 p-3">
              <div className="text-muted-foreground">Security</div>
              <div className="font-display text-lg font-bold text-foreground mt-0.5">Assured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
