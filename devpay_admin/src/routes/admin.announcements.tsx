import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, SectionHeader } from "@/components/admin/ui";
import { Megaphone, Send } from "lucide-react";

export const Route = createFileRoute("/admin/announcements")({
  component: AnnouncePage,
});

function AnnouncePage() {
  return (
    <div>
      <AdminHeader title="Send Announcement" subtitle="Broadcast a message to your platform." />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <SectionHeader title="Target Audience" />
            <div className="grid grid-cols-2 gap-2">
              {["All Users", "Developers Only", "Clients Only", "Pro Users Only", "Specific Country", "Specific Users (ID list)"].map((o, i) => (
                <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#1C2040] bg-[#12152A] p-3 hover:border-[#1E3A8A]">
                  <input type="checkbox" defaultChecked={i === 0} className="accent-[#1E3A8A]" />
                  <span className="font-sans text-[13px] text-white">{o}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Channel" />
            <div className="flex gap-3">
              {["In-app notification", "Email", "SMS"].map((c, i) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#1C2040] bg-[#12152A] px-4 py-2.5 hover:border-[#1E3A8A]">
                  <input type="checkbox" defaultChecked={i < 2} className="accent-[#1E3A8A]" />
                  <span className="font-sans text-[13px] text-white">{c}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Compose" />
            <div className="mb-3">
              <div className="mb-1 font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Title</div>
              <input
                defaultValue="New 7% commission rate effective Feb 1"
                className="h-11 w-full rounded-[10px] border border-[#1C2040] bg-[#12152A] px-3 font-sans text-[14px] text-white focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-1 font-sans text-[11px] uppercase tracking-wider text-[#3D4466]">Body</div>
              <textarea
                rows={6}
                defaultValue="Hi team, we've updated our platform commission to 7% (down from 7.5%) — more earnings stay with you. Existing contracts are unaffected. Reach out with questions."
                className="w-full rounded-[10px] border border-[#1C2040] bg-[#12152A] p-3 font-sans text-[13px] text-white focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
          </Card>

          <Card>
            <SectionHeader title="Schedule" />
            <div className="flex gap-3">
              <button className="flex-1 rounded-[10px] border-2 border-[#1E3A8A] bg-[rgba(30,58,138,0.10)] py-3 font-sans text-[13px] font-semibold text-[#3B82F6]">Send Now</button>
              <button className="flex-1 rounded-[10px] border border-[#1C2040] bg-[#12152A] py-3 font-sans text-[13px] text-[#8890B5] hover:border-[#1E3A8A]">Schedule</button>
            </div>
          </Card>

          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] font-sans text-[14px] font-bold text-white shadow-[0_8px_32px_rgba(30,58,138,0.4)] hover:shadow-[0_8px_40px_rgba(30,58,138,0.6)]">
            <Send className="h-4 w-4" /> Send to 3,891 developers
          </button>
        </div>

        <div>
          <Card className="sticky top-6">
            <SectionHeader title="Preview" />
            <div className="rounded-[12px] border border-[#1C2040] bg-[#07080F] p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(30,58,138,0.15)]">
                  <Megaphone className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <div className="font-sans text-[13px] font-semibold text-white">
                    New 7% commission rate effective Feb 1
                  </div>
                  <div className="mt-1 font-sans text-[12px] leading-relaxed text-[#8890B5]">
                    Hi team, we've updated our platform commission to 7% (down from 7.5%)...
                  </div>
                  <div className="mt-2 font-sans text-[11px] text-[#3D4466]">DevPay Africa · just now</div>
                </div>
              </div>
            </div>
            <div className="mt-3 font-sans text-[11px] text-[#3D4466]">
              This is how your message appears in the user's notification feed.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
