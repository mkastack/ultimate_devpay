import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/audit")({
  component: AuditLogPage,
});

const auditEntries = [
  { ts: "09:14:22", admin: "Michael K.", action: "approve_verification", target: "usr_4f2a91", details: "Approved KYC for Amara Okafor", ip: "102.176.x.x", color: "#10B981" },
  { ts: "09:12:08", admin: "Michael K.", action: "resolve_dispute", target: "DSP-2847", details: "Resolved in developer's favor — GHS 7,800 released", ip: "102.176.x.x", color: "#3B82F6" },
  { ts: "09:08:51", admin: "Sarah O.", action: "suspend_account", target: "usr_8c1b04", details: "Suspended for ToS violation", ip: "197.211.x.x", color: "#FF4D6A" },
  { ts: "09:03:14", admin: "Michael K.", action: "approve_withdrawal", target: "wd_00342", details: "Approved GHS 12,000 to MTN MoMo", ip: "102.176.x.x", color: "#F5A623" },
  { ts: "08:58:42", admin: "Sarah O.", action: "update_settings", target: "platform.commission", details: "Changed commission rate from 7.5% to 7.0%", ip: "197.211.x.x", color: "#3B82F6" },
  { ts: "08:52:19", admin: "Michael K.", action: "export_users", target: "users.csv", details: "Exported 5,247 user records", ip: "102.176.x.x", color: "#3B82F6" },
  { ts: "08:47:03", admin: "Michael K.", action: "view_user", target: "usr_2a8e51", details: "Viewed full profile of Kofi Mensah", ip: "102.176.x.x", color: "#3B82F6" },
  { ts: "08:41:55", admin: "Sarah O.", action: "approve_verification", target: "usr_6d3f12", details: "Approved business verification for Sankofa Capital", ip: "197.211.x.x", color: "#10B981" },
];

function AuditLogPage() {
  return (
    <div>
      <AdminHeader title="Audit Log" subtitle="Complete record of all admin actions." />

      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              {["Timestamp", "Admin", "Action", "Target", "Details", "IP"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditEntries.concat(auditEntries).map((e, i) => (
              <tr key={i} className="h-[50px] border-t border-[#1C2040] hover:bg-[#12152A]">
                <td className="px-4 font-mono text-[12px] text-[#8890B5]">{e.ts}</td>
                <td className="px-4 font-sans text-[13px] text-white">{e.admin}</td>
                <td className="px-4">
                  <span className="font-mono text-[12px] font-semibold" style={{ color: e.color }}>{e.action}</span>
                </td>
                <td className="px-4 font-mono text-[12px] text-[#3B82F6]">{e.target}</td>
                <td className="px-4 font-sans text-[12px] text-[#8890B5]">{e.details}</td>
                <td className="px-4 font-mono text-[11px] text-[#3D4466]">{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-3 text-center font-sans text-[11px] text-[#3D4466]">
        Audit log is immutable. Cannot be deleted or edited. Retained 7 years for compliance.
      </div>
    </div>
  );
}
