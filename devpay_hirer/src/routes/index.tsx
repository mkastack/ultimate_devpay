import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/client/DashboardLayout";
import { TopBar } from "@/components/client/TopBar";
import {
  CreditCard, Layers, Users as UsersIcon, Briefcase, ArrowRight,
  Lock, Sparkles, Star, MessageCircle, CheckCircle2,
} from "lucide-react";
import {
  client, contracts, proposalsByJob, recommendedDevelopers, openJobs, conversations,
} from "@/lib/mock-data";
import { fmtGHS, fmtUSD, ghsToUsd, initials } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Overview · DevPay Africa" }],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <DashboardLayout>
      <TopBar title="Overview" subtitle={today} />

      <WelcomeBanner />
      <MetricCards />
      <PostJobBanner small={client.jobs_posted > 0} />
      <ActiveContractsSection />
      <ProposalsSection />
      <RecommendedDevelopersSection />
      <BottomRow />
    </DashboardLayout>
  );
}

/* ---------- Welcome ---------- */

function WelcomeBanner() {
  const msg =
    client.active_contracts_count > 0
      ? `You have ${client.active_contracts_count} active projects in progress.`
      : client.new_proposals_count > 0
        ? `${client.new_proposals_count} new developer proposals waiting for your review.`
        : "Ready to hire? Post a job and find your ideal developer today.";

  return (
    <div
      className="relative mb-7 overflow-hidden rounded-[20px] border px-8 py-7"
      style={{
        background: "linear-gradient(135deg, #2A1F05 0%, #1A1405 50%, #0F0D03 100%)",
        borderColor: "rgba(245,166,35,0.20)",
      }}
    >
      <div className="max-w-[65%]">
        <h2 className="font-display text-[26px] font-bold leading-tight" style={{ color: "#FFFFFF" }}>
          Welcome back, {client.company_name} 👋
        </h2>
        <p className="mt-2 text-[15px]" style={{ color: "rgba(255,255,255,0.70)" }}>
          {msg}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/post-job"
            className="flex h-10 items-center gap-2 rounded-full px-5 font-semibold transition-transform duration-200 hover:scale-[1.02] gold-gradient shadow-gold"
            style={{ color: "#0A1628", fontSize: 14 }}
          >
            Post a Job <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/developers"
            className="flex h-10 items-center gap-2 rounded-full border bg-white/5 px-5 text-[14px] font-semibold transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
          >
            Browse Developers
          </Link>
        </div>
      </div>


      {client.plan === "pro" && (
        <div
          className="absolute right-6 top-6 rounded-full px-3 py-1 font-mono text-[11px] font-bold"
          style={{ background: "var(--gold)", color: "var(--background)" }}
        >
          Pro Client ⭐
        </div>
      )}

      <div
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.08]"
        aria-hidden
      >
        <Briefcase className="h-[180px] w-[180px]" style={{ color: "var(--gold)" }} strokeWidth={1} />
      </div>
    </div>
  );
}

/* ---------- Metric Cards ---------- */

function MetricCards() {
  return (
    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric
        label="Total Spent"
        icon={<CreditCard className="h-4 w-4" style={{ color: "var(--gold)" }} />}
        iconBg="rgba(245,166,35,0.15)"
        value={fmtGHS(client.total_spent_ghs)}
        sub={`≈ ${fmtUSD(ghsToUsd(client.total_spent_ghs))}`}
        trend="↑ +34% vs last quarter"
        trendColor="var(--success)"
      />
      <Metric
        label="Active Projects"
        icon={<Layers className="h-4 w-4" style={{ color: "var(--cyan)" }} />}
        iconBg="rgba(0,198,167,0.15)"
        value={String(client.active_contracts_count)}
        trend="2 due this week"
        trendColor="var(--gold)"
      />
      <Metric
        label="Developers Hired"
        icon={<UsersIcon className="h-4 w-4" style={{ color: "#818CF8" }} />}
        iconBg="rgba(99,102,241,0.15)"
        value={String(client.hires_made)}
        trend="4 from Ghana, 3 from Nigeria"
        trendColor="var(--text-secondary)"
      />
      <Metric
        label="Open Jobs"
        icon={<Briefcase className="h-4 w-4" style={{ color: "var(--gold)" }} />}
        iconBg="rgba(245,166,35,0.15)"
        value={String(client.open_jobs_count)}
        trend="23 total proposals received"
        trendColor="var(--text-secondary)"
      />
    </div>
  );
}

