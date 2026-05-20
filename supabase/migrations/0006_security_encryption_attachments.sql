-- Chave de criptografia (trocar em produção via SQL Editor)
create schema if not exists private;

create table if not exists private.app_config (
  id int primary key default 1 check (id = 1),
  encryption_key text not null default 'atena-dev-key-trocar-em-producao'
);

insert into private.app_config (id, encryption_key)
values (1, 'atena-dev-key-trocar-em-producao')
on conflict (id) do nothing;

revoke all on schema private from public, authenticated, anon;
revoke all on private.app_config from public, authenticated, anon;

-- Criptografia (base64)
create or replace function public.encrypt_field(content text)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  k text;
begin
  if content is null or content = '' then return null; end if;
  select encryption_key into k from private.app_config where id = 1;
  return encode(pgp_sym_encrypt(content, k), 'base64');
end;
$$;

create or replace function public.decrypt_field(content text)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  k text;
begin
  if content is null or content = '' then return null; end if;
  select encryption_key into k from private.app_config where id = 1;
  return pgp_sym_decrypt(decode(content, 'base64'), k);
exception when others then
  return content;
end;
$$;

-- RPC: criar paciente
create or replace function public.create_patient_encrypted(
  p_full_name text,
  p_birth_date date default null,
  p_email text default null,
  p_phone text default null,
  p_emergency_contact_name text default null,
  p_emergency_contact_phone text default null,
  p_emergency_contact_relation text default null,
  p_payment_method text default null,
  p_session_value numeric default null,
  p_case_summary text default null,
  p_current_focus text default null,
  p_medication text default null,
  p_risks_alerts text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.has_profile() then
    raise exception 'Sem perfil';
  end if;

  insert into patients (
    full_name, birth_date, email, phone,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    payment_method, session_value, case_summary, current_focus,
    medication, risks_alerts
  ) values (
    p_full_name, p_birth_date, p_email, p_phone,
    p_emergency_contact_name, p_emergency_contact_phone, p_emergency_contact_relation,
    p_payment_method, p_session_value, p_case_summary, p_current_focus,
    public.encrypt_field(p_medication),
    public.encrypt_field(p_risks_alerts)
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- RPC: atualizar campo sensível do paciente
create or replace function public.update_patient_sensitive_field(
  p_patient_id uuid,
  p_field text,
  p_value text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_psicologa() then
    raise exception 'Acesso negado';
  end if;

  if p_field = 'medication' then
    update patients set medication = public.encrypt_field(p_value), updated_at = now() where id = p_patient_id;
  elsif p_field = 'risks_alerts' then
    update patients set risks_alerts = public.encrypt_field(p_value), updated_at = now() where id = p_patient_id;
  else
    raise exception 'Campo inválido';
  end if;
end;
$$;

-- RPC: inserir sessão com campos clínicos criptografados
create or replace function public.create_session_encrypted(
  p_patient_id uuid,
  p_scheduled_at timestamptz,
  p_status text,
  p_occurred_at timestamptz default null,
  p_agenda text default null,
  p_interventions text default null,
  p_homework text default null,
  p_next_focus text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.has_profile() then
    raise exception 'Sem perfil';
  end if;

  insert into sessions (
    patient_id, scheduled_at, occurred_at, status,
    agenda, interventions, homework, next_focus, notes
  ) values (
    p_patient_id, p_scheduled_at, p_occurred_at, p_status,
    public.encrypt_field(p_agenda),
    public.encrypt_field(p_interventions),
    p_homework,
    p_next_focus,
    public.encrypt_field(p_notes)
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- Views sem campos clínicos (assistente) — security_invoker=false para não herdar RLS bloqueante
create or replace view public.patients_assistente
with (security_invoker = false) as
select
  id, full_name, birth_date, email, phone,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  payment_method, session_value, active,
  case_summary, current_focus,
  created_at, updated_at
from patients;

create or replace view public.sessions_assistente
with (security_invoker = false) as
select
  id, patient_id, scheduled_at, occurred_at, status, google_event_id,
  homework, next_focus, created_at, updated_at
from sessions;

grant select on public.patients_assistente to authenticated;
grant select on public.sessions_assistente to authenticated;

-- RLS: psicóloga lê tabela base; assistente só via views
drop policy if exists "All authenticated users can view patients" on patients;
create policy "Psicologa can view patients" on patients
  for select using (public.is_psicologa());
create policy "Assistente cannot select patients table" on patients
  for select using (false);

drop policy if exists "All authenticated users can view sessions" on sessions;
create policy "Psicologa can view sessions" on sessions
  for select using (public.is_psicologa());
create policy "Assistente cannot select sessions table" on sessions
  for select using (false);

-- Assistente: insert/update pacientes (campos não clínicos) e sessões (sem clínico)
create policy "Assistente can insert patients" on patients
  for insert with check (public.has_profile() and not public.is_psicologa());
create policy "Assistente can update patients non clinical" on patients
  for update using (public.has_profile() and not public.is_psicologa());

-- Storage policies
drop policy if exists "patient_files_select" on storage.objects;
drop policy if exists "patient_files_insert" on storage.objects;
drop policy if exists "patient_files_delete" on storage.objects;

create policy "patient_files_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'patient-files' and public.has_profile());

create policy "patient_files_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'patient-files' and public.has_profile());

create policy "patient_files_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'patient-files' and public.has_profile());

grant execute on function public.decrypt_field(text) to authenticated;
grant execute on function public.create_patient_encrypted(
  text, date, text, text, text, text, text, text, numeric, text, text, text, text
) to authenticated;
grant execute on function public.update_patient_sensitive_field(uuid, text, text) to authenticated;
grant execute on function public.create_session_encrypted(
  uuid, timestamptz, text, timestamptz, text, text, text, text, text
) to authenticated;

-- Impede assistente de alterar colunas clínicas diretamente
create or replace function public.block_assistente_clinical_patient_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_psicologa() then return new; end if;
  if new.medication is distinct from old.medication
     or new.risks_alerts is distinct from old.risks_alerts then
    raise exception 'Campo clínico restrito à psicóloga';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_assistente_patient_clinical on patients;
create trigger trg_block_assistente_patient_clinical
  before update on patients
  for each row execute function public.block_assistente_clinical_patient_update();

create or replace function public.block_assistente_clinical_session_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_psicologa() then return new; end if;
  if new.agenda is distinct from old.agenda
     or new.interventions is distinct from old.interventions
     or new.notes is distinct from old.notes then
    raise exception 'Campo clínico restrito à psicóloga';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_assistente_session_clinical on sessions;
create trigger trg_block_assistente_session_clinical
  before update on sessions
  for each row execute function public.block_assistente_clinical_session_update();
