import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ListJobsInput = z.object({
  search: z.string().max(120).optional().default(""),
  category: z.string().max(40).optional().default("all"),
  experience: z.enum(["all", "entry", "intermediate", "expert"]).optional().default("all"),
  status: z.enum(["all", "open", "in_review", "awarded", "closed"]).optional().default("open"),
  minBudget: z.number().int().min(0).max(1_000_000).optional().default(0),
  page: z.number().int().min(1).max(500).optional().default(1),
  pageSize: z.number().int().min(1).max(50).optional().default(10),
});

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListJobsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.category !== "all") q = q.eq("category", data.category);
    if (data.experience !== "all") q = q.eq("experience_level", data.experience);
    if (data.minBudget > 0) q = q.gte("budget_max_usd", data.minBudget);
    if (data.search.trim()) q = q.ilike("title", `%${data.search.trim()}%`);

    const { data: rows, count } = await q;
    return { jobs: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });