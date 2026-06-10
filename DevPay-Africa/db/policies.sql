-- ============================================================
-- DevPay Africa — RLS policies & helpers
-- Paste this into Supabase → SQL Editor → Run.
-- Safe to re-run (uses DROP POLICY IF EXISTS).
-- ============================================================

-- 1. Helper: get current user's role from profiles (SECURITY DEFINER avoids RLS recursion)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- 2. Enable RLS
alter table public.profiles            enable row level security;
alter table public.developer_profiles  enable row level security;
alter table public.client_profiles     enable row level security;
alter table public.jobs                enable row level security;
alter table public.job_skills          enable row level security;
alter table public.proposals           enable row level security;
alter table public.skills              enable row level security;

-- transactions / withdrawals if they exist
do $$ begin
  if to_regclass('public.transactions') is not null then
    execute 'alter table public.transactions enable row level security';
  end if;
  if to_regclass('public.withdrawals') is not null then
    execute 'alter table public.withdrawals enable row level security';
  end if;
end $$;

-- ---------- profiles ----------
drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles read all"  on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles read all"
  on public.profiles for select using (true);
create policy "profiles insert own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own"
  on public.profiles for update using (auth.uid() = id);

-- ---------- developer_profiles ----------
drop policy if exists "dev profiles read all"   on public.developer_profiles;
drop policy if exists "dev profiles insert own" on public.developer_profiles;
drop policy if exists "dev profiles update own" on public.developer_profiles;

create policy "dev profiles read all"
  on public.developer_profiles for select using (true);
create policy "dev profiles insert own"
  on public.developer_profiles for insert with check (auth.uid() = user_id);
create policy "dev profiles update own"
  on public.developer_profiles for update using (auth.uid() = user_id);

-- ---------- client_profiles ----------
drop policy if exists "client profiles read all"   on public.client_profiles;
drop policy if exists "client profiles insert own" on public.client_profiles;
drop policy if exists "client profiles update own" on public.client_profiles;

create policy "client profiles read all"
  on public.client_profiles for select using (true);
create policy "client profiles insert own"
  on public.client_profiles for insert with check (auth.uid() = user_id);
create policy "client profiles update own"
  on public.client_profiles for update using (auth.uid() = user_id);

-- ---------- skills (public reference data) ----------
drop policy if exists "skills read all" on public.skills;
create policy "skills read all" on public.skills for select using (true);

-- ---------- jobs ----------
-- Anyone signed-in can read open jobs; clients only insert/edit/delete their own.
drop policy if exists "jobs read open or owner" on public.jobs;
drop policy if exists "jobs insert client owner" on public.jobs;
drop policy if exists "jobs update owner"        on public.jobs;
drop policy if exists "jobs delete owner"        on public.jobs;

create policy "jobs read open or owner"
  on public.jobs for select
  using (
    status = 'open'
    or client_id = auth.uid()
  );

create policy "jobs insert client owner"
  on public.jobs for insert
  with check (
    auth.uid() = client_id
    and public.current_user_role() = 'client'
  );

create policy "jobs update owner"
  on public.jobs for update using (auth.uid() = client_id);

create policy "jobs delete owner"
  on public.jobs for delete using (auth.uid() = client_id);

-- ---------- job_skills ----------
-- Readable when the parent job is readable; writable only by job owner (client).
drop policy if exists "job_skills read"   on public.job_skills;
drop policy if exists "job_skills write"  on public.job_skills;
drop policy if exists "job_skills delete" on public.job_skills;

create policy "job_skills read"
  on public.job_skills for select
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_skills.job_id
        and (j.status = 'open' or j.client_id = auth.uid())
    )
  );

create policy "job_skills write"
  on public.job_skills for insert
  with check (
    exists (select 1 from public.jobs j where j.id = job_skills.job_id and j.client_id = auth.uid())
  );

create policy "job_skills delete"
  on public.job_skills for delete
  using (
    exists (select 1 from public.jobs j where j.id = job_skills.job_id and j.client_id = auth.uid())
  );

-- ---------- proposals ----------
-- Developer creates own proposal; only developer (author) and client (job owner) can read it.
drop policy if exists "proposals read author or job owner" on public.proposals;
drop policy if exists "proposals insert developer"         on public.proposals;
drop policy if exists "proposals update author"            on public.proposals;
drop policy if exists "proposals update job owner status"  on public.proposals;
drop policy if exists "proposals delete author"            on public.proposals;

create policy "proposals read author or job owner"
  on public.proposals for select
  using (
    auth.uid() = developer_id
    or exists (
      select 1 from public.jobs j
      where j.id = proposals.job_id and j.client_id = auth.uid()
    )
  );

create policy "proposals insert developer"
  on public.proposals for insert
  with check (
    auth.uid() = developer_id
    and public.current_user_role() = 'developer'
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open')
  );

create policy "proposals update author"
  on public.proposals for update
  using (auth.uid() = developer_id);

create policy "proposals delete author"
  on public.proposals for delete
  using (auth.uid() = developer_id);

-- ---------- transactions (read-only for owning user) ----------
do $$ begin
  if to_regclass('public.transactions') is not null then
    execute 'drop policy if exists "tx read own" on public.transactions';
    execute 'create policy "tx read own" on public.transactions for select using (auth.uid() = user_id)';
  end if;
end $$;

-- ---------- wallets (required for signup trigger) ----------
do $$ begin
  if to_regclass('public.wallets') is not null then
    execute 'alter table public.wallets enable row level security';
    execute 'drop policy if exists "wallets read own" on public.wallets';
    execute 'drop policy if exists "wallets insert own" on public.wallets';
    execute 'drop policy if exists "wallets update own" on public.wallets';
    execute 'create policy "wallets read own" on public.wallets for select using (auth.uid() = user_id)';
    execute 'create policy "wallets insert own" on public.wallets for insert with check (auth.uid() = user_id)';
    execute 'create policy "wallets update own" on public.wallets for update using (auth.uid() = user_id)';
  end if;
end $$;

-- ---------- withdrawals ----------
do $$ begin
  if to_regclass('public.withdrawals') is not null then
    execute 'drop policy if exists "wd read own"   on public.withdrawals';
    execute 'drop policy if exists "wd insert own" on public.withdrawals';
    execute 'create policy "wd read own"   on public.withdrawals for select using (auth.uid() = user_id)';
    execute 'create policy "wd insert own" on public.withdrawals for insert with check (auth.uid() = user_id)';
  end if;
end $$;
