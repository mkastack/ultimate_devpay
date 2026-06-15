-- DevPay Africa — Supabase Storage Buckets & Policies
-- Run in Supabase → SQL Editor (safe to re-run).

-- Helper function to configure a bucket if it doesn't exist or update public status
create or replace function public.setup_bucket(bucket_name text, is_public boolean)
returns void as $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    bucket_name,
    bucket_name,
    is_public,
    case 
      when bucket_name = 'avatars' then 5242880 -- 5MB
      when bucket_name = 'portfolio' then 10485760 -- 10MB
      when bucket_name = 'company-logos' then 3145728 -- 3MB
      when bucket_name = 'job-attachments' then 52428800 -- 50MB
      when bucket_name = 'dispute-evidence' then 26214400 -- 25MB
      when bucket_name = 'verification-documents' then 10485760 -- 10MB
      when bucket_name = 'message-attachments' then 20971520 -- 20MB
      else null
    end,
    case
      when bucket_name = 'avatars' then array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      when bucket_name = 'portfolio' then array['image/jpeg', 'image/png', 'image/webp']
      when bucket_name = 'company-logos' then array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      when bucket_name = 'verification-documents' then array['image/jpeg', 'image/png', 'application/pdf']
      else null
    end
  )
  on conflict (id) do update set 
    public = is_public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
end;
$$ language plpgsql security definer;

-- Set up all 7 buckets
select public.setup_bucket('avatars', true);
select public.setup_bucket('portfolio', true);
select public.setup_bucket('company-logos', true);
select public.setup_bucket('job-attachments', false);
select public.setup_bucket('dispute-evidence', false);
select public.setup_bucket('verification-documents', false);
select public.setup_bucket('message-attachments', false);

drop function public.setup_bucket(text, boolean);


-----------------------------------------------------------
-- 1. avatars BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Avatars are publicly viewable" on storage.objects;
create policy "Avatars are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[2]
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[2]
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[2]
  );


-----------------------------------------------------------
-- 2. portfolio BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Portfolio images are public" on storage.objects;
create policy "Portfolio images are public"
  on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "Developers upload own portfolio" on storage.objects;
create policy "Developers upload own portfolio"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Developers delete own portfolio" on storage.objects;
create policy "Developers delete own portfolio"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio' and
    auth.uid()::text = (storage.foldername(name))[1]
  );


-----------------------------------------------------------
-- 3. company-logos BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Company logos are public" on storage.objects;
create policy "Company logos are public"
  on storage.objects for select
  using (bucket_id = 'company-logos');

drop policy if exists "Clients upload own company logo" on storage.objects;
create policy "Clients upload own company logo"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Clients update own company logo" on storage.objects;
create policy "Clients update own company logo"
  on storage.objects for update
  using (
    bucket_id = 'company-logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Clients delete own company logo" on storage.objects;
create policy "Clients delete own company logo"
  on storage.objects for delete
  using (
    bucket_id = 'company-logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );


-----------------------------------------------------------
-- 4. job-attachments BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Job participants can view attachments" on storage.objects;
create policy "Job participants can view attachments"
  on storage.objects for select
  using (
    bucket_id = 'job-attachments' and (
      -- Client who owns the job
      auth.uid() in (
        select client_id from public.jobs
        where id::text = (storage.foldername(name))[1]
      )
      OR
      -- Developer who was hired
      auth.uid() in (
        select hired_developer from public.jobs
        where id::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "Clients upload job attachments" on storage.objects;
create policy "Clients upload job attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'job-attachments' and
    auth.uid() in (
      select client_id from public.jobs
      where id::text = (storage.foldername(name))[1]
    )
  );


-----------------------------------------------------------
-- 5. dispute-evidence BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Dispute participants can view evidence" on storage.objects;
create policy "Dispute participants can view evidence"
  on storage.objects for select
  using (
    bucket_id = 'dispute-evidence' and (
      auth.uid() in (
        select raised_by from public.disputes
        where id::text = (storage.foldername(name))[1]
        union
        select against from public.disputes
        where id::text = (storage.foldername(name))[1]
      )
      OR
      auth.uid() in (
        select id from public.profiles where role = 'admin'
      )
    )
  );

drop policy if exists "Dispute parties upload evidence" on storage.objects;
create policy "Dispute parties upload evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'dispute-evidence' and
    auth.uid() in (
      select raised_by from public.disputes
      where id::text = (storage.foldername(name))[1]
      union
      select against from public.disputes
      where id::text = (storage.foldername(name))[1]
    )
  );


-----------------------------------------------------------
-- 6. verification-documents BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Owner and admins view verification docs" on storage.objects;
create policy "Owner and admins view verification docs"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents' and (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      auth.uid() in (
        select id from public.profiles where role = 'admin'
      )
    )
  );

drop policy if exists "Users upload own verification docs" on storage.objects;
create policy "Users upload own verification docs"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Admins delete verification docs" on storage.objects;
create policy "Admins delete verification docs"
  on storage.objects for delete
  using (
    bucket_id = 'verification-documents' and
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );


-----------------------------------------------------------
-- 7. message-attachments BUCKET POLICIES
-----------------------------------------------------------
drop policy if exists "Conversation participants view attachments" on storage.objects;
create policy "Conversation participants view attachments"
  on storage.objects for select
  using (
    bucket_id = 'message-attachments' and
    auth.uid() in (
      select sender_id from public.messages
      where conversation_id::text = (storage.foldername(name))[1]
      union
      select receiver_id from public.messages
      where conversation_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Participants upload message attachments" on storage.objects;
create policy "Participants upload message attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'message-attachments' and
    auth.uid() in (
      select sender_id from public.messages
      where conversation_id::text = (storage.foldername(name))[1]
      union
      select receiver_id from public.messages
      where conversation_id::text = (storage.foldername(name))[1]
    )
  );
