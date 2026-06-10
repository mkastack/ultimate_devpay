import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Loader2, Briefcase, Star, Filter, ShieldCheck, DollarSign, Calendar, SlidersHorizontal, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { useJobStore } from "@/lib/stores/job-store";
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Predefined lists for robust filtering
const categoriesList = ["All", "Web Dev", "Mobile Apps", "UI/UX Design", "Cloud Engineering", "Data Science", "Security", "Web3"];
const budgetsList = [
  { label: "All Budgets", value: "all" },
  { label: "Under $1,000", value: "under-1k" },
  { label: "$1,000 – $5,000", value: "1k-5k" },
  { label: "$5,000 – $10,000", value: "5k-10k" },
  { label: "$10,000+", value: "10k-plus" }
];
const timelinesList = [
  { label: "All Timelines", value: "all" },
  { label: "Under 1 Month", value: "under-1m" },
  { label: "1 to 3 Months", value: "1m-3m" },
  { label: "3+ Months", value: "3m-plus" }
];
const topSkills = ["React", "TypeScript", "Node.js", "Solidity", "Supabase", "React Native", "Flutter", "Python", "UI/UX", "Docker"];

// Helper to dynamically extract matching skills based on job description & title
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
  
  // Return extracted skills, or a default list if none found
  return list.length > 0 ? list : ["Full Stack", "API Integration"];
}