function Metric({
  label, icon, iconBg, value, sub, trend, trendColor,
}: {
  label: string; icon: React.ReactNode; iconBg: string;
  value: string; sub?: string; trend: string; trendColor: string;
}) {
  return (
    <div
      className="group cursor-pointer rounded-2xl border bg-card px-6 py-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(245,166,35,0.30)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,166,35,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 font-mono text-[34px] font-bold leading-none text-foreground">
        {value}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
          {sub}
        </div>
      )}
      <div className="mt-3 border-t pt-3 text-[12px]" style={{ borderColor: "var(--border)", color: trendColor }}>
        {trend}
      </div>
    </div>
  );
}

/* ---------- Post Job Banner ---------- */

function PostJobBanner({ small }: { small: boolean }) {
  return (
    <div
      className={`mb-7 flex flex-col items-start justify-between gap-4 rounded-2xl border ${small ? "px-6 py-5" : "px-7 py-6"} md:flex-row md:items-center`}
      style={{
        background: "linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.06))",
        borderColor: "rgba(245,166,35,0.25)",
      }}
    >
      <div>
        <div className="font-display text-[20px] font-bold text-foreground">
          Ready to hire your next developer?
        </div>
        <div className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Post a job in 2 minutes and receive proposals from verified African developers within hours.
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          to="/post-job"
          className="flex h-12 items-center gap-2 rounded-xl px-6 font-display text-[15px] font-semibold transition-transform duration-200 hover:scale-[1.02] gold-gradient shadow-gold"
          style={{ color: "var(--background)" }}
        >
          Post a Job Now <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/developers"
          className="flex h-12 items-center rounded-xl border bg-[var(--card-hover)] px-6 text-[15px] font-semibold transition-colors"
          style={{ color: "var(--gold)", borderColor: "rgba(245,166,35,0.30)" }}
        >
          Browse Developers
        </Link>
      </div>
    </div>
  );
}

/* ---------- Active contracts ---------- */

