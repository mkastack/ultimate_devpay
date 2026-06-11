import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Send, Paperclip, Circle } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { conversations } from "@/lib/dev-mock-data";

export const Route = createFileRoute("/developer/messages")({
  head: () => ({ meta: [{ title: "Messages — DevPay Africa" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    thread: typeof search.thread === "string" ? search.thread : undefined,
  }),
  component: MessagesPage,
});

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const threadDemo = [
  { who: "them", body: "Hey Kwame — pushed the latest API spec to the repo.", time: "10:02" },
  { who: "me", body: "Got it. Pulling now. I'll wire the auth flow tonight.", time: "10:04" },
  { who: "them", body: "Perfect. Also: can we add MoMo fallback to the checkout?", time: "10:05" },
  { who: "me", body: "Yes — already have Paystack and MTN endpoints stubbed.", time: "10:06" },
  { who: "them", body: "Just pushed the API changes — can you test the auth flow?", time: "12:14" },
];

function MessagesPage() {
  const { thread } = Route.useSearch();
  const [activeId, setActiveId] = useState(thread ?? conversations[0]?.id);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (thread && conversations.some((c) => c.id === thread)) setActiveId(thread);
  }, [thread]);
  const filteredConversations = useMemo(
    () => conversations.filter((c) => `${c.name} ${c.lastMessage}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const active = conversations.find((c) => c.id === activeId) ?? filteredConversations[0] ?? conversations[0];

  return (
    <>
      <DevDashboardHeader title="Messages" subtitle={`${conversations.filter((c) => c.unread).length} unread conversations`} />

      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl md:grid-cols-[300px_1fr]" style={{ background: "var(--surface)", border: "1px solid var(--color-border)", minHeight: 560 }}>
        {/* Conversation list */}
        <aside className="flex flex-col" style={{ borderRight: "1px solid var(--color-border)" }}>
          <div className="p-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                placeholder="Search messages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-[10px] bg-[color:var(--background)] pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
                style={{ border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-[color:var(--surface-hover)]"
                style={{
                  background: c.id === active?.id ? "rgba(0,198,167,0.06)" : "transparent",
                  borderBottom: "1px solid var(--color-border)",
                  borderLeft: c.id === active?.id ? "3px solid var(--cyan-brand)" : "3px solid transparent",
                }}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--surface-hover)] font-display text-[12px] font-bold text-[color:var(--cyan-brand)]">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[13.5px] font-semibold text-white">{c.name}</div>
                    <div className="shrink-0 text-[11px] text-[color:var(--text-muted)]">{c.timeAgo}</div>
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-[color:var(--text-secondary)]">{c.lastMessage}</div>
                </div>
                {c.unread && <Circle className="h-2 w-2 shrink-0 mt-2 fill-[color:var(--cyan-brand)] text-[color:var(--cyan-brand)]" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--surface-hover)] font-display text-[12px] font-bold text-[color:var(--cyan-brand)]">
                {active && initials(active.name)}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white">{active?.name}</div>
                <div className="text-[11.5px] text-[color:var(--cyan-brand)]">● Active contract</div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {threadDemo.map((m, i) => (
              <div key={i} className={`flex ${m.who === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-[13.5px]"
                  style={{
                    background: m.who === "me" ? "var(--cyan-brand)" : "var(--surface-hover)",
                    color: m.who === "me" ? "oklch(0.205 0.043 252)" : "var(--foreground)",
                  }}
                >
                  <div>{m.body}</div>
                  <div className="mt-1 text-[10.5px] opacity-70">{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <button className="grid h-10 w-10 place-items-center rounded-[10px] text-[color:var(--text-muted)] hover:text-white" style={{ border: "1px solid var(--color-border)" }} aria-label="Attach">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              placeholder="Type a message…"
              className="h-10 flex-1 rounded-[10px] bg-[color:var(--background)] px-3 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
              style={{ border: "1px solid var(--color-border)" }}
            />
            <button className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[color:var(--cyan-brand)] px-4 text-[13px] font-semibold text-[color:var(--background)] hover:shadow-cyan active:scale-[0.98]">
              Send <Send className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}