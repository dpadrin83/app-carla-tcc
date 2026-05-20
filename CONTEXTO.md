# CONTEXTO — Espaço Carla TCC (Gestão do Consultório TCC)

> **LEIA ESTE ARQUIVO ANTES DE QUALQUER AÇÃO NESTE PROJETO.**
> Se você é o Claude Code, confirme a leitura no início da resposta antes de executar qualquer comando.

---

## 1. Identidade do projeto

- **Nome:** Espaço Carla TCC
- **Cliente:** psicóloga clínica TCC, consultório solo, ~30 pacientes ativos, até 6 atendimentos/dia. TDAH autodeclarado.
- **Equipe da cliente:** ela + 1 assistente administrativa
- **Estúdio responsável:** Estúdio 33 (Danilo Padrin)
- **Tipo de produto:** Sistema web multi-user (psicóloga + assistente) — gestão integrada de consultório de psicologia
- **Estratégia adotada:** Caminho C — Híbrido. O Espaço Carla TCC entra como **complemento** ao Consultório Psi (sistema pago que ela já usa). Migração total fica em aberto para Fase 3, baseada em uso real.

---

## 2. Problema que estamos resolvendo

A cliente tem informação espalhada em pelo menos **6 lugares diferentes**: Consultório Psi, Google Agenda, 2 WhatsApps (administrativo + pessoal), planilhas Excel, post-its e memória. Com TDAH + 6 pacientes/dia + intervalos curtos, isso gera:

- Sobrecarga cognitiva
- Ansiedade recorrente (paciente sumido, contato de emergência pendente, NF não emitida)
- Dependência da assistente sem visibilidade clara do status
- WhatsApp administrativo como o maior consumidor de tempo

**O que ela quer (na voz dela):**
> "Uma tela simples com resumo do caso, última sessão, medicação, tarefa combinada, pauta sugerida, riscos/alertas, próximo foco terapêutico. E que me mostre com clareza: 'O que precisa da minha atenção hoje?'"

---

## 3. Filosofia de design (não negociável)

A cliente tem TDAH e foi explícita sobre o que funciona pra ela. **Estas diretrizes valem mais que qualquer "boa prática" genérica de UX:**

1. **Anti-fricção.** Poucas telas. Poucos cliques. Onboarding guiado.
2. **Silêncio por padrão.** Sem pop-ups, sem badges piscando, sem notificações ativas invasivas. Informação está lá quando ela vai procurar.
3. **Baixa densidade visual.** Uma informação importante por bloco. Espaço em branco generoso. Tela cheia paralisa.
4. **Calendário-first.** Visualização principal é calendário visual, não kanban nem lista.
5. **Acolhimento + profissionalismo.** Coerente com o público dela (pacientes em terapia).
6. **Delegação com transparência.** Psicóloga vê o que a assistente fez/não fez sem precisar perguntar.
7. **Critério de sucesso real:** ao final do MVP, a cliente usa **menos** ferramentas que antes, não mais. Se o Espaço Carla TCC virar mais ruído, falhamos.

---

## 4. Escopo por fases

### MVP — Fase 1 (semanas 1-8)

Funcionalidades MUST:

- **Auth multi-user** (psicóloga e assistente, com perfis e permissões distintas)
- **Cadastro completo de pacientes** com todos os campos que o Consultório Psi não cobre
- **Ficha 360° do paciente** com 8 blocos visíveis em uma tela:
  1. Resumo do caso
  2. Última sessão
  3. Medicação
  4. Tarefa combinada (entre sessões)
  5. Pauta sugerida da próxima sessão
  6. Riscos / alertas
  7. Próximo foco terapêutico
  8. Dados administrativos (contrato, contato de emergência, forma de pagamento)
- **Prontuário com evolução por sessão** — campos estruturados: pauta, intervenções, tarefas combinadas, foco da próxima
- **Tela "Hoje"** — pergunta única do produto: *"O que precisa da minha atenção hoje?"*
  - Agenda do dia
  - Pendências priorizadas
  - Alertas básicos
- **Calendário visual** (semana e mês) lendo do Google Agenda via API
- **Painel da assistente** com tarefas administrativas (NFs a emitir, lembretes a enviar, contratos a confirmar, aniversários do mês) com status visual
- **Comunicação interna psicóloga ↔ assistente** dentro do sistema (substitui parte do WhatsApp administrativo) — chat/comentários por paciente
- **Importação inicial via CSV** dos pacientes do Consultório Psi
- **Controle financeiro mensal básico** (entradas por sessão, indicadores)
- **Anexos por paciente** (contratos, documentos)
- **Auditoria de acesso** (quem viu/editou qual prontuário e quando — exigência LGPD)

