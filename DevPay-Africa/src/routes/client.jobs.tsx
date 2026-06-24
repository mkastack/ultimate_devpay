import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; 
import { useAuth } from "@/integrations/supabase/auth-context"; 

export const Route = createFileRoute("/client/jobs")({
  head: () => ({ meta: [{ title: "My Jobs · DevPay Africa" }] }),
  component: JobsPage,
});

// Helper to match your mock UI's "3d ago" format
function formatDaysAgo(dateString: string) {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? "Today" : `${diffDays}d`;
}

// Helper to clean up budget rendering based on min/max and currency
function formatBudget(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return "TBD";
  
  const currencySymbol = currency || "GHS";
  const formattedMin = min ? min.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "";
  const formattedMax = max ? max.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "";

  if (min === max) {
    return `${currencySymbol} ${formattedMin}`;
  }
  return `${currencySymbol} ${formattedMin} - ${formattedMax}`;
}

function JobsPage() {
  const { user } = useAuth(); 
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyJobs() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("jobs") 
          .select("*")
          .eq("client_id", user.id) 
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyJobs();
  }, [user]);

  return (
    <>
      <TopBar
        title="My Jobs"
        subtitle="Manage your open and past job posts"
        right={
          <Link
            to="/client/post-job"
            className="hidden h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold md:flex"
            style={{ color: "var(--background)" }}
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> New Job
          </Link>
        }
      />

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-12 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-foreground font-semibold">No jobs posted yet</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Create your first job post to start receiving proposals.</p>
            <Link
              to="/client/post-job"
              className="flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold gold-gradient shadow-gold"
              style={{ color: "var(--background)" }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Post a Job
            </Link>
          </div>
        ) : (
          jobs.map((j) => (
            <Link
              key={j.id}
              to="/client/proposals"
              search={{ jobId: j.id }} 
              className="block rounded-2xl border bg-card p-5 transition-colors hover:bg-[var(--card-hover)]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-foreground">{j.title}</div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                    {/* Category Badge */}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
                      style={{ background: "var(--card-hover)", color: "var(--text-secondary)" }}
                    >
                      {j.category || "Uncategorized"}
                    </span>

                    {/* Project Type Badge (e.g., Full-time, One-time) */}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
                      style={{ background: "var(--card-hover)", color: "var(--text-secondary)" }}
                    >
                      {j.project_type?.replace("-", " ") || "Project"}
                    </span>

                    {/* Dynamically parsed Currency and Budget */}
                    <span className="font-mono text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                      {formatBudget(j.budget_min, j.budget_max, j.currency)}
                    </span>
                    
                    {/* Real Proposals Counter */}
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                      style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
                    >
                      {j.proposals_count ?? 0} {j.proposals_count === 1 ? "proposal" : "proposals"}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end justify-between self-stretch">
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Posted {j.created_at ? formatDaysAgo(j.created_at) : "recently"}
                  </div>
                  <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                  >
                    {j.status || "open"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}