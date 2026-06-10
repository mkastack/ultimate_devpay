import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User, Bell, CreditCard, Shield, Crown, Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { developer } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — DevPay Africa" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
] as const;
type TabId = (typeof tabs)[number]["id"];

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[12px] font-medium text-[color:var(--text-secondary)]">{label}</div>
      <input
        type={type}
        defaultValue={value}
        className="h-10 w-full rounded-[10px] bg-[color:var(--background)] px-3 text-[13.5px] text-white outline-none focus:border-[color:var(--cyan-brand)]"
        style={{ border: "1px solid var(--color-border)" }}
      />
    </label>
  );
}

function Toggle({ label, hint, on }: { label: string; hint: string; on: boolean }) {
  const [v, setV] = useState(on);
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div>
        <div className="text-[13.5px] font-medium text-white">{label}</div>
        <div className="text-[12px] text-[color:var(--text-muted)]">{hint}</div>
      </div>
      <button
        type="button"
        onClick={() => setV(!v)}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: v ? "var(--cyan-brand)" : "var(--surface-hover)" }}
      >
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: v ? 22 : 2 }} />
      </button>
    </div>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState<TabId>("account");

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your account, notifications, billing, and security." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
        <nav className="rounded-2xl p-2" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={{
                  background: active ? "rgba(0,198,167,0.10)" : "transparent",
                  color: active ? "#fff" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: active ? "var(--cyan-brand)" : "var(--text-muted)" }} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
          {tab === "account" && (
            <>
              <h3 className="font-display text-[16px] font-semibold text-white">Account information</h3>
              <p className="mt-1 text-[12.5px] text-[color:var(--text-muted)]">Update how clients reach and identify you.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" value={developer.full_name} />
                <Field label="Username" value={developer.username} />
                <Field label="Email" value={developer.email} type="email" />
                <Field label="Title" value={developer.title} />
                <Field label="City" value={developer.city} />
                <Field label="Country" value={developer.country} />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="h-10 rounded-[10px] px-4 text-[13.5px] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]" style={{ border: "1px solid var(--color-border)" }}>Cancel</button>
                <button className="h-10 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13.5px] font-semibold text-[color:var(--background)] hover:shadow-cyan">Save changes</button>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3 className="font-display text-[16px] font-semibold text-white">Notifications</h3>
              <div className="mt-4">
                <Toggle label="New job matches" hint="AI-matched jobs that fit your skills" on />
                <Toggle label="Proposal updates" hint="When a client views or replies to your bid" on />
                <Toggle label="Payment events" hint="Escrow funded, released, or payout completed" on />
                <Toggle label="Messages" hint="New messages from clients" on />
                <Toggle label="Weekly digest" hint="Earnings summary every Monday" on={false} />
              </div>
            </>
          )}

          {tab === "billing" && (
            <>
              <h3 className="font-display text-[16px] font-semibold text-white">Subscription</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { name: "Free", price: "GHS 0", features: ["5 proposals / month", "Standard fees (10%)", "Email support"], current: developer.subscription_plan === "free" },
                  { name: "Pro", price: "GHS 99/mo", features: ["Unlimited AI proposals", "Lower fees (5%)", "Priority support", "Pro badge on profile"], current: developer.subscription_plan === "pro" },
                ].map((p) => (
                  <div key={p.name} className="rounded-xl p-5" style={{
                    background: "var(--background)",
                    border: p.current ? "1px solid var(--cyan-brand)" : "1px solid var(--color-border)",
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-display text-[15px] font-bold text-white">
                        {p.name === "Pro" && <Crown className="h-4 w-4 text-[color:var(--gold-brand)]" />}
                        {p.name}
                      </div>
                      {p.current && <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)" }}>CURRENT</span>}
                    </div>
                    <div className="mt-2 font-mono-nums text-[24px] font-bold text-white">{p.price}</div>
                    <ul className="mt-3 space-y-1.5 text-[12.5px] text-[color:var(--text-secondary)]">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" /> {f}</li>
                      ))}
                    </ul>
                    {!p.current && (
                      <button className="mt-4 h-9 w-full rounded-[10px] bg-[color:var(--cyan-brand)] text-[13px] font-semibold text-[color:var(--background)] hover:shadow-cyan">{p.name === "Pro" ? "Upgrade" : "Downgrade"}</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "security" && (
            <>
              <h3 className="font-display text-[16px] font-semibold text-white">Security</h3>
              <div className="mt-4">
                <Toggle label="Two-factor authentication" hint="Require a code from your authenticator app at sign-in" on={false} />
                <Toggle label="Login email alerts" hint="Get notified of new sign-ins from unknown devices" on />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Current password" value="" type="password" />
                <Field label="New password" value="" type="password" />
              </div>
              <div className="mt-6 flex justify-end">
                <button className="h-10 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13.5px] font-semibold text-[color:var(--background)] hover:shadow-cyan">Update password</button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}