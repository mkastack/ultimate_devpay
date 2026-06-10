import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Shield, UserX, Eye, Briefcase, AlertTriangle, MessageSquare } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar, StatusDot } from "@/components/admin/ui";
import { ALL_USERS, formatGHS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/clients")({
  component: ClientsPage,
});

const INDUSTRIES = [
  "Fintech", "E-commerce", "Healthtech", "Logistics", "EdTech",
  "Media", "Real Estate", "AgriTech", "SaaS", "Web3",
];
const COMPANY_SUFFIX = ["Capital", "Labs", "Group", "Holdings", "Ventures", "Tech", "Africa"];

const clients = ALL_USERS.filter((u) => u.role === "client").map((u, i) => ({
  ...u,
  company: `${u.name.split(" ")[1]} ${COMPANY_SUFFIX[i % COMPANY_SUFFIX.length]}`,
  industry: INDUSTRIES[i % INDUSTRIES.length],
  jobsPosted: 2 + (i * 5) % 28,
  hires: 1 + (i * 3) % 18,
  disputeRate: ((i * 7) % 12),
  totalSpent: u.earningsOrSpent,
  avgContract: Math.floor(u.earningsOrSpent / Math.max(1, 1 + (i * 3) % 18)),
  tier: i % 9 === 0 ? "Enterprise" : i % 4 === 0 ? "Pro" : "Standard",
}));

function ClientsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "enterprise" | "verified" | "high_risk" | "suspended">("all");

  const filtered = clients.filter((c) => {
    if (filter === "enterprise" && c.tier !== "Enterprise") return false;
    if (filter === "verified" && !c.verified) return false;
    if (filter === "high_risk" && c.disputeRate < 6) return false;
    if (filter === "suspended" && c.status !== "suspended") return false;
    if (q && !`${c.name} ${c.company} ${c.industry} ${c.country}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalSpend = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div>
      <AdminHeader
        title="Clients"
        subtitle={`${clients.length} client accounts · ${formatGHS(totalSpend)} lifetime spend`}
      />

      <div className="mb-5 grid grid-cols-5 gap-3.5">
        <Stat label="Total Clients" value={clients.length.toString()} color="#3B82F6" />
        <Stat label="Enterprise" value={clients.filter((c) => c.tier === "Enterprise").length.toString()} color="#F5A623" />
        <Stat label="Lifetime Spend" value={formatGHS(totalSpend)} color="#10B981" />
        <Stat label="High Risk" value={clients.filter((c) => c.disputeRate >= 6).length.toString()} color="#FF4D6A" />
        <Stat label="Active (30d)" value="892" color="#00C6A7" />
      </div>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, company, industry, or country..."
            className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] pl-10 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-full bg-[#12152A] p-1">
          {[
            { v: "all", l: "All" },
            { v: "enterprise", l: "Enterprise" },
            { v: "verified", l: "Verified" },
            { v: "high_risk", l: "High Risk" },
            { v: "suspended", l: "Suspended" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setFilter(t.v as never)}
              className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
                filter === t.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {filtered.map((c) => (
          <Card key={c.id} hover padding="p-5">
            <div className="flex items-start gap-3">
              <Avatar
                name={c.company}
                color={c.avatarColor}
                size={52}
                ring={c.verified ? "#00C6A7" : "#3D4466"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-sans text-[15px] font-semibold text-white">
                    {c.company}
                  </span>
                  {c.tier === "Enterprise" && <Pill color="gold">Enterprise</Pill>}
                  {c.tier === "Pro" && <Pill color="purple">Pro</Pill>}
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-sans text-[11px] text-[#3D4466]">
                  <span>{c.name}</span>
                  <span>·</span>
                  <span>{c.flag} {c.country}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-[#12152A] px-2 py-0.5 font-mono text-[10px] text-[#3B82F6]">
                    {c.industry}
                  </span>
                  {c.disputeRate >= 6 && (
                    <span className="flex items-center gap-1 rounded-md bg-[rgba(255,77,106,0.10)] px-2 py-0.5 font-mono text-[10px] text-[#FF4D6A]">
                      <AlertTriangle className="h-2.5 w-2.5" /> {c.disputeRate}% disputes
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-bold text-[#10B981]">
                  {formatGHS(c.totalSpent)}
                </div>
                <div
                  className="mt-1 flex items-center gap-1.5 font-sans text-[11px]"
                  style={{
                    color:
                      c.status === "active" ? "#10B981"
                      : c.status === "suspended" ? "#FF4D6A"
                      : "#F59E0B",
                  }}
                >
                  <StatusDot
                    color={
                      c.status === "active" ? "#10B981"
                      : c.status === "suspended" ? "#FF4D6A"
                      : "#F59E0B"
                    }
                  />
                  {c.status}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-[#12152A] p-3">
              <MiniStat icon={Briefcase} label="Posted" value={c.jobsPosted.toString()} />
              <MiniStat label="Hires" value={c.hires.toString()} />
              <MiniStat label="Avg" value={formatGHS(c.avgContract)} />
              <MiniStat label="Dispute" value={`${c.disputeRate}%`} />
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#1E3A8A] bg-[rgba(30,58,138,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">
                <Eye className="h-3 w-3" /> Profile
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-[#3B82F6] bg-[rgba(59,130,246,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[rgba(59,130,246,0.20)]">
                <MessageSquare className="h-3 w-3" /> Contact
              </button>
              {c.verified ? (
                <button
                  className="flex items-center gap-1.5 rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#10B981]"
                  disabled
                >
                  <Shield className="h-3 w-3" /> Verified
                </button>
              ) : (
                <button className="flex items-center gap-1.5 rounded-md border border-[#00C6A7] bg-[rgba(0,198,167,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#00C6A7] hover:bg-[rgba(0,198,167,0.20)]">
                  <Shield className="h-3 w-3" /> Verify
                </button>
              )}
              <button className="flex items-center gap-1.5 rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                <UserX className="h-3 w-3" /> {c.status === "suspended" ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card padding="p-12" className="text-center">
          <div className="font-display text-[18px] font-bold text-white">No clients match your filters</div>
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

function MiniStat({
  icon: Icon, label, value,
}: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className="mt-0.5 font-mono text-[12px] font-bold text-white">{value}</div>
    </div>
  );
}
