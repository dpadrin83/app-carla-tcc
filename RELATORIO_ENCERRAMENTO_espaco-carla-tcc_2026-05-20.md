# Relatório de Encerramento — Espaço Carla TCC

**Data do relatório:** 20/05/2026  
**Elaborado por:** análise automatizada do repositório + dados a confirmar com Danilo Padrin (Estúdio 33)  
**Repositório:** `app-carla-tcc` · produção: https://app-carla-tcc.vercel.app

---

## 1. Sumário do projeto

**Nome:** Espaço Carla TCC — Gestão do Consultório TCC  

**Descrição:** Sistema web interno para uma psicóloga clínica (TCC) e sua assistente administrativa. Centraliza cadastro de pacientes, ficha clínica 360°, prontuário por sessão, agenda, tarefas administrativas, financeiro básico e comunicação interna — com foco em baixa fricção e baixa densidade visual (perfil TDAH da cliente).

**Problema que resolve:** Informação espalhada entre Consultório Psi, Google Agenda, WhatsApp, planilhas e anotações. O produto responde à pergunta *“O que precisa da minha atenção hoje?”* e oferece uma ficha única por paciente.

**Usuários / escala:** 1 psicóloga + 1 assistente; ~30 pacientes ativos; até ~6 atendimentos/dia (contexto do `CONTEXTO.md`).

**Status final:** **MVP em produção** (Vercel + Supabase). Fase 2 (WhatsApp automatizado, contratos, assinatura digital) **não implementada**. Google Calendar: integração OAuth leitura implementada; uso opcional conforme variáveis de ambiente.

---

## 2. Stack e arquitetura

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 16.2 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide |
| **Backend** | Next.js Server Components + Server Actions (`'use server'`) |
| **Banco** | Supabase (PostgreSQL) + Supabase Auth |
| **Hospedagem** | Vercel (região `gru1` — São Paulo) |
| **Autenticação** | E-mail/senha (Supabase Auth), perfis `psicologa` \| `assistente` |
| **Armazenamento** | Supabase Storage (anexos) |
| **Integrações** | Google Calendar API (OAuth, leitura); export financeiro (`/api/financeiro/export`) |

**Padrões arquiteturais observados no código:**

- App Router com rotas protegidas em `/app/*` e middleware de sessão Supabase
- **RLS** (Row Level Security) em tabelas sensíveis (`0002_enable_rls.sql` + correções em `0007`)
- **Criptografia** de campos clínicos sensíveis (`0003`, `0006` — views/tabelas por papel)
- Server Actions para mutações (pacientes, sessões, tarefas, financeiro, comentários, anexos)
- Fallback de agenda: eventos do Google **ou** sessões cadastradas no banco (`lib/calendar/db-sessions.ts`)
- Preview estático HTML (`preview/atena-preview.html`) para validação visual sem servidor
- Scripts operacionais: seed dev/demo, correção de usuário, SQL manual para Auth/RLS

---

## 3. Inventário do que foi entregue

*Números levantados em 20/05/2026 a partir do repositório `main` (commit `2c4aba8`).*

### Código

| Métrica | Quantidade |
|---------|------------|
| Arquivos TS/TSX/CSS/SQL/MJS (excl. `node_modules`, `.next`) | **102** |
| Linhas TS/TSX (`app` + `components` + `lib`) | **~6.692** |
| Linhas SQL (`supabase/`) | **~838** |
| Linhas scripts (`scripts/*.mjs`) | **~665** |
| CSS principal (`app/globals.css`) | **184** |
| **Total linhas código próprio (aprox.)** | **~8.200** |
| Dependências npm (produção) | 18 pacotes principais |
| Commits Git (desenvolvimento do produto) | **8** (7 funcionais + scaffold Next) |

*Libs geradas (shadcn/ui, node_modules) não entram na contagem de código próprio.*

### Interface

| Métrica | Quantidade |
|---------|------------|
| **Rotas/páginas** (`page.tsx`) | **18** |
| **Componentes** (`components/`, excl. ui base) | **16** |
| **Componentes UI base** (shadcn) | **11** |
| **Módulos `lib/`** | **13** arquivos |

### Rotas implementadas

