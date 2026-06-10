import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const QUICK_LINKS: { label: string; to: string; hint: string }[] = [
  { label: "Overview", to: "/", hint: "Dashboard home" },
  { label: "Post a Job", to: "/post-job", hint: "Create a new posting" },
  { label: "Browse Developers", to: "/developers", hint: "Find talent" },
  { label: "My Jobs", to: "/jobs", hint: "Manage open posts" },
  { label: "Proposals", to: "/proposals", hint: "Review incoming bids" },
  { label: "Active Contracts", to: "/contracts", hint: "Track milestones" },
  { label: "Payments", to: "/payments", hint: "Escrow & transactions" },
  { label: "Messages", to: "/messages", hint: "Chat with developers" },
  { label: "Settings", to: "/settings", hint: "Account & billing" },
];

export function SearchPopover({ size = 40 }: { size?: number }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return QUICK_LINKS;
    return QUICK_LINKS.filter(
      (l) => l.label.toLowerCase().includes(s) || l.hint.toLowerCase().includes(s),
    );
  }, [q]);

  const go = (to: string) => {
    setOpen(false);
    setQ("");
    navigate({ to });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Search"
          className="flex items-center justify-center rounded-full border bg-card transition-colors hover:border-[var(--gold)]"
          style={{
            width: size,
            height: size,
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,380px)] p-0"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center gap-2 border-b px-3 py-2.5"
          style={{ borderColor: "var(--border)" }}
        >
          <Search className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].to);
            }}
            placeholder="Search pages, jobs, developers…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: "var(--foreground)" }}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-[13px]"
              style={{ color: "var(--text-muted)" }}
            >
              No matches for “{q}”.
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.to}
                onClick={() => go(r.to)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--card-hover)]"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-foreground">{r.label}</div>
                  <div
                    className="truncate text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.hint}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
