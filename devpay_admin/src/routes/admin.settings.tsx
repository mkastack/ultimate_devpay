import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <AdminHeader title="Platform Settings" subtitle="Configure platform-wide behaviour." />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Fees & Pricing" />
          <Field label="Platform Commission Rate (%)" value="7" />
          <Field label="Pro Developer Monthly Fee (GHS)" value="150" />
          <Field label="Featured Job Weekly Fee (GHS)" value="200" />
          <div className="mt-3 rounded-lg border border-[#F59E0B]/40 bg-[rgba(245,158,11,0.10)] p-3">
            <div className="font-sans text-[12px] text-[#F59E0B]">⚠ Changes affect all new transactions. Existing contracts unaffected.</div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Payment Settings" />
          <Field label="Paystack API Key" value="pk_live_••••••••" />
          <Field label="Stripe API Key" value="sk_live_••••••••" />
          <Field label="MoMo Merchant ID" value="MTN-••••12" />
          <Toggle label="Enable Test Mode" sub="Routes payments to test endpoints" />
        </Card>

        <Card>
          <SectionHeader title="AI Settings" />
          <Field label="Gemini API Key" value="AIza••••••••" />
          <Field label="Claude API Key" value="sk-ant••••••••" />
          <Field label="Max tokens / proposal" value="4096" />
          <Field label="Max matches / job" value="25" />
          <Toggle label="AI Matching Enabled" sub="Powers the developer recommendation engine" on />
        </Card>

        <Card>
          <SectionHeader title="Withdrawal Settings" />
          <Field label="Minimum Withdrawal (GHS)" value="50" />
          <Field label="Max Auto-approve (GHS)" value="500" />
          <Field label="Processing Hours" value="08:00 – 18:00 GMT" />
          <Toggle label="MoMo Processing" on />
          <Toggle label="Bank Transfer Enabled" on />
        </Card>

        <Card>
          <SectionHeader title="Platform Controls" />
          <Toggle label="Maintenance Mode" sub="Shows maintenance page to users" />
          <Toggle label="New Registrations" on />
          <Toggle label="Job Posting Open" on />
          <Field label="Max jobs / client" value="20" />
          <Field label="Max proposals / developer / day" value="15" />
        </Card>

        <Card>
          <SectionHeader title="Notifications" />
          <Field label="Admin Email" value="admin@devpay.africa" />
          <Field label="Dispute Alert Threshold" value="5" />
          <Field label="Withdrawal Alert Threshold (GHS)" value="50,000" />
          <Field label="Daily Report Time" value="08:00 GMT" />
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <div className="mb-1 font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">{label}</div>
      <input
        defaultValue={value}
        className="h-10 w-full rounded-[10px] border border-[#1C2040] bg-[#12152A] px-3 font-mono text-[13px] text-white focus:border-[#1E3A8A] focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, sub, on = false }: { label: string; sub?: string; on?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-[10px] border border-[#1C2040] bg-[#12152A] p-3">
      <div>
        <div className="font-sans text-[13px] font-semibold text-white">{label}</div>
        {sub && <div className="font-sans text-[11px] text-[#3D4466]">{sub}</div>}
      </div>
      <div className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-[#1E3A8A]" : "bg-[#1C2040]"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </div>
    </div>
  );
}
