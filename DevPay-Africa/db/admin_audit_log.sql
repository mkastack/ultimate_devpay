-- Run this in your Supabase SQL Editor
-- Admin audit log — tracks every admin action

create table if not exists public.admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.profiles(id),
  action       text not null,
  target_table text,
  target_id    uuid,
  old_data     jsonb,
  new_data     jsonb,
  ip_address   text,
  user_agent   text,
  notes        text,
  created_at   timestamptz default now()
);

-- Only admins can read audit logs
alter table public.admin_audit_log enable row level security;

drop policy if exists "Only admins can view audit log" on public.admin_audit_log;
create policy "Only admins can view audit log"
  on public.admin_audit_log for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Only admins can insert audit log" on public.admin_audit_log;
create policy "Only admins can insert audit log"
  on public.admin_audit_log for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index for fast admin queries
create index if not exists admin_audit_log_admin_id_idx on public.admin_audit_log(admin_id);
create index if not exists admin_audit_log_created_at_desc_idx on public.admin_audit_log(created_at desc);
create index if not exists admin_audit_log_target_table_idx on public.admin_audit_log(target_table);
