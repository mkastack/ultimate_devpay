import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { Lock, Check, X, CheckCircle2, Handshake } from "lucide-react";
import { contracts as mockContracts } from "@/lib/hirer-mock-data";
import { fmtGHS, initials } from "@/lib/hirer-format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContractsSearch = { hire?: string; contract?: string };

export const Route = createFileRoute("/client/contracts")({
  head: () => ({ meta: [{ title: "Contracts · DevPay Africa" }] }),
  validateSearch: (s: Record<string, unknown>): ContractsSearch => ({
    hire: typeof s.hire === "string" ? s.hire : undefined,
    contract: typeof s.contract === "string" ? s.contract : undefined,
  }),
  component: ContractsPage,
});

const ESCROW_STAGES = ["pending", "funded", "locked", "released"] as const;
const STAGE_LABEL: Record<string, string> = {
  pending: "Pending",
  funded: "Funded",
  locked: "In Progress",
  released: "Released",
  refunded: "Refunded",
};

function ContractsPage() {
  const { hire, contract } = Route.useSearch();
  const [confirm, setConfirm] = useState(false);

  const isLiveContract = !!contract && !contract.startsWith("c");

  const liveQ = useQuery({
    queryKey: ["contract", hire, contract],
    enabled: !!hire || isLiveContract,
    queryFn: async () => {
      let c = null;
      if (hire) {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("hire_request_id", hire)
          .maybeSingle();
        if (error) throw error;
        c = data;
      } else if (contract) {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contract)
          .maybeSingle();
        if (error) throw error;
        c = data;
      }

      if (!c) return null;
      const { data: e } = await supabase
        .from("escrow_accounts")
        .select("*")
        .eq("contract_id", c.id)
        .maybeSingle();
      return { contract: c, escrow: e };
    },
  });

  useEffect(() => {
    if (liveQ.data?.contract) {
      toast.success("Contract created", { description: `Escrow status: ${STAGE_LABEL[liveQ.data.escrow?.status ?? "pending"]}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveQ.data?.contract?.id]);

  const live = liveQ.data;

  const mock = useMemo(() => {
    if (contract) {
      return mockContracts.find((c) => c.id === contract) ?? mockContracts[0];
    }
    return mockContracts[0];
  }, [contract]);

  const display = useMemo(() => {
    if (live?.contract) {
      return {
        job_title: live.contract.job_title,
        developer_name: live.contract.developer_name,
        amount: Number(live.contract.amount),
        platform_fee: Number(live.contract.platform_fee),
        deadline: live.contract.deadline ?? "",
        milestones: ((live.contract.milestones as any) ?? []).map((m: any, idx: number) => ({
          name: m.name,
          amount: Number(m.amount),
          status: m.status ?? (idx === 0 ? "active" : "pending") as "done" | "active" | "pending",
        })),
        escrow_status: (live.escrow?.status ?? "pending") as string,
        escrow_amount: Number(live.escrow?.amount ?? live.contract.amount),
        created_at: live.escrow?.created_at ?? live.contract.created_at,
        funded_at: live.escrow?.funded_at ?? null,
        locked_at: live.escrow?.locked_at ?? null,
        released_at: live.escrow?.released_at ?? null,
        refunded_at: live.escrow?.refunded_at ?? null,
      };
    }

    // Build mock milestones dynamically based on selected mock contract
    const mCount = mock.milestone_total ?? 4;
    const mCurrent = mock.milestone_current ?? 2;
    const mAmount = mock.contract_amount / mCount;
    const mockMilestones = Array.from({ length: mCount }).map((_, idx) => {
      const num = idx + 1;
      let mStatus: "done" | "active" | "pending" = "pending";
      if (num < mCurrent) mStatus = "done";
      else if (num === mCurrent) mStatus = "active";
      return {
        name: num === mCurrent ? mock.milestone_label : `Milestone ${num}`,
        amount: mAmount,
        status: mStatus,
      };
    });

    return {
      job_title: mock.job_title,
      developer_name: mock.developer.name,
      amount: mock.contract_amount,
      platform_fee: mock.contract_amount * 0.04,
      deadline: "May 29, 2026",
      milestones: mockMilestones,
      escrow_status: mock.escrow_status === "holding" ? "locked" : mock.escrow_status === "released" ? "released" : "locked",
      escrow_amount: mock.escrow_amount,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      funded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      locked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      released_at: null,
      refunded_at: null,
    };
  }, [live, mock]);

  const stageIdx = Math.max(0, ESCROW_STAGES.indexOf(display.escrow_status as any));

  const activeMilestone = useMemo(() => {
    return display.milestones.find((m: any) => m.status === "active");
  }, [display.milestones]);

  return (
    <>
    <TopBar title="Contract Detail" subtitle={`Contracts → ${display.job_title}`} />

      {hire && liveQ.isLoading && (
        <div className="mb-4 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          Loading your new contract…
        </div>
      )}

      <div className="rounded-[20px] border bg-card p-7" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <Party label="You" name="Sandalwood Ventures" />
          <div className="flex flex-1 items-center px-6">
            <div className="h-px flex-1" style={{ background: "var(--gold)" }} />
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(245,166,35,0.15)" }}>
              <Handshake className="h-5 w-5" style={{ color: "var(--gold)" }} />
            </div>
            <div className="h-px flex-1" style={{ background: "var(--gold)" }} />
          </div>
          <Party label="Developer" name={display.developer_name} cyan />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["Agreed Amount", fmtGHS(display.amount)],
            ["Platform Fee (4%)", fmtGHS(display.platform_fee)],
            ["Your Total", fmtGHS(display.amount + display.platform_fee)],
            ["Deadline", display.deadline || "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>{k}</span>
              <span className="font-mono text-sm text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow */}
      <div className="mt-5 rounded-2xl border p-6 text-center" style={{ background: "rgba(245,166,35,0.06)", borderColor: "rgba(245,166,35,0.20)" }}>
        <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--gold)" }}>
          Escrow Status · {STAGE_LABEL[display.escrow_status] ?? display.escrow_status}
        </div>
        <div className="mt-4 flex justify-center">
          <Lock className="h-12 w-12 animate-float" style={{ color: "var(--gold)" }} />
        </div>
        <div className="mt-4 font-display text-3xl font-bold text-foreground">
          {fmtGHS(display.escrow_amount)} {display.escrow_status === "pending" ? "Awaiting Funding" : display.escrow_status === "released" ? "Released" : "Held Safely 🔒"}
        </div>
        <div className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {display.escrow_status === "pending"
            ? "Fund the escrow to activate the contract."
            : "Funds are secure. Released only on your approval."}
        </div>

        <div className="mx-auto mt-6 flex max-w-[480px] items-center justify-between">
          {ESCROW_STAGES.map((s, i) => {
            const done = i < stageIdx;
            const current = i === stageIdx;
            return (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${current ? "animate-pulse-gold" : ""}`}
                    style={{
                      background: done || current ? "var(--gold)" : "transparent",
                      border: current ? "2px solid var(--gold)" : done ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {done && <Check className="h-3.5 w-3.5" style={{ color: "var(--background)" }} strokeWidth={3} />}
                  </div>
                  <div className="mt-1.5 text-[10px]" style={{ color: done || current ? "var(--gold)" : "var(--text-muted)" }}>
                    {STAGE_LABEL[s]}
                  </div>
                </div>
                {i < ESCROW_STAGES.length - 1 && (
                  <div className="mx-1 mb-4 h-px flex-1" style={{ background: i < stageIdx ? "var(--gold)" : "var(--border)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow audit timeline */}
      <EscrowTimeline
        createdAt={display.created_at}
        fundedAt={display.funded_at}
        lockedAt={display.locked_at}
        releasedAt={display.released_at}
        refundedAt={display.refunded_at}
        status={display.escrow_status}
      />

      {/* Milestones */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Milestones
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {display.milestones.map((m: any, i: number) => (
          <Milestone
            key={i}
            num={i + 1}
            title={m.name}
            amount={Number(m.amount)}
            status={m.status}
            onApprove={m.status === "active" ? () => setConfirm(true) : undefined}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="text-[13px] font-medium" style={{ color: "var(--destructive)" }}>
          Having issues? Raise a Dispute
        </button>
      </div>

      {confirm && activeMilestone && (
        <ApproveModal
          onCancel={() => setConfirm(false)}
          amount={activeMilestone.amount}
          developer={display.developer_name}
        />
      )}
    </>
  );
}

function Party({ label, name, cyan }: { label: string; name: string; cyan?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold"
        style={{
          borderColor: cyan ? "var(--cyan)" : "var(--gold)",
          background: cyan ? "rgba(0,198,167,0.10)" : "rgba(245,166,35,0.10)",
          color: cyan ? "var(--cyan)" : "var(--gold)",
        }}
      >
        {initials(name)}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</div>
      </div>
    </div>
  );
}

function Milestone({
  num, title, amount, status, onApprove,
}: {
  num: number; title: string; amount: number;
  status: "done" | "active" | "pending"; onApprove?: () => void;
}) {
  const color =
    status === "done" ? "var(--success)"
    : status === "active" ? "var(--gold)" : "var(--border)";

  return (
    <div
      className={`rounded-xl border-l-[3px] bg-card p-4 ${status === "active" ? "animate-pulse-gold" : ""}`}
      style={{
        borderLeftColor: color,
        borderTop: "1px solid var(--border)",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        opacity: status === "pending" ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">Milestone {num}: {title}</div>
          <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {status === "done" ? "✅ Complete" : status === "active" ? "In progress · Awaiting your approval" : "Scheduled"}
          </div>
        </div>
        <div className="font-mono text-sm font-semibold" style={{ color: "var(--gold)" }}>
          {fmtGHS(amount)}
        </div>
      </div>
      {status === "active" && (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--card-hover)" }}>
            <div className="h-full" style={{ width: "60%", background: "var(--cyan)" }} />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="h-9 flex-1 rounded-lg border text-[12px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Request Revision
            </button>
            <button
              onClick={onApprove}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold"
              style={{ color: "var(--background)" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Release →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ApproveModal({ onCancel, amount, developer }: { onCancel: () => void; amount: number; developer: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-[480px] rounded-[20px] border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex justify-end">
          <button onClick={onCancel} aria-label="Close">
            <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12" style={{ color: "var(--gold)" }} />
        </div>
        <div className="mt-4 text-center font-display text-2xl font-bold text-foreground">
          Release {fmtGHS(amount)} to {developer}?
        </div>
        <div className="mt-1 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
          This payment cannot be reversed.
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="h-11 flex-1 rounded-xl border text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button onClick={onCancel} className="h-11 flex-1 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] gold-gradient shadow-gold" style={{ color: "var(--background)" }}>
            Yes, Release ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function EscrowTimeline({
  createdAt, fundedAt, lockedAt, releasedAt, refundedAt, status,
}: {
  createdAt?: string | null;
  fundedAt?: string | null;
  lockedAt?: string | null;
  releasedAt?: string | null;
  refundedAt?: string | null;
  status: string;
}) {
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null;

  const events: Array<{ key: string; label: string; desc: string; at: string | null; tone: "gold" | "cyan" | "success" | "destructive" }> = [
    { key: "created", label: "Escrow Created", desc: "Account opened, awaiting funding.", at: fmt(createdAt), tone: "gold" },
    { key: "funded", label: "Funds Received", desc: "Client deposited the contract amount.", at: fmt(fundedAt), tone: "cyan" },
    { key: "locked", label: "Escrow Locked", desc: "Work in progress — funds secured.", at: fmt(lockedAt), tone: "gold" },
  ];
  if (refundedAt) {
    events.push({ key: "refunded", label: "Refunded to Client", desc: "Contract cancelled, escrow returned.", at: fmt(refundedAt), tone: "destructive" });
  } else {
    events.push({ key: "released", label: "Released to Developer", desc: "Final approval — payout completed.", at: fmt(releasedAt), tone: "success" });
  }

  const toneColor = (t: string) =>
    t === "success" ? "var(--success)"
    : t === "destructive" ? "var(--destructive)"
    : t === "cyan" ? "var(--cyan)" : "var(--gold)";

  return (
    <div className="mt-6 rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)" }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Escrow Audit Timeline
          </div>
          <div className="mt-1 font-display text-lg font-semibold text-foreground">
            Full payment trail
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: "rgba(245,166,35,0.12)", color: "var(--gold)" }}
        >
          {status}
        </span>
      </div>

      <ol className="relative space-y-5 pl-6">
        <span className="absolute left-[10px] top-1.5 bottom-1.5 w-px" style={{ background: "var(--border)" }} />
        {events.map((e) => {
          const done = !!e.at;
          const color = toneColor(e.tone);
          return (
            <li key={e.key} className="relative">
              <span
                className="absolute -left-[22px] top-1 flex h-4 w-4 items-center justify-center rounded-full"
                style={{
                  background: done ? color : "var(--card)",
                  border: `2px solid ${done ? color : "var(--border)"}`,
                  boxShadow: done ? `0 0 0 3px color-mix(in oklab, ${color} 18%, transparent)` : undefined,
                }}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold" style={{ color: done ? "var(--foreground)" : "var(--text-muted)" }}>
                  {e.label}
                </div>
                <div className="font-mono text-[12px]" style={{ color: done ? "var(--text-secondary)" : "var(--text-muted)" }}>
                  {e.at ?? "—"}
                </div>
              </div>
              <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                {e.desc}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
