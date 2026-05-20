-- Google Calendar OAuth tokens (one row per consultório / user who connected)
create table google_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  refresh_token text not null,
  calendar_id text default 'primary',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table google_integrations enable row level security;

create policy "Users with profile can manage own google integration"
  on google_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Event ↔ patient links (when title match is ambiguous)
create table google_event_links (
  id uuid primary key default gen_random_uuid(),
  google_event_id text not null unique,
  patient_id uuid not null references patients(id) on delete cascade,
  created_at timestamptz default now()
);

alter table google_event_links enable row level security;

create policy "Authenticated users can manage event links"
  on google_event_links for all
  using (public.has_profile())
  with check (public.has_profile());
