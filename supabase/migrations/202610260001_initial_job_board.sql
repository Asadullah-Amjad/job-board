create type public.app_role as enum ('user', 'admin');
create type public.application_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
create type public.job_type as enum ('Full Time', 'Part Time', 'Contract');
create type public.job_status as enum ('open', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role public.app_role not null default 'user',
  phone text,
  city text,
  skills text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  slug text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  company text not null,
  location text not null,
  type public.job_type not null,
  salary_min integer not null check (salary_min >= 0),
  salary_max integer not null check (salary_max >= salary_min),
  category_slug text not null references public.categories(slug),
  description text not null,
  requirements text not null,
  status public.job_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_name text not null,
  stored_name text not null unique,
  storage_path text not null,
  size_bytes bigint not null check (size_bytes > 0),
  mime_type text not null,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id),
  note text not null default '',
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications(user_id);
create index applications_job_id_idx on public.applications(job_id);
create index resumes_user_id_idx on public.resumes(user_id);
create index jobs_category_slug_idx on public.jobs(category_slug);
create index jobs_status_created_at_idx on public.jobs(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.jobs enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.contact_messages enable row level security;

create policy profiles_read_own_or_admin
on public.profiles for select to authenticated
using ((select auth.uid()) = id or public.is_admin());

create policy profiles_update_own
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (select role from public.profiles where id = (select auth.uid()))
);

create policy categories_public_read
on public.categories for select to anon, authenticated
using (true);

create policy categories_admin_write
on public.categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy jobs_public_read
on public.jobs for select to anon, authenticated
using (status = 'open' or public.is_admin());

create policy jobs_admin_write
on public.jobs for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy resumes_own
on public.resumes for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy applications_user_read
on public.applications for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());

create policy applications_user_create
on public.applications for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy applications_admin_update
on public.applications for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy contact_messages_create
on public.contact_messages for insert to anon, authenticated
with check (true);

create policy contact_messages_admin_read
on public.contact_messages for select to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy resumes_storage_own
on storage.objects for all to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy resumes_storage_admin_read
on storage.objects for select to authenticated
using (bucket_id = 'resumes' and public.is_admin());
