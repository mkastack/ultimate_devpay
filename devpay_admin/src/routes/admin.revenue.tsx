import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Download, TrendingUp, FileText } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, SectionHeader } from "@/components/admin/ui";
import { REVENUE_30D } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/revenue")({
  component: RevenuePage,
});

const MRR_SERIES = Array.from({ length: 12 }, (_, i) => {
  const base = 18000 + i * 4200 + Math.round(Math.sin(i) * 1800);
  return {
    month: new Date(2025, i, 1).toLocaleDateString("en", { month: "short" }),
    mrr: base,
    newMrr: Math.round(base * 0.18),
    churnedMrr: Math.round(base * 0.06),
  };
});

const FEES_BREAKDOWN = [
  { name: "Commission (7%)", value: 412000, color: "#1E3A8A" },
  { name: "Featured Listings", value: 84500, color: "#3B82F6" },
  { name: "Subscriptions", value: 184250, color: "#00C6A7" },
  { name: "Withdrawal Fees", value: 38400, color: "#F5A623" },
  { name: "Dispute Fees", value: 12100, color: "#FF4D6A" },
];

const PAYOUTS_BY_METHOD = [
  { method: "MTN MoMo", count: 1842, volume: 3_420_000 },
  { method: "Bank Transfer", count: 612, volume: 2_180_000 },
  { method: "Vodafone Cash", count: 487, volume: 940_000 },
  { method: "Airtel Money", count: 218, volume: 412_000 },
];

const REPORTS = [
  { name: "Q4 2025 Revenue P&L", format: "PDF", size: "2.4 MB", generated: "2h ago" },
  { name: "November Payouts (CSV)", format: "CSV", size: "847 KB", generated: "1d ago" },
  { name: "MRR Cohort Analysis", format: "XLSX", size: "1.2 MB", generated: "3d ago" },
  { name: "Tax Summary YTD", format: "PDF", size: "612 KB", generated: "1w ago" },
  { name: "Commission Breakdown Q3", format: "PDF", size: "1.8 MB", generated: "2w ago" },
];

function RevenuePage() {
  const totalFees = FEES_BREAKDOWN.reduce((s, f) => s + f.value, 0);
  const currentMrr = MRR_SERIES[MRR_SERIES.length - 1].mrr;
  const prevMrr = MRR_SERIES[MRR_SERIES.length - 2].mrr;
  const mrrGrowth = (((currentMrr - prevMrr) / prevMrr) * 100).toFixed(1);

  return (
    <div>
      <AdminHeader title="Revenue Analytics" subtitle="Platform monetization deep-dive" />
      <div className="mb-5 flex justify-end">
        <button className="flex h-10 items-center gap-2 rounded-[10px] bg-[#1E3A8A] px-4 font-sans text-[13px] font-semibold text-white hover:bg-[#1E40AF]">
          <Download className="h-4 w-4" /> Export Full Report
        </button>
      </div>


      {/* Top KPIs */}
      <div className="mb-6 grid grid-cols-4 gap-3.5">
        <Kpi label="MRR" value={`GHS ${currentMrr.toLocaleString()}`} delta={`+${mrrGrowth}%`} color="#3B82F6" />
        <Kpi label="ARR" value={`GHS ${(currentMrr * 12).toLocaleString()}`} delta="+34%" color="#00C6A7" />
        <Kpi label="Total Fees (YTD)" value={`GHS ${totalFees.toLocaleString()}`} delta="+28%" color="#F5A623" />
        <Kpi label="Net Payouts (30d)" value="GHS 6.95M" delta="+19%" color="#10B981" />
      </div>

      {/* MRR chart */}
      <Card className="mb-6" padding="p-6">
        <SectionHeader
          title="Monthly Recurring Revenue"
          subtitle="New MRR vs. churned MRR over the last 12 months"
          right={<Pill color="green">+{mrrGrowth}% MoM</Pill>}
        />
        <div className="h-[260px] w-full">
          <ResponsiveContainer>
            <AreaChart data={MRR_SERIES} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1C2040" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#3D4466", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#3D4466", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #1C2040", borderLeft: "3px solid #1E3A8A", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#8890B5" }} />
              <Area type="monotone" dataKey="mrr" stroke="#1E3A8A" strokeWidth={2} fill="url(#mrrGrad)" name="Total MRR" />
              <Area type="monotone" dataKey="newMrr" stroke="#10B981" strokeWidth={2} fill="url(#newGrad)" name="New MRR" />
              <Area type="monotone" dataKey="churnedMrr" stroke="#FF4D6A" strokeWidth={2} fill="transparent" name="Churned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Fees pie + Payouts bar */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card padding="p-6">
          <SectionHeader title="Fee Breakdown" subtitle="By revenue source — YTD" />
          <div className="flex items-center gap-6">
            <div className="h-[220px] w-[220px] shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={FEES_BREAKDOWN} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {FEES_BREAKDOWN.map((f) => <Cell key={f.name} fill={f.color} stroke="#0D0F1A" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #1C2040", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {FEES_BREAKDOWN.map((f) => {
                const pct = ((f.value / totalFees) * 100).toFixed(1);
                return (
                  <div key={f.name} className="flex items-center justify-between border-b border-[#1C2040] pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                      <span className="font-sans text-[12px] text-[#8890B5]">{f.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[12px] font-semibold text-white">GHS {f.value.toLocaleString()}</div>
                      <div className="font-mono text-[10px] text-[#3D4466]">{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <SectionHeader title="Payouts by Method" subtitle="30-day volume + transaction count" />
          <div className="h-[220px] w-full">
            <ResponsiveContainer>
              <BarChart data={PAYOUTS_BY_METHOD} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1C2040" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="method" tick={{ fill: "#3D4466", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#3D4466", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #1C2040", borderLeft: "3px solid #F5A623", borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#F5A623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {PAYOUTS_BY_METHOD.map((p) => (
              <div key={p.method} className="rounded-lg bg-[#12152A] p-2 text-center">
                <div className="font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">{p.method}</div>
                <div className="mt-1 font-mono text-[13px] font-bold text-white">{p.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Daily revenue + reports */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-3" padding="p-6">
          <SectionHeader title="Daily Revenue (30 days)" subtitle="Platform fees collected per day" />
          <div className="h-[240px] w-full">
            <ResponsiveContainer>
              <BarChart data={REVENUE_30D} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1C2040" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#3D4466", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#3D4466", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #1C2040", borderLeft: "3px solid #1E3A8A", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-2" padding="p-6">
          <SectionHeader title="Downloadable Reports" subtitle="Generated reports & exports" />
          <div className="space-y-2">
            {REPORTS.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-lg border border-[#1C2040] bg-[#12152A] px-3 py-2.5 hover:border-[rgba(30,58,138,0.30)]">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[rgba(30,58,138,0.15)]">
                  <FileText className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-[12px] font-semibold text-white">{r.name}</div>
                  <div className="font-sans text-[11px] text-[#3D4466]">{r.format} · {r.size} · {r.generated}</div>
                </div>
                <button className="grid h-8 w-8 place-items-center rounded-md bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1E3A8A] py-2.5 font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.10)]">
              <TrendingUp className="h-3.5 w-3.5" /> Generate New Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, color }: { label: string; value: string; delta: string; color: string }) {
  return (
    <Card hover padding="p-5">
      <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#3D4466]">{label}</div>
      <div className="mt-2 font-mono text-[26px] font-bold" style={{ color }}>{value}</div>
      <div className="mt-2 font-sans text-[11px] font-semibold text-[#10B981]">{delta} vs prev</div>
    </Card>
  );
}
