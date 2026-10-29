# Supabase Database and Custom Auth Setup

This project uses Supabase Postgres and a private Supabase Storage bucket for resumes. Application authentication is implemented in Next.js with hashed passwords and HttpOnly cookie sessions; Supabase Auth is not used by the application.

## 1. Apply the migrations

Open the Supabase SQL Editor for the project configured in `.env`, then run these files in order:

1. `supabase/migrations/202610260001_initial_job_board.sql`
2. `supabase/migrations/202610260002_seed_job_data.sql`
3. `supabase/migrations/202610280001_custom_auth.sql`

The first migration creates the application tables, RLS policies, and private resume bucket. The second seeds categories and jobs. The custom-auth migration creates:

- `public.users` with password hashes and verification timestamps
- `public.auth_sessions`
- `public.email_verification_tokens`
- `public.password_reset_tokens`

Run the custom-auth migration before testing registration or login. New custom-auth users are intentionally separate from any old Supabase Auth users.

If the migration file is not available in your Supabase project, run this minimum query first in the SQL Editor:

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  email_verified_at timestamptz,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_idx
  on public.users (lower(email));
```

The minimum query only fixes the immediate missing-table error. The complete migration is still required because registration also needs `profiles`, `email_verification_tokens`, `auth_sessions`, `password_reset_tokens`, and `auth_rate_limits`.

After running the migration, confirm that PostgREST can see the table:

```sql
select to_regclass('public.users') as users_table;
notify pgrst, 'reload schema';
```

If the base migration was already applied, run `supabase/migrations/202610290001_contact_job_title.sql` to add the contact form's `job_title` column, then reload the schema again:

```sql
alter table public.contact_messages
  add column if not exists job_title text not null default '';

notify pgrst, 'reload schema';
```

Until this migration is applied to the connected Supabase project, contact submissions that include a job title and the admin Query Tab will return a safe unavailable message. The migration file in the repository does not change the remote database automatically.

The result must be `public.users`. Then redeploy or restart the application so it uses the same Supabase project and server key.

## 2. Configure transactional email

For testing, use Gmail SMTP with a Gmail App Password. Do not use the normal Gmail account password. Configure these server-only variables in `.env.local` and Vercel:

```env
AUTH_EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASSWORD=your-gmail-app-password
AUTH_EMAIL_FROM=JobHive <your-gmail-address@gmail.com>
```

Keep the App Password in environment variables and never commit it. The Gmail account must have 2-Step Verification enabled before an App Password can be created.

For preview and production, use Resend API after a sending domain has been verified:

```env
AUTH_EMAIL_PROVIDER=resend
MAILTRAP_API_TOKEN=replace-with-mailtrap-token
RESEND_API_KEY=replace-with-resend-api-key
AUTH_EMAIL_FROM=JobHive <no-reply@your-verified-domain.example>
```

Verify the sender domain and configure SPF, DKIM, and DMARC before production sending. The existing Mailtrap API configuration remains supported, but SMTP Sandbox is the recommended local-testing path.

## 3. Configure application and server credentials

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=replace-with-server-only-key
```

`SUPABASE_SECRET_KEY` is used only by server code and must never be exposed or committed. It is required because custom-auth requests do not create a Supabase Auth identity for RLS to use.

## 4. Create an administrator

Register a normal account at `/register`, complete email verification with the OTP, then run this controlled SQL operation:

```sql
update public.users set role = 'admin' where email = 'admin@example.com';
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

Do not expose an admin-registration form. New registrations always receive the `user` role.

## 5. Run the app

```powershell
npm run dev
```

Register, verify the email OTP, log in, request a password reset, and verify that the reset OTP is single-use and expires.

## Security notes

- Passwords are stored as `crypto.scrypt` hashes.
- Session, verification, and reset values are stored only as SHA-256 hashes.
- Session cookies are HttpOnly, SameSite=Lax, and Secure in production.
- Reset and verification codes expire and are limited to five attempts.
- Generic reset responses avoid revealing whether an email is registered.
- Never paste provider or Supabase secrets into source control or chat.
