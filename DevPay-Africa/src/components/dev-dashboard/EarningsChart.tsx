import { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { earningsWeek, earningsMonth, earningsYear, USD_TO_GHS, fmtGHSDecimal } from "@/lib/dev-mock-data";

type Period = "Week" | "Month" | "Year";
const dataByPeriod: Record<Period, { label: string; usd: number }[]> = {
  Week: earningsWeek,
  Month: earningsMonth,
  Year: earningsYear,
};

export function EarningsChart() {
  const [period, setPeriod] = useState<Period>("Month");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const raw = dataByPeriod[period];
  const data = raw.map((d) => ({ ...d, ghs: Math.round(d.usd * USD_TO_GHS) }));
  const total = raw.reduce((s, d) => s + d.usd, 0);

  return (
    <div
      className="flex h-full flex-col rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[16px] font-semibold text-white">Earnings Overview</div>
        <div className="flex items-center gap-1.5">
          {(["Week", "Month", "Year"] as Period[]).map((p) => {
            const active = p === period;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className="h-7 rounded-full px-3 text-[12px] transition-colors"
                style={{
                  background: active ? "var(--cyan-brand)" : "var(--surface-hover)",
                  color: active ? "var(--background)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 h-[200px] w-full">
        {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C6A7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00C6A7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E3A5F" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false}
              tick={{ fill: "#4A6080", fontSize: 11, fontFamily: "DM Sans" }} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: "#4A6080", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickFormatter={(v) => `GHS ${v}`} width={70} />
            <Tooltip
              cursor={{ stroke: "#00C6A7", strokeWidth: 1, strokeOpacity: 0.4 }}
              contentStyle={{
                background: "#fff", border: "none", borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.30)", padding: "8px 12px",
              }}
              labelStyle={{ color: "#64748B", fontSize: 12, fontFamily: "DM Sans" }}
              formatter={(value: number) => [
                <span key="v" style={{ fontFamily: "JetBrains Mono", color: "#0A1628", fontWeight: 700 }}>
                  {`GHS ${value.toLocaleString()}`}
                </span>,
                "",
              ]}
            />
            <Area
              type="monotone" dataKey="ghs" stroke="#00C6A7" strokeWidth={2}
              fill="url(#earningsFill)"
              dot={{ r: 4, fill: "#00C6A7", stroke: "#0F1F3D", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#00C6A7", stroke: "#0F1F3D", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      <div
        className="mt-4 flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-[color:var(--text-secondary)]">Total this period:</span>
          <span className="font-mono-nums text-[15px] font-bold text-[color:var(--cyan-brand)]">
            {fmtGHSDecimal(total)}
          </span>
        </div>
        <div className="font-mono-nums text-[12px] text-[color:var(--text-muted)]">
          Best month: GHS 6,200
        </div>
      </div>
    </div>
  );
}