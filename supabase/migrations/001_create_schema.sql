-- 001_create_schema.sql
-- Run this in the Supabase SQL editor or include it as a migration

-- 1. Create extensions
create extension if not exists "uuid-ossp";

-- 2. Families
create table if not exists families (
  id uuid primary key default uuid_generate_v4(),
  family_code text unique not null,
  name text,
  created_at timestamptz default now()
);

-- 3. Members
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  member_code text unique,
  first_name text,
  last_name text,
  email text,
  phone text,
  dob date,
  birthDate date,
  baptismDate date,
  address text,
  gender text,
  family_id uuid references families(id) on delete set null,
  familyId text,
  familyRole text,
  department text,
  group_name text,
  "group" text,
  status text default 'Active',
  joinDate text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_members_member_code on members(member_code);
create index if not exists idx_members_email on members(email);

-- 4. Service types
create table if not exists service_types (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- 5. Groups
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- 6. Departments
create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- 7. Attendance
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  attendance_code text unique,
  member_id uuid references members(id) on delete set null,
  member_name text,
  member_member_code text,
  service_date date,
  service_type text,
  group_name text,
  department text,
  status text check (status in ('Present','Absent','Late')) default 'Present',
  created_at timestamptz default now()
);

create index if not exists idx_attendance_service_date on attendance(service_date);
create index if not exists idx_attendance_member_id on attendance(member_id);

-- 8. keep updated_at
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_members_updated_at
before update on members
for each row execute procedure update_updated_at_column();

-- 9. Seed sample types/groups/departments (safe to run multiple times)
insert into service_types (name) values ('Sunday Service'), ('Midweek Service'), ('Prayer Meeting'), ('Bible Study') on conflict do nothing;
insert into groups (name) values ('Choir'), ('Youth Group'), ('Ushers') on conflict do nothing;
insert into departments (name) values ('Choir'), ('Children Ministry'), ('Ushers'), ('Hospitality') on conflict do nothing;
