import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Plus, MoreVertical, Eye, Pencil } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, Avatar, StatusDot } from "@/components/admin/ui";
import { ALL_USERS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = ALL_USERS.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (query && !`${u.name} ${u.email} ${u.username}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  function exportCsv() {
    const headers = ["Name", "Username", "Email", "Role", "Country", "Status", "Joined", "Earnings/Spent", "Last Active"];
    const rows = filtered.map((u) => [
      u.name, u.username, u.email, u.role, u.country, u.status, u.joined,
      u.earningsOrSpent.toString(), u.lastActive,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devpay-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  const statusColor: Record<string, { color: string; label: string }> = {
    active: { color: "#10B981", label: "Active" },
    suspended: { color: "#FF4D6A", label: "Suspended" },
    pending: { color: "#F59E0B", label: "Pending" },
    unverified: { color: "#3D4466", label: "Unverified" },
  };

  return (
    <div>
      <AdminHeader title="User Management" subtitle="5,247 registered users" />

      {/* Filter bar */}
      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, username..."
            className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] pl-10 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none"
          />
        </div>
        <Select value={roleFilter} onChange={setRoleFilter} options={[
          { v: "all", l: "All Roles" }, { v: "developer", l: "Developers" }, { v: "client", l: "Clients" },
        ]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={[
          { v: "all", l: "All Status" }, { v: "active", l: "Active" }, { v: "suspended", l: "Suspended" }, { v: "pending", l: "Pending" }, { v: "unverified", l: "Unverified" },
        ]} />
        <button onClick={exportCsv} className="flex h-11 items-center gap-2 rounded-[10px] border border-[#1E3A8A] bg-[#12152A] px-4 font-sans text-[13px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.10)]">
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button onClick={() => setInviteOpen(true)} className="flex h-11 items-center gap-2 rounded-[10px] bg-[#1E3A8A] px-4 font-sans text-[13px] font-semibold text-white hover:bg-[#1E40AF]">
          <Plus className="h-4 w-4" /> Invite User
        </button>

      </div>

      <div className="mb-3 font-sans text-[13px] text-[#3D4466]">
        Showing 1–{filtered.length} of {filtered.length} users
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#12152A]">
              <tr className="h-11">
                <th className="w-10 px-4"><Checkbox checked={false} onChange={() => {}} /></th>
                {["User", "Role", "Country", "Joined", "Status", "Earnings/Spent", "Last Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#3D4466]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const sc = statusColor[u.status];
                return (
                  <tr key={u.id} className="h-[60px] border-t border-[#1C2040] transition-colors hover:bg-[#12152A]">
                    <td className="px-4"><Checkbox checked={selected.has(u.id)} onChange={() => toggle(u.id)} /></td>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={u.avatarColor} ring={u.role === "developer" ? "#00C6A7" : "#F5A623"} />
                        <div>
                          <div className="font-sans text-[14px] font-semibold text-white">{u.name}</div>
                          <div className="font-sans text-[11px] text-[#3D4466]">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4"><Pill color={u.role === "developer" ? "cyan" : "gold"}>{u.role}</Pill></td>
                    <td className="px-4 font-sans text-[13px] text-[#8890B5]">{u.flag} {u.country}</td>
                    <td className="px-4 font-sans text-[13px] text-[#8890B5]">
                      {new Date(u.joined).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-1.5 font-sans text-[13px]" style={{ color: sc.color }}>
                        <StatusDot color={sc.color} /> {sc.label}
                      </div>
                    </td>
                    <td className="px-4 font-mono text-[13px]" style={{ color: u.role === "developer" ? "#00C6A7" : "#F5A623" }}>
                      {u.role === "developer" ? "Earned: " : "Spent: "}GHS {u.earningsOrSpent.toLocaleString()}
                    </td>
                    <td className="px-4 font-sans text-[13px] text-[#3D4466]">{u.lastActive}</td>
                    <td className="px-4">
                      <div className="flex gap-1.5">
                        <IconBtn><Eye className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn><Pencil className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn><MoreVertical className="h-3.5 w-3.5" /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-24 left-3 right-3 md:bottom-6 md:left-[270px] md:right-6 z-50 flex items-center justify-between rounded-xl border border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 shadow-[0_8px_32px_rgba(30,58,138,0.5)]">
          <span className="font-sans text-[13px] font-semibold text-white">{selected.size} users selected</span>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Verify Selected</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Suspend Selected</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Export</button>
            <button className="rounded-lg bg-white/15 px-3 py-1.5 font-sans text-[12px] font-semibold text-white hover:bg-white/25">Email</button>
          </div>
        </div>
      )}

      {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}

function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("developer");
  const [message, setMessage] = useState("Welcome to DevPay Africa! Click the link below to set up your account.");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center px-4" role="dialog">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1C2040] bg-[#0D0F1A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1C2040] px-5 py-4">
          <div>
            <div className="font-display text-[16px] font-bold text-white">Invite a user</div>
            <div className="font-sans text-[11px] text-[#8890B5]">Send an invitation email to join the platform.</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full border border-[#1C2040] text-[#8890B5] hover:text-white">×</button>
        </div>
        {sent ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#10B981]/15 text-[#10B981]">✓</div>
            <div className="font-display text-[15px] font-bold text-white">Invitation sent</div>
            <div className="mt-1 font-sans text-[12px] text-[#8890B5]">{email} will receive an email shortly.</div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 px-5 py-5">
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className="h-10 w-full rounded-lg border border-[#1C2040] bg-[#07080F] px-3 text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
            </Field>
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="h-10 w-full rounded-lg border border-[#1C2040] bg-[#07080F] px-3 text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
            </Field>
            <Field label="Role">
              <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 w-full rounded-lg border border-[#1C2040] bg-[#07080F] px-3 text-[13px] text-white focus:border-[#1E3A8A] focus:outline-none">
                <option value="developer">Developer</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="Personal message">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-lg border border-[#1C2040] bg-[#07080F] p-3 text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-[#1C2040] px-4 py-2 text-[12.5px] font-semibold text-[#8890B5] hover:text-white">Cancel</button>
              <button type="submit" className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#1E40AF]">Send invitation</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#8890B5]">{label}</span>
      {children}
    </label>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`grid h-4 w-4 place-items-center rounded border ${
        checked ? "border-[#1E3A8A] bg-[#1E3A8A]" : "border-[#1C2040] bg-[#0D0F1A]"
      }`}
    >
      {checked && <span className="text-[10px] text-white">✓</span>}
    </button>
  );
}

export function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-7 w-7 place-items-center rounded-md bg-[#12152A] text-[#8890B5] transition-colors hover:bg-[#1C2040] hover:text-white">
      {children}
    </button>
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-[10px] border border-[#1C2040] bg-[#0D0F1A] px-3 font-sans text-[13px] text-white focus:border-[#1E3A8A] focus:outline-none"
    >
      {options.map((o) => <option key={o.v} value={o.v} className="bg-[#0D0F1A]">{o.l}</option>)}
    </select>
  );
}
