-- Gender Reveal RSVP schema
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type attendance_status as enum ('yes', 'no');
exception when duplicate_object then null; end $$;

do $$ begin
  create type team_guess as enum ('boy', 'girl', 'undecided');
exception when duplicate_object then null; end $$;

-- Event details (single row, editable without redeploying)
create table if not exists public.event_settings (
  id              int primary key default 1,
  parent_one      text not null default 'Parent One',
  parent_two      text not null default 'Parent Two',
  event_date      date,
  event_time      time,
  venue_name      text,
  venue_address   text,
  rsvp_deadline   date,
  dress_code      text,
  notes           text,
  updated_at      timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.event_settings (id) values (1)
on conflict (id) do nothing;

-- RSVPs
create table if not exists public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null check (char_length(full_name) between 1 and 120),
  email          text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          text check (char_length(phone) <= 30),
  attending      attendance_status not null,
  guest_count    int not null default 1 check (guest_count between 0 and 10),
  team           team_guess not null default 'undecided',
  dietary_notes  text check (char_length(dietary_notes) <= 500),
  message        text check (char_length(message) <= 1000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- One RSVP per email (case-insensitive)
create unique index if not exists rsvps_email_unique
  on public.rsvps (lower(email));

create index if not exists rsvps_created_at_idx
  on public.rsvps (created_at desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- Stats view for the admin dashboard
create or replace view public.rsvp_stats as
select
  count(*) filter (where attending = 'yes')                         as attending_responses,
  coalesce(sum(guest_count) filter (where attending = 'yes'), 0)    as total_guests,
  count(*) filter (where attending = 'no')                          as declined,
  count(*) filter (where team = 'boy')                              as team_boy,
  count(*) filter (where team = 'girl')                             as team_girl,
  count(*) filter (where team = 'undecided')                        as team_undecided
from public.rsvps;

-- Security: lock tables down. Only the backend (service role) can access them.
alter table public.rsvps enable row level security;
alter table public.event_settings enable row level security;
-- No public policies are created on purpose: the anon key has no access.
-- The backend uses the service role key, which bypasses RLS.
