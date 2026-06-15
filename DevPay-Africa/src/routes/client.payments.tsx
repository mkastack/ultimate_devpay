import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { fmtGHS, initials, fmtUSD } from "@/lib/hirer-format";
import { client, spendingByWeek, transactions } from "@/lib/hirer-mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/client/payments")({
  head: () => ({ meta: [{ title: "Payments · DevPay Africa" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [methods, setMethods] = useState([
    { id: "m1", name: "Paystack", sub: "Card & Bank Transfer", emoji: "💳", isPrimary: true },
    { id: "m2", name: "MTN Mobile Money", sub: "+233 *** 5821", emoji: "📱", isPrimary: false },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Dialog visibility states
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  // Add Payment Method form fields
  const [newType, setNewType] = useState("card");
  const [cardNum, setCardNum] = useState("");
  const [phone, setPhone] = useState("");
  const [accName, setAccName] = useState("");
  const [network, setNetwork] = useState("MTN");

  // Make Payment form fields
  const [payAmt, setPayAmt] = useState("");

  const handleAddMethod = () => {
    if (newType === "card" && !cardNum.trim()) {
      toast.error("Please enter card number");
      return;
    }
    if (newType === "momo" && !phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    if (!accName.trim()) {
      toast.error("Please enter account name");
      return;
    }

    const newId = `m${methods.length + 1}`;
    const newMethod = {
      id: newId,
      name: newType === "card" ? "Paystack" : `${network} Mobile Money`,
      sub: newType === "card" ? `Card ending in ${cardNum.slice(-4) || "4242"}` : phone,
      emoji: newType === "card" ? "💳" : "📱",
      isPrimary: false,
    };

    setMethods([...methods, newMethod]);
    setAddOpen(false);
    setCardNum("");
    setPhone("");
    setAccName("");
    toast.success("Payment method added successfully!");
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [activeMonth, setActiveMonth] = useState("May");

  const spendingDataByMonth: Record<string, { week: string; amount: number }[]> = {
    Jan: [{ week: "W1", amount: 1200 }, { week: "W2", amount: 800 }, { week: "W3", amount: 1500 }, { week: "W4", amount: 2000 }],
    Feb: [{ week: "W1", amount: 900 }, { week: "W2", amount: 1100 }, { week: "W3", amount: 1800 }, { week: "W4", amount: 1300 }],
    Mar: [{ week: "W1", amount: 2300 }, { week: "W2", amount: 1400 }, { week: "W3", amount: 1600 }, { week: "W4", amount: 2100 }],
    Apr: [{ week: "W1", amount: 1100 }, { week: "W2", amount: 1900 }, { week: "W3", amount: 1200 }, { week: "W4", amount: 2500 }],
    May: spendingByWeek,
    Jun: [{ week: "W1", amount: 1500 }, { week: "W2", amount: 2200 }, { week: "W3", amount: 1700 }, { week: "W4", amount: 1900 }],
    Jul: [{ week: "W1", amount: 1800 }, { week: "W2", amount: 1300 }, { week: "W3", amount: 2100 }, { week: "W4", amount: 1400 }],
    Aug: [{ week: "W1", amount: 1400 }, { week: "W2", amount: 1700 }, { week: "W3", amount: 1900 }, { week: "W4", amount: 2600 }],
    Sep: [{ week: "W1", amount: 2000 }, { week: "W2", amount: 1800 }, { week: "W3", amount: 1400 }, { week: "W4", amount: 1500 }],
    Oct: [{ week: "W1", amount: 1600 }, { week: "W2", amount: 2100 }, { week: "W3", amount: 2500 }, { week: "W4", amount: 1900 }],
    Nov: [{ week: "W1", amount: 2200 }, { week: "W2", amount: 1900 }, { week: "W3", amount: 2300 }, { week: "W4", amount: 1800 }],
    Dec: [{ week: "W1", amount: 3100 }, { week: "W2", amount: 4500 }, { week: "W3", amount: 2900 }, { week: "W4", amount: 5000 }],
  };

  const handleExecutePayment = () => {
    const amt = parseFloat(payAmt);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Payment of GHS ${amt.toLocaleString()} authorized successfully!`);
    setPayOpen(false);
    setPayAmt("");
  };

  return (
    <>
      <TopBar
        title="Payments"
        subtitle="Track every transaction and release"
        right={
          <div className="hidden font-mono text-base font-semibold md:block" style={{ color: "var(--gold)" }}>
            Total spent: {fmtGHS(client.total_spent_ghs)}
          </div>
        }
      />

      {/* Spending Overview */}
      <div className="mb-6 rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)" }}>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Spending Overview</h2>
          <div className="flex gap-2 text-[12px] overflow-x-auto max-w-full pb-2 scrollbar-thin snap-x">
            {months.map((m) => {
              const isActive = activeMonth === m;
              return (
                <button
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className="px-2.5 pb-1 font-medium transition-all shrink-0 snap-start"
                  style={{
                    color: isActive ? "var(--gold)" : "var(--text-muted)",
                    borderBottom: isActive ? "2px solid var(--gold)" : "none",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingDataByMonth[activeMonth] || spendingByWeek}>
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

      {/* Payment Methods */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Payment Methods
          </div>
          <button onClick={() => setAddOpen(true)} className="text-[13px] font-medium transition-colors hover:text-white" style={{ color: "var(--gold)" }}>
            + Add New
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {methods.map((m) => {
            const isSelected = selectedId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: isSelected ? "var(--gold)" : "var(--border)",
                  borderWidth: isSelected ? 2 : 1,
                  boxShadow: isSelected ? "0 4px 20px -6px rgba(245,166,35,0.2)" : "none",
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ background: "var(--card-hover)" }}
                >
                  {m.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground truncate">{m.name}</div>
                  <div className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>{m.sub}</div>
                </div>
                {m.isPrimary && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                  >
                    Primary ✓
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setAddOpen(true)}
            className="flex min-h-[88px] items-center justify-center rounded-xl border-2 border-dashed text-sm font-semibold transition-colors hover:border-[var(--gold)] hover:text-white"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            + Add Payment Method
          </button>
        </div>

        {/* Dynamic Make Payment action button */}
        {selectedId && (
          <div className="mt-4 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => setPayOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xl px-6 font-display font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
              style={{ color: "var(--background)" }}
            >
              💳 Pay Now with {methods.find(m => m.id === selectedId)?.name}
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
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

      {/* Add Payment Method Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-0 sm:max-w-md" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add Payment Method</DialogTitle>
            <DialogDescription className="text-xs text-[color:var(--text-muted)]">
              Configure a new credit card or mobile money number for your project escrows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Method Type</label>
              <div className="flex gap-2">
                {["card", "momo"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className="h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors"
                    style={{
                      background: newType === t ? "var(--gold)" : "var(--card-hover)",
                      color: newType === t ? "var(--background)" : "var(--text-secondary)",
                      borderColor: newType === t ? "var(--gold)" : "var(--border)",
                    }}
                  >
                    {t === "card" ? "💳 Card / Paystack" : "📱 Mobile Money"}
                  </button>
                ))}
              </div>
            </div>

            {newType === "card" ? (
              <>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Card Number</label>
                  <input
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">CVV</label>
                    <input
                      type="password"
                      placeholder="xxx"
                      className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Network Operator</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Telecel">Telecel Cash</option>
                    <option value="AirtelTigo">AT Money</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+233 xx xxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Account Name</label>
              <input
                type="text"
                placeholder="e.g. Kwame Mensah"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="h-11 w-full rounded-lg border bg-[var(--card-hover)] px-3 text-sm text-white outline-none focus:border-[var(--gold)]"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <button
              onClick={handleAddMethod}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl font-semibold transition-transform hover:scale-[1.01] gold-gradient"
              style={{ color: "var(--background)" }}
            >
              Save Payment Method
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Make Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="border-0 sm:max-w-md" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <DialogHeader>
            <DialogTitle className="text-white">Make Payment</DialogTitle>
            <DialogDescription className="text-xs text-[color:var(--text-muted)]">
              Enter the amount you wish to pay / fund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Payment Method</label>
              <div className="rounded-lg border bg-[var(--card-hover)] px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="text-sm font-semibold text-white">
                  {methods.find(m => m.id === selectedId)?.name}
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  {methods.find(m => m.id === selectedId)?.sub}
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[color:var(--text-muted)]">Amount (GHS)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[color:var(--text-muted)]">GHS</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={payAmt}
                  onChange={(e) => setPayAmt(e.target.value)}
                  className="h-12 w-full rounded-lg border bg-[var(--card-hover)] pl-12 pr-4 text-lg font-mono text-white outline-none focus:border-[var(--gold)]"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>
            <button
              onClick={handleExecutePayment}
              className="flex h-11 w-full items-center justify-center rounded-xl font-semibold transition-transform hover:scale-[1.01] gold-gradient"
              style={{ color: "var(--background)" }}
            >
              Authorize Payment
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
