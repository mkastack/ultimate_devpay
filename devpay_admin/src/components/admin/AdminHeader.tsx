import { Bell, Search, LogOut, User as UserIcon, Settings as SettingsIcon, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import devpayLogo from "@/assets/devpay-logo.png";
import { getCurrentAdmin, signOutAdmin } from "@/lib/auth-mock";

const MOCK_NOTIFICATIONS = [
  { id: "n1", icon: AlertTriangle, color: "#FF4D6A", title: "New dispute opened", body: "Order #4523 escalated by client.", time: "2m ago", unread: true },
  { id: "n2", icon: DollarSign, color: "#10B981", title: "Withdrawal approved", body: "GHS 12,400 released to Kwame O.", time: "18m ago", unread: true },
  { id: "n3", icon: CheckCircle2, color: "#3B82F6", title: "KYC verified", body: "5 new developers verified.", time: "1h ago", unread: true },
  { id: "n4", icon: Bell, color: "#8890B5", title: "Weekly digest", body: "Platform metrics summary ready.", time: "Yesterday", unread: false },
];

export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(MOCK_NOTIFICATIONS.filter((n) => n.unread).length);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const admin = getCurrentAdmin();
  const displayName = admin?.name?.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) || "Admin";
  const email = admin?.email || "admin@devpay.africa";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleLogout() {
    signOutAdmin();
    navigate({ to: "/login" });
  }

  return (
    <div className="mb-5 flex min-h-[60px] items-center justify-between gap-3 border-b border-[#1C2040] pb-3 md:mb-7 md:pb-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={devpayLogo} alt="" className="h-7 w-7 shrink-0 object-contain md:hidden" />
        <div className="min-w-0">
          <h1 className="font-display text-[17px] font-bold leading-tight text-white md:text-[20px] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 font-sans text-[11px] text-[#3D4466] md:text-[12px] truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-2.5">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D4466]" />
          <input
            type="text"
            placeholder="Search users, transactions, disputes..."
            className="h-9 w-[260px] rounded-[8px] border border-[#1C2040] bg-[#0D0F1A] pl-9 pr-3 font-sans text-[13px] text-white placeholder:text-[#3D4466] focus:border-[#1E3A8A] focus:outline-none"
          />
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full border border-[#1C2040] bg-[#0D0F1A] text-[#8890B5] md:hidden">
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-[#1C2040] bg-[#0D0F1A] text-[#8890B5] transition-colors hover:border-[#1E3A8A] hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-[14px] min-w-[14px] place-items-center rounded-full bg-[#FF4D6A] px-1 font-sans text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 z-50 w-[320px] overflow-hidden rounded-xl border border-[#1C2040] bg-[#0D0F1A] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1C2040] px-4 py-3">
                <div className="font-display text-[13px] font-bold text-white">Notifications</div>
                <button
                  onClick={() => setUnread(0)}
                  className="text-[11px] font-medium text-[#3B82F6] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex gap-3 border-b border-[#1C2040]/60 px-4 py-3 last:border-0 hover:bg-[#12152A]">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: `${n.color}22`, color: n.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-sans text-[12.5px] font-semibold text-white truncate">{n.title}</div>
                          {n.unread && unread > 0 && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />}
                        </div>
                        <div className="font-sans text-[11.5px] text-[#8890B5]">{n.body}</div>
                        <div className="mt-1 font-sans text-[10.5px] text-[#3D4466]">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="block w-full border-t border-[#1C2040] py-2.5 text-center font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[#12152A]">
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            aria-label="Account"
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1E3A8A] bg-[#12152A] font-display font-bold text-white hover:border-[#3B82F6]"
          >
            {initial}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-[260px] overflow-hidden rounded-xl border border-[#1C2040] bg-[#0D0F1A] shadow-2xl">
              <div className="flex items-center gap-3 border-b border-[#1C2040] px-4 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#1E3A8A] bg-[#12152A] font-display font-bold text-white">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-sans text-[13px] font-semibold text-white">{displayName}</div>
                  <div className="truncate font-sans text-[11px] text-[#8890B5]">{email}</div>
                  <div className="mt-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">Super Admin</div>
                </div>
              </div>
              <div className="py-1.5">
                <button className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-sans text-[12.5px] text-[#B6BFE0] hover:bg-[#12152A] hover:text-white">
                  <UserIcon className="h-4 w-4" /> My Profile
                </button>
                <button
                  onClick={() => navigate({ to: "/admin/settings" })}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-sans text-[12.5px] text-[#B6BFE0] hover:bg-[#12152A] hover:text-white"
                >
                  <SettingsIcon className="h-4 w-4" /> Settings
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-[#1C2040] px-4 py-2.5 text-left font-sans text-[12.5px] font-semibold text-[#FF4D6A] hover:bg-[#FF4D6A]/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
