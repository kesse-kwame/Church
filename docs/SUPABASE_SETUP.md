# Supabase Setup & Migration

1) Create a new Supabase project at https://app.supabase.com
2) In Project → Settings → API copy the `URL` and `anon public key` and set them in your local `.env.local` as:

VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

(Do NOT commit real keys to source control.)

3) Open SQL Editor → run `supabase/migrations/001_create_schema.sql` (paste & execute).

4) (Optional) Run RLS policies in `supabase/policies/rls_policies.sql` once you have set up `profiles` and any initial admin rows. To create an admin user in `profiles`:

```sql
insert into profiles (id, email, is_admin) values ('<auth-uuid>', 'admin@example.com', true);
```

Replace `<auth-uuid>` with the user's `auth.uid()` found in the Supabase Auth dashboard. Policies are examples — review them carefully before enabling in production.


5) (Optional) Deploy Edge Functions in `supabase/functions/*` using Supabase CLI or UI if you need server-only endpoints.

6) Local dev: install dependencies with `npm install` and ensure `.env.local` is present with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

7) If you would like migrations automated, install Supabase CLI and run a migration step or include migrations in CI (example available on request).

Security notes:
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only (do not expose in client code).
- Rotate keys if you ever shared them publicly.
