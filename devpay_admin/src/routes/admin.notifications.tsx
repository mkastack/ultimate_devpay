import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Trash2, Send, Filter } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar } from "@/components/admin/ui";
import { ALL_USERS } from "@/lib/admin-mock";
import { Checkbox, IconBtn } from "@/routes/admin.users";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationsPage,
});

type Channel = "email" | "sms" | "push" | "in_app";
type NotifStatus = "delivered" | "queued" | "failed" | "read";

interface Notif {
  id: string;
  title: string;
  body: string;
  channel: Channel;
  audience: string;
  recipient: typeof ALL_USERS[number];
  status: NotifStatus;
  sentHrs: number;
  type: "transactional" | "marketing" | "system" | "security";
}

const TYPES: Notif["type"][] = ["transactional", "marketing", "system", "security"];
const CHANNELS: Channel[] = ["email", "sms", "push", "in_app"];
const STATUSES: NotifStatus[] = ["delivered", "queued", "failed", "read"];
const TITLES = [
  "Withdrawal approved",
  "New proposal received",
  "Milestone payment released",
  "Account verified successfully",
  "Suspicious login detected",
  "Weekly earnings summary",
  "Dispute opened against contract",
  "New job matches your skills",
  "Contract milestone due",
  "Platform maintenance scheduled",
];

const NOTIFS: Notif[] = Array.from({ length: 24 }, (_, i) => ({
  id: `ntf_${(i + 1).toString().padStart(5, "0")}`,
  title: TITLES[i % TITLES.length],
  body: "Automated message dispatched by the platform notification engine.",
  channel: CHANNELS[i % CHANNELS.length],
  audience: i % 5 === 0 ? "All developers" : i % 7 === 0 ? "Verified clients" : "Single user",
  recipient: ALL_USERS[i % ALL_USERS.length],
  status: STATUSES[i % STATUSES.length],
  sentHrs: i + 1,
  type: TYPES[i % TYPES.length],
}));

const channelIcon = { email: Mail, sms: Smartphone, push: Bell, in_app: MessageSquare };
const statusColor: Record<NotifStatus, "green" | "blue" | "red" | "purple"> = {
  delivered: "green", queued: "blue", failed: "red", read: "purple",
};

function NotificationsPage() {
  const [channel, setChannel] = useState<"all" | Channel>("all");
  const [type, setType] = useState<"all" | Notif["type"]>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = NOTIFS.filter((n) =>
    (channel === "all" || n.channel === channel) && (type === "all" || n.type === type),
  );
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div>
      <AdminHeader title="Notifications" subtitle="Outbound notification log + composer" />

      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <Stat label="Sent Today" value="14,832" color="#3B82F6" />
        <Stat label="Delivery Rate" value="98.4%" color="#10B981" />
        <Stat label="Failed (24h)" value="217" color="#FF4D6A" />
        <Stat label="Queue Depth" value="42" color="#F59E0B" />
      </div>

      {/* Composer */}
      <Card padding="p-5" className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-sans text-[14px] font-semibold text-white">Broadcast composer</div>
          <Pill color="purple">Draft</Pill>
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
          <input placeholder="Title..."
            className="h-11 rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] px-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
          <select className="h-11 rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] px-3 font-sans text-[13px] text-white focus:border-[#1E3A8A] focus:outline-none">
            <option>All users (5,247)</option>
            <option>Developers only (3,891)</option>
            <option>Clients only (1,356)</option>
            <option>Verified only</option>
          </select>
          <button className="flex h-11 items-center gap-2 rounded-[10px] bg-[#1E3A8A] px-5 font-sans text-[13px] font-semibold text-white hover:bg-[#1E40AF]">
            <Send className="h-4 w-4" /> Send Now
          </button>
        </div>
      </Card>

      {/* Filters */}
      <div className="mb-5 flex items-center gap-3">
        <Filter className="h-4 w-4 text-[#3D4466]" />
        <Tabs value={channel} onChange={(v) => setChannel(v as never)} options={[
          { v: "all", l: "All Channels" },
          { v: "email", l: "Email" }, { v: "sms", l: "SMS" }, { v: "push", l: "Push" }, { v: "in_app", l: "In-app" },
        ]} />
        <Tabs value={type} onChange={(v) => setType(v as never)} options={[
          { v: "all", l: "All Types" },
          { v: "transactional", l: "Transactional" }, { v: "marketing", l: "Marketing" }, { v: "system", l: "System" }, { v: "security", l: "Security" },
        ]} />
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#12152A]">
            <tr className="h-11">
              <th className="w-10 px-4"><Checkbox checked={false} onChange={() => {}} /></th>
              {["Notification", "Channel", "Recipient", "Type", "Status", "Sent", "Actions"].map((h) => (
                <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => {
              const ChIcon = channelIcon[n.channel];
              return (
                <tr key={n.id} className="h-[60px] border-t border-[#1C2040] hover:bg-[#12152A]">
                  <td className="px-4"><Checkbox checked={selected.has(n.id)} onChange={() => toggle(n.id)} /></td>
                  <td className="px-4">
                    <div className="font-sans text-[13px] font-semibold text-white">{n.title}</div>
                    <div className="font-sans text-[11px] text-[#3D4466]">{n.audience}</div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-1.5 font-sans text-[12px] text-[#8890B5]">
                      <ChIcon className="h-3.5 w-3.5 text-[#3B82F6]" /> {n.channel}
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={n.recipient.name} color={n.recipient.avatarColor} size={28} />
                      <span className="font-sans text-[12px] text-[#8890B5]">{n.recipient.name}</span>
                    </div>
                  </td>
                  <td className="px-4"><Pill color={n.type === "security" ? "red" : n.type === "marketing" ? "gold" : "purple"}>{n.type}</Pill></td>
                  <td className="px-4"><Pill color={statusColor[n.status]}>{n.status}</Pill></td>
                  <td className="px-4 font-sans text-[12px] text-[#3D4466]">{n.sentHrs}h ago</td>
                  <td className="px-4">
                    <div className="flex gap-1.5">
                      <IconBtn><Send className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {selected.size > 0 && (
        <div className="fixed bottom-24 left-3 right-3 md:bottom-6 md:left-[270px] md:right-6 z-50 flex items-center justify-between rounded-xl border border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 shadow-[0_8px_32px_rgba(30,58,138,0.5)]">
          <span className="font-sans text-[13px] font-semibold text-white">{selected.size} notifications selected</span>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Resend</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Mark as Read</button>
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
      <div className="mt-1 font-mono text-[24px] font-bold" style={{ color }}>{value}</div>
    </Card>
  );
}

function Tabs({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="flex gap-1 rounded-full bg-[#12152A] p-1">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium transition-colors ${value === o.v ? "bg-[#1E3A8A] text-white" : "text-[#8890B5] hover:text-white"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
