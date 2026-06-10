import { proposals, conversations, fmtGHS } from "@/lib/mock-data";

const statusPill: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(245,166,35,0.15)", color: "var(--gold-brand)", label: "Pending" },
  accepted: { bg: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)", label: "Accepted ✓" },
  rejected: { bg: "rgba(255,77,106,0.15)", color: "var(--error)", label: "Rejected" },
  withdrawn: { bg: "rgba(139,163,199,0.15)", color: "#8BA3C7", label: "Withdrawn" },
};

export function BottomRow() {
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-semibold text-white">
            My Proposals <span className="text-[color:var(--text-muted)]">(12)</span>
          </div>
          <button type="button" className="text-[13px] text-[color:var(--cyan-brand)] hover:underline">
            View all →
          </button>
        </div>
        <ul className="mt-4">
          {proposals.map((p) => {
            const s = statusPill[p.status];
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-white">{p.title}</div>
                  <div className="text-[12px] text-[color:var(--text-secondary)]">
                    <span className="font-mono-nums">{fmtGHS(p.bidUsd)}</span> · {p.days} days
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px]"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[16px] font-semibold text-white">Messages</div>
            {unreadCount > 0 && (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[color:var(--cyan-brand)] px-1.5 text-[11px] font-bold text-[color:var(--background)]">
                {unreadCount}
              </span>
            )}
          </div>
          <button type="button" className="text-[13px] text-[color:var(--cyan-brand)] hover:underline">
            View all →
          </button>
        </div>
        <ul className="mt-4">
          {conversations.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-lg"
              style={{
                background: c.unread ? "rgba(0,198,167,0.03)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--surface-hover)] text-[11px] font-bold text-[color:var(--cyan-brand)]"
                style={{
                  boxShadow: c.contractActive ? "0 0 0 2px var(--cyan-brand)" : "none",
                }}
              >
                {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-white">{c.name}</div>
                <div className="truncate text-[12px] text-[color:var(--text-muted)]">{c.lastMessage}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="text-[11px] text-[color:var(--text-muted)]">{c.timeAgo}</div>
                {c.unread && <div className="h-2 w-2 rounded-full bg-[color:var(--cyan-brand)]" />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}