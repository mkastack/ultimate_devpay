import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader, Avatar, Pill } from "@/components/admin/ui";
import { ALL_WITHDRAWALS } from "@/lib/admin-mock";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/withdrawals")({
  component: WithdrawalsPage,
});

function WithdrawalsPage() {
  const total = ALL_WITHDRAWALS.reduce((s, w) => s + w.amount, 0);

  return (
    <div>
      <AdminHeader title="Withdrawal Queue" subtitle={`${ALL_WITHDRAWALS.length} pending payouts to process`} />

      <div className="mb-5 flex items-center justify-between">
        <div className="grid grid-cols-4 gap-3.5">
          <Stat label="Total Pending" value={ALL_WITHDRAWALS.length.toString()} color="#F59E0B" />
          <Stat label="GHS Value" value={`GHS ${total.toLocaleString()}`} color="#F5A623" />
          <Stat label="Avg Wait" value="3.2h" color="#3B82F6" />
          <Stat label="Processed Today" value="124" color="#10B981" />
        </div>
      </div>

      {/* Auto-process toggle */}
      <Card padding="p-4" className="mb-5 flex items-center justify-between">
        <div>
          <div className="font-sans text-[14px] font-semibold text-white">Auto-process withdrawals</div>
          <div className="font-sans text-[12px] text-[#3D4466]">Automatically approve withdrawals under GHS 500</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-[12px] text-[#10B981]">Auto: ON — Processing &lt; GHS 500</span>
          <div className="relative h-6 w-11 rounded-full bg-[#1E3A8A]">
            <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              {["User", "Method", "Amount", "Account", "Requested", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_WITHDRAWALS.map((w) => (
              <tr key={w.id} className="h-[60px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={w.user.name} color={w.user.avatarColor} size={32} ring="#00C6A7" />
                    <div>
                      <div className="font-sans text-[13px] font-semibold text-white">{w.user.name}</div>
                      <Pill color="cyan">Developer</Pill>
                    </div>
                  </div>
                </td>
                <td className="px-4 font-sans text-[13px] text-[#8890B5]">{w.method}</td>
                <td className="px-4 font-mono text-[16px] font-bold text-[#F5A623]">GHS {w.amount.toLocaleString()}</td>
                <td className="px-4 font-mono text-[13px] text-[#8890B5]">{w.account}</td>
                <td className="px-4">
                  <span className={`font-sans text-[13px] ${w.requestedHrs > 2 ? "text-[#F59E0B]" : "text-[#3D4466]"}`}>
                    {w.requestedHrs}h ago
                  </span>
                </td>
                <td className="px-4">
                  <Pill color={w.status === "pending" ? "amber" : w.status === "processing" ? "blue" : w.status === "failed" ? "red" : "green"}>
                    {w.status}
                  </Pill>
                </td>
                <td className="px-4">
                  <div className="flex gap-1.5">
                    <button className="flex items-center gap-1 rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-2.5 py-1 font-sans text-[11px] font-semibold text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]">
                      <Check className="h-3 w-3" /> Approve
                    </button>
                    <button className="flex items-center gap-1 rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] px-2.5 py-1 font-sans text-[11px] font-semibold text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card padding="p-4">
      <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">{label}</div>
      <div className="mt-1 font-mono text-[20px] font-bold" style={{ color }}>{value}</div>
    </Card>
  );
}
