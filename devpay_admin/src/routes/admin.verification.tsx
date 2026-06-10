import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Avatar, Pill } from "@/components/admin/ui";
import { ALL_USERS } from "@/lib/admin-mock";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/verification")({
  component: Page,
});

function Page() {
  const pending = ALL_USERS.filter((u) => u.status === "pending" || u.status === "unverified").slice(0, 18);

  return (
    <div>
      <AdminHeader title="Verification Queue" subtitle={`${pending.length} users awaiting verification`} />

      <div className="mb-5 flex gap-1 rounded-full bg-[#12152A] p-1">
        {["All", "Pending", "Under Review", "Approved", "Rejected"].map((t, i) => (
          <button key={t} className={`flex-1 rounded-full px-3 py-2 font-sans text-[12px] font-medium transition-colors ${i === 1 ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3">
        {pending.map((u, i) => {
          const hrs = (i * 7) % 48;
          const ageColor = hrs > 24 ? "#FF4D6A" : hrs > 12 ? "#F59E0B" : "#10B981";
          return (
            <Card key={u.id} padding="p-5" className="flex items-center gap-5">
              <Avatar name={u.name} color={u.avatarColor} size={56} ring="#1E3A8A" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[15px] font-semibold text-white">{u.name}</span>
                  <Pill color={u.role === "developer" ? "cyan" : "gold"}>{u.role}</Pill>
                </div>
                <div className="font-sans text-[12px] text-[#3D4466]">{u.flag} {u.country} · {u.email}</div>
                <div className="mt-1 font-sans text-[12px]" style={{ color: hrs > 24 ? "#F59E0B" : "#8890B5" }}>
                  Submitted {hrs}h ago
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-mono text-[12px]" style={{ color: ageColor }}>Queue: {hrs}h</div>
                <button className="rounded-md bg-[#12152A] px-3 py-1.5 font-sans text-[12px] text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">View Document</button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-[10px] border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-4 py-2 font-sans text-[13px] font-semibold text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]">
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button className="flex items-center gap-1.5 rounded-[10px] border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] px-4 py-2 font-sans text-[13px] font-semibold text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
