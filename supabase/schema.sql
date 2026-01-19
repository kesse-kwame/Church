-- Supabase / PostgreSQL schema for ChurchSuite admin dashboard
-- Normalized to 3NF: lookup tables separated, no repeating groups.

create extension if not exists "uuid-ossp";

create table if not exists churches (
  id bigserial primary key,
  name text not null,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  timezone text default 'UTC',
  currency text default 'USD',
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link to Supabase auth users; stores role and display name

create table if not exists households (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists members (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  household_id bigint references households(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birthdate date,
  status text not null default 'Active',
  join_date date,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_member_email unique (church_id, email)
);

create index if not exists idx_members_church on members(church_id);
create index if not exists idx_members_status on members(status);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  church_id bigint references churches(id) on delete set null,
  member_id bigint references members(id) on delete set null,
  full_name text,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_church on profiles(church_id);

create table if not exists events (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  title text not null,
  description text,
  event_type text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_church on events(church_id);
create index if not exists idx_events_start_at on events(start_at);

create table if not exists attendance_records (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  member_id bigint not null references members(id) on delete cascade,
  status text not null default 'Present',
  checked_in_at timestamptz not null default now(),
  notes text,
  constraint uq_attendance unique (event_id, member_id)
);

create index if not exists idx_attendance_event on attendance_records(event_id);
create index if not exists idx_attendance_member on attendance_records(member_id);

create table if not exists donations (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  member_id bigint references members(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  method text,
  category text,
  memo text,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_donations_church on donations(church_id);
create index if not exists idx_donations_member on donations(member_id);
create index if not exists idx_donations_received_at on donations(received_at);

create table if not exists expenses (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  payee text not null,
  category text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  memo text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_church on expenses(church_id);
create index if not exists idx_expenses_paid_at on expenses(paid_at);

create table if not exists staff_positions (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_position_per_church unique (church_id, title)
);

create table if not exists staff_assignments (
  id bigserial primary key,
  church_id bigint not null references churches(id) on delete cascade,
  member_id bigint not null references members(id) on delete cascade,
  position_id bigint not null references staff_positions(id) on delete cascade,
  employment_type text,
  salary_amount numeric(12,2),
  salary_currency text default 'USD',
  payment_frequency text,
  start_date date not null,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_assignment unique (position_id, member_id, start_date)
);

create index if not exists idx_staff_assignments_church on staff_assignments(church_id);
create index if not exists idx_staff_assignments_member on staff_assignments(member_id);

-- Optional: trigger to keep updated_at fresh
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_members_updated_at
before update on members
for each row execute procedure set_updated_at();

create trigger trg_events_updated_at
before update on events
for each row execute procedure set_updated_at();

create trigger trg_staff_positions_updated_at
before update on staff_positions
for each row execute procedure set_updated_at();

create trigger trg_staff_assignments_updated_at
before update on staff_assignments
for each row execute procedure set_updated_at();

create trigger trg_profiles_updated_at
before update on profiles
for each row execute procedure set_updated_at();

-- Basic RLS scaffold (tighten as needed)
alter table churches enable row level security;
alter table households enable row level security;
alter table members enable row level security;
alter table events enable row level security;
alter table attendance_records enable row level security;
alter table donations enable row level security;
alter table expenses enable row level security;
alter table staff_positions enable row level security;
alter table staff_assignments enable row level security;
alter table profiles enable row level security;

-- Replace with your auth logic; for now allow service role full access.
create policy "service role all access churches" on churches for all using (true) with check (true);
create policy "service role all access households" on households for all using (true) with check (true);
create policy "service role all access members" on members for all using (true) with check (true);
create policy "service role all access events" on events for all using (true) with check (true);
create policy "service role all access attendance_records" on attendance_records for all using (true) with check (true);
create policy "service role all access donations" on donations for all using (true) with check (true);
create policy "service role all access expenses" on expenses for all using (true) with check (true);
create policy "service role all access staff_positions" on staff_positions for all using (true) with check (true);
create policy "service role all access staff_assignments" on staff_assignments for all using (true) with check (true);
create policy "service role all access profiles" on profiles for all using (true) with check (true);

-- Seed example church (optional; remove in production)
insert into churches (name, phone, email, address_line1, city, state, postal_code, country)
values ('Grace Community Church', '+1 (555) 987-6543', 'info@gracecommunity.com', '123 Church Street', 'New York', 'NY', '10001', 'USA')
on conflict do nothing;
