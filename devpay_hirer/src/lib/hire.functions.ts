import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MilestoneSchema = z.object({
  name: z.string().min(1).max(120),
  amount: z.number().positive().max(10_000_000),
  due_days: z.number().int().min(1).max(365),
});

const HireSchema = z.object({
  session_id: z.string().min(1).max(128),
  job_id: z.string().min(1).max(64),
  job_title: z.string().min(1).max(200),
  developer_name: z.string().min(1).max(120),
  bid_amount: z.number().positive().max(10_000_000),
  days: z.number().int().min(1).max(365),
  budget_min: z.number().nonnegative(),
  budget_max: z.number().nonnegative(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  milestones: z.array(MilestoneSchema).min(1).max(20),
});

export const createHireRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => HireSchema.parse(input))
  .handler(async ({ data }) => {
    // Verify approved job
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("jobs_registry")
      .select("id, approved, budget_min, budget_max")
      .eq("id", data.job_id)
      .maybeSingle();
    if (jobErr) throw new Error(jobErr.message);
    if (!job) throw new Error("UNAPPROVED_JOB");
    if (!job.approved) throw new Error("UNAPPROVED_JOB");
    if (data.bid_amount < Number(job.budget_min) || data.bid_amount > Number(job.budget_max)) {
      throw new Error(`BID_OUT_OF_RANGE:${job.budget_min}:${job.budget_max}`);
    }

    // Verify developer
    const { data: dev, error: devErr } = await supabaseAdmin
      .from("developers_registry")
      .select("name, verified")
      .eq("name", data.developer_name)
      .maybeSingle();
    if (devErr) throw new Error(devErr.message);
    if (!dev || !dev.verified) throw new Error("UNVERIFIED_DEVELOPER");

    // Milestones must sum to bid (cents tolerance)
    const sum = data.milestones.reduce((a, m) => a + m.amount, 0);
    if (Math.abs(sum - data.bid_amount) > 0.01) throw new Error("MILESTONE_SUM_MISMATCH");

    if (new Date(data.deadline).getTime() < Date.now() - 86_400_000) {
      throw new Error("DEADLINE_PAST");
    }

    // 1) Create the hire request (status: approved — server-side validations passed)
    const { data: hire, error } = await supabaseAdmin
      .from("hire_requests")
      .insert({
        session_id: data.session_id,
        job_id: data.job_id,
        job_title: data.job_title,
        developer_name: data.developer_name,
        bid_amount: data.bid_amount,
        days: data.days,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        deadline: data.deadline,
        milestones: data.milestones,
        status: "approved",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // 2) Auto-generate contract
    const platformFee = Math.round(data.bid_amount * 0.04 * 100) / 100;
    const { data: contract, error: cErr } = await supabaseAdmin
      .from("contracts")
      .insert({
        hire_request_id: hire.id,
        job_id: data.job_id,
        job_title: data.job_title,
        developer_name: data.developer_name,
        amount: data.bid_amount,
        platform_fee: platformFee,
        deadline: data.deadline,
        milestones: data.milestones,
        status: "active",
      })
      .select("id")
      .single();
    if (cErr) throw new Error(cErr.message);

    // 3) Kick off escrow flow (pending — awaiting funding)
    const { data: escrow, error: eErr } = await supabaseAdmin
      .from("escrow_accounts")
      .insert({
        contract_id: contract.id,
        amount: data.bid_amount,
        status: "pending",
      })
      .select("id, status")
      .single();
    if (eErr) throw new Error(eErr.message);

    return {
      hire_id: hire.id,
      contract_id: contract.id,
      escrow_id: escrow.id,
      escrow_status: escrow.status as "pending" | "funded" | "locked" | "released" | "refunded",
    };
  });
