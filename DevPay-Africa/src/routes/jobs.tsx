import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicJobCard } from "@/components/PublicJobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  Briefcase,
  SlidersHorizontal,
  Tag,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { useJobStore } from "@/lib/stores/job-store";
import { showcaseJobs, type PublicJobListing } from "@/lib/public-jobs-showcase";
import { JobPreviewDialog } from "@/components/JobPreviewDialog";
import { z } from "zod";

const jobSearchSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
});

export const Route = createFileRoute("/jobs")({
  validateSearch: jobSearchSchema,
  head: () => ({ meta: [{ title: "Browse Jobs — DevPay Africa" }] }),
  component: Jobs,
});

type JobRow = {
  id: string;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  duration: string | null;
  status: string;
  created_at: string;
  client_id: string;
};

const categoriesList = ["All", "Web Dev", "Mobile Apps", "Fintech", "UI/UX Design", "Cloud Engineering", "Data Science", "Security", "Web3"];
const budgetsList = [
  { label: "All Budgets", value: "all" },
  { label: "Under $1,000", value: "under-1k" },
  { label: "$1,000 – $5,000", value: "1k-5k" },
  { label: "$5,000 – $10,000", value: "5k-10k" },
  { label: "$10,000+", value: "10k-plus" },
];
const timelinesList = [
  { label: "All Timelines", value: "all" },
  { label: "Under 1 Month", value: "under-1m" },
  { label: "1 to 3 Months", value: "1m-3m" },
  { label: "3+ Months", value: "3m-plus" },
];
const topSkills = ["React", "TypeScript", "Node.js", "Solidity", "Supabase", "React Native", "Flutter", "Python", "UI/UX", "Docker"];

function extractSkills(title: string, desc: string | null): string[] {
  const text = `${title} ${desc ?? ""}`.toLowerCase();
  const list: string[] = [];
  if (text.includes("react") && !text.includes("react native")) list.push("React");
  if (text.includes("native") || text.includes("react-native")) list.push("React Native");
  if (text.includes("typescript") || text.includes("ts")) list.push("TypeScript");
  if (text.includes("node") || text.includes("express")) list.push("Node.js");
  if (text.includes("solidity") || text.includes("smart contract") || text.includes("web3")) list.push("Solidity");
  if (text.includes("supabase") || text.includes("postgres")) list.push("Supabase");
  if (text.includes("flutter")) list.push("Flutter");
  if (text.includes("python") || text.includes("django")) list.push("Python");
  if (text.includes("ui") || text.includes("ux") || text.includes("design") || text.includes("figma")) list.push("UI/UX");
  if (text.includes("docker") || text.includes("aws") || text.includes("cloud")) list.push("Docker");
  return list.length > 0 ? list : ["Full Stack", "API Integration"];
}

function inferCategory(title: string, desc: string | null): string {
  const text = `${title} ${desc ?? ""}`.toLowerCase();
  if (text.includes("mobile") || text.includes("flutter") || text.includes("react native")) return "Mobile Apps";
  if (text.includes("design") || text.includes("figma") || text.includes("ui")) return "UI/UX Design";
  if (text.includes("cloud") || text.includes("aws") || text.includes("docker")) return "Cloud Engineering";
  if (text.includes("solidity") || text.includes("web3")) return "Web3";
  if (text.includes("security") || text.includes("audit")) return "Security";
  return "Web Dev";
}

function rowToListing(j: JobRow): PublicJobListing {
  const skills = extractSkills(j.title, j.description);
  return {
    id: j.id,
    title: j.title,
    description: j.description ?? "No description provided.",
    budget_min: j.budget_min ?? 0,
    budget_max: j.budget_max ?? j.budget_min ?? 0,
    currency: j.currency ?? "USD",
    duration: j.duration ?? "Flexible",
    status: j.status,
    created_at: j.created_at,
    client_id: j.client_id,
    clientName: "Verified Hirer",
    clientVerified: true,
    location: "Remote",
    category: inferCategory(j.title, j.description),
    experienceLevel: "Intermediate",
    skills,
    proposalsCount: Math.floor(Math.random() * 12) + 2,
  };
}

