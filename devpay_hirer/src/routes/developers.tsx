import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import { Search, Bot, ArrowRight } from "lucide-react";
import { recommendedDevelopers } from "@/lib/mock-data";
import { initials } from "@/lib/format";

const ALL_DEVS = [
  ...recommendedDevelopers,
  { id: "d7", name: "Yaw Owusu", title: "Backend Python", location: "Kumasi, Ghana 🇬🇭", flag: "🇬🇭", rating: 4.7, rate: 130, available: true, top: false, skills: ["Python", "Django"], recently_active: true },
  { id: "d8", name: "Mariam Diallo", title: "DevOps Engineer", location: "Bamako, Mali 🇲🇱", flag: "🇲🇱", rating: 4.8, rate: 145, available: false, top: false, skills: ["AWS", "Docker"], recently_active: false },
];

const FILTERS = ["All", "Available Now ●", "Top Rated ⭐", "< GHS 100/hr", "GHS 100–200/hr", "Ghana 🇬🇭", "Nigeria 🇳🇬", "Full Stack", "Mobile"];

export const Route = createFileRoute("/developers")({
  head: () => ({ meta: [{ title: "Browse Developers · DevPay Africa" }] }),
  component: DevelopersPage,
});

function DevelopersPage() {
  const [filter, setFilter] = useState("All");

  return (
    <DashboardLayout>
      <TopBar title="Browse Developers" subtitle="Find verified African talent for your next project" />

      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2"
          style={{ color: "var(--gold)" }}
        />
        <input
          placeholder="Search by name, skill, or specialisation..."
          className="h-14 w-full rounded-xl border bg-card pl-14 pr-4 text-sm text-foreground outline-none focus:border-[var(--gold)]"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div
        className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4 gold-gradient"
      >
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8" style={{ color: "var(--background)" }} />
          <div>
            <div className="font-display text-[15px] font-semibold" style={{ color: "var(--background)" }}>
              AI Matching Active
            </div>
            <div className="text-xs" style={{ color: "rgba(0,0,0,0.60)" }}>
              Tell AI what you need
            </div>
          </div>
        </div>
        <button
          className="flex h-10 items-center gap-1 rounded-lg border bg-black/20 px-4 text-sm font-semibold"
          style={{ borderColor: "rgba(0,0,0,0.30)", color: "var(--background)" }}
        >
          Match Me <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => {
          const sel = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-9 flex-shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors"
              style={{
                background: sel ? "var(--gold)" : "var(--card-hover)",
                color: sel ? "var(--background)" : "var(--text-secondary)",
                borderColor: sel ? "var(--gold)" : "var(--border)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_DEVS.map((d) => (
          <DeveloperCard key={d.id} d={d} />
        ))}
      </div>
    </DashboardLayout>
  );
}

function DeveloperCard({ d }: { d: typeof ALL_DEVS[number] }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: d.available ? "var(--cyan)" : "var(--gold)",
        }}
      />
      <div className="p-5">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 text-base font-bold"
          style={{
            borderColor: d.top ? "var(--gold)" : d.available ? "var(--cyan)" : "var(--border)",
            background: "var(--card-hover)",
            color: d.top ? "var(--gold)" : "var(--cyan)",
          }}
        >
          {initials(d.name)}
        </div>
        <div className="mt-3 text-center text-[15px] font-semibold text-foreground">{d.name}</div>
        <div className="text-center text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {d.title}
        </div>
        <div className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          📍 {d.location}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="RATING" value={`⭐ ${d.rating}`} color="var(--gold)" />
          <Stat label="JOBS" value="38" color="#fff" />
          <Stat label="RATE" value={`GHS ${d.rate}/hr`} color="#fff" />
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {d.skills.map((s) => (
            <span
              key={s}
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: "var(--card-hover)", color: "var(--text-secondary)" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div
        className="flex gap-2 border-t p-3"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          className="h-9 flex-1 rounded-lg border text-[13px] font-semibold"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          View Profile
        </button>
        <button
          className="h-9 flex-1 rounded-lg text-[13px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
          style={{ color: "var(--background)" }}
        >
          Hire Now →
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-[12px] font-semibold" style={{ color }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
