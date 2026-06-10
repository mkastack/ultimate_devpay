import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader } from "@/components/admin/ui";
import { REVENUE_30D } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const breakdownData = [
  { name: "Commission Fees", value: 580000, color: "#1E3A8A" },
  { name: "Subscriptions", value: 142500, color: "#F5A623" },
  { name: "Featured Listings", value: 89200, color: "#00C6A7" },
  { name: "Other", value: 35550, color: "#3B82F6" },
];

const topDevs = [
  { name: "Kofi Mensah", value: 42500 },
  { name: "Amara Okafor", value: 38900 },
  { name: "Chioma Eze", value: 35200 },
  { name: "Tunde Adeyemi", value: 29800 },
  { name: "Aisha Bello", value: 27300 },
  { name: "Nia Achebe", value: 24100 },
  { name: "Imani Kone", value: 21500 },
  { name: "Idris Bello", value: 18900 },
  { name: "Themba Ndlovu", value: 16400 },
  { name: "Akua Owusu", value: 14200 },
];

const geoRevenue = [
  { country: "🇳🇬 Nigeria", revenue: 312000, pct: 36.8 },
  { country: "🇬🇭 Ghana", revenue: 198000, pct: 23.4 },
  { country: "🇰🇪 Kenya", revenue: 142000, pct: 16.8 },
  { country: "🇿🇦 South Africa", revenue: 98500, pct: 11.6 },
  { country: "🇪🇬 Egypt", revenue: 56200, pct: 6.6 },
  { country: "🇲🇦 Morocco", revenue: 40550, pct: 4.8 },
];

function AnalyticsPage() {
  return (
    <div>
      <AdminHeader title="Financial Analytics" subtitle="Complete financial intelligence for DevPay Africa." />

      <div className="mb-5 grid grid-cols-5 gap-3">
        <Mini label="Platform Revenue" value="GHS 847,250" trend="+34%" color="#3B82F6" />
        <Mini label="Total Volume" value="GHS 12.1M" trend="+28%" color="#FFFFFF" />
        <Mini label="Transaction Count" value="3,421" trend="+18%" color="#00C6A7" />
        <Mini label="Avg Transaction" value="GHS 3,537" trend="+9%" color="#F5A623" />
        <Mini label="Growth Rate" value="34%" trend="+4 pp" color="#10B981" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Revenue Breakdown" subtitle="Where the GHS 847k came from" />
          <div className="flex items-center gap-6">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdownData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {breakdownData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {breakdownData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                    <span className="font-sans text-[12px] text-[#8890B5]">{d.name}</span>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-white">GHS {d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Top Earning Developers" subtitle="Generators of platform fees" />
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={topDevs} layout="vertical" margin={{ left: 30, right: 16 }}>
                <CartesianGrid stroke="#1C2040" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#3D4466", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#8890B5", fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #1E3A8A", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Geographic Revenue" subtitle="Markets by platform fee generated" />
          <div className="space-y-2">
            {geoRevenue.map((g) => (
              <div key={g.country}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-sans text-[13px] text-white">{g.country}</span>
                  <span className="font-mono text-[12px] text-[#8890B5]">GHS {g.revenue.toLocaleString()} · {g.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#1C2040]">
                  <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]" style={{ width: `${g.pct * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Monthly Recurring Revenue" subtitle="Subscription-driven income" />
          <div className="mb-4 font-display text-[36px] font-bold text-[#3B82F6]">GHS 142,500<span className="text-[14px] text-[#3D4466]">/mo</span></div>
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Pro Devs" value="847" trend="+34" color="#3B82F6" />
            <Mini label="Churn" value="2.1%" trend="-0.4" color="#10B981" />
            <Mini label="ARPU" value="GHS 168" trend="+8" color="#F5A623" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value, trend, color }: { label: string; value: string; trend: string; color: string }) {
  return (
    <Card padding="p-4">
      <div className="font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">{label}</div>
      <div className="mt-1 font-mono text-[18px] font-bold" style={{ color }}>{value}</div>
      <div className="mt-1 font-sans text-[11px] text-[#10B981]">↑ {trend}</div>
    </Card>
  );
}
