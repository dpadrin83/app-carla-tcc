-- 0002_enable_rls.sql

alter table profiles enable row level security;
alter table patients enable row level security;
alter table sessions enable row level security;
alter table admin_tasks enable row level security;
alter table comments enable row level security;
alter table attachments enable row level security;
alter table financial_entries enable row level security;
alter table audit_log enable row level security;

-- Helper function to check if user has profile
create or replace function public.has_profile()
returns boolean as $$
begin
  return exists (select 1 from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- Helper function to check if user is psicologa
create or replace function public.is_psicologa()
returns boolean as $$
begin
  return exists (select 1 from profiles where id = auth.uid() and role = 'psicologa');
end;
$$ language plpgsql security definer;

-- Profiles
create policy "Users can view all profiles" on profiles for select using (has_profile());
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Patients
-- Assistente can see patients but we will mask sensitive fields in the application layer or via a view.
create policy "All authenticated users can view patients" on patients for select using (has_profile());
create policy "All authenticated users can insert patients" on patients for insert with check (has_profile());
create policy "All authenticated users can update patients" on patients for update using (has_profile());

-- Sessions
create policy "All authenticated users can view sessions" on sessions for select using (has_profile());
create policy "All authenticated users can insert sessions" on sessions for insert with check (has_profile());
create policy "All authenticated users can update sessions" on sessions for update using (has_profile());

-- Admin Tasks
create policy "All authenticated users can view admin tasks" on admin_tasks for select using (has_profile());
create policy "All authenticated users can insert admin tasks" on admin_tasks for insert with check (has_profile());
create policy "All authenticated users can update admin tasks" on admin_tasks for update using (has_profile());

-- Comments
create policy "All authenticated users can view comments" on comments for select using (has_profile());
create policy "All authenticated users can insert comments" on comments for insert with check (has_profile());

-- Attachments
create policy "All authenticated users can view attachments" on attachments for select using (has_profile());
create policy "All authenticated users can insert attachments" on attachments for insert with check (has_profile());
create policy "All authenticated users can delete attachments" on attachments for delete using (has_profile());

-- Financial Entries
create policy "All authenticated users can view financial entries" on financial_entries for select using (has_profile());
create policy "All authenticated users can insert financial entries" on financial_entries for insert with check (has_profile());
create policy "All authenticated users can update financial entries" on financial_entries for update using (has_profile());

-- Audit Log
-- Only inserts allowed via trigger or server actions. Selects only for psicologa/admin.
create policy "Psicologa can view audit logs" on audit_log for select using (is_psicologa());
create policy "Users can insert audit logs" on audit_log for insert with check (has_profile());

-- Trigger for automatic audit on patients and sessions
create or replace function public.log_audit_event()
returns trigger as $$
begin
  if (tg_op = 'UPDATE') then
    insert into audit_log (user_id, patient_id, action, entity, entity_id)
    values (
      auth.uid(),
      case when tg_table_name = 'patients' then new.id else new.patient_id end,
      'edit',
      tg_table_name,
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger audit_patients_update
  after update on patients
  for each row execute procedure public.log_audit_event();

create trigger audit_sessions_update
  after update on sessions
  for each row execute procedure public.log_audit_event();
