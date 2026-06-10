export function formatAuthError(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err && "message" in err
        ? String((err as { message: unknown }).message)
        : "Something went wrong";

  if (/failed to fetch/i.test(message)) {
    return (
      "Cannot reach Supabase. Check your internet connection, allow supabase.co in ad blockers, " +
      "and confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set on Vercel."
    );
  }

  if (/row-level security/i.test(message) && /wallets/i.test(message)) {
    return (
      "Signup is blocked by database security on the wallets table. " +
      "In Supabase SQL Editor, run db/signup-fix.sql from this project, then try again."
    );
  }

  if (/row-level security/i.test(message) && /profiles/i.test(message)) {
    return (
      "Signup is blocked by database security on profiles. " +
      "In Supabase SQL Editor, run db/policies.sql and db/signup-fix.sql, then try again."
    );
  }

  return message;
}
