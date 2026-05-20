# Espaço Carla TCC — Gestão do Consultório TCC

## Setup local

1. `npm install`
2. Copie `.env.example` → `.env.local` e preencha Supabase + Google.
3. Rode as migrations em `supabase/migrations/` no SQL Editor do Supabase (0001 → 0005).
4. **Usuário de teste (recomendado):** `npm run seed:dev` — cria `carla@atena.dev` / `AtenaDev2026!` com perfil `psicologa`.
   - Ou manualmente: Authentication + linha em `profiles`.
5. Migrations extras (se faltar): cole `supabase/setup-pending-migrations.sql` e depois `supabase/migrations/0006_security_encryption_attachments.sql` no SQL Editor.
6. `npm run dev` → http://localhost:3000/login

**Login é e-mail/senha (Supabase).** Google no `.env` é só para ler a Agenda — pode ficar vazio.

### Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (JWT) |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas server-side (opcional no MVP) |
| `GOOGLE_CLIENT_ID` | OAuth Google Calendar |
| `GOOGLE_CLIENT_SECRET` | OAuth Google Calendar |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/auth/google/callback` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (produção: URL da Vercel) |

## Google Calendar (somente leitura)

1. [Google Cloud Console](https://console.cloud.google.com/) → novo projeto.
2. **APIs & Services** → Enable **Google Calendar API**.
3. **Credentials** → OAuth 2.0 Client ID (Web).
4. Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Escopo usado: `calendar.readonly`
6. No app: **Integrações** → Conectar Google Agenda.

## Import CSV (Consultório Psi)

- Rota: `/app/pacientes/importar`
- Apenas cadastro de pacientes (não importa prontuário).
- Campos mapeáveis: nome*, email, telefone, data de nascimento.
- Mapeamento salvo no `localStorage` do navegador.

## Preview HTML (sem servidor)

Abra `preview/atena-preview.html` no navegador (duplo clique).

## Deploy Vercel

O projeto inclui `vercel.json` com região **gru1** (São Paulo). O layout raiz já define `robots: noindex` (sistema interno).

### Checklist

1. Crie o projeto na [Vercel](https://vercel.com) importando este repositório (framework: Next.js).
2. **Environment variables** (Production + Preview):

   | Variável | Valor em produção |
   |----------|-------------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role (seed/scripts; opcional no runtime) |
   | `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio.vercel.app` |
   | `GOOGLE_CLIENT_ID` | (opcional) OAuth Calendar |
   | `GOOGLE_CLIENT_SECRET` | (opcional) |
   | `GOOGLE_REDIRECT_URI` | `https://seu-dominio.vercel.app/api/auth/google/callback` |

3. No **Google Cloud Console**, adicione o redirect URI de produção (se usar Agenda).
4. No **Supabase** → Authentication → URL Configuration: inclua a URL de produção em **Site URL** e **Redirect URLs**.
5. Deploy: push na branch principal ou `vercel --prod`.
6. Após o deploy, teste login com `carla@atena.dev` (ou usuários reais criados no Auth).

### Teste rápido pós-deploy

- `/login` — logo e formulário
- Login psicóloga → `/app/hoje`
- Login assistente → `/app/tarefas`
- Paciente → ficha → anexos (se migration 0006 aplicada)

## Migrations pendentes no Supabase

Se ainda não rodou após o setup inicial:

- `0004_google_integrations.sql`
- `0005_comment_reads_and_storage.sql`
