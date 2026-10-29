create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  email_verified_at timestamptz,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_idx on public.users (lower(email));

-- Custom users replace Supabase Auth identities for new accounts.
alter table public.profiles drop constraint if exists profiles_id_fkey;

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_id_idx on public.auth_sessions(user_id);
create index if not exists auth_sessions_expires_at_idx on public.auth_sessions(expires_at);

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_verification_tokens_user_id_idx
  on public.email_verification_tokens(user_id);

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_id_idx
  on public.password_reset_tokens(user_id);

create table if not exists public.auth_rate_limits (
  key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now()
);

create or replace function public.consume_auth_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempts integer;
  started_at timestamptz;
begin
  insert into public.auth_rate_limits (key, attempts, window_started_at)
  values (p_key, 1, now())
  on conflict (key) do update
  set attempts = case
    when now() - public.auth_rate_limits.window_started_at > make_interval(secs => p_window_seconds)
      then 1
    else public.auth_rate_limits.attempts + 1
  end,
  window_started_at = case
    when now() - public.auth_rate_limits.window_started_at > make_interval(secs => p_window_seconds)
      then now()
    else public.auth_rate_limits.window_started_at
  end
  returning attempts, window_started_at into current_attempts, started_at;

  return current_attempts <= p_limit;
end;
$$;

alter table public.users enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.email_verification_tokens enable row level security;
alter table public.password_reset_tokens enable row level security;

create or replace function public.set_custom_auth_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_custom_auth_updated_at();

-- Custom auth tables are accessed only through server-side Supabase credentials.
revoke all on public.users from anon, authenticated;
revoke all on public.auth_sessions from anon, authenticated;
revoke all on public.email_verification_tokens from anon, authenticated;
revoke all on public.password_reset_tokens from anon, authenticated;
revoke all on public.auth_rate_limits from anon, authenticated;
