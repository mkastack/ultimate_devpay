-- ============================================================
-- DevPay Africa — DELETE ALL USERS & SIGNUP DATA
-- Run in Supabase → SQL Editor (as project owner).
--
-- ⚠️  IRREVERSIBLE: removes every account, profile, job, wallet,
--     message, and login session. Use only for a clean dev reset.
-- ============================================================

-- 1) App data (children first — order matters for FKs)
do $reset$
declare
  tables text[] := array[
    -- job / project children
    'public.milestone_deliverables',
    'public.project_messages',
    'public.disputes',
    'public.milestones',
    'public.milestone_submissions',
    -- hire / escrow flow
    'public.escrow_accounts',
    'public.contracts',
    'public.hire_requests',
    -- marketplace
    'public.proposals',
    'public.job_skills',
    'public.jobs',
    'public.jobs_registry',
  -- wallets / payments
    'public.wallet_transactions',
    'public.transactions',
    'public.withdrawals',
    'public.payout_methods',
    'public.wallets',
    -- notifications & activity
    'public.notifications',
    'public.activities',
    -- role extensions
    'public.developer_profiles',
    'public.client_profiles',
    'public.developers_registry',
    'public.user_skills',
    'public.user_roles',
    -- core profile (references auth.users)
    'public.profiles'
  ];
  t text;
begin
  foreach t in array tables loop
    if to_regclass(t) is not null then
      execute format('delete from %s', t);
      raise notice 'cleared %', t;
    end if;
  end loop;
end;
$reset$;

-- 2) Auth users (removes all signups / logins / sessions)
delete from auth.users;

-- 3) Optional: clear uploaded avatars (uncomment if you use the avatars bucket)
-- delete from storage.objects where bucket_id = 'avatars';

-- Done. Authentication → Users should now show 0 users.