function ActiveContractsSection() {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[18px] font-semibold text-foreground">Active Contracts</h2>
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold"
            style={{ background: "var(--gold)", color: "var(--background)" }}
          >
            {contracts.length}
          </span>
        </div>
        <Link to="/contracts" className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
          View all →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
        {contracts.map((c) => (
          <ContractCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

function ContractCard({ c }: { c: typeof contracts[number] }) {
  const stripColor =
    c.status === "active" ? "var(--cyan)"
    : c.status === "review" ? "#818CF8"
    : c.status === "disputed" ? "var(--destructive)"
    : "var(--gold)";

  return (
    <div
      className="relative w-[360px] flex-shrink-0 overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 [scroll-snap-align:start]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: stripColor }} />

      <div className="mb-3.5 flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold"
          style={{ borderColor: "var(--cyan)", background: "rgba(0,198,167,0.10)", color: "var(--cyan)" }}
        >
          {initials(c.developer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{c.developer.name}</div>
          <div className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
            {c.developer.title}
          </div>
          <div className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
            ⭐ {c.developer.rating}
          </div>
        </div>
        <StatusPill status={c.status} />
      </div>

      <div className="mb-3.5 line-clamp-1 text-[16px] font-semibold text-foreground">{c.job_title}</div>

      <div className="mb-3.5">
        <div
          className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          Milestone {c.milestone_current} of {c.milestone_total}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: c.milestone_total }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i < c.milestone_current ? "var(--gold)" : "var(--border)" }}
            />
          ))}
        </div>
        <div className="mt-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {c.milestone_label}
        </div>
      </div>

      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lock className="h-4 w-4" style={{ color: "var(--gold)" }} />
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--gold)" }}>
            {fmtGHS(c.escrow_amount)} in escrow
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: c.escrow_status === "holding" ? "rgba(16,185,129,0.15)" : "rgba(74,96,128,0.20)",
            color: c.escrow_status === "holding" ? "var(--success)" : "var(--text-secondary)",
          }}
        >
          {c.escrow_status === "holding" ? "Funded ✓" : "Released"}
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[15px] font-semibold text-foreground">
          Contract: {fmtGHS(c.contract_amount)}
        </span>
        <span className="font-mono text-[13px]" style={{ color: "var(--success)" }}>
          Paid: {fmtGHS(c.paid_amount)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border bg-[var(--card-hover)] text-[13px] font-semibold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <MessageCircle className="h-3.5 w-3.5" /> Message
        </button>
        <Link
          to="/contracts"
          className="flex h-9 flex-1 items-center justify-center rounded-lg text-[13px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
          style={{ color: "var(--background)" }}
        >
          View Contract
        </Link>
      </div>

      {c.awaiting_approval && (
        <button
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-[13px] font-semibold animate-pulse-border"
          style={{
            background: "rgba(16,185,129,0.15)",
            borderColor: "rgba(16,185,129,0.40)",
            color: "var(--success)",
          }}
        >
          <CheckCircle2 className="h-4 w-4" /> Approve Milestone & Release Payment
        </button>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: "active" | "review" | "disputed" | "completed" }) {
  const conf = {
    active: { bg: "rgba(0,198,167,0.15)", color: "var(--cyan)", label: "● Active" },
    review: { bg: "rgba(99,102,241,0.15)", color: "#818CF8", label: "In Review" },
    disputed: { bg: "rgba(255,77,106,0.15)", color: "var(--destructive)", label: "Disputed" },
    completed: { bg: "rgba(245,166,35,0.15)", color: "var(--gold)", label: "Completed" },
  }[status];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: conf.bg, color: conf.color }}
    >
      {conf.label}
    </span>
  );
}

/* ---------- Proposals ---------- */

