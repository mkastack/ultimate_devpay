import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import { fmtGHS, initials } from "@/lib/format";
import { client, spendingByWeek, transactions } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments · DevPay Africa" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <DashboardLayout>
      <TopBar
        title="Payments"
        subtitle="Track every transaction and release"
        right={
          <div className="hidden font-mono text-base font-semibold md:block" style={{ color: "var(--gold)" }}>
            Total spent: {fmtGHS(client.total_spent_ghs)}
          </div>
        }
      />

      <div className="mb-6 rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Spending Overview</h2>
          <div className="flex gap-2 text-[12px]">
            {["Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
              <button
                key={m}
                className="px-2 pb-1 font-medium"
                style={{
                  color: m === "May" ? "var(--gold)" : "var(--text-muted)",
                  borderBottom: m === "May" ? "2px solid var(--gold)" : "none",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingByWeek}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="week" stroke="#4A6080" style={{ fontSize: 11 }} />
              <YAxis stroke="#4A6080" style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#0F1F3D",
                  border: "1px solid var(--gold)",
                  borderRadius: 8,
                  color: "#fff",
                }}
                formatter={(v: number) => fmtGHS(v)}
              />
              <Bar dataKey="amount" fill="url(#gold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Payment Methods
          </div>
          <button className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>+ Add New</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MethodCard name="Paystack" sub="Card & Bank Transfer" tag="Primary ✓" tagColor="var(--success)" emoji="💳" />
          <MethodCard name="MTN Mobile Money" sub="+233 *** 5821" emoji="📱" />
          <button
            className="flex min-h-[88px] items-center justify-center rounded-xl border-2 border-dashed text-sm font-semibold transition-colors hover:border-[var(--gold)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            + Add Payment Method
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between p-5">
          <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
          <button className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>Export ↓</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--card-hover)" }}>
                {["Date", "Description", "Developer", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>{t.date}</td>
                  <td className="px-5 py-3 text-[13px] text-foreground">{t.description}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: "var(--card-hover)", color: "var(--gold)" }}
                      >
                        {initials(t.developer)}
                      </div>
                      <span className="text-[13px] text-foreground">{t.developer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[13px]" style={{ color: "var(--destructive)" }}>
                    {fmtGHS(t.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: t.status === "Completed" ? "rgba(16,185,129,0.15)" : "rgba(245,166,35,0.15)",
                        color: t.status === "Completed" ? "var(--success)" : "var(--gold)",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MethodCard({ name, sub, tag, tagColor, emoji }: {
  name: string; sub: string; tag?: string; tagColor?: string; emoji: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4" style={{ borderColor: "var(--border)" }}>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
        style={{ background: "var(--card-hover)" }}
      >
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{sub}</div>
      </div>
      {tag && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${tagColor}33`, color: tagColor }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}
