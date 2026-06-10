import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import { Check, ArrowLeft, ArrowRight, Lock, Sparkles } from "lucide-react";
import { fmtUSD, ghsToUsd } from "@/lib/format";

export const Route = createFileRoute("/post-job")({
  head: () => ({ meta: [{ title: "Post a Job · DevPay Africa" }] }),
  component: PostJobPage,
});

const STEPS = ["Type", "Details", "Skills", "Budget", "Review"];

const CATEGORIES = [
  { id: "web", label: "Web Development", desc: "React, Next.js, Vue", icon: "🌐", color: "rgba(0,198,167,0.15)" },
  { id: "mobile", label: "Mobile App", desc: "React Native, Flutter", icon: "📱", color: "rgba(56,189,248,0.15)" },
  { id: "design", label: "UI/UX Design", desc: "Figma, Wireframes", icon: "🎨", color: "rgba(168,85,247,0.15)" },
  { id: "ai", label: "AI Integration", desc: "LLMs, Automation", icon: "🤖", color: "rgba(16,185,129,0.15)" },
  { id: "security", label: "Cybersecurity", desc: "Pentesting, Audits", icon: "🔒", color: "rgba(255,77,106,0.15)" },
  { id: "backend", label: "Backend / API", desc: "Node.js, Python, Go", icon: "⚙️", color: "rgba(245,166,35,0.15)" },
  { id: "ecom", label: "E-commerce", desc: "Shopify, WooCommerce", icon: "🛒", color: "rgba(245,166,35,0.15)" },
  { id: "data", label: "Data / Analytics", desc: "SQL, Python, BI", icon: "📊", color: "rgba(99,102,241,0.15)" },
  { id: "devops", label: "DevOps / Cloud", desc: "AWS, Docker, CI/CD", icon: "☁️", color: "rgba(56,189,248,0.15)" },
];

const POPULAR_SKILLS = ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "PostgreSQL", "Python", "Figma", "AWS", "GraphQL"];

function PostJobPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [projectType, setProjectType] = useState("one-time");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [budgetType, setBudgetType] = useState<"fixed" | "hourly">("fixed");
  const [budget, setBudget] = useState<string>("");
  const [featured, setFeatured] = useState(false);
  const [posted, setPosted] = useState(false);

  if (posted) return <SuccessOverlay />;

  return (
    <DashboardLayout>
      <TopBar title="Post a Job" subtitle="Find your developer in hours, not weeks" />

      {/* Stepper */}
      <div className="mx-auto mb-8 flex max-w-[640px] items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-bold transition-all"
                style={{
                  background: i < step ? "var(--gold)" : "transparent",
                  border: i === step ? "2px solid var(--gold)" : i < step ? "none" : "1px solid var(--border)",
                  color: i < step ? "var(--background)" : i === step ? "var(--gold)" : "var(--text-muted)",
                }}
              >
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <div
                className="mt-2 text-[10px] font-medium uppercase tracking-wider"
                style={{ color: i === step ? "var(--gold)" : "var(--text-muted)" }}
              >
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="mx-2 mb-5 h-px flex-1"
                style={{ background: i < step ? "var(--gold)" : "var(--border)" }}
              />
            )}
          </div>
        ))}
      </div>

      <div
        className="mx-auto max-w-[640px] rounded-[20px] border bg-card p-8"
        style={{ borderColor: "var(--border)" }}
      >
        {step === 0 && (
          <StepType
            category={category}
            setCategory={setCategory}
            projectType={projectType}
            setProjectType={setProjectType}
          />
        )}
        {step === 1 && (
          <StepDetails
            title={title} setTitle={setTitle}
            description={description} setDescription={setDescription}
            timeline={timeline} setTimeline={setTimeline}
            experience={experience} setExperience={setExperience}
          />
        )}
        {step === 2 && <StepSkills skills={skills} setSkills={setSkills} />}
        {step === 3 && (
          <StepBudget
            budgetType={budgetType} setBudgetType={setBudgetType}
            budget={budget} setBudget={setBudget}
          />
        )}
        {step === 4 && (
          <StepReview
            category={category} title={title} timeline={timeline}
            experience={experience} skills={skills} budget={budget}
            featured={featured} setFeatured={setFeatured}
            budgetType={budgetType}
          />
        )}
      </div>

      {/* Nav */}
      <div className="mx-auto mt-5 flex max-w-[640px] items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex h-12 items-center gap-2 rounded-xl border bg-[var(--card-hover)] px-5 text-sm font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : <div />}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex h-12 items-center gap-2 rounded-xl px-6 font-display text-[15px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
            style={{ color: "var(--background)" }}
          >
            Next: {STEPS[step + 1]} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setPosted(true)}
            className="flex h-14 items-center gap-2 rounded-xl px-8 font-display text-[18px] font-bold transition-transform hover:scale-[1.01] gold-gradient shadow-gold-lg"
            style={{ color: "var(--background)" }}
          >
            Post Job Now 🚀
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}

