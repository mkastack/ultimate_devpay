import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/ai-logs")({
  component: AiLogs,
});

const usage = [
  { time: "09:12", model: "Gemini 1.5 Pro", action: "Job matching", tokens: 1240, cost: "$0.012", time_ms: 320 },
  { time: "09:11", model: "Claude 3.5 Sonnet", action: "Proposal draft", tokens: 2860, cost: "$0.028", time_ms: 1840 },
  { time: "09:10", model: "Gemini 1.5 Pro", action: "Skill extraction", tokens: 980, cost: "$0.009", time_ms: 280 },
  { time: "09:09", model: "Claude 3.5 Sonnet", action: "Proposal draft", tokens: 3120, cost: "$0.031", time_ms: 1980 },
  { time: "09:08", model: "Gemini 1.5 Pro", action: "Job matching", tokens: 1180, cost: "$0.011", time_ms: 310 },
  { time: "09:06", model: "Gemini 1.5 Pro", action: "Profile score", tokens: 640, cost: "$0.006", time_ms: 190 },
];

function AiLogs() {
  return (
    <div>
      <AdminHeader title="AI Operations" subtitle="Monitor all AI usage across the platform." />

      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <Stat label="API Calls Today" value="1,247" color="#3B82F6" />
        <Stat label="Token Usage" value="3.2M" color="#00C6A7" />
        <Stat label="Cost Today" value="$47.20" color="#F5A623" />
        <Stat label="Match Accuracy" value="91.4%" color="#10B981" />
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <SectionHeader title="Recent AI Calls" right={<span className="font-sans text-[12px] text-[#3D4466]">Live feed</span>} />
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-10">
              {["Time", "Model", "Action", "Tokens", "Cost", "Latency"].map((h) => (
                <th key={h} className="px-5 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usage.concat(usage).map((u, i) => (
              <tr key={i} className="h-[48px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-5 font-mono text-[12px] text-[#8890B5]">{u.time}</td>
                <td className="px-5 font-sans text-[13px] text-white">{u.model}</td>
                <td className="px-5 font-sans text-[13px] text-[#8890B5]">{u.action}</td>
                <td className="px-5 font-mono text-[13px] text-white">{u.tokens.toLocaleString()}</td>
                <td className="px-5 font-mono text-[13px] text-[#F5A623]">{u.cost}</td>
                <td className="px-5 font-mono text-[12px] text-[#10B981]">{u.time_ms}ms</td>
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
      <div className="mt-1 font-mono text-[22px] font-bold" style={{ color }}>{value}</div>
    </Card>
  );
}
