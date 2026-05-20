-- Cole no SQL Editor do Supabase se ainda não rodou 0004, 0005 e 0006.
-- Ordem: este arquivo (0004+0005) depois migrations/0006_security_encryption_attachments.sql
-- Arquivos originais: migrations/0004_google_integrations.sql e 0005_comment_reads_and_storage.sql

-- === 0004 ===
create table if not exists google_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  refresh_token text not null,
  calendar_id text default 'primary',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table google_integrations enable row level security;

drop policy if exists "Users with profile can manage own google integration" on google_integrations;
create policy "Users with profile can manage own google integration"
  on google_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists google_event_links (
  id uuid primary key default gen_random_uuid(),
  google_event_id text not null unique,
  patient_id uuid not null references patients(id) on delete cascade,
  created_at timestamptz default now()
);

alter table google_event_links enable row level security;

drop policy if exists "Authenticated users can manage event links" on google_event_links;
create policy "Authenticated users can manage event links"
  on google_event_links for all
  using (public.has_profile())
  with check (public.has_profile());

-- === 0005 ===
create table if not exists comment_reads (
  comment_id uuid references comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (comment_id, user_id)
);

alter table comment_reads enable row level security;

drop policy if exists "Users can manage own comment reads" on comment_reads;
create policy "Users can manage own comment reads"
  on comment_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('patient-files', 'patient-files', false)
on conflict (id) do nothing;