### Fase 2 (semanas 9-14)

- Lembretes automatizados (WhatsApp Business API ou geração de mensagem pronta para envio manual)
- Gestão completa de contratos com status por etapa
- Assinatura digital eletrônica (provedor a definir: D4Sign, Clicksign ou ZapSign)
- Templates de mensagens para a assistente (boas-vindas, formas de pagamento, política de remarcação, reembolso)
- Alertas inteligentes ("paciente X sem sessão há 3 semanas", "contato de emergência pendente há 30 dias")
- Lembretes internos (emissão de Receita Saúde, fechamento financeiro mensal)

### Fase 3 — pós-entrega (escopo aberto)

- Portal do paciente para tarefas TCC (RPD, registro de pensamento, escala de humor)
- Análise de dados históricos do prontuário com Claude API (RAG para sugerir metas baseadas em evidências)
- Integração com NF municipal e Receita Saúde
- Indicadores clínicos avançados
- **Avaliar migração total do Consultório Psi para o Espaço Carla TCC** (decisão baseada em uso real do MVP/Fase 2)

---

## 5. Estratégia de integração com Consultório Psi (CRÍTICO)

**Status:** Consultório Psi não tem API pública conhecida. Confirmado em pesquisa.

**Estratégia adotada (Caminho C — Híbrido):**

- **Fonte da verdade no MVP:**
  - Agenda → Google Agenda (continua sendo a referência visual)
  - Prontuário → começa migrando do Consultório Psi via CSV, mas a partir do dia 1 o Espaço Carla TCC passa a ser a fonte da verdade clínica para o que for novo
  - Cadastro de paciente → Espaço Carla TCC (mais campos, mais flexibilidade)
  - Financeiro → Espaço Carla TCC (substitui planilha Excel)

- **Sincronização Consultório Psi:**
  - Import único de CSV no início (migração dos 30 pacientes ativos)
  - Sem sincronização automática contínua. A cliente decide se continua mantendo as duas pontas ou se larga o Consultório Psi.

- **Sincronização Google Agenda:**
  - Leitura via Google Calendar API (OAuth)
  - Escrita avaliada para Fase 2 (no MVP, ela continua criando eventos no Google)

**O que NÃO fazemos no MVP:**
- Não escrevemos no Consultório Psi (sem API)
- Não fazemos scraping autenticado (frágil, vai quebrar)
- Não tentamos sincronização bidirecional automática

---

## 6. Stack técnica (não negociável)

- **Framework:** Next.js (App Router) + React + TypeScript
- **Estilo:** Tailwind CSS + shadcn/ui
- **Backend / DB / Auth / Storage:** Supabase (Postgres + Auth + Storage)
- **Hospedagem:** Vercel
- **IDE:** Cursor + Claude Code

**Bibliotecas previstas:**

- `googleapis` — integração com Google Calendar
- `papaparse` — parse de CSV do Consultório Psi
- `react-hook-form` + `zod` — formulários e validação
- `date-fns` + `react-day-picker` (ou similar) — calendário visual
- `lucide-react` — ícones
- Provedor de assinatura digital (D4Sign, Clicksign ou ZapSign) — Fase 2

---

## 7. LGPD e segurança (CRÍTICO)

Dados clínicos são **categoria especial** pela LGPD (Art. 11). Isso não é opcional.

### Exigências obrigatórias do MVP:

1. **RLS no Supabase** em todas as tabelas com dados de paciente — `auth.uid()` em todas as queries
2. **Criptografia em campos sensíveis** (anotações clínicas, observações livres, dados de medicação) usando `pgcrypto`
3. **Auditoria de acesso**: tabela `audit_log` registrando quem (`user_id`), o quê (`patient_id`, `action`), quando (`timestamp`)
4. **Política de retenção** documentada (CFP exige guarda mínima de 5 anos do prontuário)
5. **Termo de consentimento específico** — escopo separado, requer consultor jurídico (alinhar com a cliente)
6. **Backup automático** dos prontuários (Supabase já faz, mas documentar e testar restore)
7. **Sessão expira** após inatividade (30 minutos)
8. **Não logar dados clínicos** em console, em ferramentas de monitoramento ou em cache externo

### Fora do MVP mas obrigatório antes de entrar em produção:

- Termo de privacidade redigido por jurista
- Política de retenção e descarte
- DPA assinado com a cliente
- Definição de DPO (provavelmente a própria cliente, com orientação jurídica)

---

## 8. Modelo de dados (proposta inicial — refinar no dev)

```sql
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

-- RLS: todas as tabelas com dados clínicos filtram por usuários autenticados do consultório
-- (single-tenant no MVP — psicóloga + assistente compartilham acesso, com permissões diferenciadas)
```

> **Decisão pendente:** no MVP é single-tenant (um consultório). Se o Espaço Carla TCC virar SaaS (Fase 3+), repensar para multi-tenant com `clinic_id` em todas as tabelas.

---

## 9. Identidade visual

- **Logo:** já existe, será referência
- **Paleta:** rosa magenta + cinza chumbo (hex codes a confirmar com a cliente)
- **Tom:** acolhimento + segurança + profissionalismo + qualidade + cuidado
- **Tipografia:** legível, sem firulas. Inter ou similar.
- **Acessibilidade WCAG AA obrigatória:** contraste, foco visível, navegação por teclado, labels.

---

## 10. Critérios de aceite do MVP

- [ ] Psicóloga e assistente logam com perfis distintos e veem o que cabe a cada uma
- [ ] Cliente abre o sistema de manhã e em ≤30 segundos sabe o que precisa fazer hoje
- [ ] Cliente abre a ficha de um paciente antes da sessão e vê os 8 blocos em uma tela só, sem rolar muito
- [ ] Calendário visual mostra agenda do Google Agenda corretamente (semana e mês)
- [ ] Assistente abre o painel dela e vê as tarefas administrativas com status
- [ ] Comunicação interna psicóloga ↔ assistente funciona dentro do sistema (por paciente e por tarefa)
- [ ] Import inicial de CSV do Consultório Psi cria os 30 pacientes corretamente
- [ ] Auditoria de acesso registra toda visualização e edição de prontuário
- [ ] Sistema responsivo em mobile (psicóloga consulta entre sessões)
- [ ] Sessão expira após 30 min de inatividade
- [ ] Deploy em produção na Vercel com domínio da cliente

---

## 11. Riscos conhecidos

1. **Sem API do Consultório Psi.** Import via CSV apenas. Cliente já cienciada.
2. **LGPD para dados de saúde mental.** Categoria especial. Exige consultoria jurídica em paralelo (escopo separado do estúdio).
3. **Escopo amplo para 3-4 meses.** Resistir ao impulso de subir Fase 2 no MVP.
4. **Dependência do Google Calendar.** Se a integração quebrar, o calendário visual quebra. Ter fallback (criar evento manual).
5. **Risco de "mais um sistema na pilha".** Critério de sucesso: ela usa menos ferramentas no final, não mais.

---

## 12. Pendências para alinhar com a cliente

- [x] Nome final do produto: **Espaço Carla TCC**
- [ ] Confirmar orçamento e modelo (valor fechado por fase? manutenção mensal?)
- [ ] Domínio e hospedagem
- [ ] Hex codes da paleta + logo em SVG/PNG
- [ ] Email da assistente (para criar conta)
- [ ] LGPD: ela tem termo de privacidade hoje? Tem DPO? (recomendar jurista)
- [ ] Receber export CSV do Consultório Psi para mapear campos
- [ ] Confirmar fluxo de OAuth com Google (qual conta Google? a profissional?)
- [ ] Decidir provedor de assinatura digital para Fase 2

---

## 13. Regras de trabalho neste repositório

1. **Sempre confirme a leitura deste arquivo no início da sessão.**
2. **Dados clínicos não vão para logs, console.log ou ferramentas de monitoramento.** Nunca.
3. **Toda alteração de schema do Supabase** vai por migration versionada — não editar pelo painel manualmente.
4. **Antes de instalar nova dependência**, justifique brevemente. Especialmente bibliotecas de criptografia, calendário e CSV — escolha com cuidado.
5. **Commits em português, no imperativo.** Exemplo: `adiciona ficha 360 do paciente`.
6. **Não rodar `supabase db reset` nem comandos destrutivos sem confirmação explícita do Danilo.**
7. **Não misture este projeto com outros do Estúdio 33** (Briefing Studio, Roteiroteca CNC, App CEIs, etc.).
8. **Decisões de UX TDAH-friendly têm prioridade sobre "padrões de mercado".** Se algo for visualmente denso, repensar — mesmo que seja comum em outros sistemas.