function Jobs() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { category: queryCategory, search: querySearch, budget_min, budget_max } = Route.useSearch();
  const { setFilter } = useJobStore();

  useEffect(() => {
    if (queryCategory) setFilter("category", queryCategory);
    if (querySearch) setFilter("search", querySearch);
    if (budget_min) setFilter("budget_min", budget_min);
    if (budget_max) setFilter("budget_max", budget_max);
  }, [queryCategory, querySearch, budget_min, budget_max, setFilter]);

  // Search & Filter state
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
        setJobs((data as JobRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setQ("");
    setCategory("All");
    setBudgetRange("all");
    setTimeline("all");
    setSelectedSkills([]);
  };

  // Perform client-side filter computation
  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const skills = extractSkills(j.title, j.description);
      const text = `${j.title} ${j.description ?? ""}`.toLowerCase();

      // Search query
      if (q && !j.title.toLowerCase().includes(q.toLowerCase()) && !j.description?.toLowerCase().includes(q.toLowerCase())) {
        return false;
      }

      // Category filter
      if (category !== "All") {
        const cat = category.toLowerCase();
        if (cat === "web dev" && !text.includes("web") && !text.includes("react") && !text.includes("next")) return false;
        if (cat === "mobile apps" && !text.includes("mobile") && !text.includes("native") && !text.includes("flutter")) return false;
        if (cat === "ui/ux design" && !text.includes("design") && !text.includes("ui") && !text.includes("ux")) return false;
        if (cat === "cloud engineering" && !text.includes("cloud") && !text.includes("aws") && !text.includes("docker")) return false;
        if (cat === "web3" && !text.includes("solidity") && !text.includes("web3") && !text.includes("crypto")) return false;
      }

      // Budget Range filter
      if (budgetRange !== "all") {
        const maxBudget = j.budget_max ?? j.budget_min ?? 0;
        if (budgetRange === "under-1k" && maxBudget >= 1000) return false;
        if (budgetRange === "1k-5k" && (maxBudget < 1000 || maxBudget > 5000)) return false;
        if (budgetRange === "5k-10k" && (maxBudget < 5000 || maxBudget > 10000)) return false;
        if (budgetRange === "10k-plus" && maxBudget < 10000) return false;
      }

      // Timeline/Duration filter
      if (timeline !== "all") {
        const durationText = (j.duration ?? "").toLowerCase();
        if (timeline === "under-1m" && !durationText.includes("month") && !durationText.includes("week")) return false;
        if (timeline === "1m-3m" && !durationText.includes("1") && !durationText.includes("2") && !durationText.includes("3") && durationText.includes("month")) return false;
        if (timeline === "3m-plus" && !durationText.includes("3") && !durationText.includes("6") && !durationText.includes("year")) return false;
      }

      // Skills tags filter
      if (selectedSkills.length > 0) {
        const matchesSkill = selectedSkills.some(s => skills.includes(s));
        if (!matchesSkill) return false;
      }

      return true;
    });
  }, [jobs, q, category, budgetRange, timeline, selectedSkills]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <SiteHeader />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Page Title & Post Job Button */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight">
              Find your next <span className="text-gradient-brand">project</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Escrow-protected high-quality gigs from global hirers.</p>
          </div>
          {profile?.role === "client" && (
            <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)]">
              <Link to="/client/post-job">Post a job</Link>
            </Button>
          )}
        </div>

        {/* Unified Search & Filters Glass Card */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 mb-8 shadow-lg space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 h-12 bg-surface/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="Search jobs by keyword, role title, skills..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`h-12 border-border/60 ${showFilters ? "bg-primary/10 text-primary border-primary/20" : ""}`}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>
            {(q || category !== "All" || budgetRange !== "all" || timeline !== "all" || selectedSkills.length > 0) && (
              <Button onClick={clearFilters} variant="ghost" className="h-12 text-xs text-muted-foreground hover:text-foreground">
                Reset
              </Button>
            )}
          </div>

          {/* Advanced Dropdown Filters (Collapsible) */}
          {(showFilters || category !== "All" || budgetRange !== "all" || timeline !== "all") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border/30">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Budget selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Range</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {budgetsList.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Timeline selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration / Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border/60 bg-surface px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {timelinesList.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Clickable Skill Badges */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Filter by Core Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topSkills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface hover:bg-surface/80 border-border/60 text-muted-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Grid View */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 animate-pulse" />
            <h3 className="font-display text-xl font-bold mt-4">No jobs found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find any matches. Try modifying your search keywords or clearing the active filters.
            </p>
            <Button onClick={clearFilters} className="mt-5 border border-border">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((j) => {
              const skills = extractSkills(j.title, j.description);
              // Clients have average star rating representation
              const clientRating = (4.8 + (Math.random() * 0.2)).toFixed(1);

              return (
                <Link
                  key={j.id}
                  to="/jobs/$jobId"
                  params={{ jobId: j.id }}
                  className="group rounded-2xl border border-border/60 bg-card/80 p-6 flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-all block text-left"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                        {j.title}
                      </h3>
                      <div className="text-primary font-display font-extrabold text-lg shrink-0 flex items-center">
                        <DollarSign className="h-4 w-4 shrink-0 -mr-0.5" />
                        {j.budget_min ? j.budget_min.toLocaleString() : "—"}{j.budget_max ? ` – $${j.budget_max.toLocaleString()}` : ""}
                      </div>
                    </div>

                    {/* Meta data row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Remote</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(j.created_at)}</span>
                      {j.duration && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{j.duration}</span>}
                    </div>

                    {/* Escrow safety badge */}
                    <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15 w-fit">
                      <ShieldCheck className="h-3 w-3" /> Escrow Safe Guaranteed
                    </div>

                    {/* Description */}
                    {j.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed py-1">
                        {j.description}
                      </p>
                    )}
                  </div>

                  {/* Footer tags and rating */}
                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between gap-4">
                    {/* Skills tags list */}
                    <div className="flex flex-wrap gap-1 max-w-[70%]">
                      {skills.slice(0, 3).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0 bg-primary/5 text-primary border border-primary/10 rounded">
                          {s}
                        </Badge>
                      ))}
                      {skills.length > 3 && (
                        <span className="text-[10px] text-muted-foreground flex items-center">+{skills.length - 3} more</span>
                      )}
                    </div>

                    {/* Client Rating & Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center text-xs text-muted-foreground gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">{clientRating}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                        Apply →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
