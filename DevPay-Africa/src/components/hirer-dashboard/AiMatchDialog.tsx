import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Sparkles } from "lucide-react";
import { rankDevelopersByQuery } from "@/lib/hirer-developer-catalog";
import { initials } from "@/lib/hirer-format";

export function AiMatchDialog({
  open,
  onOpenChange,
  onSelectDeveloper,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectDeveloper: (devId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const matches = useMemo(
    () => (submitted ? rankDevelopersByQuery(submitted).slice(0, 5) : []),
    [submitted],
  );

  const runMatch = () => {
    if (!query.trim()) return;
    setSubmitted(query.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" style={{ color: "var(--gold)" }} />
            AI Developer Matching
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Describe the project, skills, or timeline you need. We&apos;ll rank verified developers on DevPay Africa.
        </p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. React dashboard with escrow, 3-week timeline, fintech experience..."
          className="min-h-[100px] w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--gold)]"
          style={{ borderColor: "var(--border)" }}
        />

        <button
          type="button"
          onClick={runMatch}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold gold-gradient shadow-gold"
          style={{ color: "var(--background)" }}
        >
          <Sparkles className="h-4 w-4" /> Match Me
        </button>

        {submitted && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Top matches for &ldquo;{submitted}&rdquo;
            </div>
            {matches.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No strong matches yet. Try broader keywords like React, mobile, or fintech.
              </p>
            ) : (
              matches.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onSelectDeveloper(d.id);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-[var(--gold)]"
                  style={{ borderColor: "var(--border)", background: "var(--card-hover)" }}
                >
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(0,198,167,0.1)", color: "var(--cyan)" }}
                  >
                    {initials(d.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{d.name}</div>
                    <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{d.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold" style={{ color: "var(--cyan)" }}>{d.score}%</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>match</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
