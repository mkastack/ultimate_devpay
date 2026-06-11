import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { openJobs } from "@/lib/hirer-mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/client/jobs")({
  head: () => ({ meta: [{ title: "My Jobs · DevPay Africa" }] }),
  component: JobsPage,
});

function JobsPage() {
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
        {openJobs.map((j) => (
          <Link
            key={j.id}
            to="/client/proposals"
            className="block rounded-2xl border bg-card p-5 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-foreground">{j.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px]"
                    style={{ background: "var(--card-hover)", color: "var(--text-secondary)" }}
                  >
                    {j.category}
                  </span>
                  <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{j.budget}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
                  >
                    {j.proposals} proposals
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Posted {j.posted_days}d ago
                </div>
                <span
                  className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                >
                  {j.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
