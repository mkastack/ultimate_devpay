
This is a large multi-part request. I'll group it into 5 phases so we can ship it cleanly. Phases 1–2 are foundational (must land first); 3–5 build on them.

## Phase 1 — UI quick fixes & branding
- **EarningsChart blank fix**: wrap `ResponsiveContainer` in a parent with an explicit pixel height (e.g. `h-[280px]`) so SSR + Recharts always has a measurable box.
- **Logo**: copy `DevPay_favicon-removebg-preview-2.png` to `src/assets/devpay-logo.png` and `public/favicon.png`. Use it in:
  - Sidebar header (replaces text wordmark)
  - `__root.tsx` head (`favicon`, `og:image`, `twitter:image`)
  - Auth screens
- **Sidebar UX overhaul**:
  - Remove the user identity card from the sidebar top.
  - Remove the internal scrollbar; make the sidebar a fixed full-height flex column where the menu fits without scrolling (collapse Pro CTA into a compact pill at the bottom).
  - Add collapse toggle (chevron) → mini sidebar (~72px) showing only icons with tooltips. Persist state in `localStorage`.
- **Profile popover on header avatar**: clicking the avatar in the top-right `Header` opens a popover showing name, @handle, Pro badge, "Available for work" status, and links to Profile / Settings / Sign out.

## Phase 2 — Lovable Cloud + Auth
- Enable Lovable Cloud.
- Create schema (migration) with explicit GRANTs + RLS:
  - `profiles` (id FK auth.users, username, display_name, avatar_url, city, country, headline, rating, rating_count, is_pro, available_for_work)
  - `app_role` enum + `user_roles` + `has_role()` security-definer
  - `jobs` (public read), `proposals`, `contracts`, `activities`, `messages`, `wallet_transactions`, `payouts`, `skills`, `job_skills`, `saved_jobs`
  - Trigger to auto-create `profiles` row on signup
- Auth pages: `/login`, `/signup`, `/reset-password` (email+password + Google via Lovable broker, via `supabase--configure_social_auth`).
- `_authenticated` layout route guarding `/dashboard/*` with `supabase.auth.getUser()` in `beforeLoad`.
- Wire `attachSupabaseAuth` in `src/start.ts` and root `onAuthStateChange` listener that invalidates router + query cache.

## Phase 3 — Overview wired to real data
- Server fns (in `src/lib/dashboard.functions.ts`) with `requireSupabaseAuth`:
  - `getOverviewMetrics` (totals, counts, rating)
  - `getRecentActivity`
  - `getActiveContracts`
  - `getEarningsTimeseries` (last 30 days)
  - `getMatchedJobs` (simple skill overlap)
- Replace mock imports in `MetricCards`, `RecentActivity`, `ContractsRow`, `EarningsChart`, `JobsForYou`, `BottomRow` with `useSuspenseQuery` + `ensureQueryData` per the TanStack Query pattern. Add skeletons + empty states.

## Phase 4 — Jobs & Wallet pages
- **`/dashboard/jobs`**: search input, filters (category, budget range, experience, posted-within), status badges (Open / Closed / Awarded), pagination via URL search params (`validateSearch` + `loaderDeps`). Server fn `listJobs` paginates from Supabase with full-text search on title/description.
- **`/dashboard/wallet`**: balance card (available / pending / lifetime), transactions table with type badges (deposit, escrow_release, payout, fee, refund) and status badges (pending / completed / failed), pagination + filter by type. Server fn `listWalletTransactions` + `getWalletSummary`.

## Phase 5 — Verification
- Run build, take preview screenshots of Overview / Jobs / Wallet / collapsed sidebar to confirm chart renders, sidebar fits without scroll, profile popover works.

---

## Important confirmation before I start

This is roughly **12–15 new files, 1 large migration with ~12 tables, ~8 server functions, and a full auth flow** — a multi-hour build. A few decisions I need from you first:

1. **Profiles**: I'll auto-create a `profiles` row on signup with username derived from email (editable later on the Profile page). OK?
2. **Seed data**: After enabling Cloud, there will be **zero** jobs/contracts/activity for a new account → the dashboard will look empty. Do you want me to also write a `seed.sql` that inserts demo jobs + a sample contract/activity for the signed-in user so the UI doesn't look broken on first login?
3. **Google sign-in**: enable alongside email/password? (Lovable Cloud default.)
4. **Scope confirmation**: shall I execute **all 5 phases in one go**, or land Phase 1 (UI fixes + branding + sidebar/profile) first so you can review, then continue?

Reply with answers (e.g. "1. yes  2. yes seed  3. yes  4. all in one go") and I'll start immediately.