| Rota | Função |
|------|--------|
| `/login` | Autenticação |
| `/app/hoje` | Dashboard “O que precisa da minha atenção hoje?” |
| `/app/calendario` | Calendário semana/mês |
| `/app/pacientes` | Lista com busca e filtros |
| `/app/pacientes/novo` | Cadastro |
| `/app/pacientes/importar` | Importação CSV (Consultório Psi) |
| `/app/pacientes/[id]` | Ficha 360° + abas |
| `/app/pacientes/[id]/sessoes` | Lista de sessões |
| `/app/pacientes/[id]/sessoes/nova` | Nova sessão |
| `/app/pacientes/[id]/sessoes/[sessionId]` | Detalhe da sessão |
| `/app/pacientes/[id]/sessoes/[sessionId]/editar` | Editar sessão |
| `/app/tarefas` | Painel administrativo (assistente/psicóloga) |
| `/app/financeiro` | Lançamentos e indicadores |
| `/app/conta/integracoes` | OAuth Google Agenda |
| `/app/auditoria` | Log LGPD (somente psicóloga) |
| `/app/perfil-pendente` | Estado sem perfil configurado |
| `/app/sem-acesso` | Bloqueio de papel |

### API routes

| Endpoint | Função |
|----------|--------|
| `/api/auth/google` | Início OAuth Google |
| `/api/auth/google/callback` | Callback OAuth |
| `/api/financeiro/export` | Exportação financeira |

### Server Actions (9 arquivos)

- Login, pacientes, sessões, anexos, importar CSV, tarefas, comentários, calendário, financeiro

### Banco de dados

**Migrations:** 7 arquivos (`0001` … `0007`)

| Tabela | Relação principal |
|--------|-------------------|
| `profiles` | Extensão de `auth.users` (papel) |
| `patients` | Cadastro + campos ficha 360° |
| `sessions` | Prontuário / evolução por sessão |
| `admin_tasks` | Tarefas da assistente |
| `comments` | Comunicação interna por paciente/tarefa |
| `attachments` | Anexos por paciente |
| `financial_entries` | Financeiro |
| `audit_log` | Auditoria LGPD |
| `google_integrations` | Tokens OAuth |
| `google_event_links` | Vínculo evento ↔ paciente |
| `comment_reads` | Leitura de comentários |

### Funcionalidades-chave (confirmadas no código)

| Funcionalidade | Status |
|----------------|--------|
| Login multi-perfil (psicóloga / assistente) | ✅ |
| Tela **Hoje** (agenda, pendências, alertas) | ✅ |
| **Ficha 360°** (8 blocos + abas sessões/comentários/anexos) | ✅ |
| Prontuário por sessão (criar, ver, editar) | ✅ |
| Lista de pacientes (busca, filtros, tags de status) | ✅ |
| Calendário visual semana/mês | ✅ |
| Google Calendar (leitura, opcional) | ✅ |
| Painel de tarefas (tipos NF, contrato, lembrete, etc.) | ✅ |
| Comentários internos por paciente | ✅ |
| Anexos por paciente | ✅ |
| Financeiro mensal + export | ✅ |
| Importação CSV pacientes | ✅ |
| Auditoria de acesso | ✅ |
| Criptografia campos sensíveis + RLS | ✅ (migrations; requer apply no Supabase) |
| Onboarding guiado (banner) | ✅ |
| Seed dados demo / scripts operação | ✅ |
| Deploy produção Vercel | ✅ |

### Fora do escopo MVP (não encontrado no código)

- WhatsApp Business API / lembretes automáticos  
- Assinatura digital (D4Sign, Clicksign, etc.)  
- Gestão completa de contratos por etapa  
- Portal do paciente  
- Integração NF / Receita Saúde  
- Sincronização com Consultório Psi (apenas import CSV manual)

---

## 4. Tempo real gasto com IA

> **Seção incompleta — depende dos dados do Danilo.** Valores inferidos do Git abaixo.

| Métrica | Valor inferido (Git) | Status |
|---------|----------------------|--------|
| **Primeiro commit** | 19/05/2026 16:56 | Confirmado |
| **Último commit** | 20/05/2026 07:38 | Confirmado |
| **Dias corridos** | **2 dias** (19 e 20/05) | Confirmado |
| **Janela ativa de commits** | ~15 horas (noite 19/05 → manhã 20/05) | Aproximado |
| **Horas efetivas de trabalho** | *a confirmar* | Pendente |
| **Custo Claude Max** | *a confirmar* | Pendente |
| **Custo Supabase** | *a confirmar* (Free vs Pro) | Pendente |
| **Custo Vercel / domínio** | *a confirmar* | Pendente |
| **Total IA + infra** | **R$ ___** | Pendente |

