import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { TopBar } from "@/components/hirer-dashboard/TopBar";
import { Send, ArrowLeft, Menu, Paperclip } from "lucide-react";
import { conversations } from "@/lib/hirer-mock-data";
import { toast } from "sonner";
import { initials } from "@/lib/hirer-format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/client/messages")({
  head: () => ({ meta: [{ title: "Messages · DevPay Africa" }] }),
  component: MessagesPage,
});

type Msg = { from: "you" | "dev"; text: string };
const INITIAL: Msg[] = [
  { from: "dev", text: "Hi! Just wanted to confirm the design direction before I push the next milestone." },
  { from: "you", text: "Looks great so far. Please proceed with the analytics dashboard." },
  { from: "dev", text: "Perfect. Just pushed the latest milestone for your review." },
];

function MessagesPage() {
  const [active, setActive] = useState(conversations[0].id);
  const [showThread, setShowThread] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState("");
  const [theyAreTyping, setTheyAreTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const conv = conversations.find((c) => c.id === active)!;

  const pickConversation = (id: string) => {
    setActive(id);
    setShowThread(true);
    setDrawerOpen(false);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, theyAreTyping, active]);

  // Reset thread when switching conversations
  useEffect(() => {
    setMessages(INITIAL);
  }, [active]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "you", text }]);
    setDraft("");
    // Simulate developer typing then replying
    setTheyAreTyping(true);
    window.setTimeout(() => {
      setTheyAreTyping(false);
      setMessages((m) => [...m, { from: "dev", text: "Got it — I'll update the milestone shortly." }]);
    }, 1600);
  };

  // Swipe-to-open conversation list on mobile (swipe right from left edge)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    // Right-swipe from left edge while reading a thread opens the conversation drawer
    if (showThread && touchStartX.current < 40 && dx > 60) setDrawerOpen(true);
    if (!showThread && dx < -60) setShowThread(true);
    touchStartX.current = null;
  };

  const ConversationList = ({ onPick }: { onPick: (id: string) => void }) => (
    <div className="overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className="flex w-full items-start gap-3 p-4 text-left transition-colors"
          style={{
            background: c.id === active ? "rgba(245,166,35,0.06)" : c.unread ? "rgba(245,166,35,0.02)" : "transparent",
            borderBottom: "1px solid var(--border)",
            borderLeft: c.id === active ? "3px solid var(--gold)" : "3px solid transparent",
          }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
            style={{
              borderColor: c.active_contract ? "var(--gold)" : "var(--border)",
              background: "var(--card-hover)",
              color: "var(--gold)",
            }}
          >
            {initials(c.dev)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{c.dev}</span>
              <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>{c.time}</span>
            </div>
            <div className="italic text-[11px] truncate" style={{ color: "var(--gold)" }}>{c.job}</div>
            <div className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: "var(--text-muted)" }}>{c.last}</div>
          </div>
          {c.unread && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: "var(--cyan)" }} />}
        </button>
      ))}
    </div>
  );

  return (
    <>
    <TopBar title="Messages" subtitle="Talk to your developers" />

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          Active:
        </span>
        {conversations.filter(c => c.active_contract).map((c) => (
          <button
            key={c.id}
            className="flex h-7 flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />
            {c.dev} — {c.job}
          </button>
        ))}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="grid h-[calc(100vh-270px)] md:h-[70vh] overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Conversation list — desktop sidebar */}
        <div
          className="hidden md:block overflow-y-auto border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <ConversationList onPick={pickConversation} />
        </div>

        {/* Conversation list — mobile (when no thread open) */}
        {!showThread && (
          <div className="md:hidden overflow-y-auto">
            <ConversationList onPick={pickConversation} />
          </div>
        )}

        {/* Thread pane */}
        <div className={`${showThread ? "flex" : "hidden md:flex"} flex-col min-w-0`}>
          <div className="border-b p-3 sm:p-4 flex items-center gap-2 sm:gap-3" style={{ borderColor: "var(--border)" }}>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border flex-shrink-0"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  aria-label="Open conversations"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
                <SheetHeader className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <SheetTitle>Conversations</SheetTitle>
                  <SheetDescription className="text-xs">Tap a chat to open it. Swipe right from the left edge to reopen this list.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <ConversationList onPick={pickConversation} />
                </div>
                <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full" aria-label="Close conversations drawer">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            <button
              onClick={() => setShowThread(false)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border flex-shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold flex-shrink-0"
              style={{ borderColor: "var(--gold)", background: "var(--card-hover)", color: "var(--gold)" }}
            >
              {initials(conv.dev)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{conv.dev}</div>
              <div className="text-[11px] truncate" style={{ color: "var(--gold)" }}>{conv.job}</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-5 scroll-smooth">
            <div
              className="rounded-xl border p-3 text-[12px] sm:text-[13px]"
              style={{
                background: "rgba(245,166,35,0.06)",
                borderColor: "rgba(245,166,35,0.20)",
                color: "var(--text-secondary)",
              }}
            >
              📄 Contract · Milestone 2 of 4 ·{" "}
              <a className="font-semibold" style={{ color: "var(--gold)" }} href="/client/contracts">
                View Contract →
              </a>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm break-words"
                  style={
                    m.from === "you"
                      ? { background: "linear-gradient(135deg, #F5A623, #E65100)", color: "#fff" }
                      : { background: "var(--card-hover)", color: "var(--foreground)" }
                  }
                >
                  {m.text}
                </div>
              </div>

            ))}
            {theyAreTyping && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm"
                  style={{ background: "var(--card-hover)" }}
                  aria-label={`${conv.dev} is typing`}
                >
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-3 pb-6 sm:p-4" style={{ borderColor: "var(--border)" }}>
            <button
              className="mb-3 flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] sm:text-[12px] font-semibold gold-gradient"
              style={{ color: "var(--background)" }}
            >
              💰 Release Milestone Payment
            </button>
             <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success("Attachment interface: select files to upload")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--card-hover)] text-[color:var(--text-secondary)] border hover:text-white transition-colors"
                style={{ borderColor: "var(--border)" }}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="h-11 flex-1 min-w-0 rounded-xl border bg-[var(--card-hover)] px-4 text-sm text-foreground outline-none focus:border-[var(--gold)]"
                style={{ borderColor: "var(--border)" }}
              />
              <button
                onClick={sendMessage}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl gold-gradient shadow-gold"
                style={{ color: "var(--background)" }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
