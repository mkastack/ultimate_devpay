-- ============================================================
-- DevPay Africa — Fix signup / login profile + wallet setup
-- Run in Supabase → SQL Editor → Run (safe to re-run).
-- ============================================================

-- 1) Wallet RLS: allow each signed-in user to manage their own wallet row
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

-- 2) Wallet bootstrap on new profile (SECURITY DEFINER — bypasses RLS safely)
create or replace function public.handle_new_profile_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.wallets') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'wallets' and column_name = 'user_id'
    ) then
      insert into public.wallets (user_id) values (new.id) on conflict do nothing;
    elsif exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'wallets' and column_name = 'id'
    ) then
      insert into public.wallets (id) values (new.id) on conflict do nothing;
    end if;
  end if;
  return new;
exception
  when others then
    -- Never block profile creation if wallet row already exists or schema differs
    return new;
end;
$$;

drop trigger if exists on_profile_insert_wallet on public.profiles;
create trigger on_profile_insert_wallet
  after insert on public.profiles
  for each row
  execute function public.handle_new_profile_wallet();

-- 3) Ensure core profile policies exist (re-apply from policies.sql)
drop policy if exists "profiles read all" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles read all"
  on public.profiles for select using (true);
create policy "profiles insert own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own"
  on public.profiles for update using (auth.uid() = id);
