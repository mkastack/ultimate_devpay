import { createServerFn } from "@tanstack/react-start";

type HirePayload = {
  session_id: string;
  job_id: string;
  job_title: string;
  developer_name: string;
  bid_amount: number;
  days: number;
  budget_min: number;
  budget_max: number;
  deadline: string;
  milestones: Array<{ name: string; amount: number; due_days: number }>;
};

export const createHireRequest = createServerFn({ method: "POST" })
  .validator((data: HirePayload) => data)
  .handler(async ({ data }) => {
    return {
      hire_id: `hire_${data.job_id}_${Date.now()}`,
      contract_id: `contract_${data.job_id}`,
      job_title: data.job_title,
      developer_name: data.developer_name,
    };
  });
