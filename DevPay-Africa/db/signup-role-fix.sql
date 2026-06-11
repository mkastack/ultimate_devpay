-- ============================================================
-- DevPay Africa — Signup role from user metadata
-- Run in Supabase → SQL Editor. Safe to re-run.
-- Ensures new accounts get developer/client from signup choice.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix integer := 0;
  chosen_role text;
  display_name text;
begin
  chosen_role := coalesce(
    nullif(trim(new.raw_user_meta_data->>'role'), ''),
    'developer'
  );
  if chosen_role not in ('developer', 'client', 'admin') then
    chosen_role := 'developer';
  end if;

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  base_username := lower(
    regexp_replace(
      coalesce(
        nullif(trim(new.raw_user_meta_data->>'username'), ''),
        split_part(coalesce(new.email, 'user'), '@', 1)
      ),
      '[^a-z0-9]',
      '',
      'g'
    )
  );
  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, email, role)
  values (
    new.id,
    final_username,
    display_name,
    new.email,
    chosen_role
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    email = coalesce(public.profiles.email, excluded.email);

  if chosen_role = 'developer' then
    insert into public.developer_profiles (user_id)
    values (new.id)
    on conflict do nothing;
  elsif chosen_role = 'client' then
    insert into public.client_profiles (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  return new;
exception
  when others then
    -- Never block auth signup if profile row already exists or schema differs
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
