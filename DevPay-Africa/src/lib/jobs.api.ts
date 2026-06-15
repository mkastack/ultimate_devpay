import { supabase } from "@/integrations/supabase/client";

type CreateJobInput = {
  category: string | null;
  project_type: string;
  title: string;
  description: string;
  timeline: string | null;
  experience: string | null;
  budget_type: "fixed" | "hourly";
  budget: number | null;
  skills: string[];
};

export async function createJob(data: CreateJobInput) {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("Not authenticated");
  }

  // 1. Insert job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      client_id: user.data.user.id,
      title: data.title,
      description: data.description,
      category: data.category,
      project_type: data.project_type,
      timeline: data.timeline,
      experience_level: data.experience,
      budget_type: data.budget_type,
      budget: data.budget,
      status: "open",
    })
    .select()
    .single();

  if (jobError) throw jobError;

  // 2. Insert skills
  if (data.skills.length > 0) {
    const skillRows = data.skills.map((skill) => ({
      job_id: job.id,
      skill,
    }));

    const { error: skillsError } = await supabase
      .from("job_skills")
      .insert(skillRows);

    if (skillsError) throw skillsError;
  }

  return job;
}