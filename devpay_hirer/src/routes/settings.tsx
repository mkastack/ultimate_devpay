import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import { LogoUploader } from "@/components/client/LogoUploader";
import { client } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · DevPay Africa" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <DashboardLayout>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border bg-card p-6 text-center" style={{ borderColor: "var(--border)" }}>
          <LogoUploader name={client.company_name} sessionId="demo-client" />
          <div className="mt-4 text-base font-semibold text-foreground">{client.company_name}</div>
          <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{client.email}</div>
          <div
            className="mx-auto mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
          >
            Verified Business ✓
          </div>
        </div>


        <div className="space-y-6">
          {["Company Info", "Notifications", "Billing & Plan", "Security"].map((section) => (
            <div
              key={section}
              className="rounded-2xl border bg-card p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="mb-4 text-base font-semibold text-foreground">{section}</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div>
                      <div className="text-sm text-foreground">Setting option {i}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                        Configure how this feature behaves
                      </div>
                    </div>
                    <button className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
