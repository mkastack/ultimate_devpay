import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Use this in TanStack Start server functions, API routes, and Inngest handlers.
 * Reads credentials from process.env (set in .env as SUPABASE_URL / SUPABASE_ANON_KEY).
 */
const SUPABASE_URL =
  (typeof process !== "undefined" && process.env.SUPABASE_URL) ||
  "https://nmjqzgnunvvrqllwutal.supabase.co";

const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env.SUPABASE_ANON_KEY) ||
  "sb_publishable_Qszi-BRivaGnYMAx0H10Sg_CGli3f6i";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase Server] SUPABASE_URL or SUPABASE_ANON_KEY is not set. " +
    "Add them to your .env file."
  );
}

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,       // No session persistence on the server
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
