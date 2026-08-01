import { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

type Period = "Week" | "Month" | "Year";
type Point = { label: string; usd: number };

const USD_TO_GHS = 15.5;

const fmtGHSDecimal = (usd: number) =>
  `GHS ${(usd * USD_TO_GHS).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function buildWeekData(transactions: Array<{ amount: number; created_at: string | null }>): Point[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const total = transactions.reduce((sum, item) => {
      if (!item.created_at) return sum;
      const created = new Date(item.created_at);
      const createdKey = created.toISOString().slice(0, 10);
      return createdKey === key ? sum + Number(item.amount ?? 0) : sum;
    }, 0);

    return { label: date.toLocaleDateString("en-US", { weekday: "short" }), usd: total };
  });
}

function buildMonthData(transactions: Array<{ amount: number; created_at: string | null }>): Point[] {
  return Array.from({ length: 4 }, (_, index) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (27 - index * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const total = transactions.reduce((sum, item) => {
      if (!item.created_at) return sum;
      const created = new Date(item.created_at);
      return created >= start && created <= end ? sum + Number(item.amount ?? 0) : sum;
    }, 0);

    return { label: `W${index + 1}`, usd: total };
  });
}

function buildYearData(transactions: Array<{ amount: number; created_at: string | null }>): Point[] {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (11 - index));
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const total = transactions.reduce((sum, item) => {
      if (!item.created_at) return sum;
      const created = new Date(item.created_at);
      return created >= start && created <= end ? sum + Number(item.amount ?? 0) : sum;
    }, 0);

    return { label: start.toLocaleDateString("en-US", { month: "short" }), usd: total };
  });
}

export function EarningsChart() {
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>("Month");
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Array<{ amount: number; created_at: string | null }>>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session?.user?.id) {
      setTransactions([]);
      return;
    }

    let active = true;

    const loadTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (!active) return;
      if (error) {
        console.error("Failed to load earnings chart", error);
        setTransactions([]);
        return;
      }

      setTransactions((data ?? []) as Array<{ amount: number; created_at: string | null }>);
    };

    void loadTransactions();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const raw = period === "Week" ? buildWeekData(transactions) : period === "Year" ? buildYearData(transactions) : buildMonthData(transactions);
  const data = raw.map((d) => ({ ...d, ghs: Math.round(d.usd * USD_TO_GHS) }));
  const total = raw.reduce((sum, item) => sum + item.usd, 0);

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
          Live from transactions
        </div>
      </div>
    </div>
  );
}