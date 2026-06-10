import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader, Avatar, Pill } from "@/components/admin/ui";
import { DISPUTES } from "@/lib/admin-mock";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/disputes")({
  component: DisputesPage,
});

function DisputesPage() {
  return (
    <div>
      <AdminHeader title="Disputes Center" subtitle="Resolve conflicts between clients and developers." />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <StatMini label="Open" value="12" color="#FF4D6A" />
        <StatMini label="Under Review" value="5" color="#F59E0B" />
        <StatMini label="Resolved Today" value="3" color="#10B981" />
        <StatMini label="Avg Resolution" value="18h" color="#3B82F6" />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-full bg-[#12152A] p-1">
        {["All", "Open", "Under Review", "Resolved Client", "Resolved Developer", "Closed"].map((t, i) => (
          <button
            key={t}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-[12px] font-medium transition-colors ${
              i === 1 ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3.5">
        {DISPUTES.map((d) => (
          <Card key={d.id} padding="p-6" className="relative">
            {d.highValue && (
              <div className="absolute right-4 top-4">
                <Pill color="red">⚠ HIGH VALUE</Pill>
              </div>
            )}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[13px] font-bold text-[#3B82F6]">{d.id}</span>
              <span className="font-sans text-[16px] font-semibold text-white">{d.contract}</span>
              <Pill color={d.status === "open" ? "red" : "amber"}>{d.status === "open" ? "Open" : "Under Review"}</Pill>
              <span className="ml-auto font-sans text-[12px] text-[#3D4466]">Opened {d.openedHrs}h ago</span>
            </div>

            <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
              {/* Client */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Avatar name={d.client.name} color="#F5A623" ring="#F5A623" size={40} />
                  <div>
                    <Pill color="gold">Client</Pill>
                    <div className="mt-1 font-sans text-[14px] font-semibold text-white">{d.client.name}</div>
                    <div className="font-sans text-[11px] text-[#3D4466]">{d.client.company}</div>
                  </div>
                </div>
                <div className="font-sans text-[12px] leading-relaxed text-[#8890B5]">
                  <span className="text-[#F5A623]">Claims:</span> {d.client.claim}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-px bg-[#1C2040]" />
                <span className="my-1 font-display text-[11px] font-bold text-[#3D4466]">VS</span>
                <div className="h-12 w-px bg-[#1C2040]" />
              </div>
              {/* Developer */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Avatar name={d.developer.name} color="#00C6A7" ring="#00C6A7" size={40} />
                  <div>
                    <Pill color="cyan">Developer</Pill>
                    <div className="mt-1 font-sans text-[14px] font-semibold text-white">{d.developer.name}</div>
                    <div className="font-sans text-[11px] text-[#3D4466]">★ {d.developer.rating}</div>
                  </div>
                </div>
                <div className="font-sans text-[12px] leading-relaxed text-[#8890B5]">
                  <span className="text-[#00C6A7]">Claims:</span> {d.developer.claim}
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="mb-4 flex items-center justify-between rounded-xl bg-[#12152A] px-4 py-3">
              <div>
                <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Disputed Amount</div>
                <div className="font-mono text-[16px] font-bold text-[#F5A623]">GHS {d.amount.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-sans text-[11px] text-[#3D4466]">{d.milestone}</div>
                <div className="font-sans text-[12px] text-[#8890B5]">Held in escrow</div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2.5">
              <button className="rounded-[10px] border border-[#3B82F6] bg-[rgba(59,130,246,0.10)] py-2.5 font-sans text-[13px] font-semibold text-[#3B82F6] hover:bg-[rgba(59,130,246,0.20)]">
                Resolve in Client's Favor
              </button>
              <button className="rounded-[10px] border border-[#00C6A7] bg-[rgba(0,198,167,0.10)] py-2.5 font-sans text-[13px] font-semibold text-[#00C6A7] hover:bg-[rgba(0,198,167,0.20)]">
                Resolve in Developer's Favor
              </button>
              <button className="rounded-[10px] border border-[#1E3A8A] bg-[rgba(30,58,138,0.10)] py-2.5 font-sans text-[13px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">
                Split Resolution
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <button className="font-sans text-[#3B82F6] hover:underline">View Evidence ↓</button>
              <button className="font-sans text-[#FF4D6A] hover:underline">Escalate to Senior Admin →</button>
            </div>
          </Card>
        ))}
      </div>

      {DISPUTES.length === 0 && (
        <Card padding="p-12" className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-[#10B981]" />
          <div className="font-display text-[18px] font-bold text-white">All clear</div>
          <div className="font-sans text-[13px] text-[#8890B5]">No disputes — platform is healthy.</div>
        </Card>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card padding="p-4">
      <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">{label}</div>
      <div className="mt-1 font-mono text-[24px] font-bold" style={{ color }}>{value}</div>
    </Card>
  );
}
