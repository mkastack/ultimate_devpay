import type { HireTarget } from "@/components/hirer-dashboard/HireDialog";
import type { HirerDeveloper } from "@/lib/hirer-developer-catalog";
import { openJobs } from "@/lib/hirer-mock-data";

export function hireTargetFromDeveloper(dev: HirerDeveloper, jobId?: string): HireTarget {
  const job = openJobs.find((j) => j.id === jobId) ?? openJobs[0];
  return {
    proposalId: `direct-${dev.id}`,
    jobId: job.id,
    jobTitle: job.title,
    developerName: dev.name,
    suggestedBid: Math.round(dev.rate * 28),
    suggestedDays: 21,
  };
}

export function hireTargetFromProposal(
  proposalId: string,
  jobId: string,
  jobTitle: string,
  devName: string,
  bid: number,
  days: number,
): HireTarget {
  return { proposalId, jobId, jobTitle, developerName: devName, suggestedBid: bid, suggestedDays: days };
}
