import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { Search, Bot, ArrowRight } from "lucide-react";
import { initials } from "@/lib/hirer-format";
import { hirerDeveloperCatalog, getHirerDeveloper, type HirerDeveloper } from "@/lib/hirer-developer-catalog";
import { HireDialog, type HireTarget } from "@/components/hirer-dashboard/HireDialog";
import { DeveloperProfileDialog } from "@/components/hirer-dashboard/DeveloperProfileDialog";
import { AiMatchDialog } from "@/components/hirer-dashboard/AiMatchDialog";
import { hireTargetFromDeveloper } from "@/lib/hirer-hire-flow";

const FILTERS = ["All", "Available Now ●", "Top Rated ⭐", "< GHS 100/hr", "GHS 100–200/hr", "Ghana 🇬🇭", "Nigeria 🇳🇬", "Full Stack", "Mobile"];

export const Route = createFileRoute("/client/developers")({
  head: () => ({ meta: [{ title: "Browse Developers · DevPay Africa" }] }),
  component: DevelopersPage,
});

function DevelopersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [hireTarget, setHireTarget] = useState<HireTarget | null>(null);
  const [hireOpen, setHireOpen] = useState(false);
  const [profileDev, setProfileDev] = useState<HirerDeveloper | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const openHire = (dev: HirerDeveloper) => {
    setHireTarget(hireTargetFromDeveloper(dev));
    setHireOpen(true);
  };

  const openProfile = (dev: HirerDeveloper) => {
    setProfileDev(dev);
    setProfileOpen(true);
  };

  const filtered = hirerDeveloperCatalog.filter((d) => {
    const q = query.trim().toLowerCase();
    if (q && !`${d.name} ${d.title} ${d.skills.join(" ")}`.toLowerCase().includes(q)) return false;
    if (filter === "Available Now ●" && !d.available) return false;
    if (filter === "Top Rated ⭐" && !d.top) return false;
    if (filter === "< GHS 100/hr" && d.rate >= 100) return false;
    if (filter === "GHS 100–200/hr" && (d.rate < 100 || d.rate > 200)) return false;
    if (filter === "Ghana 🇬🇭" && !d.location.includes("Ghana")) return false;
    if (filter === "Nigeria 🇳🇬" && !d.location.includes("Nigeria")) return false;
    if (filter === "Full Stack" && !d.title.toLowerCase().includes("full")) return false;
    if (filter === "Mobile" && !d.title.toLowerCase().includes("mobile") && !d.skills.some((s) => /flutter|react native/i.test(s))) return false;
    return true;
  });

  return (
    <>
      <TopBar title="Browse Developers" subtitle="Find verified African talent for your next project" />

      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2"
          style={{ color: "var(--gold)" }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skill, or specialisation..."
          className="h-14 w-full rounded-xl border bg-card pl-14 pr-4 text-sm text-foreground outline-none focus:border-[var(--gold)]"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4 gold-gradient">
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
          type="button"
          onClick={() => setAiOpen(true)}
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
              type="button"
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
        {filtered.map((d) => (
          <DeveloperCard key={d.id} d={d} onProfile={() => openProfile(d)} onHire={() => openHire(d)} />
        ))}
      </div>

      <HireDialog
        open={hireOpen}
        onOpenChange={setHireOpen}
        target={hireTarget}
        onSuccess={(r) => navigate({ to: "/client/contracts", search: { hire: r.hire_id } as any })}
      />
      <DeveloperProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        developer={profileDev}
        onHire={profileDev ? () => openHire(profileDev) : undefined}
      />
      <AiMatchDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        onSelectDeveloper={(id) => {
          const dev = getHirerDeveloper(id);
          if (dev) openProfile(dev);
        }}
      />
    </>
  );
}

function DeveloperCard({
  d,
  onProfile,
  onHire,
}: {
  d: HirerDeveloper;
  onProfile: () => void;
  onHire: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: d.available ? "var(--cyan)" : "var(--gold)" }}
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
        <div className="text-center text-[13px]" style={{ color: "var(--text-secondary)" }}>{d.title}</div>
        <div className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>📍 {d.location}</div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="RATING" value={`⭐ ${d.rating}`} color="var(--gold)" />
          <Stat label="JOBS" value={String(d.jobs)} color="#fff" />
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
      <div className="flex gap-2 border-t p-3" style={{ borderColor: "var(--border)" }}>
        <button
          type="button"
          onClick={onProfile}
          className="h-9 flex-1 rounded-lg border text-[13px] font-semibold"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={onHire}
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
