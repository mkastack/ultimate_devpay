import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, isConfigured } =
  getSupabaseConfig();

if (!isConfigured) {
  console.error(
    "[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set at build time. " +
      "Add them in .env locally and in Vercel → Settings → Environment Variables."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  }
);

export type UserRole = "developer" | "client" | "admin";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
};
