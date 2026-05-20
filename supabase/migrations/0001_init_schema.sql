-- 0001_init_schema.sql

-- Usuários: gerenciados pelo Supabase Auth (auth.users)
-- Profile estende auth.users com role (psicologa | assistente)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('psicologa', 'assistente')),
  created_at timestamptz default now()
);

-- Pacientes
create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  email text,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  payment_method text,
  session_value numeric(10,2),
  active boolean default true,
  case_summary text,                  -- resumo do caso (bloco 1 da ficha 360)
  current_focus text,                 -- próximo foco terapêutico (bloco 7)
  medication text,                    -- medicação atual (bloco 3) — CRIPTOGRAFAR
  risks_alerts text,                  -- riscos/alertas (bloco 6) — CRIPTOGRAFAR
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessões / evoluções
create table sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  scheduled_at timestamptz not null,
  occurred_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'occurred', 'no_show', 'cancelled')),
  google_event_id text,               -- vínculo com o Google Agenda
  agenda text,                        -- pauta da sessão — CRIPTOGRAFAR
  interventions text,                 -- intervenções realizadas — CRIPTOGRAFAR
  homework text,                      -- tarefa combinada (bloco 4 da ficha 360)
  next_focus text,                    -- foco da próxima (bloco 5)
  notes text,                         -- observações livres — CRIPTOGRAFAR
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tarefas administrativas (painel da assistente)
create table admin_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  title text not null,
  description text,
  type text check (type in ('nf', 'receita_saude', 'contrato', 'lembrete', 'cadastro', 'outro')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Comentários internos (chat psicóloga ↔ assistente por paciente ou por tarefa)
create table comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  patient_id uuid references patients(id) on delete cascade,
  task_id uuid references admin_tasks(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Anexos
create table attachments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  uploaded_by uuid references profiles(id),
  file_name text not null,
  file_path text not null,
  file_type text,
  category text check (category in ('contrato', 'documento', 'exame', 'outro')),
  created_at timestamptz default now()
);

-- Financeiro
create table financial_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  type text not null check (type in ('entrada', 'saida')),
  amount numeric(10,2) not null,
  description text,
  occurred_at date not null,
  created_at timestamptz default now()
);

-- Auditoria (LGPD)
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  patient_id uuid references patients(id),
  action text not null,               -- 'view', 'edit', 'delete', 'export'
  entity text not null,               -- 'patient', 'session', 'attachment'
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
