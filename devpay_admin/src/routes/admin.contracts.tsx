import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Check, X, AlertTriangle, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar } from "@/components/admin/ui";
import { ALL_USERS, ALL_JOBS, formatGHS } from "@/lib/admin-mock";
import { Checkbox, IconBtn } from "@/routes/admin.users";

export const Route = createFileRoute("/admin/contracts")({
  component: ContractsPage,
});

type ContractStatus = "active" | "completed" | "disputed" | "cancelled" | "pending_approval";
interface Contract {
  id: string;
  title: string;
  client: typeof ALL_USERS[number];
  developer: typeof ALL_USERS[number];
  totalValue: number;
  released: number;
  inEscrow: number;
  milestoneIndex: number;
  totalMilestones: number;
  status: ContractStatus;
  startedDaysAgo: number;
  deadlineDays: number;
}

const STATUSES: ContractStatus[] = ["active", "completed", "disputed", "cancelled", "pending_approval"];
const devs = ALL_USERS.filter((u) => u.role === "developer");
const clients = ALL_USERS.filter((u) => u.role === "client");

const CONTRACTS: Contract[] = Array.from({ length: 24 }, (_, i) => {
  const total = 5000 + ((i * 1471) % 80000);
  const released = Math.round(total * ((i % 4) / 4));
  return {
    id: `C-${(2000 + i).toString()}`,
    title: ALL_JOBS[i % ALL_JOBS.length].title,
    client: clients[i % clients.length],
    developer: devs[i % devs.length],
    totalValue: total,
    released,
    inEscrow: total - released,
    milestoneIndex: (i % 4) + 1,
    totalMilestones: 4,
    status: STATUSES[i % STATUSES.length],
    startedDaysAgo: 3 + (i * 2) % 90,
    deadlineDays: -10 + (i * 5) % 60,
  };
});

const statusColor: Record<ContractStatus, "green" | "purple" | "red" | "gray" | "amber"> = {
  active: "green", completed: "purple", disputed: "red", cancelled: "gray", pending_approval: "amber",
};

function ContractsPage() {
  const [tab, setTab] = useState<"all" | ContractStatus>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = CONTRACTS.filter((c) =>
    (tab === "all" || c.status === tab) &&
    (!q || `${c.title} ${c.client.name} ${c.developer.name}`.toLowerCase().includes(q.toLowerCase()))
  );

  const toggle = (id: string) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  };

  const totalEscrow = CONTRACTS.filter((c) => c.status === "active").reduce((s, c) => s + c.inEscrow, 0);

  return (
    <div>
      <AdminHeader title="Contracts" subtitle="342 active · 1,210 completed · 18 disputed" />

      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <Stat label="Active Contracts" value="342" color="#10B981" />
        <Stat label="In Escrow" value={formatGHS(totalEscrow)} color="#F5A623" />
        <Stat label="Completed (30d)" value="187" color="#3B82F6" />
        <Stat label="Disputed" value="18" color="#FF4D6A" />
      </div>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contracts, client, or developer..."
            className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] pl-10 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-full bg-[#12152A] p-1">
        {[{ v: "all" as const, l: "All" }, ...STATUSES.map((s) => ({ v: s, l: s.replace("_", " ") }))].map((t) => (
          <button key={t.v} onClick={() => setTab(t.v as never)}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-[12px] font-medium capitalize ${tab === t.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              <th className="w-10 px-4"><Checkbox checked={false} onChange={() => {}} /></th>
              {["Contract", "Client → Developer", "Progress", "Value", "Escrow", "Deadline", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const pct = (c.milestoneIndex / c.totalMilestones) * 100;
              return (
                <tr key={c.id} className="h-[72px] border-t border-[#1C2040] hover:bg-[#12152A]">
                  <td className="px-4"><Checkbox checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                  <td className="px-4">
                    <div className="font-mono text-[12px] text-[#3B82F6]">{c.id}</div>
                    <div className="max-w-[200px] truncate font-sans text-[13px] font-semibold text-white">{c.title}</div>
                    <div className="font-sans text-[11px] text-[#3D4466]">Started {c.startedDaysAgo}d ago</div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={c.client.name} color={c.client.avatarColor} size={26} />
                      <span className="font-sans text-[12px] text-[#8890B5]">→</span>
                      <Avatar name={c.developer.name} color={c.developer.avatarColor} size={26} ring="#00C6A7" />
                    </div>
                    <div className="mt-1 font-sans text-[11px] text-[#3D4466]">{c.client.name.split(" ")[0]} → {c.developer.name.split(" ")[0]}</div>
                  </td>
                  <td className="px-4">
                    <div className="font-sans text-[11px] text-[#8890B5]">M{c.milestoneIndex} of {c.totalMilestones}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[#1C2040]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#00C6A7]" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 font-mono text-[14px] font-bold text-white">{formatGHS(c.totalValue)}</td>
                  <td className="px-4">
                    <div className="font-mono text-[12px] text-[#F5A623]">{formatGHS(c.inEscrow)}</div>
                    <div className="font-mono text-[10px] text-[#3D4466]">{formatGHS(c.released)} released</div>
                  </td>
                  <td className="px-4">
                    <span className={`font-sans text-[12px] ${c.deadlineDays < 0 ? "text-[#FF4D6A]" : c.deadlineDays < 7 ? "text-[#F59E0B]" : "text-[#8890B5]"}`}>
                      {c.deadlineDays < 0 ? `${Math.abs(c.deadlineDays)}d overdue` : `${c.deadlineDays}d left`}
                    </span>
                  </td>
                  <td className="px-4"><Pill color={statusColor[c.status]}>{c.status.replace("_", " ")}</Pill></td>
                  <td className="px-4">
                    <div className="flex gap-1.5">
                      <IconBtn><Eye className="h-3.5 w-3.5" /></IconBtn>
                      <button className="grid h-7 w-7 place-items-center rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]" title="Approve milestone">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button className="grid h-7 w-7 place-items-center rounded-md border border-[#F59E0B] bg-[rgba(245,158,11,0.10)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.20)]" title="Flag">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                      <button className="grid h-7 w-7 place-items-center rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]" title="Cancel">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {selected.size > 0 && (
        <div className="fixed bottom-24 left-3 right-3 md:bottom-6 md:left-[270px] md:right-6 z-50 flex items-center justify-between rounded-xl border border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 shadow-[0_8px_32px_rgba(30,58,138,0.5)]">
          <span className="font-sans text-[13px] font-semibold text-white">{selected.size} contracts selected</span>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Approve Milestones</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Export</button>
          </div>
        </div>
      )}
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
