# Database — single-file Postgres schema

`schema.sql` recreates the entire VitalityHub database (tables, RLS, the
`handle_new_user` auth trigger, role helpers, and storage buckets) on any
self-hosted Supabase / Postgres instance.

**Apply on a fresh DB:**
```bash
psql "$DATABASE_URL" -f db/schema.sql
```

**Notes**
- Requires the standard Supabase `auth` and `storage` schemas to already exist.
- Promote a user to admin after they sign up:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('<uuid-from-auth.users>', 'admin');
  ```
- Password reset link expiry (default 20 minutes) is configured in the
  Supabase Auth settings (`OTP expiry` / `password recovery token lifetime`),
  not in this SQL file.
