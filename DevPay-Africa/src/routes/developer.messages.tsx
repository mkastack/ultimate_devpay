import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Send, Paperclip, ChevronLeft, Smile, MoreVertical, CheckCheck, Check } from "lucide-react";
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
  { who: "them", body: "Hey Kwame — pushed the latest API spec to the repo.", time: "10:02", read: true },
  { who: "me", body: "Got it. Pulling now. I'll wire the auth flow tonight.", time: "10:04", read: true },
  { who: "them", body: "Perfect. Also: can we add MoMo fallback to the checkout?", time: "10:05", read: true },
  { who: "me", body: "Yes — already have Paystack and MTN endpoints stubbed.", time: "10:06", read: true },
  { who: "them", body: "Just pushed the API changes — can you test the auth flow?", time: "12:14", read: false },
];

function MessagesPage() {
  const { thread } = Route.useSearch();
  const [activeId, setActiveId] = useState(thread ?? conversations[0]?.id);
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  useEffect(() => {
    if (thread && conversations.some((c) => c.id === thread)) {
      setActiveId(thread);
      setMobileView("thread");
    }
  }, [thread]);

  const filteredConversations = useMemo(
    () => conversations.filter((c) => `${c.name} ${c.lastMessage}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const active = conversations.find((c) => c.id === activeId) ?? filteredConversations[0] ?? conversations[0];

  return (
    <>
      <div className="hidden md:block">
        <DevDashboardHeader title="Messages" subtitle={`${conversations.filter((c) => c.unread).length} unread conversations`} />
      </div>

      <div
        className="grid grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-[340px_1fr]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--color-border)",
          height: "calc(100vh - 180px)",
          minHeight: 520,
        }}
      >
        {/* Chat List Pane */}
        <aside
          className={`${mobileView === "list" ? "flex" : "hidden"} flex-col md:flex`}
          style={{
            borderRight: "1px solid var(--color-border)",
            background: "color-mix(in oklab, var(--surface) 98%, transparent)",
          }}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-4" style={{ borderBottom: "1px solid var(--color-border)", background: "color-mix(in oklab, var(--surface) 94%, transparent)" }}>
            <h2 className="text-base font-bold text-white">Chats</h2>
            <button type="button" className="text-[color:var(--text-muted)] hover:text-white" aria-label="Menu">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                placeholder="Search or start a new chat"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-full bg-[color:var(--background)] pl-10 pr-4 text-[13px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
                style={{ border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>

          {/* Chat Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((c) => {
              const isActiveChat = c.id === active?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveId(c.id);
                    setMobileView("thread");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isActiveChat ? "rgba(0, 198, 167, 0.08)" : "transparent",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[12px] font-bold"
                    style={{
                      background: "rgba(0,198,167,0.12)",
                      color: "var(--cyan-brand)",
                      border: "1.5px solid rgba(0,198,167,0.2)",
                    }}
                  >
                    {initials(c.name)}
                  </div>
                  {/* Message Detail preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13.5px] font-semibold text-white">{c.name}</span>
                      <span className="shrink-0 text-[11px] text-[color:var(--text-muted)]">{c.timeAgo}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <p className="truncate text-[12.5px] text-[color:var(--text-secondary)]">{c.lastMessage}</p>
                      {c.unread && (
                        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[color:var(--cyan-brand)] px-1 text-[10px] font-bold text-[color:var(--background)]">
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Message Thread Window */}
        <section
          className={`${mobileView === "thread" ? "flex" : "hidden"} flex-col md:flex`}
          style={{
            background: "var(--background)",
          }}
        >
          {/* Header */}
          <div
            className="flex h-14 items-center justify-between gap-3 px-4 py-3"
            style={{
              borderBottom: "1px solid var(--color-border)",
              background: "color-mix(in oklab, var(--surface) 95%, transparent)",
            }}
          >
            <div className="flex items-center gap-2">
              {/* Back Button for Mobile */}
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-white md:hidden"
                aria-label="Back to chats"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Avatar */}
              <div
                className="grid h-10 w-10 place-items-center rounded-full font-display text-[12px] font-bold"
                style={{
                  background: "rgba(0,198,167,0.12)",
                  color: "var(--cyan-brand)",
                }}
              >
                {active && initials(active.name)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[14.5px] font-bold text-white">{active?.name}</h3>
                <span className="block text-[11px] text-[color:var(--cyan-brand)]">
                  {active?.contractActive ? "● active contract" : "online"}
                </span>
              </div>
            </div>
            <button type="button" className="text-[color:var(--text-muted)] hover:text-white" aria-label="Thread menu">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area - WhatsApp Wallpaper Pattern Style */}
          <div
            className="flex-1 space-y-3.5 overflow-y-auto px-4 py-5 md:px-6"
            style={{
              backgroundImage: "radial-gradient(var(--color-border) 0.5px, transparent 0.5px), radial-gradient(var(--color-border) 0.5px, var(--background) 0.5px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {threadDemo.map((m, i) => {
              const isMe = m.who === "me";
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative max-w-[82%] md:max-w-[70%] px-3 py-2 rounded-xl text-[13.5px] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]`}
                    style={{
                      background: isMe ? "var(--cyan-brand)" : "var(--surface)",
                      color: isMe ? "var(--background)" : "var(--foreground)",
                      borderRadius: isMe ? "12px 0px 12px 12px" : "0px 12px 12px 12px",
                    }}
                  >
                    <div className="leading-relaxed whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                      <span>{m.time}</span>
                      {isMe && (
                        m.read ? (
                          <CheckCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Input Bar */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5"
            style={{
              borderTop: "1px solid var(--color-border)",
              background: "color-mix(in oklab, var(--surface) 95%, transparent)",
            }}
          >
            {/* Attachment Icons */}
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--text-muted)] hover:bg-[color:var(--surface-hover)] hover:text-white"
                aria-label="Add Emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--text-muted)] hover:bg-[color:var(--surface-hover)] hover:text-white"
                aria-label="Attach File"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            {/* Pill Search Input */}
            <input
              placeholder="Type a message"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="h-10 flex-1 rounded-full bg-[color:var(--background)] px-4 text-[13.5px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
              style={{ border: "1px solid var(--color-border)" }}
            />

            {/* Circular Send Button */}
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform active:scale-[0.93] shadow-md"
              style={{
                background: "var(--cyan-brand)",
                color: "var(--background)",
              }}
              aria-label="Send"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}