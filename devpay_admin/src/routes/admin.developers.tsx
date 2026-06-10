import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Shield, UserX, Eye, Star, Briefcase } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar, StatusDot } from "@/components/admin/ui";
import { ALL_USERS, formatGHS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/developers")({
  component: DevelopersPage,
});

const SKILLS_POOL = [
  ["React", "TypeScript", "Node"], ["Flutter", "Dart", "Firebase"], ["Python", "Django", "ML"],
  ["Vue", "Nuxt", "GraphQL"], ["Swift", "iOS", "Combine"], ["Kotlin", "Android"],
  ["Solidity", "Web3", "Hardhat"], ["Go", "gRPC", "K8s"], ["Rust", "WASM"],
];

const devs = ALL_USERS.filter((u) => u.role === "developer").map((u, i) => ({
  ...u,
  skills: SKILLS_POOL[i % SKILLS_POOL.length],
  rating: 3.5 + ((i * 13) % 15) / 10,
  jobsCompleted: 4 + (i * 7) % 80,
  successRate: 78 + ((i * 11) % 22),
  hourlyRate: 25 + (i * 7) % 175,
  responseHrs: 1 + (i % 12),
  level: i % 7 === 0 ? "Top Rated" : i % 5 === 0 ? "Rising Talent" : "Verified",
}));

function DevelopersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "top" | "verified" | "unverified" | "suspended">("all");

  const filtered = devs.filter((d) => {
    if (filter === "top" && d.level !== "Top Rated") return false;
    if (filter === "verified" && !d.verified) return false;
    if (filter === "unverified" && d.verified) return false;
    if (filter === "suspended" && d.status !== "suspended") return false;
    if (q && !`${d.name} ${d.skills.join(" ")} ${d.country}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <AdminHeader title="Developers" subtitle={`${devs.length} developer accounts · ${devs.filter((d) => d.verified).length} verified`} />

      <div className="mb-5 grid grid-cols-5 gap-3.5">
        <Stat label="Total Developers" value={devs.length.toString()} color="#3B82F6" />
        <Stat label="Top Rated" value={devs.filter((d) => d.level === "Top Rated").length.toString()} color="#F5A623" />
        <Stat label="Avg Rating" value="4.6" color="#10B981" />
        <Stat label="Active (7d)" value="2,148" color="#00C6A7" />
        <Stat label="Suspended" value={devs.filter((d) => d.status === "suspended").length.toString()} color="#FF4D6A" />
      </div>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill, or country..."
            className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] pl-10 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
        </div>
        <div className="flex gap-1 rounded-full bg-[#12152A] p-1">
          {[
            { v: "all", l: "All" }, { v: "top", l: "Top Rated" }, { v: "verified", l: "Verified" },
            { v: "unverified", l: "Unverified" }, { v: "suspended", l: "Suspended" },
          ].map((t) => (
            <button key={t.v} onClick={() => setFilter(t.v as never)}
              className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${filter === t.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Roster grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {filtered.map((d) => (
          <Card key={d.id} hover padding="p-5">
            <div className="flex items-start gap-3">
              <Avatar name={d.name} color={d.avatarColor} size={52} ring={d.verified ? "#00C6A7" : "#3D4466"} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-sans text-[15px] font-semibold text-white">{d.name}</span>
                  {d.level === "Top Rated" && <Pill color="gold">⭐ Top Rated</Pill>}
                  {d.level === "Rising Talent" && <Pill color="purple">↗ Rising</Pill>}
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-sans text-[11px] text-[#3D4466]">
                  <span>@{d.username}</span><span>·</span>
                  <span>{d.flag} {d.country}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.skills.map((s) => (
                    <span key={s} className="rounded-md bg-[#12152A] px-2 py-0.5 font-mono text-[10px] text-[#3B82F6]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 font-mono text-[14px] font-bold text-[#F5A623]">
                  <Star className="h-3.5 w-3.5 fill-[#F5A623]" />{d.rating.toFixed(1)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-sans text-[11px]" style={{ color: d.status === "active" ? "#10B981" : d.status === "suspended" ? "#FF4D6A" : "#F59E0B" }}>
                  <StatusDot color={d.status === "active" ? "#10B981" : d.status === "suspended" ? "#FF4D6A" : "#F59E0B"} />
                  {d.status}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-[#12152A] p-3">
              <MiniStat icon={Briefcase} label="Jobs" value={d.jobsCompleted.toString()} />
              <MiniStat label="Success" value={`${d.successRate}%`} />
              <MiniStat label="Rate" value={`$${d.hourlyRate}/h`} />
              <MiniStat label="Earned" value={formatGHS(d.earningsOrSpent)} />
            </div>

            {/* Quick actions */}
            <div className="mt-3 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#1E3A8A] bg-[rgba(30,58,138,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">
                <Eye className="h-3 w-3" /> Profile
              </button>
              {d.verified ? (
                <button className="flex items-center gap-1.5 rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#10B981]" disabled>
                  <Shield className="h-3 w-3" /> Verified
                </button>
              ) : (
                <button className="flex items-center gap-1.5 rounded-md border border-[#00C6A7] bg-[rgba(0,198,167,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#00C6A7] hover:bg-[rgba(0,198,167,0.20)]">
                  <Shield className="h-3 w-3" /> Verify
                </button>
              )}
              <button className="flex items-center gap-1.5 rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                <UserX className="h-3 w-3" /> {d.status === "suspended" ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card padding="p-12" className="text-center">
          <div className="font-display text-[18px] font-bold text-white">No developers match your filters</div>
        </Card>
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

function MiniStat({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-bold text-white">{value}</div>
    </div>
  );
}
