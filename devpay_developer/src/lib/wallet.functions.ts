import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ListInput = z.object({
  type: z.enum(["all", "deposit", "escrow_hold", "escrow_release", "payout", "fee", "refund"]).optional().default("all"),
  page: z.number().int().min(1).max(500).optional().default(1),
  pageSize: z.number().int().min(1).max(50).optional().default(15),
});

export const getWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabase
      .from("wallet_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data.type !== "all") q = q.eq("type", data.type);
    const { data: rows, count } = await q;

    const { data: allTxns } = await supabase
      .from("wallet_transactions")
      .select("amount_usd, type, status")
      .eq("user_id", userId);

    let lifetime = 0;
    let available = 0;
    let pending = 0;
    for (const t of allTxns ?? []) {
      const amt = Number(t.amount_usd);
      if (t.type === "escrow_release" || t.type === "payout" || t.type === "deposit") {
        if (t.status === "completed") {
          lifetime += amt;
          available += amt;
        }
        if (t.status === "pending") pending += amt;
      }
      if (t.type === "payout" && t.status === "completed") available -= amt;
      if (t.type === "fee" && t.status === "completed") available -= amt;
    }

    return {
      transactions: rows ?? [],
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
      summary: { lifetime, available: Math.max(0, available), pending },
    };
  });