import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\/$/, "");
  }
  return `https://${value.replace(/\/$/, "")}`;
}

const SUPABASE_URL = normalizeSupabaseUrl(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
);
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY?.trim() ??
  process.env.VITE_SUPABASE_ANON_KEY?.trim() ??
  "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase Server] SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables."
  );
}

export const supabaseServer = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "missing-anon-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
