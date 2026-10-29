alter table public.contact_messages
  add column if not exists job_title text not null default '';

notify pgrst, 'reload schema';
