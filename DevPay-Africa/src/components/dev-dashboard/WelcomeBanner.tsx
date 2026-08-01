import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeBanner() {
  const { profile, session } = useAuth();
  const [stats, setStats] = useState({ pendingProposals: 0, activeContracts: 0 });

  useEffect(() => {
    if (!session?.user?.id) return;

    let active = true;

    const loadStats = async () => {
      try {
        const [proposalRes, contractRes] = await Promise.all([
          supabase.from("proposals").select("id, status").eq("developer_id", session.user.id),
          supabase.from("contracts").select("id, status").eq("developer_id", session.user.id),
        ]);

        if (proposalRes.error) throw proposalRes.error;
        if (contractRes.error) throw contractRes.error;

        const pendingProposals = (proposalRes.data ?? []).filter((item: { status?: string | null }) => {
          const status = String(item?.status ?? "").toLowerCase();
          return status === "pending" || status === "submitted" || status === "draft";
        }).length;

        const activeContracts = (contractRes.data ?? []).filter((item: { status?: string | null }) => {
          const status = String(item?.status ?? "").toLowerCase();
          return status === "active" || status === "in_progress" || status === "accepted" || status === "locked" || status === "funded";
        }).length;

        if (active) {
          setStats({ pendingProposals, activeContracts });
        }
      } catch (error) {
        console.error("Failed to load welcome banner stats", error);
        if (active) {
          setStats({ pendingProposals: 0, activeContracts: 0 });
        }
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const fullName =
    profile?.full_name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Developer";
  const firstName = fullName.split(" ")[0];
  const isPro = Boolean(profile?.is_verified || session?.user?.app_metadata?.subscription_plan === "pro");

  return (
    <div
      className="force-white relative mb-7 overflow-hidden rounded-[20px] px-8 py-7"
      style={{
        background:
          "linear-gradient(135deg, #1A4A2E 0%, #0F2A1E 50%, #0A1F16 100%)",
        border: "1px solid rgba(0,198,167,0.15)",
      }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path d="M55 30 L25 90 L55 150" stroke="#00C6A7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M125 30 L155 90 L125 150" stroke="#00C6A7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M90 50 L60 65 V100 C60 125 75 140 90 145 C105 140 120 125 120 100 V65 Z" stroke="#00C6A7" strokeWidth="6" fill="none" strokeLinejoin="round" />
      </svg>

      {isPro && (
        <span
          className="absolute right-4 top-4 md:right-6 md:top-6 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: "rgba(245,166,35,0.15)",
            border: "1px solid rgba(245,166,35,0.30)",
            color: "var(--gold-brand)",
          }}
        >
          ⭐ {profile?.is_verified ? "Verified Developer" : "Pro Developer"}
        </span>
      )}

      <div className="relative z-10 max-w-full md:max-w-[65%]">
        <div className="font-display text-[22px] sm:text-[26px] font-bold text-white pr-20 md:pr-0">
          {getGreeting()}, {firstName} 👋
        </div>
        <div className="mt-2 text-[14px] sm:text-[15px] text-white/70">
          You have {stats.pendingProposals} pending proposals and {stats.activeContracts} active contracts.
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--cyan-brand)] px-5 text-[14px] font-semibold text-[color:var(--background)] transition-all hover:scale-[1.02] hover:shadow-cyan active:scale-[0.98]"
          >
            Browse New Jobs <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}