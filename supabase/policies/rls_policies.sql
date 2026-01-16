-- rls_policies.sql
-- Run these in Supabase SQL editor after you have a `profiles` table and have created initial users.

-- Example: create profiles (if using external auth you can sync or use trigger)
create table if not exists profiles (
  id uuid primary key,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on sensitive tables
alter table members enable row level security;
alter table attendance enable row level security;

-- Allow authenticated users to select attendance
create policy "Allow select attendance to authenticated" on attendance
  for select using (auth.role() = 'authenticated');

-- Allow inserts to attendance from authenticated users
create policy "Allow insert attendance to authenticated" on attendance
  for insert with check (auth.role() = 'authenticated');

-- Allow users to select members
create policy "Allow select members to authenticated" on members
  for select using (auth.role() = 'authenticated');

-- Allow admins to insert/update/delete members
create policy "Members: admin full control" on members
  for all using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Example: allow authenticated users to insert their profile row into profiles
create policy "Insert own profile" on profiles for insert with check (auth.uid() = id);

-- Note: Adjust policies to your security model. Use service_role for server-side operations.
