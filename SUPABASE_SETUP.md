# Supabase Setup

This project uses Supabase Auth, Supabase Postgres, and a private Supabase Storage bucket for resumes.

## 1. Apply the migrations

Open the Supabase SQL Editor for the project configured in `.env`, then run these files in order:

1. `supabase/migrations/202610260001_initial_job_board.sql`
2. `supabase/migrations/202610260002_seed_job_data.sql`

The first migration creates:

- `public.profiles`
- `public.categories`
- `public.jobs`
- `public.resumes`
- `public.applications`
- `public.contact_messages`
- Row-level security policies
- The `resumes` private Storage bucket
- An Auth trigger that creates every normal signup as `user`

The second migration seeds the existing project categories and jobs.

## 2. Enable email confirmation

In Supabase Dashboard:

1. Open **Authentication > Providers > Email**.
2. Enable email/password authentication.
3. Enable **Confirm email**.
4. Leave **Secure email change** enabled.
5. Keep the development SMTP provider enabled for now.

## 3. Configure Auth URLs

In **Authentication > URL Configuration**, set:

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/callback?next=/reset-password`

For production, replace `localhost:3000` with the deployed HTTPS origin and update `NEXT_PUBLIC_APP_URL`.

## 4. Create the admin account

Add these values to `.env.local`, never commit them:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=a-strong-unique-password
ADMIN_NAME=JobHive Admin
```

Run:

```powershell
npm run supabase:admin
```

The script uses `SUPABASE_SECRET_KEY` only in the Node process, confirms the Auth account, and promotes its profile to `admin`. New signups created through `/register` always receive the `user` role.

## 5. Run the app

```powershell
npm run dev
```

Open `http://localhost:3000/register`, register a normal account, confirm it from Supabase's development email, and log in. The admin account can log in at `/login` and is redirected to `/admin`.

## Security notes

- `SUPABASE_SECRET_KEY` must never receive `NEXT_PUBLIC_` prefix.
- Do not expose the secret key in browser code or public repositories.
- RLS prevents normal users from changing their role or reading private files they do not own.
- Password recovery uses Supabase's standard email flow and callback exchange.
- Supabase development email is suitable for local testing only; custom SMTP can be configured later.