function Jobs() {
  const { profile } = useAuth();
  const [dbJobs, setDbJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewJob, setPreviewJob] = useState<PublicJobListing | null>(null);

  const { category: queryCategory, search: querySearch, budget_min, budget_max } = Route.useSearch();
  const { setFilter } = useJobStore();

  useEffect(() => {
    if (queryCategory) setFilter("category", queryCategory);
    if (querySearch) setFilter("search", querySearch);
    if (budget_min) setFilter("budget_min", budget_min);
    if (budget_max) setFilter("budget_max", budget_max);
  }, [queryCategory, querySearch, budget_min, budget_max, setFilter]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [budgetRange, setBudgetRange] = useState("all");
  const [timeline, setTimeline] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setDbJobs((data as JobRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const usingPreview = dbJobs.length === 0;
  const sourceJobs: PublicJobListing[] = usingPreview
    ? showcaseJobs
    : dbJobs.map(rowToListing);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const clearFilters = () => {
    setQ("");
    setCategory("All");
    setBudgetRange("all");
    setTimeline("all");
    setSelectedSkills([]);
  };

  const filtered = useMemo(() => {
    return sourceJobs.filter((j) => {
      const text = `${j.title} ${j.description}`.toLowerCase();

      if (q && !text.includes(q.toLowerCase())) return false;

      if (category !== "All" && j.category !== category) return false;

      if (budgetRange !== "all") {
        const maxBudget = j.budget_max || j.budget_min;
        if (budgetRange === "under-1k" && maxBudget >= 1000) return false;
        if (budgetRange === "1k-5k" && (maxBudget < 1000 || maxBudget > 5000)) return false;
        if (budgetRange === "5k-10k" && (maxBudget < 5000 || maxBudget > 10000)) return false;
        if (budgetRange === "10k-plus" && maxBudget < 10000) return false;
      }

      if (timeline !== "all") {
        const durationText = j.duration.toLowerCase();
        if (timeline === "under-1m" && !durationText.includes("week") && durationText.includes("month")) return false;
        if (timeline === "1m-3m" && !durationText.match(/[1-3].*month/)) return false;
        if (timeline === "3m-plus" && !durationText.includes("month") && !durationText.includes("year")) return false;
      }

      if (selectedSkills.length > 0) {
        if (!selectedSkills.some((s) => j.skills.includes(s))) return false;
      }

      return true;
    });
  }, [sourceJobs, q, category, budgetRange, timeline, selectedSkills]);

  const hasActiveFilters =
    q || category !== "All" || budgetRange !== "all" || timeline !== "all" || selectedSkills.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />

      <SiteHeader />

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight">
              Find your next <span className="text-gradient-brand">project</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escrow-protected high-quality gigs from global hirers.
            </p>
          </div>
          {profile?.role === "client" && (
            <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95">
              <Link to="/client/post-job">Post a job</Link>
            </Button>
          )}
        </div>

        <div className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 border-border/40 bg-surface/50 pl-10 focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="Search jobs by keyword, role title, skills..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`h-12 border-border/60 ${showFilters ? "border-primary/20 bg-primary/10 text-primary" : ""}`}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="ghost" className="h-12 text-xs text-muted-foreground hover:text-foreground">
                Reset
              </Button>
            )}
          </div>

          {(showFilters || category !== "All" || budgetRange !== "all" || timeline !== "all") && (
            <div className="grid grid-cols-1 gap-4 border-t border-border/30 pt-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget Range</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {budgetsList.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration / Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {timelinesList.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3 w-3" /> Filter by Core Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topSkills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 bg-surface text-muted-foreground hover:bg-surface/80"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {usingPreview && !loading && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Showing <strong className="text-foreground">sample listings</strong> — post a job or connect live data to replace these previews.
            </span>
          </div>
        )}

        {!usingPreview && filtered.length > 0 && (
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> open{" "}
            {filtered.length === 1 ? "role" : "roles"} available
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
            <Briefcase className="mx-auto h-12 w-12 animate-pulse text-muted-foreground/40" />
            <h3 className="mt-4 font-display text-xl font-bold">No jobs found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              We couldn&apos;t find any matches. Try modifying your search keywords or clearing the active filters.
            </p>
            <Button onClick={clearFilters} className="mt-5 border border-border">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((j) => (
              <PublicJobCard
                key={j.id}
                job={j}
                isPreview={usingPreview}
                onDeveloperPreview={setPreviewJob}
              />
            ))}
          </div>
        )}
      </div>

      <JobPreviewDialog
        open={!!previewJob}
        onOpenChange={(v) => !v && setPreviewJob(null)}
        job={previewJob}
      />
    </div>
  );
}
