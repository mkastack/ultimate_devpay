-- ============================================================
-- DevPay Africa — Hirer flow extensions
-- Tables: milestones, milestone_deliverables, project_messages, disputes, payout_methods
-- Run this in Supabase → SQL Editor → Run. Safe to re-run.
-- ============================================================

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null default 0,
  due_date date,
  position int not null default 0,
  status text not null default 'pending', -- pending, in_progress, submitted, approved, disputed, released
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists milestones_job_idx on public.milestones(job_id);

create table if not exists public.milestone_deliverables (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_url text,
  file_size bigint,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists deliverables_ms_idx on public.milestone_deliverables(milestone_id);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_job_idx on public.project_messages(job_id, created_at);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  opened_by uuid not null references auth.users(id) on delete cascade,
  reason text not null, -- quality, deadline, communication, other
  description text not null,
  proposed_resolution text, -- full_refund, partial_refund, revision, release
  evidence_urls text[],
  status text not null default 'open', -- open, mediation, resolved, rejected
  created_at timestamptz not null default now()
);
create index if not exists disputes_job_idx on public.disputes(job_id);

create table if not exists public.payout_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null, -- momo, bank
  provider text,        -- MTN MoMo, AirtelTigo, Vodafone, Bank name
  account_number text not null,
  account_name text not null,
  is_primary boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists payout_methods_user_idx on public.payout_methods(user_id);

-- =======================
-- RLS
-- =======================
alter table public.milestones enable row level security;
alter table public.milestone_deliverables enable row level security;
alter table public.project_messages enable row level security;
alter table public.disputes enable row level security;
alter table public.payout_methods enable row level security;

-- helper: is the current user a participant on the job?
-- A participant = job's client OR developer with an accepted proposal.
create or replace function public.is_job_participant(_job uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jobs j where j.id = _job and j.client_id = auth.uid()
  ) or exists (
    select 1 from public.proposals p
    where p.job_id = _job and p.developer_id = auth.uid()
      and coalesce(p.status, 'submitted') in ('submitted','accepted')
  )
$$;

-- milestones
drop policy if exists "ms read participants" on public.milestones;
drop policy if exists "ms write owner" on public.milestones;
drop policy if exists "ms update participants" on public.milestones;
create policy "ms read participants" on public.milestones for select
  using (public.is_job_participant(job_id));
create policy "ms write owner" on public.milestones for insert
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.client_id = auth.uid()));
create policy "ms update participants" on public.milestones for update
  using (public.is_job_participant(job_id));

-- deliverables
drop policy if exists "del read participants" on public.milestone_deliverables;
drop policy if exists "del write participants" on public.milestone_deliverables;
create policy "del read participants" on public.milestone_deliverables for select
  using (exists (select 1 from public.milestones m where m.id = milestone_id and public.is_job_participant(m.job_id)));
create policy "del write participants" on public.milestone_deliverables for insert
  with check (auth.uid() = uploaded_by and exists (select 1 from public.milestones m where m.id = milestone_id and public.is_job_participant(m.job_id)));

-- messages
drop policy if exists "msg read participants" on public.project_messages;
drop policy if exists "msg write participants" on public.project_messages;
create policy "msg read participants" on public.project_messages for select
  using (public.is_job_participant(job_id));
create policy "msg write participants" on public.project_messages for insert
  with check (auth.uid() = sender_id and public.is_job_participant(job_id));

-- disputes
drop policy if exists "disp read participants" on public.disputes;
drop policy if exists "disp insert participants" on public.disputes;
create policy "disp read participants" on public.disputes for select
  using (public.is_job_participant(job_id));
create policy "disp insert participants" on public.disputes for insert
  with check (auth.uid() = opened_by and public.is_job_participant(job_id));

-- payout methods
drop policy if exists "pm read own" on public.payout_methods;
drop policy if exists "pm write own" on public.payout_methods;
drop policy if exists "pm update own" on public.payout_methods;
drop policy if exists "pm delete own" on public.payout_methods;
create policy "pm read own" on public.payout_methods for select using (auth.uid() = user_id);
create policy "pm write own" on public.payout_methods for insert with check (auth.uid() = user_id);
create policy "pm update own" on public.payout_methods for update using (auth.uid() = user_id);
create policy "pm delete own" on public.payout_methods for delete using (auth.uid() = user_id);

-- =======================
-- Realtime
-- =======================
do $$ begin
  begin execute 'alter publication supabase_realtime add table public.project_messages'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.milestones'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.milestone_deliverables'; exception when others then null; end;
end $$;
