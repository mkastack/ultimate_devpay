// src/lib/server/escrow.ts
import { createServerFn } from "@tanstack/react-start";
import * as Sentry from "@sentry/react";
import { supabaseServer } from "@/integrations/supabase/server";

export const releaseEscrow = createServerFn()
  .validator((data: { contract_id: string; escrow_id: string }) => data)
  .handler(async ({ data }) => {
    try {
      // Update escrow record status to "released" in Supabase
      const { error } = await supabaseServer
        .from("escrow_transactions")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", data.escrow_id)
        .eq("contract_id", data.contract_id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          contract_id: data.contract_id,
          escrow_id: data.escrow_id,
        },
        tags: {
          feature: "payments",
          severity: "critical",
        },
      });
      throw error;
    }
  });
