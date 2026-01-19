# ChurchSuite Backend (Supabase + Express)

This folder contains a lightweight API layer over Supabase for the admin dashboard.

## Prerequisites
- Node 18+
- A Supabase project with Postgres

## Setup
1) Install packages:
```bash
cd project-church/backend
npm install
```
2) Create `project-church/backend/.env` with the vars from `ENVIRONMENT.md`.
3) Provision database objects by running the SQL in `../supabase/schema.sql` inside the Supabase SQL editor.

## Run
```bash
npm run start
# or for hot reload
npm run dev
```

## API surface
- `GET /health` – connectivity check
- Auth: `POST /auth/signup`, `POST /auth/login`
- Members: `GET/POST/PUT/DELETE /members` (admin only)
- Events: `GET/POST/PUT/DELETE /events` (admin only)
- Attendance: `GET/POST/PUT/DELETE /attendance` (admin only)
- Finance: `GET/POST /finance/donations`, `GET/POST /finance/expenses` (admin only)
- Staff: `GET/POST /staff/positions`, `GET/POST/PUT/DELETE /staff/assignments` (admin only)

Each route expects/returns JSON that matches the Supabase tables defined in `schema.sql`.

## Notes
- The server uses the Supabase service role key, so keep `.env` private.
- Set `ADMIN_INVITE_CODE` in `.env` to gate creation of admin accounts.
- RLS policies in `schema.sql` are permissive for the service role. Add user-context policies before exposing the anon key directly to the front-end.