### Histórico de commits (referência)

```
074a701 — MVP consultório (19/05 ~23:56)
181cd80 — Polish MVP sem APIs externas obrigatórias
555283c — UI/UX TDAH-friendly
0b4eb3f — Seed dados fictícios
10a57d0 — Refino visual preview
bf555ff — Menu lateral + cards modernos
2c4aba8 — Logo transparente no menu
```

---

## 5. Estimativa equipe freelancer/PJ tradicional (Brasil, 2026)

*Faixas de mercado PJ para entrega equivalente ao **MVP em produção** descrito na seção 3 — não inclui Fase 2 do `CONTEXTO.md`.*

### Fase 1 — Descoberta e UX (1–2 semanas)

| Item | Profissional | Horas (faixa) | Custo (faixa) |
|------|--------------|---------------|---------------|
| Entrevista, jornada, requisitos, wireframes baixa fidelidade | UX/Product Designer | 32–60 h | R$ 4.800 – R$ 15.000 |
| Priorização MVP, critérios de aceite | PM (parcial) | 16–24 h | R$ 2.400 – R$ 6.000 |

**Subtotal Fase 1:** R$ **7.200 – R$ 21.000** · **1–2 semanas**

---

### Fase 2 — Design de interface (1–2 semanas)

| Item | Profissional | Horas (faixa) | Custo (faixa) |
|------|--------------|---------------|---------------|
| UI kit, telas principais (Hoje, Ficha, Calendário, Tarefas), estados vazios/erro | UI Designer | 48–80 h | R$ 5.760 – R$ 16.000 |
| Acessibilidade e revisão TDAH-friendly | UX (revisão) | 8–16 h | R$ 1.200 – R$ 4.000 |

**Subtotal Fase 2:** R$ **6.960 – R$ 20.000** · **1–2 semanas** (pode sobrepor parcialmente à Fase 1)

---

### Fase 3 — Desenvolvimento (4–7 semanas)

| Item | Profissional | Horas (faixa) | Custo (faixa) |
|------|--------------|---------------|---------------|
| Frontend (18 telas, componentes, formulários, calendário) | Dev Frontend Pleno/Sênior | 120–180 h | R$ 14.400 – R$ 36.000 |
| Backend (schema, RLS, criptografia, server actions) | Dev Backend Pleno/Sênior | 80–120 h | R$ 10.400 – R$ 26.400 |
| Integração Google Calendar + storage + export | Dev Fullstack | 24–40 h | R$ 3.600 – R$ 10.000 |
| Auth, perfis, permissões assistente/psicóloga | Dev Backend | 24–32 h | R$ 3.120 – R$ 7.040 |

**Subtotal Fase 3:** R$ **31.520 – R$ 79.440** · **4–7 semanas** (1 fullstack sênior ≈ 6–8 semanas solo; 2 devs ≈ 4–5 semanas)

---

### Fase 4 — QA e deploy (1–2 semanas)

| Item | Profissional | Horas (faixa) | Custo (faixa) |
|------|--------------|---------------|---------------|
| Testes funcionais, regressão, LGPD básico | QA | 40–64 h | R$ 3.200 – R$ 8.320 |
| Pipeline Vercel, envs, Supabase prod, documentação deploy | DevOps | 16–32 h | R$ 2.400 – R$ 8.000 |

**Subtotal Fase 4:** R$ **5.600 – R$ 16.320** · **1–2 semanas**

---

### Fase 5 — Gestão (15–20% do esforço total)

| Item | Profissional | Horas (faixa) | Custo (faixa) |
|------|--------------|---------------|---------------|
| Coordenação, ritos, revisão, alinhamento cliente | Tech Lead / PM | 50–80 h | R$ 7.500 – R$ 20.000 |

**Subtotal Fase 5:** R$ **7.500 – R$ 20.000**

---

### Consolidado equipe tradicional

| | Mínimo | Médio | Máximo |
|---|--------|-------|--------|
| **Horas totais** | ~410 h | ~550 h | ~700 h |
| **Custo total PJ** | **R$ 58.780** | **R$ 95.000** | **R$ 156.760** |
| **Tempo corrido (calendário)** | **8 semanas** | **10 semanas** | **14 semanas** |
| **Profissionais típicos** | 3–4 (UX, UI, 1–2 devs, QA parcial) | 4–5 | 5–6 |

