import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Mail, Star, Pencil, Plus, Crown } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { developer, fmtUSD } from "@/lib/dev-mock-data";

export const Route = createFileRoute("/developer/profile")({
  head: () => ({ meta: [{ title: "Profile — DevPay Africa" }] }),
  component: ProfilePage,
});

const skills = [
  { name: "React", level: 95 }, { name: "TypeScript", level: 92 },
  { name: "Node.js", level: 88 }, { name: "React Native", level: 84 },
  { name: "PostgreSQL", level: 80 }, { name: "Tailwind", level: 90 },
  { name: "Supabase", level: 76 }, { name: "AWS", level: 70 },
];

const portfolio = [
  { title: "Speedaf Logistics App", tag: "React Native · Real-time" },
  { title: "Hubtel Merchant Dashboard", tag: "React · Supabase" },
  { title: "Zeepay Wallet SDK", tag: "TypeScript · Fintech" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function ProfilePage() {
  const completion = 86;
  return (
    <>
      <DevDashboardHeader title="My Profile" subtitle="Your public profile — what clients see when they view your work." />

      <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
        <div className="h-24 w-full" style={{ background: "linear-gradient(120deg, rgba(0,198,167,0.20), rgba(245,166,35,0.15))" }} />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className="-mt-10 grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[color:var(--surface-hover)] font-display text-[22px] font-bold text-[color:var(--cyan-brand)]"
              style={{ border: "3px solid var(--gold-brand)" }}
            >
              {initials(developer.full_name)}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-[22px] font-bold text-white">{developer.full_name}</h2>
                {developer.is_verified && <BadgeCheck className="h-5 w-5 text-[color:var(--cyan-brand)]" />}
              </div>
              <div className="text-[13.5px] text-[color:var(--text-secondary)]">{developer.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-[color:var(--text-muted)]">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {developer.city}, {developer.country}</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {developer.email}</span>
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[color:var(--gold-brand)]" /> {developer.rating} ({developer.rating_count})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {developer.subscription_plan === "pro" && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.30)", color: "var(--gold-brand)" }}>
                <Crown className="h-3.5 w-3.5" /> Pro
              </span>
            )}
            <button className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98]">
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* About + Skills + Portfolio */}
        <div className="space-y-4">
          <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <h3 className="font-display text-[15px] font-semibold text-white">About</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--text-secondary)]">
              Full-stack engineer based in Accra. I ship production React + Node systems for African fintech, logistics, and SaaS teams.
              43 contracts delivered, 98% on-time, 4.9★ average rating. Comfortable owning a feature end-to-end — from Figma to production.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-white">Skills</h3>
              <button className="text-[12px] text-[color:var(--cyan-brand)] hover:underline inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-white">{s.name}</span>
                    <span className="font-mono-nums text-[color:var(--text-muted)]">{s.level}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-hover)]">
                    <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: "linear-gradient(90deg, var(--cyan-brand), #4ADE80)" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-white">Portfolio</h3>
              <button className="text-[12px] text-[color:var(--cyan-brand)] hover:underline inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add work</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {portfolio.map((p) => (
                <div key={p.title} className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
                  <div className="h-24 w-full rounded-md" style={{ background: "linear-gradient(135deg, rgba(0,198,167,0.20), rgba(99,102,241,0.20))" }} />
                  <div className="mt-2 text-[13px] font-semibold text-white">{p.title}</div>
                  <div className="text-[11.5px] text-[color:var(--text-muted)]">{p.tag}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <h3 className="text-[13px] font-semibold text-white">Profile completion</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono-nums text-[28px] font-bold text-[color:var(--cyan-brand)]">{completion}%</span>
              <span className="text-[12px] text-[color:var(--text-muted)]">+12% boosts visibility</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-hover)]">
              <div className="h-full" style={{ width: `${completion}%`, background: "var(--cyan-brand)" }} />
            </div>
          </section>

          <section className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            <h3 className="text-[13px] font-semibold text-white">Stats</h3>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {[
                ["Jobs completed", String(developer.jobs_completed)],
                ["Response rate", `${developer.response_rate}%`],
                ["AI Skill Score", `${developer.ai_skill_score}/100`],
                ["Total earned", fmtUSD(developer.total_earned_usd)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-[color:var(--text-muted)]">{k}</dt>
                  <dd className="font-mono-nums font-semibold text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}