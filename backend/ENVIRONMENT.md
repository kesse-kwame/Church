# Backend environment variables

Set these in a `.env` file at `project-church/backend/.env`:

- `SUPABASE_URL` – your Supabase project URL (e.g., https://abc.supabase.co).
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for server-to-server calls.
- `SUPABASE_ANON_KEY` – optional; for front-end direct access when using RLS.
- `PORT` – HTTP port for the Express server (default 8080).
- `LOG_LEVEL` – morgan log format (e.g., `dev`, `combined`).

Never commit your real keys. Use the `.env.example` values when sharing.
