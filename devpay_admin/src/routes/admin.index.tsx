import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  TrendingUp, Activity, Users, FileCheck, ArrowDownCircle, AlertTriangle,
  ArrowUp, Lock, Unlock, Cpu, Shield, DollarSign, FileText, Megaphone, UserX,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader, Avatar, Pill, StatusDot } from "@/components/admin/ui";
import { LIVE_EVENTS, PLATFORM_METRICS, REVENUE_30D, ALL_USERS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const eventIcon: Record<string, { bg: string; icon: string }> = {
  signup: { bg: "rgba(59,130,246,0.15)", icon: "👤" },
  job_posted: { bg: "rgba(0,198,167,0.15)", icon: "📋" },
  proposal: { bg: "rgba(167,139,250,0.15)", icon: "✉️" },
  contract_started: { bg: "rgba(16,185,129,0.15)", icon: "📝" },
  payment_released: { bg: "rgba(245,166,35,0.15)", icon: "💰" },
  withdrawal: { bg: "rgba(245,158,11,0.15)", icon: "↓" },
  dispute: { bg: "rgba(255,77,106,0.15)", icon: "⚠" },
  review: { bg: "rgba(250,204,21,0.15)", icon: "★" },
};

function AdminOverview() {
  const totalRevenue = REVENUE_30D.reduce((s, d) => s + d.revenue, 0);
  const totalVolume = REVENUE_30D.reduce((s, d) => s + d.volume, 0);
  const totalTxns = REVENUE_30D.reduce((s, d) => s + d.txns, 0);
  const recentSignups = ALL_USERS.slice(0, 6);

  return (
    <div>
      <AdminHeader title="Admin Dashboard" subtitle="DevPay Africa Control Center" />

      {/* Live status strip */}
      <Card padding="px-5 py-3" className="mb-6 flex h-[52px] items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="font-sans text-[12px] font-bold text-[#10B981]">LIVE</span>
          </span>
          <span className="font-sans text-[11px] text-[#3D4466]">
            Platform monitoring active — updates every 30s
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px]">
          {[
            { label: "API", status: "Healthy" },
            { label: "DB", status: "Healthy" },
            { label: "Payments", status: "Healthy" },
            { label: "AI", status: "Healthy" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="font-sans text-[#8890B5]">{s.label}</span>
              <span className="flex items-center gap-1 font-mono text-[12px] text-[#10B981]">
                <StatusDot color="#10B981" /> {s.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 6 hero cards */}
      <div className="mb-6 grid grid-cols-3 gap-3.5">
        <HeroCard
          icon={TrendingUp} iconColor="#10B981" iconBg="rgba(16,185,129,0.15)"
          label="Total Platform Revenue" value={PLATFORM_METRICS.revenue.value}
          sub={PLATFORM_METRICS.revenue.usd}
          trend={PLATFORM_METRICS.revenue.trend} trendColor="#10B981" trendLabel="vs last month"
        />
        <HeroCard
          icon={Activity} iconColor="#3B82F6" iconBg="rgba(30,58,138,0.15)"
          label="Total Transaction Volume" value={PLATFORM_METRICS.volume.value}
          sub={PLATFORM_METRICS.volume.usd}
          trend={PLATFORM_METRICS.volume.trend} trendColor="#10B981" trendLabel="vs last month"
        />
        <HeroCard
          icon={Users} iconColor="#3B82F6" iconBg="rgba(59,130,246,0.15)"
          label="Registered Users" value={PLATFORM_METRICS.users.value}
          sub={PLATFORM_METRICS.users.sub}
          trend={PLATFORM_METRICS.users.trend} trendColor="#10B981" trendLabel="this week"
        />
        <HeroCard
          icon={FileCheck} iconColor="#00C6A7" iconBg="rgba(0,198,167,0.15)"
          label="Active Contracts" value={PLATFORM_METRICS.contracts.value}
          sub={PLATFORM_METRICS.contracts.sub} subColor="#F5A623"
          trend={PLATFORM_METRICS.contracts.trend} trendColor="#10B981" trendLabel="this week"
        />
        <HeroCard
          icon={ArrowDownCircle} iconColor="#F59E0B" iconBg="rgba(245,158,11,0.15)"
          label="Pending Withdrawals" value={PLATFORM_METRICS.withdrawals.value} valueColor="#F59E0B"
          sub={PLATFORM_METRICS.withdrawals.sub}
          trend={PLATFORM_METRICS.withdrawals.trend} trendColor="#F59E0B"
        />
        <HeroCard
          icon={AlertTriangle} iconColor="#FF4D6A" iconBg="rgba(255,77,106,0.15)"
          label="Open Disputes" value={PLATFORM_METRICS.disputes.value} valueColor="#FF4D6A"
          sub={PLATFORM_METRICS.disputes.sub}
          trend={PLATFORM_METRICS.disputes.trend} trendColor="#FF4D6A"
        />
      </div>

      {/* Revenue chart */}
      <Card className="mb-6" padding="p-6">
        <SectionHeader
          title="Revenue Overview"
          subtitle="Platform fee collected over time"
          right={
            <div className="flex gap-1 rounded-full bg-[#12152A] p-1">
              {["7D", "30D", "90D", "1Y", "ALL"].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-full px-3 py-1 font-sans text-[12px] transition-colors ${
                    i === 1 ? "bg-[#1E3A8A] text-white" : "text-[#3D4466] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        />
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={REVENUE_30D} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1C2040" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#3D4466", fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#3D4466", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0D0F1A", border: "1px solid #1C2040", borderLeft: "3px solid #1E3A8A", borderRadius: 8, fontFamily: "DM Sans" }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
                itemStyle={{ color: "#3B82F6" }}
              />
              <Bar dataKey="volume" fill="rgba(30,58,138,0.20)" radius={[4, 4, 0, 0]} />
              <Area type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={2} fill="url(#revGrad)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-8 border-t border-[#1C2040] pt-4">
          <FooterStat label="Total Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} color="#3B82F6" />
          <FooterStat label="Total Volume" value={`GHS ${totalVolume.toLocaleString()}`} color="#FFFFFF" />
          <FooterStat label="Transactions" value={totalTxns.toLocaleString()} color="#8890B5" />
          <FooterStat label="Avg Fee" value="7.0%" color="#10B981" />
        </div>
      </Card>

      {/* Three column row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* New signups */}
        <Card>
          <SectionHeader
            title="New Users (Today)"
            right={<Pill color="purple">+127</Pill>}
          />
          <div className="space-y-2">
            {recentSignups.map((u) => (
              <div key={u.id} className="flex items-center gap-3 border-b border-[#1C2040] pb-2 last:border-0">
                <Avatar name={u.name} color={u.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-sans text-[13px] font-medium text-white">{u.name}</span>
                    <Pill color={u.role === "developer" ? "cyan" : "gold"}>
                      {u.role === "developer" ? "Dev" : "Client"}
                    </Pill>
                  </div>
                  <div className="font-sans text-[11px] text-[#3D4466]">
                    {u.flag} {u.country} · {u.verified ? <span className="text-[#10B981]">✓ Verified</span> : <span className="text-[#F59E0B]">Pending</span>}
                  </div>
                </div>
                <span className="font-sans text-[11px] text-[#3D4466]">{u.lastActive}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Escrow */}
        <Card>
          <SectionHeader title="Escrow Monitor" />
          <div className="space-y-2.5">
            <MiniStat label="Holding:" value="GHS 2,418,750" color="#F5A623" />
            <MiniStat label="Released today:" value="GHS 84,200" color="#10B981" />
            <MiniStat label="Refunded today:" value="GHS 3,150" color="#3D4466" />
          </div>
          <div className="my-3 h-px bg-[#1C2040]" />
          <div className="space-y-1.5">
            {[
              { lock: false, text: "Released — Contract C-1948", amt: "GHS 8,400", time: "12m ago" },
              { lock: true, text: "Holding — New milestone", amt: "GHS 12,500", time: "34m ago" },
              { lock: false, text: "Released — Mobile app M2", amt: "GHS 18,500", time: "47m ago" },
              { lock: true, text: "Held — E-commerce rebuild", amt: "GHS 42,000", time: "1h ago" },
              { lock: false, text: "Released — Logo project", amt: "GHS 850", time: "2h ago" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {e.lock ? <Lock className="h-3 w-3 text-[#F5A623]" /> : <Unlock className="h-3 w-3 text-[#10B981]" />}
                <span className="flex-1 truncate font-sans text-[#8890B5]">{e.text}</span>
                <span className="font-mono text-[11px] text-white">{e.amt}</span>
                <span className="font-sans text-[#3D4466]">{e.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI health */}
        <Card>
          <SectionHeader title="AI Operations" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] text-white">Gemini 1.5 Pro</span>
              <Pill color="green">Operational</Pill>
            </div>
            <div className="font-sans text-[11px] text-[#3D4466]">847 matches today</div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] text-white">Claude 3.5 Sonnet</span>
              <Pill color="green">Operational</Pill>
            </div>
            <div className="font-sans text-[11px] text-[#3D4466]">312 proposals today</div>
            <div>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-[#8890B5]">Daily token usage</span>
                <span className="font-mono text-[#3B82F6]">62%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1C2040]">
                <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]" style={{ width: "62%" }} />
              </div>
            </div>
            <div className="font-mono text-[12px] text-[#8890B5]">Est. daily cost: $47.20</div>
          </div>
        </Card>
      </div>

      {/* Live feed + quick actions */}
      <div className="grid grid-cols-5 gap-4">
        {/* Live activity */}
        <Card className="col-span-3">
          <SectionHeader
            title="Live Activity"
            subtitle="Auto-refreshes every 30 seconds"
            right={
              <span className="flex items-center gap-1.5">
                <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="font-sans text-[11px] font-bold text-[#10B981]">LIVE</span>
              </span>
            }
          />
          <div className="max-h-[420px] space-y-1 overflow-y-auto">
            {LIVE_EVENTS.map((e) => {
              const cfg = eventIcon[e.type];
              return (
                <div key={e.id} className="flex items-center gap-3 border-b border-white/[0.03] py-2.5 last:border-0">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px]"
                    style={{ background: cfg.bg }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-sans text-[13px] font-semibold text-white">{e.title}</div>
                    <div className="truncate font-sans text-[12px] text-[#8890B5]">{e.detail}</div>
                  </div>
                  <div className="text-right">
                    {e.amount && (
                      <div className="font-mono text-[13px]" style={{ color: e.amountColor }}>
                        GHS {e.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="font-sans text-[11px] text-[#3D4466]">{e.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="col-span-2">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, label: "Verify User", color: "#3B82F6" },
              { icon: DollarSign, label: "Process Withdrawal", color: "#F5A623" },
              { icon: AlertTriangle, label: "Review Dispute", color: "#FF4D6A" },
              { icon: FileText, label: "Generate Report", color: "#3B82F6" },
              { icon: Megaphone, label: "Send Announcement", color: "#00C6A7" },
              { icon: UserX, label: "Suspend Account", color: "#FF4D6A" },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  className="group rounded-xl border border-[#1C2040] bg-[#12152A] p-4 text-center transition-all duration-150 hover:-translate-y-0.5"
                  style={{ borderColor: undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = a.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1C2040")}
                >
                  <div
                    className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full"
                    style={{ background: `${a.color}22` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: a.color }} />
                  </div>
                  <div className="font-sans text-[12px] font-medium text-[#8890B5] group-hover:text-white">
                    {a.label}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeroCard({
  icon: Icon, iconColor, iconBg, label, value, valueColor = "#FFFFFF",
  sub, subColor, trend, trendColor, trendLabel,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string; iconBg: string;
  label: string; value: string; valueColor?: string;
  sub: string; subColor?: string;
  trend: string; trendColor: string; trendLabel?: string;
}) {
  return (
    <Card hover padding="p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#3D4466]">
          {label}
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-full" style={{ background: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="font-mono text-[32px] font-bold leading-none" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="mt-2 font-mono text-[12px]" style={{ color: subColor ?? "#3D4466" }}>
        {sub}
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-[#1C2040] pt-3">
        <ArrowUp className="h-3 w-3" style={{ color: trendColor }} />
        <span className="font-sans text-[11px] font-semibold" style={{ color: trendColor }}>{trend}</span>
        {trendLabel && <span className="font-sans text-[11px] text-[#3D4466]">{trendLabel}</span>}
      </div>
    </Card>
  );
}

function FooterStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-sans text-[11px] text-[#3D4466]">{label}</div>
      <div className="font-mono text-[15px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-[12px] text-[#8890B5]">{label}</span>
      <span className="font-mono text-[14px] font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
