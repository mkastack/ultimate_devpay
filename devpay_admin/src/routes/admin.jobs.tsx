import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Avatar, Pill } from "@/components/admin/ui";
import { ALL_JOBS } from "@/lib/admin-mock";
import { Star } from "lucide-react";

export const Route = createFileRoute("/admin/jobs")({
  component: JobsPage,
});

function JobsPage() {
  return (
    <div>
      <AdminHeader title="All Jobs" subtitle={`${ALL_JOBS.length} jobs on the marketplace`} />

      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              {["Job Title", "Client", "Category", "Budget", "Proposals", "Status", "Posted", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_JOBS.map((j) => (
              <tr key={j.id} className="h-[60px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    {j.featured && <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />}
                    <div>
                      <div className="font-sans text-[13px] font-semibold text-white">{j.title}</div>
                      <div className="font-mono text-[11px] text-[#3D4466]">{j.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={j.client} color="#F5A623" size={28} />
                    <span className="font-sans text-[13px] text-white">{j.client}</span>
                  </div>
                </td>
                <td className="px-4"><Pill color="gray">{j.category}</Pill></td>
                <td className="px-4 font-mono text-[13px] text-[#F5A623]">GHS {j.budget.toLocaleString()}</td>
                <td className="px-4 font-mono text-[13px] text-white">{j.proposals}</td>
                <td className="px-4">
                  <Pill color={j.status === "open" ? "green" : j.status === "filled" ? "blue" : j.status === "cancelled" ? "red" : "gray"}>
                    {j.status}
                  </Pill>
                </td>
                <td className="px-4 font-sans text-[13px] text-[#3D4466]">{j.posted}</td>
                <td className="px-4">
                  <button className="rounded-md bg-[#12152A] px-3 py-1.5 font-sans text-[12px] text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
