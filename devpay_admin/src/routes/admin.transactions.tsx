import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill } from "@/components/admin/ui";
import { ALL_TRANSACTIONS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/transactions")({
  component: TxnPage,
});

function TxnPage() {
  return (
    <div>
      <AdminHeader title="Transactions" subtitle={`${ALL_TRANSACTIONS.length} recent transactions across the platform`} />
      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              {["Txn ID", "Type", "From", "To", "Amount", "Fee", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_TRANSACTIONS.map((t) => (
              <tr key={t.id} className="h-[56px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4 font-mono text-[12px] text-[#3B82F6]">{t.id}</td>
                <td className="px-4"><Pill color={t.type === "commission" ? "purple" : t.type === "escrow_hold" ? "amber" : t.type === "escrow_release" ? "green" : "blue"}>{t.type}</Pill></td>
                <td className="px-4 font-sans text-[13px] text-[#8890B5]">{t.from}</td>
                <td className="px-4 font-sans text-[13px] text-[#8890B5]">{t.to}</td>
                <td className="px-4 font-mono text-[14px] font-semibold text-white">GHS {t.amount.toLocaleString()}</td>
                <td className="px-4 font-mono text-[13px] text-[#3B82F6]">GHS {t.fee.toLocaleString()}</td>
                <td className="px-4"><Pill color={t.status === "success" ? "green" : t.status === "pending" ? "amber" : "red"}>{t.status}</Pill></td>
                <td className="px-4 font-sans text-[12px] text-[#3D4466]">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
