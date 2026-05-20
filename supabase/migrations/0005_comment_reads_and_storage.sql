-- Comentários lidos (badge discreto)
create table comment_reads (
  comment_id uuid references comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (comment_id, user_id)
);

alter table comment_reads enable row level security;

create policy "Users can manage own comment reads"
  on comment_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket para anexos (configurar policies no painel se necessário)
insert into storage.buckets (id, name, public)
values ('patient-files', 'patient-files', false)
on conflict (id) do nothing;
