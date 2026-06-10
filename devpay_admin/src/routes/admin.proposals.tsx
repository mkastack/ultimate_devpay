import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check, X, Eye, MessageSquare } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar } from "@/components/admin/ui";
import { ALL_USERS, ALL_JOBS, formatGHS } from "@/lib/admin-mock";
import { Checkbox, IconBtn } from "@/routes/admin.users";

export const Route = createFileRoute("/admin/proposals")({
  component: ProposalsPage,
});

type ProposalStatus = "submitted" | "shortlisted" | "accepted" | "rejected" | "withdrawn";
interface Proposal {
  id: string;
  job: typeof ALL_JOBS[number];
  developer: typeof ALL_USERS[number];
  bid: number;
  durationDays: number;
  coverLetter: string;
  status: ProposalStatus;
  aiScore: number;
  submittedHrs: number;
}

const STATUSES: ProposalStatus[] = ["submitted", "shortlisted", "accepted", "rejected", "withdrawn"];
const COVERS = [
  "I've shipped 4 similar fintech projects. Available immediately for a 6-week sprint.",
  "Background in the exact stack listed. Can deliver MVP in 3 weeks with weekly demos.",
  "10+ years in mobile banking. References from MTN and Flutterwave available on request.",
  "Open to a paid trial milestone before committing. Portfolio attached.",
];
const devs = ALL_USERS.filter((u) => u.role === "developer");

const PROPOSALS: Proposal[] = Array.from({ length: 22 }, (_, i) => ({
  id: `prop_${(i + 1).toString().padStart(5, "0")}`,
  job: ALL_JOBS[i % ALL_JOBS.length],
  developer: devs[i % devs.length],
  bid: Math.round((1000 + ((i * 781) % 24000)) / 50) * 50,
  durationDays: 14 + (i % 8) * 7,
  coverLetter: COVERS[i % COVERS.length],
  status: STATUSES[i % STATUSES.length],
  aiScore: 60 + ((i * 13) % 40),
  submittedHrs: i * 2 + 1,
}));

const statusColor: Record<ProposalStatus, "blue" | "purple" | "green" | "red" | "gray"> = {
  submitted: "blue", shortlisted: "purple", accepted: "green", rejected: "red", withdrawn: "gray",
};

function ProposalsPage() {
  const [tab, setTab] = useState<"all" | ProposalStatus>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = PROPOSALS.filter((p) =>
    (tab === "all" || p.status === tab) &&
    (!q || `${p.developer.name} ${p.job.title}`.toLowerCase().includes(q.toLowerCase()))
  );

  const toggle = (id: string) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  };

  return (
    <div>
      <AdminHeader title="Proposals" subtitle="All proposals across active jobs" />

      <div className="mb-5 grid grid-cols-5 gap-3.5">
        <Stat label="Total" value={PROPOSALS.length.toString()} color="#3B82F6" />
        <Stat label="Pending" value={PROPOSALS.filter((p) => p.status === "submitted").length.toString()} color="#3B82F6" />
        <Stat label="Shortlisted" value={PROPOSALS.filter((p) => p.status === "shortlisted").length.toString()} color="#3B82F6" />
        <Stat label="Accepted" value={PROPOSALS.filter((p) => p.status === "accepted").length.toString()} color="#10B981" />
        <Stat label="Avg AI Score" value="78" color="#F5A623" />
      </div>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by developer or job title..."
            className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] pl-10 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-full bg-[#12152A] p-1">
        {([{ v: "all" as const, l: "All" }, ...STATUSES.map((s) => ({ v: s, l: s[0].toUpperCase() + s.slice(1) }))]).map((t) => (
          <button key={t.v} onClick={() => setTab(t.v as never)}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-[12px] font-medium ${tab === t.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              <th className="w-10 px-4"><Checkbox checked={false} onChange={() => {}} /></th>
              {["Proposal", "Developer", "Job", "Bid", "Duration", "AI Score", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="h-[64px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4"><Checkbox checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                <td className="px-4">
                  <div className="font-mono text-[12px] text-[#3B82F6]">{p.id}</div>
                  <div className="max-w-[220px] truncate font-sans text-[11px] text-[#3D4466]">{p.coverLetter}</div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.developer.name} color={p.developer.avatarColor} size={32} ring="#00C6A7" />
                    <div>
                      <div className="font-sans text-[13px] font-semibold text-white">{p.developer.name}</div>
                      <div className="font-sans text-[11px] text-[#3D4466]">{p.developer.flag} {p.developer.country}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <div className="max-w-[200px] truncate font-sans text-[13px] text-white">{p.job.title}</div>
                  <div className="font-sans text-[11px] text-[#3D4466]">{p.job.category}</div>
                </td>
                <td className="px-4 font-mono text-[14px] font-bold text-[#F5A623]">{formatGHS(p.bid)}</td>
                <td className="px-4 font-sans text-[12px] text-[#8890B5]">{p.durationDays}d</td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1C2040]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]" style={{ width: `${p.aiScore}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-[#3B82F6]">{p.aiScore}</span>
                  </div>
                </td>
                <td className="px-4"><Pill color={statusColor[p.status]}>{p.status}</Pill></td>
                <td className="px-4">
                  <div className="flex gap-1.5">
                    <IconBtn><Eye className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn><MessageSquare className="h-3.5 w-3.5" /></IconBtn>
                    <button className="grid h-7 w-7 place-items-center rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button className="grid h-7 w-7 place-items-center rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected.size > 0 && (
        <div className="fixed bottom-24 left-3 right-3 md:bottom-6 md:left-[270px] md:right-6 z-50 flex items-center justify-between rounded-xl border border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 shadow-[0_8px_32px_rgba(30,58,138,0.5)]">
          <span className="font-sans text-[13px] font-semibold text-white">{selected.size} proposals selected</span>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Shortlist</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Reject</button>
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