function ProposalsSection() {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[18px] font-semibold text-foreground">New Proposals</h2>
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold"
            style={{ background: "var(--gold)", color: "var(--background)" }}
          >
            {client.new_proposals_count}
          </span>
        </div>
        <Link to="/proposals" className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
          View all →
        </Link>
      </div>

      <div className="space-y-5">
        {proposalsByJob.map((g) => (
          <div key={g.job_id}>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                {g.job_title}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: "var(--card-hover)", color: "var(--text-muted)" }}
              >
                {g.proposals.length} proposals
              </span>
            </div>
            <div className="space-y-2">
              {g.proposals.map((p) => (
                <ProposalCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProposalCard({ p }: { p: typeof proposalsByJob[number]["proposals"][number] }) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors duration-200"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(245,166,35,0.30)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
        style={{ borderColor: "var(--cyan)", background: "rgba(0,198,167,0.10)", color: "var(--cyan)" }}
      >
        {initials(p.dev.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{p.dev.name}</span>
          <span className="font-mono text-[12px]" style={{ color: "var(--gold)" }}>
            ⭐ {p.dev.rating} · {p.dev.jobs} jobs
          </span>
          {p.ai_generated && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
            >
              ✨ AI Assisted
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            🤖 AI Match:
          </span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--card-hover)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${p.ai_match}%`,
                background: "linear-gradient(90deg, #00C6A7, #0087FF)",
              }}
            />
          </div>
          <span className="font-mono text-[12px] font-bold" style={{ color: "var(--cyan)" }}>
            {p.ai_match}%
          </span>
        </div>

        <p
          className="mt-1.5 line-clamp-2 text-[13px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {p.preview}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <div className="font-mono text-base font-bold text-foreground">{fmtGHS(p.bid)}</div>
        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{p.days} days</div>
        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.hours_ago} hrs ago</div>
        <div className="flex gap-1.5">
          <button
            className="h-8 rounded-md border px-2.5 text-[11px] font-semibold transition-colors"
            style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
          >
            ★ Shortlist
          </button>
          <button
            className="h-8 rounded-md px-3 text-[11px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
            style={{ color: "var(--background)" }}
          >
            Hire Now →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Recommended Devs ---------- */

function RecommendedDevelopersSection() {
  return (
    <section className="mb-7">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-[18px] font-semibold text-foreground">
            AI Recommended For You 🤖
          </h2>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Based on your project history and skills
          </div>
        </div>
        <Link to="/developers" className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
          Browse all →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {recommendedDevelopers.map((d) => (
          <DevMiniCard key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}

function DevMiniCard({ d }: { d: typeof recommendedDevelopers[number] }) {
  return (
    <div
      className="relative w-[220px] flex-shrink-0 rounded-[14px] border bg-card p-4 transition-all duration-200 hover:-translate-y-1"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(245,166,35,0.30)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {d.recently_active && (
        <span
          className="absolute right-3 top-3 h-2 w-2 rounded-full"
          style={{ background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }}
        />
      )}
      <div
        className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-bold"
        style={{
          borderColor: d.top ? "var(--gold)" : d.available ? "var(--cyan)" : "var(--border)",
          background: "var(--card-hover)",
          color: d.top ? "var(--gold)" : "var(--cyan)",
        }}
      >
        {initials(d.name)}
      </div>
      <div className="text-center text-sm font-semibold text-foreground">{d.name}</div>
      <div className="line-clamp-1 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
        {d.title}
      </div>
      <div className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
        📍 {d.location}
      </div>
      <div className="mt-1.5 text-center font-mono text-[13px]" style={{ color: "var(--gold)" }}>
        ⭐ {d.rating} <span style={{ color: "var(--text-secondary)" }}>· GHS {d.rate}/hr</span>
      </div>
      <div className="mt-1.5 flex justify-center">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: d.available ? "rgba(0,198,167,0.15)" : "rgba(245,166,35,0.15)",
            color: d.available ? "var(--cyan)" : "var(--gold)",
          }}
        >
          ● {d.available ? "Available Now" : "Busy"}
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap justify-center gap-1">
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
      <button
        className="mt-3 h-9 w-full rounded-lg border text-[13px] font-semibold transition-colors"
        style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
      >
        View Profile
      </button>
    </div>
  );
}

/* ---------- Bottom Row ---------- */

function BottomRow() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">My Open Jobs</h3>
          <Link to="/post-job" className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
            + Post New
          </Link>
        </div>
        <div className="space-y-0">
          {openJobs.map((j) => (
            <div
              key={j.id}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">{j.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{ background: "var(--card-hover)", color: "var(--text-secondary)" }}
                  >
                    {j.category}
                  </span>
                  <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{j.budget}</span>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                    style={{ background: "rgba(245,166,35,0.15)", color: "var(--gold)" }}
                  >
                    {j.proposals} proposals
                  </span>
                </div>
              </div>
              <div className="ml-3 text-right">
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Posted {j.posted_days}d ago
                </div>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                >
                  {j.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)" }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Messages</h3>
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold"
              style={{ background: "var(--gold)", color: "var(--background)" }}
            >
              {client.unread_messages}
            </span>
          </div>
          <Link to="/messages" className="text-[13px] font-medium" style={{ color: "var(--gold)" }}>
            View all →
          </Link>
        </div>
        <div className="space-y-0">
          {conversations.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-lg px-2 py-3"
              style={{
                background: m.unread ? "rgba(245,166,35,0.03)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                style={{
                  borderColor: m.active_contract ? "var(--gold)" : "var(--border)",
                  background: "var(--card-hover)",
                  color: "var(--gold)",
                }}
              >
                {initials(m.dev)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">{m.dev}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{m.time}</span>
                </div>
                <div className="italic text-[11px]" style={{ color: "var(--gold)" }}>{m.job}</div>
                <div className="line-clamp-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {m.last}
                </div>
              </div>
              {m.unread && (
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: "var(--cyan)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// silence unused
void Star; void Sparkles;
