# Environment variables

Frontend (`.env` at project root for Vite):
- `VITE_API_BASE_URL` – URL of the backend Express API (e.g., http://localhost:8080).
- `VITE_ADMIN_INVITE_CODE` – optional secret required to sign up with role=admin.
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` – optional if you call Supabase directly from the frontend.

Backend (`project-church/backend/.env`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (recommended, used for token validation)
- `PORT` (default 8080)
- `LOG_LEVEL` (default dev)
- `ADMIN_INVITE_CODE` (optional; required to create admin users when set)

Database:
- Apply `supabase/schema.sql` in the Supabase SQL editor to create tables, constraints, triggers, RLS, and seed data.
