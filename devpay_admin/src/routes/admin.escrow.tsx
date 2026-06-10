import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/admin/ui";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/admin/escrow")({
  component: EscrowPage,
});

const escrowRecords = Array.from({ length: 18 }, (_, i) => ({
  id: `esc_${(i + 1000).toString(36)}`,
  contract: ["Mobile banking app", "E-commerce rebuild", "Brand identity package", "DeFi audit", "iOS health app", "SaaS dashboard redesign"][i % 6],
  client: ["Sankofa Capital", "MarketKart", "ZN Boutique", "DefiLabs", "WellApp", "PixelHQ"][i % 6],
  developer: ["Kofi Mensah", "Nia Achebe", "Imani Kone", "Idris Bello", "Themba Ndlovu", "Akua Owusu"][i % 6],
  amount: [42000, 18500, 850, 28000, 12500, 7800, 65000, 3200][i % 8],
  status: i % 5 === 0 ? "disputed" : i % 3 === 0 ? "released" : "holding",
  ageDays: (i * 3) % 45,
}));

function EscrowPage() {
  const totalHolding = escrowRecords.filter((e) => e.status === "holding").reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <AdminHeader title="Escrow Monitor" subtitle="Complete oversight of all funds in escrow." />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card padding="p-6" className="border-[#F5A623]/30">
          <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Total In Escrow</div>
          <div className="mt-2 font-display text-[40px] font-bold text-[#F5A623]">GHS {totalHolding.toLocaleString()}</div>
          <div className="mt-1 font-mono text-[12px] text-[#3D4466]">≈ USD {Math.round(totalHolding / 15.5).toLocaleString()}</div>
          <div className="mt-1 font-sans text-[12px] text-[#8890B5]">{escrowRecords.filter((e) => e.status === "holding").length} active holds</div>
        </Card>
        <Card padding="p-6">
          <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Released Today</div>
          <div className="mt-2 font-display text-[40px] font-bold text-[#10B981]">GHS 84,200</div>
          <div className="mt-1 font-sans text-[12px] text-[#8890B5]">23 transactions</div>
        </Card>
        <Card padding="p-6">
          <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Disputed</div>
          <div className="mt-2 font-display text-[40px] font-bold text-[#FF4D6A]">GHS 11,850</div>
          <div className="mt-1 font-sans text-[12px] text-[#8890B5]">3 under review</div>
        </Card>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              {["Escrow ID", "Contract", "Client", "Developer", "Amount", "Status", "Age", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {escrowRecords.map((e) => (
              <tr key={e.id} className="h-[52px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4 font-mono text-[12px] text-[#3B82F6]">{e.id}</td>
                <td className="px-4 font-sans text-[13px] text-white">{e.contract}</td>
                <td className="px-4 font-sans text-[13px] text-[#8890B5]">{e.client}</td>
                <td className="px-4 font-sans text-[13px] text-[#8890B5]">{e.developer}</td>
                <td className="px-4 font-mono text-[14px] font-semibold text-[#F5A623]">GHS {e.amount.toLocaleString()}</td>
                <td className="px-4">
                  <span className={`inline-flex items-center gap-1 font-sans text-[12px] font-semibold ${
                    e.status === "holding" ? "text-[#F5A623]" : e.status === "released" ? "text-[#10B981]" : "text-[#FF4D6A]"
                  }`}>
                    <Lock className="h-3 w-3" /> {e.status}
                  </span>
                </td>
                <td className="px-4">
                  <span className="font-mono text-[12px]" style={{
                    color: e.ageDays > 30 ? "#FF4D6A" : e.ageDays > 7 ? "#F59E0B" : "#10B981",
                  }}>
                    {e.ageDays}d
                  </span>
                </td>
                <td className="px-4">
                  <button className="rounded-md bg-[#12152A] px-3 py-1.5 font-sans text-[12px] text-[#3B82F6] hover:bg-[rgba(30,58,138,0.20)]">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
