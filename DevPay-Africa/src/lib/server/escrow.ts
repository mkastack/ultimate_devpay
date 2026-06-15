import { createServerFn } from "@tanstack/react-start";
import { supabaseServer } from "@/integrations/supabase/server";

export const releaseEscrow = createServerFn()
  .inputValidator((data: { contract_id: string; escrow_id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabaseServer
      .from("escrow_transactions")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", data.escrow_id)
      .eq("contract_id", data.contract_id);

    if (error) throw error;

    return { success: true };
  });
