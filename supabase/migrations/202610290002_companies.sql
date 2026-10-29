create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.companies (name)
select distinct trim(company) from public.jobs
where trim(company) <> ''
on conflict (name) do nothing;

notify pgrst, 'reload schema';
