import { useMemo, useState } from "react";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const all = [
  { group: "Pages", to: "/dashboard", label: "Overview" },
  { group: "Pages", to: "/dashboard/jobs", label: "Browse Jobs" },
  { group: "Pages", to: "/dashboard/proposals", label: "My Proposals" },
  { group: "Pages", to: "/dashboard/contracts", label: "Active Contracts" },
  { group: "Pages", to: "/dashboard/wallet", label: "Wallet" },
  { group: "Pages", to: "/dashboard/messages", label: "Messages" },
  { group: "Pages", to: "/dashboard/profile", label: "My Profile" },
  { group: "Pages", to: "/dashboard/settings", label: "Settings" },
  { group: "Actions", to: "/dashboard/jobs", label: "Find new jobs matching your skills" },
  { group: "Actions", to: "/dashboard/wallet", label: "Withdraw to MoMo" },
  { group: "Actions", to: "/dashboard/contracts", label: "Request milestone release" },
];

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => (q.trim() ? all.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) : all),
    [q],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0 p-0 gap-0" style={{ background: "var(--surface)", border: "1px solid var(--color-border)", borderRadius: 16 }}>
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
          <SearchIcon className="h-4 w-4 text-[color:var(--text-muted)]" />
          <input
            autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, jobs, actions…"
            className="h-9 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-[color:var(--text-muted)]"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center rounded-md px-1.5 text-[10px] text-[color:var(--text-muted)]" style={{ border: "1px solid var(--color-border)" }}>ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-[color:var(--text-muted)]">No matches for "{q}"</div>
          )}
          {filtered.map((i, idx) => (
            <Link
              key={`${i.to}-${idx}`}
              to={i.to}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-[13.5px] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-white"
            >
              <span className="min-w-0 truncate">{i.label}</span>
              <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-[color:var(--text-muted)]">{i.group}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-muted)]" />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}