import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Flag, Trash2, Check, X } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar } from "@/components/admin/ui";
import { ALL_USERS } from "@/lib/admin-mock";
import { Checkbox, IconBtn } from "@/routes/admin.users";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

type Status = "published" | "flagged" | "hidden" | "pending";
interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewer: typeof ALL_USERS[number];
  subject: typeof ALL_USERS[number];
  contract: string;
  status: Status;
  flags: number;
  postedHrs: number;
  audit: { at: string; actor: string; action: string }[];
}

const SAMPLES = [
  "Outstanding communication and clean code. Shipped early.",
  "Did the work but missed two deadlines. Average overall.",
  "Refused to deliver final assets without extra payment.",
  "Best developer I've worked with on the platform. Hiring again.",
  "Quality was below expectations and revisions were rushed.",
  "Solid mid-level engineer, would recommend for similar scope.",
];
const STATUSES: Status[] = ["published", "flagged", "hidden", "pending"];

const REVIEWS: Review[] = Array.from({ length: 18 }, (_, i) => ({
  id: `rev_${(i + 1).toString().padStart(5, "0")}`,
  rating: ((i * 7) % 5) + 1,
  title: ["Highly recommended", "Mixed experience", "Would not hire again", "Exceeded expectations", "Average work"][i % 5],
  body: SAMPLES[i % SAMPLES.length],
  reviewer: ALL_USERS[i % ALL_USERS.length],
  subject: ALL_USERS[(i + 7) % ALL_USERS.length],
  contract: `C-${1000 + i}`,
  status: STATUSES[i % STATUSES.length],
  flags: i % 4,
  postedHrs: i * 3 + 1,
  audit: [
    { at: `${i + 1}h ago`, actor: "System", action: "Auto-published after AI safety check" },
    ...(i % 4 === 1 ? [{ at: `${i}h ago`, actor: "ada.admin", action: "Flagged for manual review" }] : []),
  ],
}));

const statusColor: Record<Status, "green" | "red" | "gray" | "amber"> = {
  published: "green", flagged: "red", hidden: "gray", pending: "amber",
};

function ReviewsPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = REVIEWS.filter((r) => filter === "all" || r.status === filter);
  const toggle = (id: string) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  };

  return (
    <div>
      <AdminHeader title="Reviews & Ratings" subtitle="Moderate public reviews across contracts" />

      <div className="mb-5 grid grid-cols-5 gap-3.5">
        <Stat label="Total Reviews" value="8,247" color="#3B82F6" />
        <Stat label="Avg Rating" value="4.6 ★" color="#F5A623" />
        <Stat label="Flagged" value="23" color="#FF4D6A" />
        <Stat label="Pending Moderation" value="14" color="#F59E0B" />
        <Stat label="Hidden (30d)" value="47" color="#3D4466" />
      </div>

      <div className="mb-5 flex gap-1 rounded-full bg-[#12152A] p-1">
        {[
          { v: "all" as const, l: "All Reviews" }, { v: "flagged" as const, l: "Flagged" },
          { v: "pending" as const, l: "Pending" }, { v: "published" as const, l: "Published" }, { v: "hidden" as const, l: "Hidden" },
        ].map((t) => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-[12px] font-medium ${filter === t.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-3.5">
        {filtered.map((r) => (
          <Card key={r.id} padding="p-5">
            <div className="mb-3 flex items-start gap-4">
              <Checkbox checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-3">
                  <span className="font-mono text-[12px] text-[#3B82F6]">{r.id}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i < r.rating ? "#F5A623" : "none"} stroke={i < r.rating ? "#F5A623" : "#3D4466"} />
                    ))}
                  </div>
                  <span className="font-sans text-[14px] font-semibold text-white">{r.title}</span>
                  <Pill color={statusColor[r.status]}>{r.status}</Pill>
                  {r.flags > 0 && <Pill color="red">⚑ {r.flags} flags</Pill>}
                  <span className="ml-auto font-sans text-[12px] text-[#3D4466]">{r.postedHrs}h ago</span>
                </div>
                <p className="mb-3 font-sans text-[13px] leading-relaxed text-[#8890B5]">{r.body}</p>
                <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl bg-[#12152A] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.reviewer.name} color={r.reviewer.avatarColor} size={32} />
                    <div>
                      <div className="font-sans text-[12px] font-semibold text-white">{r.reviewer.name}</div>
                      <Pill color={r.reviewer.role === "developer" ? "cyan" : "gold"}>Reviewer · {r.reviewer.role}</Pill>
                    </div>
                  </div>
                  <span className="font-display text-[11px] font-bold text-[#3D4466]">→ on contract {r.contract} →</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-right">
                      <div className="font-sans text-[12px] font-semibold text-white">{r.subject.name}</div>
                      <Pill color={r.subject.role === "developer" ? "cyan" : "gold"}>Subject · {r.subject.role}</Pill>
                    </div>
                    <Avatar name={r.subject.name} color={r.subject.avatarColor} size={32} />
                  </div>
                </div>

                {/* Audit trail */}
                <details className="mb-3 rounded-lg border border-[#1C2040] bg-[#0D0F1A] px-3 py-2">
                  <summary className="cursor-pointer font-sans text-[11px] font-semibold uppercase tracking-wider text-[#3D4466]">
                    Audit trail ({r.audit.length})
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    {r.audit.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 font-mono text-[11px] text-[#8890B5]">
                        <span className="text-[#3D4466]">{a.at}</span>
                        <span className="text-[#3B82F6]">{a.actor}</span>
                        <span>—</span>
                        <span>{a.action}</span>
                      </div>
                    ))}
                  </div>
                </details>

                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]">
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md border border-[#F59E0B] bg-[rgba(245,158,11,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#F59E0B] hover:bg-[rgba(245,158,11,0.20)]">
                    <Flag className="h-3 w-3" /> Flag
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md border border-[#3D4466] bg-[#12152A] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#8890B5] hover:text-white">
                    <X className="h-3 w-3" /> Hide
                  </button>
                  <button className="ml-auto flex items-center gap-1.5 rounded-md border border-[#FF4D6A] bg-[rgba(255,77,106,0.10)] px-3 py-1.5 font-sans text-[12px] font-semibold text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.20)]">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-24 left-3 right-3 md:bottom-6 md:left-[270px] md:right-6 z-50 flex items-center justify-between rounded-xl border border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 shadow-[0_8px_32px_rgba(30,58,138,0.5)]">
          <span className="font-sans text-[13px] font-semibold text-white">{selected.size} reviews selected</span>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Approve All</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Hide All</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card padding="p-4">
      <div className="font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">{label}</div>
      <div className="mt-1 font-mono text-[22px] font-bold" style={{ color }}>{value}</div>
    </Card>
  );
}