*Premissas: paralelismo realista (design antes/durante dev), sem retrabalho grande de escopo, cliente disponível para validações.*

---

## 6. Comparativo final

| Métrica | Com IA (real) | Equipe PJ tradicional |
|---------|---------------|------------------------|
| Tempo corrido | **2 dias** (Git) — horas efetivas *a confirmar* | **8–14 semanas** |
| Horas de trabalho | *a confirmar* | **410–700 h** |
| Custo total | *a confirmar* (ferramentas + seu tempo) | **R$ 59k – R$ 157k** |
| Profissionais envolvidos | **1 (Danilo + IA)** | **3–6** |

*Linha “Com IA” será preenchida após respostas da seção 4.*

---

## 7. ROI e economia gerada

> **Cálculo preliminar** — substituir custo IA real quando informado.

| Indicador | Estimativa preliminar |
|-----------|------------------------|
| Economia vs. PJ mínimo (R$ 58.780) | **R$ 58.780 − custo IA** |
| Economia vs. PJ médio (R$ 95.000) | **R$ 95.000 − custo IA** |
| Economia vs. PJ máximo (R$ 156.760) | **R$ 156.760 − custo IA** |
| Velocidade (calendário) | **~28× a 49×** mais rápido (2 dias vs. 8–14 semanas) *— métrica de calendário, não de horas humanas equivalentes* |
| Custo | *multiplicador a calcular após custo IA* |

### O que a IA fez bem (evidência no projeto)

- Entrega fullstack integrada (Next + Supabase + deploy) em janela de **2 dias** de calendário
- Volume consistente: **~8.200 LOC** próprias + **7 migrations** + **18 telas**
- Iteração rápida de UI (vários commits de polish visual no mesmo dia)
- Scripts operacionais (seed, fix usuário, SQL RLS) reduzindo trabalho manual

### Onde houve intervenção humana necessária

- Definição de produto e restrições TDAH (`CONTEXTO.md`, briefing Estúdio 33)
- Configuração Supabase/Vercel, variáveis de ambiente, usuários reais
- Correções de Auth/RLS via SQL manual quando o fluxo automático falhou
- Validação visual com a cliente; deploy explícito na Vercel
- Logo: tratamento de fundo branco (asset processado)

### Riscos / dívida técnica conhecida

- Migrations e RLS dependem de execução correta no painel Supabase (erros relatados em sessões anteriores)
- Google Calendar opcional — sem OAuth configurado, calendário usa fallback do banco
- Fase 2 inteira ainda por construir
- Testes automatizados (e2e/unit) **não identificados** no repositório
- Estimativas de mercado não substituem proposta comercial fechada

---

## 8. Notas finais

### Limitações desta análise

- Custos de ferramentas e **horas efetivas** do Danilo não foram informados — seção 4 e ROI incompletos.
- Faixas PJ são referências de mercado 2026, não orçamento formal.
- Contagem de linhas inclui comentários e strings; não mede complexidade ciclomática.

### O que não foi contabilizado

- Tempo de briefing, reuniões com a cliente, suporte pós-deploy
- Custo de oportunidade / aprendizado de stack
- Design de logo/identidade visual (asset existente)
- Horas de retrabalho não registradas em commit

### Recomendações para o próximo projeto

1. Registrar **horas por sessão** desde o dia 1 (planilha simples).
2. Manter **testes críticos** (login, RLS, criptografia) antes de cada deploy.
3. Separar repositório de **scripts SQL operacionais** com checklist de apply em produção.
4. Para Fase 2, orçar integrações externas (WhatsApp, assinatura) como **mini-projetos** com API keys e homologação.

---

## Pendência — dados solicitados ao Danilo

Para fechar as seções 4, 6 e 7, informe:

1. **Data de início e fim** oficiais do projeto (se diferente do Git: 19–20/05/2026).
2. **Horas médias por dia** e **total de horas** estimadas nas sessões com IA.
3. **Custos no período:** Claude Max (R$/mês × meses), Supabase (plano), Vercel, domínio, outros.
4. **Trabalho humano além da IA:** design externo, consultoria jurídica/LGPD, revisão da cliente, etc.

*Após resposta, atualizar este arquivo e recalcular ROI.*

---

*Relatório gerado com base no estado do repositório em 20/05/2026.*