function StepType({
  category, setCategory, projectType, setProjectType,
}: {
  category: string | null; setCategory: (s: string) => void;
  projectType: string; setProjectType: (s: string) => void;
}) {
  return (
    <>
      <h2 className="font-display text-[22px] font-bold text-foreground">What type of work do you need?</h2>
      <p className="mb-6 mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        Select the category that best fits your project.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const sel = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="relative rounded-xl border p-4 text-left transition-all"
              style={{
                borderColor: sel ? "var(--gold)" : "var(--border)",
                borderWidth: sel ? 2 : 1,
                background: sel ? "rgba(245,166,35,0.08)" : "var(--card-hover)",
              }}
            >
              <div
                className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ background: c.color }}
              >
                {c.icon}
              </div>
              <div className="text-sm font-semibold text-foreground">{c.label}</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{c.desc}</div>
              {sel && (
                <div
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: "var(--gold)", color: "var(--background)" }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="mb-2 mt-6 text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "var(--text-muted)" }}
      >
        Project Type
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "one-time", label: "One-time Project" },
          { id: "ongoing", label: "Ongoing Work" },
          { id: "fulltime", label: "Full-time Hire" },
        ].map((p) => {
          const sel = projectType === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setProjectType(p.id)}
              className="h-10 rounded-full border px-4 text-[13px] font-semibold transition-colors"
              style={{
                background: sel ? "var(--gold)" : "var(--card-hover)",
                color: sel ? "var(--background)" : "var(--text-secondary)",
                borderColor: sel ? "var(--gold)" : "var(--border)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepDetails({
  title, setTitle, description, setDescription,
  timeline, setTimeline, experience, setExperience,
}: any) {
  return (
    <>
      <h2 className="mb-6 font-display text-[22px] font-bold text-foreground">Describe your project</h2>

      <Label>Job Title *</Label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. React Developer for Fintech Dashboard"
        className="h-14 w-full rounded-xl border bg-[var(--card-hover)] px-4 text-[16px] text-foreground outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-2 focus:border-[var(--gold)]"
        style={{ borderColor: "var(--border)" }}
        maxLength={100}
      />
      <div className="mb-5 mt-1 text-right text-[11px]" style={{ color: "var(--text-muted)" }}>
        {title.length}/100
      </div>

      <Label>Description *</Label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what you need built, technical requirements, and what success looks like..."
        className="h-40 w-full resize-none rounded-xl border bg-[var(--card-hover)] p-4 text-[15px] text-foreground outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-2 focus:border-[var(--gold)]"
        style={{ borderColor: "var(--border)" }}
      />
      <div
        className="mt-2 rounded-lg border px-4 py-2.5 text-[12px]"
        style={{
          background: "rgba(245,166,35,0.08)",
          borderColor: "rgba(245,166,35,0.20)",
          color: "var(--gold)",
        }}
      >
        💡 Detailed descriptions get 4x more quality proposals
      </div>

      <Label className="mt-6">Project Timeline *</Label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "1w", label: "< 1 Week", sub: "Quick project" },
          { id: "2w", label: "1–2 Weeks", sub: "Short sprint" },
          { id: "1m", label: "1 Month", sub: "Medium build" },
          { id: "3m", label: "3+ Months", sub: "Long-term" },
        ].map((t) => {
          const sel = timeline === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTimeline(t.id)}
              className="rounded-[10px] border p-3 text-left transition-all"
              style={{
                background: sel ? "rgba(245,166,35,0.08)" : "var(--card-hover)",
                borderColor: sel ? "var(--gold)" : "var(--border)",
                borderWidth: sel ? 2 : 1,
              }}
            >
              <div className="text-sm font-semibold text-foreground">{t.label}</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.sub}</div>
            </button>
          );
        })}
      </div>

      <Label className="mt-6">Experience Level *</Label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "junior", label: "Junior", sub: "1–3 yrs · Basic tasks" },
          { id: "mid", label: "Mid-level", sub: "3–5 yrs · Solid work" },
          { id: "senior", label: "Senior/Expert", sub: "5+ yrs · Complex builds" },
        ].map((e) => {
          const sel = experience === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setExperience(e.id)}
              className="rounded-[10px] border p-4 text-center transition-all"
              style={{
                background: sel ? "rgba(245,166,35,0.08)" : "var(--card-hover)",
                borderColor: sel ? "var(--gold)" : "var(--border)",
                borderWidth: sel ? 2 : 1,
              }}
            >
              <div className="text-sm font-semibold text-foreground">{e.label}</div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{e.sub}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepSkills({ skills, setSkills }: { skills: string[]; setSkills: (s: string[]) => void }) {
  const toggle = (s: string) =>
    setSkills(skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s]);

  return (
    <>
      <h2 className="mb-6 font-display text-[22px] font-bold text-foreground">What skills do you need?</h2>

      <input
        placeholder="Search skills..."
        className="h-14 w-full rounded-xl border bg-[var(--card-hover)] px-4 text-[15px] text-foreground outline-none placeholder:text-[var(--text-muted)] focus:border-2 focus:border-[var(--gold)]"
        style={{ borderColor: "var(--border)" }}
      />

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium"
              style={{
                background: "var(--card-hover)",
                borderColor: "var(--gold)",
                color: "var(--gold)",
              }}
            >
              {s} <span className="text-base leading-none">✕</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="mb-3 mt-6 text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "var(--text-muted)" }}
      >
        Popular Skills
      </div>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SKILLS.map((s) => {
          const sel = skills.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: sel ? "rgba(245,166,35,0.10)" : "var(--card-hover)",
                borderColor: sel ? "var(--gold)" : "var(--border)",
                color: sel ? "var(--gold)" : "var(--text-secondary)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepBudget({
  budgetType, setBudgetType, budget, setBudget,
}: {
  budgetType: "fixed" | "hourly"; setBudgetType: (b: "fixed" | "hourly") => void;
  budget: string; setBudget: (b: string) => void;
}) {
  const num = parseFloat(budget) || 0;
  return (
    <>
      <h2 className="font-display text-[22px] font-bold text-foreground">Set your budget</h2>
      <p className="mb-6 mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        You only pay when you approve the work.
      </p>

      <div className="mb-6 flex justify-center gap-3">
        {(["fixed", "hourly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setBudgetType(t)}
            className="h-11 rounded-full border px-6 text-sm font-semibold transition-colors"
            style={{
              background: budgetType === t ? "var(--gold)" : "var(--card-hover)",
              color: budgetType === t ? "var(--background)" : "var(--text-secondary)",
              borderColor: budgetType === t ? "var(--gold)" : "var(--border)",
            }}
          >
            {t === "fixed" ? "Fixed Price" : "Hourly Rate"}
          </button>
        ))}
      </div>

      {budgetType === "fixed" ? (
        <>
          <Label>Estimated Budget (GHS)</Label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg"
              style={{ color: "var(--text-muted)" }}
            >
              GHS
            </span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
              className="h-[72px] w-full rounded-xl border bg-[var(--card-hover)] pl-[72px] pr-4 font-mono text-3xl font-bold text-foreground outline-none focus:border-2 focus:border-[var(--gold)]"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div className="mt-2 font-mono text-sm" style={{ color: "var(--text-muted)" }}>
            ≈ {fmtUSD(ghsToUsd(num))}
          </div>

          <div
            className="mt-4 rounded-xl border p-4"
            style={{
              background: "rgba(245,166,35,0.06)",
              borderColor: "rgba(245,166,35,0.15)",
            }}
          >
            <div className="text-[13px] font-semibold" style={{ color: "var(--gold)" }}>
              💡 Similar projects on DevPay:
            </div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              GHS 1,500 – 4,500 for similar work
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Min Rate (GHS/hr)</Label>
            <input className="h-14 w-full rounded-xl border bg-[var(--card-hover)] px-4 text-foreground" style={{ borderColor: "var(--border)" }} type="number" />
          </div>
          <div>
            <Label>Max Rate (GHS/hr)</Label>
            <input className="h-14 w-full rounded-xl border bg-[var(--card-hover)] px-4 text-foreground" style={{ borderColor: "var(--border)" }} type="number" />
          </div>
        </div>
      )}

      <div
        className="mt-6 rounded-[10px] p-4"
        style={{ background: "var(--card-hover)", borderLeft: "3px solid var(--gold)" }}
      >
        <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Lock className="h-4 w-4" style={{ color: "var(--gold)" }} /> How Your Payment is Protected:
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {["You fund escrow", "DevPay holds it safely", "Developer completes work", "You approve → Dev gets paid"].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                style={{ background: "var(--gold)", color: "var(--background)" }}
              >
                {i + 1}
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[13px]" style={{ color: "var(--success)" }}>
          ✓ Your money is 100% refundable if work is not delivered
        </div>
      </div>
    </>
  );
}

function StepReview({
  category, title, timeline, experience, skills, budget, featured, setFeatured, budgetType,
}: any) {
  return (
    <>
      <h2 className="mb-6 font-display text-[22px] font-bold text-foreground">Review your job post</h2>

      {/* AI Reach */}
      <div
        className="mb-5 rounded-2xl border px-6 py-5 text-center"
        style={{
          background: "rgba(245,166,35,0.08)",
          borderColor: "rgba(245,166,35,0.25)",
        }}
      >
        <div className="text-[13px] font-semibold" style={{ color: "var(--gold)" }}>
          🤖 AI Match Estimate
        </div>
        <div className="my-2 font-display text-5xl font-bold text-foreground">847</div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          matching developers on DevPay Africa
        </div>
        <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          Based on your skill requirements and budget
        </div>
      </div>

      <div className="space-y-0 rounded-xl border p-2" style={{ borderColor: "var(--border)" }}>
        {[
          ["Job Type", category || "Not set"],
          ["Title", title || "Untitled"],
          ["Timeline", timeline || "Not set"],
          ["Experience Level", experience || "Not set"],
          ["Required Skills", skills.join(", ") || "None"],
          ["Budget", budgetType === "fixed" ? `GHS ${budget || 0}` : "Hourly"],
        ].map(([k, v]) => (
          <div
            key={k as string}
            className="flex items-start justify-between px-3 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>{k}</span>
            <span className="max-w-[60%] truncate text-right text-[13px] text-foreground">{v}</span>
          </div>
        ))}
      </div>

      <div
        className="mt-5 flex items-center justify-between rounded-xl border-2 border-dashed p-4"
        style={{ borderColor: "var(--gold)" }}
      >
        <div>
          <div className="text-sm font-semibold text-foreground">⭐ Feature this job for more visibility</div>
          <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Get 8x more developer views · Top of search results
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px]" style={{ color: "var(--gold)" }}>+ GHS 450/week</span>
          <button
            onClick={() => setFeatured(!featured)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: featured ? "var(--gold)" : "var(--border)" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
              style={{ left: featured ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>
      </div>
    </>
  );
}

function SuccessOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-8 text-center">
      <Sparkles className="mb-6 h-20 w-20 animate-float" style={{ color: "var(--gold)" }} />
      <div className="font-display text-4xl font-bold text-foreground">🎉 Your Job is Live!</div>
      <div className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
        847 developers have been notified.
      </div>
      <div className="mt-8 flex gap-3">
        <a
          href="/proposals"
          className="flex h-12 items-center gap-2 rounded-xl px-6 font-display font-semibold gold-gradient shadow-gold"
          style={{ color: "var(--background)" }}
        >
          View Proposals →
        </a>
        <a
          href="/post-job"
          className="flex h-12 items-center rounded-xl border px-6 font-semibold"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          Post Another Job
        </a>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] ${className || ""}`}
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}
