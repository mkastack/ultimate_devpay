import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [
      { data: profile },
      { data: contracts },
      { data: pendingProposals },
      { data: activities },
      { data: txns },
      { data: jobs },
      { count: unreadMessages },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("contracts")
        .select("*")
        .eq("developer_id", userId)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("proposals")
        .select("id, title:job_id, bid_usd, days, status, viewed_by_client, created_at")
        .eq("developer_id", userId)
        .eq("status", "pending"),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("wallet_transactions")
        .select("amount_usd, type, created_at")
        .eq("user_id", userId)
        .in("type", ["escrow_release", "payout"])
        .gte("created_at", new Date(Date.now() - 365 * 86400e3).toISOString()),
      supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("developer_id", userId)
        .eq("unread_for_developer", true),
    ]);

    const totalEarnedUsd = (txns ?? [])
      .filter((t) => t.type === "escrow_release" || t.type === "payout")
      .reduce((s, t) => s + Number(t.amount_usd), 0);

    return {
      profile: profile ?? null,
      activeContracts: contracts ?? [],
      pendingProposalsCount: (pendingProposals ?? []).length,
      activities: activities ?? [],
      totalEarnedUsd,
      earningsTxns: txns ?? [],
      jobs: jobs ?? [],
      unreadMessagesCount: unreadMessages ?? 0,
    };
  });

export const getProposalsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, count } = await supabase
      .from("proposals")
      .select("id, bid_usd, days, status, job_id, created_at, jobs(title)", { count: "exact" })
      .eq("developer_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    return { proposals: data ?? [], total: count ?? 0 };
  });

export const getConversationsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("developer_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(4);
    return { conversations: data ?? [] };
  });