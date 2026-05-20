# Prompts de abertura — Atena

> Cole estes prompts em ordem em sessões do Claude Code dentro da pasta do projeto.
> Sempre comece uma nova sessão com o **Prompt 0** para forçar a leitura do `CONTEXTO.md`.
> Projeto longo (3-4 meses, ~190h MVP). Cada prompt = sessão separada, para não estourar contexto.

---

## Prompt 0 — Abertura de QUALQUER sessão

> Use este prompt como **primeira mensagem** em toda sessão nova do Claude Code neste projeto.

```
Antes de qualquer coisa: leia o arquivo CONTEXTO.md na raiz deste projeto e confirme em uma linha que entendeu o escopo, a estratégia (Caminho C — complemento ao Consultório Psi), a filosofia de design TDAH-friendly e as regras de trabalho.

Importante: este projeto envolve dados clínicos de saúde mental sob LGPD categoria especial. Dados sensíveis nunca vão para logs ou console.

Depois de confirmar, aguarde minha próxima instrução. Não execute nada antes disso.
```

---

## Prompt 1 — Setup inicial

```
Vamos iniciar o setup da Atena.

Tarefas desta sessão (nesta ordem, parando para eu validar entre etapas grandes):

1. Inicializar projeto Next.js 14+ com App Router, TypeScript, Tailwind e ESLint.
2. Instalar e configurar shadcn/ui com tema neutro (slate). Modo claro como padrão.
3. Instalar dependências previstas no CONTEXTO.md seção 6:
   - @supabase/supabase-js
   - @supabase/ssr
   - googleapis (Google Calendar)
   - papaparse + @types/papaparse (CSV)
   - react-hook-form + zod
   - date-fns
   - react-day-picker
   - lucide-react (já vem com shadcn)
4. Criar estrutura de pastas:
   - app/ (rotas)
   - app/(auth)/ (login, signup desabilitado)
   - app/(app)/ (área autenticada — hoje, pacientes, calendario, financeiro, etc.)
   - components/ (UI compartilhada)
   - components/ui/ (shadcn)
   - lib/ (supabase, helpers, encryption)
   - lib/supabase/ (client, server, middleware)
   - lib/google/ (calendar API)
   - lib/csv/ (parsers do Consultório Psi)
   - types/ (tipos TypeScript)
5. Criar .env.example com:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI
6. Criar README.md curto com instruções de setup local.
7. Configurar lang="pt-BR" no layout raiz, fonte Inter, viewport mobile.

Não inicialize git ainda. Não rode `next dev` no final, só confirme que `npm run build` passa.

Quando terminar, me mostre a árvore de pastas e o package.json.
```

---

## Prompt 2 — Schema do banco + RLS + LGPD

```
Vamos configurar o Supabase com toda a estrutura de banco e segurança LGPD.

Premissa: eu já criei o projeto no painel do Supabase e vou colar as variáveis no .env.local.

Tarefas:

1. Crie supabase/migrations/.
2. Migration 0001_init_schema.sql com TODAS as tabelas da seção 8 do CONTEXTO.md:
   - profiles, patients, sessions, admin_tasks, comments, attachments, financial_entries, audit_log
   - Todos os checks, foreign keys, índices apropriados
3. Migration 0002_enable_rls.sql:
   - RLS em todas as tabelas
   - Policies: usuários autenticados com profile no consultório podem ler/escrever
   - Assistente NÃO pode ler campos clínicos sensíveis (medication, risks_alerts, agenda, interventions, notes) — bloqueio via view
   - Auditoria automática via trigger (insert em audit_log a cada SELECT/UPDATE em patients e sessions)
4. Migration 0003_encryption.sql:
   - Habilitar extensão pgcrypto
   - Funções helper: encrypt_field(text) e decrypt_field(text) usando chave do Vault
   - Documentar quais campos são criptografados (medication, risks_alerts, agenda, interventions, notes)
5. Crie lib/supabase/client.ts, server.ts e middleware.ts.
6. Crie middleware.ts na raiz para proteger /app/** com sessão + expirar após 30 min de inatividade.
7. Crie types/database.ts com tipos TypeScript escritos manualmente baseados no schema.

NÃO crie seed nem dados de teste ainda. Eu rodo as migrations manualmente no painel do Supabase.

Quando terminar, me mostre:
- O SQL completo das 3 migrations
- Os arquivos do lib/supabase/
- Uma explicação de 5 linhas de como a auditoria funciona

Pontos de atenção que quero que você me alerte se identificar:
- Riscos de a assistente conseguir ler dados clínicos sensíveis
- Riscos de o audit_log não capturar acessos
- Performance da criptografia em queries frequentes
```

---

## Prompt 3 — Autenticação multi-user (psicóloga + assistente)

```
Implemente autenticação multi-user com perfis distintos.

Requisitos:

1. Rota /login com formulário email + senha (shadcn Form, Input, Button).
2. /signup desabilitado. Em /login, texto: "Acesso restrito ao consultório. Se você esqueceu a senha, contate o admin."
3. Após login, criar/buscar registro em profiles e redirecionar:
   - role 'psicologa' → /app/hoje
   - role 'assistente' → /app/tarefas
4. Logout no header de qualquer página autenticada.
5. Componente <RoleGate role="psicologa"> para esconder áreas que só a psicóloga vê (prontuário clínico completo, ficha 360 com campos sensíveis).
6. Hook useCurrentProfile() para acessar o perfil em client components.
7. Server Actions para login e logout. Tratamento de erro amigável em pt-BR.
8. Página /app/sem-acesso para quando assistente tenta acessar rota só da psicóloga.

Crie usuários de teste manualmente via painel Supabase:
- psicologa@atena.test (role psicologa)
- assistente@atena.test (role assistente)

Quando terminar, me explique em 5 linhas:
- Como o controle de acesso por role funciona (camadas: middleware + RoleGate + RLS)
- Onde está a sessão sendo validada
- Como adicionar uma rota nova restrita a um role específico
```

---

## Prompt 4 — Cadastro de pacientes + Ficha 360°

```
Esta é a feature mais importante do MVP. Capricha.

Telas:

1. /app/pacientes — lista de pacientes ativos com busca por nome:
   - Card por paciente: nome, idade, foto (placeholder), tag de status (em dia, sem sessão há X dias, contato emergência pendente)
   - Filtro: ativos / inativos / todos
   - Botão "Novo paciente"
   - Botão "Importar CSV" (vai pra /app/pacientes/importar — implementamos depois)

2. /app/pacientes/novo — formulário completo:
   - Dados pessoais: nome, data de nascimento, email, telefone
   - Contato de emergência: nome, telefone, parentesco
   - Financeiro: valor da sessão, forma de pagamento
   - Clínico (só psicóloga vê): resumo do caso, foco terapêutico atual, medicação, riscos/alertas
   - Validação com zod, Server Action para salvar
   - Campos clínicos passam por encrypt_field antes de salvar

3. /app/pacientes/[id] — FICHA 360° (a tela mais importante):
   - Layout: header com nome + idade + status + botões de ação
   - Grid 2x4 com os 8 blocos:
     1. Resumo do caso
     2. Última sessão (link pra sessão completa, mostra data + 1 linha resumo)
     3. Medicação atual
     4. Tarefa combinada (puxa de sessions.homework da última sessão)
     5. Pauta sugerida da próxima (puxa de sessions.next_focus da última)
     6. Riscos / alertas
     7. Próximo foco terapêutico
     8. Dados administrativos (contrato status, contato emergência, forma pgto)
   - Cada bloco é editável inline (clica → vira textarea → salva ao perder foco)
   - Tabs no rodapé: Sessões (histórico) | Tarefas administrativas | Anexos | Financeiro | Comentários internos
   - Mobile: blocos empilham em uma coluna, mantendo a ordem dos 8 blocos

4. /app/pacientes/[id]/editar — formulário completo de edição (mesmo do /novo)

Regras TDAH-friendly da ficha 360:
- Espaço em branco generoso entre blocos
- Tipografia legível, contraste alto
- SEM badges piscando, SEM cores agressivas
- Riscos/alertas usa cor de atenção, mas suave (âmbar, não vermelho)
- Bloco vazio mostra placeholder convidativo ("Sem registro ainda — clique para adicionar")

Server Components onde possível. Loading skeleton em cada bloco. Toast de feedback no salvar inline.

Auditoria: toda visualização de paciente registra em audit_log via Server Action.

Quando terminar:
- Suba 3 pacientes de teste
- Me mostre a ficha 360 de um deles
- Me indique os 3 pontos onde você acha que pode ter regressão de UX TDAH (densidade visual, fricção, etc.)
```

---

## Prompt 5 — Sessões e prontuário (evolução)

```
Implemente o módulo de sessões e prontuário clínico.

Telas:

1. /app/pacientes/[id]/sessoes — lista de sessões do paciente (ordenada por data, mais recente em cima):
   - Card: data, status (agendada/realizada/falta/cancelada), 1 linha de resumo da pauta
   - Filtro por status
   - Botão "Nova sessão"

2. /app/pacientes/[id]/sessoes/nova — registrar sessão:
   - Data e hora (default: agora)
   - Status (radio: realizada / falta / cancelada — se status="agendada", redireciona pra agenda)
   - Campos clínicos (criptografados):
     - Pauta da sessão
     - Intervenções realizadas
     - Tarefa combinada (homework)
     - Foco da próxima (next_focus)
     - Observações livres
   - Botão "Salvar e voltar pra ficha do paciente"
   - Botão "Salvar e criar próxima sessão" (cria nova agendada com base no homework)

3. /app/pacientes/[id]/sessoes/[sessionId] — visualizar/editar sessão:
   - Mesmos campos
   - Edição inline ou modo edição completo (você decide o que for mais TDAH-friendly)
   - Histórico de alterações (quem editou e quando — auditoria)

Acesso:
- Psicóloga: tudo
- Assistente: NÃO pode ler campos clínicos. Vê apenas data, status, paciente. Pode mudar status de "agendada" pra "falta" se paciente não comparecer.

UX:
- Templates rápidos de pauta (botões com sugestões: "RPD", "exposição", "psicoeducação")
- Auto-save a cada 3 segundos de inatividade nos textos longos
- Indicador "salvo" / "salvando" discreto no canto

Quando terminar, simule o fluxo completo:
1. Psicóloga abre paciente → vê ficha 360 com última sessão
2. Registra nova sessão
3. Volta pra ficha → os blocos 2 (última sessão), 4 (homework) e 5 (next_focus) atualizaram automaticamente
4. Logs de auditoria foram criados
```

---

## Prompt 6 — Tela "Hoje" + Calendário visual + Google Agenda

```
Implemente as duas telas que a cliente vai usar mais: "Hoje" e calendário visual.

Pré-requisito: configurar OAuth do Google.
1. Documente em README os passos para criar credenciais no Google Cloud Console (escopo: calendar.readonly).
2. Crie /app/conta/integracoes com botão "Conectar Google Agenda" → fluxo OAuth → salva refresh_token no Supabase (tabela google_integrations, criar via migration 0004).

Tela 1: /app/hoje (rota raiz da psicóloga após login)

Pergunta única que responde: "O que precisa da minha atenção hoje?"

Layout:
- Saudação curta com o nome ("Bom dia, [Nome]")
- Bloco 1: Agenda do dia (próximos atendimentos, com link pra ficha 360 do paciente)
- Bloco 2: Pendências priorizadas (max 5 itens, ordenadas por urgência)
  - Tarefa administrativa atribuída a ela
  - Comentário não lido da assistente
  - Sessão sem evolução registrada
- Bloco 3: Alertas (só se houver — caso contrário, omite o bloco)
  - Paciente sem sessão há +21 dias
  - Contato de emergência pendente em paciente novo
  - NF não emitida (cruzar com tarefa admin)

Princípios obrigatórios:
- Se não houver pendência nem alerta, mostre uma frase curta: "Tudo em dia. Você só tem [N] atendimentos hoje."
- Sem números grandes, sem dashboards. Texto + cards simples.
- Mobile-first

Tela 2: /app/calendario

Calendário visual lendo do Google Agenda:
- Views: semana (default) e mês
- Eventos do Google Agenda aparecem como blocos coloridos
- Clicar em um evento que tem paciente vinculado → abre painel lateral com ficha 360 resumida
- Cores: tom suave, coerente com paleta rosa magenta + cinza chumbo
- SEM eventos do Google fora do horário comercial (filtro: pegar só calendário profissional)

Vínculo evento ↔ paciente:
- No MVP, faz por título do evento (regex match com nome do paciente)
- Botão "Vincular ao paciente X" na primeira vez que o sistema encontra um evento não vinculado
- Salva google_event_id na tabela sessions ao vincular

Cache do Google Agenda:
- 5 min de cache no servidor (a cliente não precisa ver mudança instantânea)
- Botão "Atualizar agora" se ela quiser forçar refresh

Quando terminar:
- Conecte sua conta Google de teste
- Mostre a tela "Hoje" de uma psicóloga com 4 atendimentos no dia
- Mostre o calendário semanal funcionando
- Me alerte se a integração com Google estiver frágil em algum ponto
```

---

## Prompt 7 — Painel da assistente + Comunicação interna

```
Implemente as ferramentas da assistente e a comunicação interna.

Tela 1: /app/tarefas (rota raiz da assistente após login)

Painel de tarefas administrativas:
- Colunas/agrupamento: A fazer | Em andamento | Feitas hoje | Feitas esta semana
- Card: título, paciente vinculado (se houver), tipo (NF/Receita Saúde/contrato/etc.), data limite
- Filtro por tipo de tarefa
- Filtro "minhas tarefas" / "todas"
- Botão "Nova tarefa" — abre modal com:
  - Título
  - Tipo (select)
  - Paciente (autocomplete, opcional)
  - Data limite
  - Descrição
  - Atribuir a (default: a mesma pessoa que criou)

A psicóloga também acessa essa tela (botão no menu) para criar tarefas pra assistente.

Tela 2: Tarefas predefinidas / templates

Botões de "criar tarefa rápida" para os tipos recorrentes:
- Emitir NF de [paciente]
- Receita Saúde de [paciente]
- Confirmar sessão de amanhã com [paciente]
- Cadastrar paciente novo: [nome]
- Aniversário do mês: [paciente]

Tela 3: Comunicação interna por paciente

Na ficha 360 do paciente, tab "Comentários internos":
- Thread de mensagens psicóloga ↔ assistente
- Avatar, nome, timestamp
- Markdown simples (negrito, lista)
- Notificação suave (badge discreto, nada de pop-up) quando há comentário não lido
- Marcar como lido ao abrir

Tela 4: Comunicação interna por tarefa

Na visualização de uma admin_task, mesmo padrão de comentários. Discussão sobre a tarefa fica ali, não no WhatsApp.

Permissões:
- Assistente vê tarefas, comentários, dados administrativos do paciente, MAS não vê campos clínicos
- Psicóloga vê tudo

UX:
- Sem pop-ups de notificação. Tudo via badge discreto no menu.
- Ao concluir uma tarefa, animação simples (não chama atenção demais).

Quando terminar:
- Crie 10 tarefas de teste de tipos variados
- Simule um fluxo: psicóloga cria tarefa pra assistente → assistente comenta pedindo info → psicóloga responde → assistente conclui
- Verifique que a assistente NÃO consegue ler campos clínicos por nenhuma via (UI, URL direta, query)
```

---

## Prompt 8 — Importação de CSV do Consultório Psi

```
Implemente o importador de CSV do Consultório Psi.

Premissa: a cliente exporta CSV do Consultório Psi manualmente e sobe na Atena. Não temos API.

Tela: /app/pacientes/importar

Fluxo:
1. Upload do arquivo CSV (drag-and-drop ou seletor)
2. Preview: mostra primeiras 10 linhas em tabela
3. Mapeamento de colunas:
   - Tela com select pra cada coluna do CSV mapear pro campo da Atena
   - Salva o mapeamento pra próxima importação (LocalStorage ou tabela csv_import_mappings)
4. Validação:
   - Linhas inválidas marcadas em vermelho com motivo
   - Linhas duplicadas (já existe paciente com mesmo email/nome) marcadas em amarelo, opção: ignorar / atualizar / criar novo
5. Confirmar importação:
   - Cria registros em patients
   - Mostra progresso (X de Y importados)
   - Relatório final: criados, atualizados, ignorados, erros

Validações:
- Nome obrigatório
- Email se preenchido, deve ser válido
- Telefone normalizado pra formato brasileiro
- Data de nascimento se preenchida, deve ser válida

Tratamento de erro:
- Arquivo corrompido → erro claro
- CSV vazio → erro claro
- Mais de 1000 linhas → avisa que vai demorar, processa em chunks de 50

Não vamos importar prontuário/sessões do Consultório Psi via CSV no MVP. Só cadastro de pacientes. Documentar isso na tela.

Quando terminar:
- Crie um CSV de exemplo (5 pacientes fictícios) e teste
- Documente em README os campos esperados e os limites
- Me indique como o mapeamento de colunas funciona se o CSV vier diferente na próxima vez
```

---

## Prompt 9 — Financeiro básico + Anexos

```
Implemente o controle financeiro básico e o sistema de anexos.

Tela 1: /app/financeiro

Visão mensal:
- Seletor de mês/ano (default: mês atual)
- Total de entradas, total de saídas, saldo
- Lista de movimentações ordenada por data
- Filtro por paciente
- Botão "Nova entrada" / "Nova saída"
- Botão "Exportar CSV" (para conferir com a contadora)

Auto-criação de entrada:
- Quando psicóloga marca sessão como "realizada", aparece um toast "Registrar pagamento de R$ [valor da sessão]?" com botão "Sim, registrei via Pix"
- Cria uma financial_entry vinculada à sessão

Tela 2: Indicadores mensais

Tab "Indicadores" na tela financeiro:
- Número de sessões realizadas no mês
- Número de faltas
- Taxa de adesão (realizadas / agendadas)
- Pacientes ativos
- Pacientes novos no mês

Sem gráficos sofisticados. Números claros, comparação com mês anterior em fonte menor.

Tela 3: Anexos por paciente

Na ficha 360 do paciente, tab "Anexos":
- Upload de arquivos pro Supabase Storage (bucket "patient-files", RLS por paciente)
- Categorias: contrato | documento | exame | outro
- Lista de arquivos com preview (PDF inline, imagens thumbnail)
- Download e exclusão
- Limite por arquivo: 10MB

Permissões:
- Anexos categoria "contrato" e "documento" → psicóloga e assistente
- Anexos categoria "exame" → só psicóloga
- Auditoria: toda visualização/download de anexo registra em audit_log

Quando terminar:
- Suba alguns anexos de teste
- Crie movimentações financeiras de exemplo
- Mostre o mês atual com indicadores
- Verifique RLS dos anexos (assistente NÃO acessa "exame")
```

---

## Prompt 10 — Polimento, acessibilidade e deploy do MVP

```
Última sessão do MVP. Vamos polir e preparar pra produção.

Tarefas:

1. Acessibilidade WCAG AA:
   - Contraste em todos os textos (rodar checker)
   - Labels em todos os inputs
   - Foco visível em elementos interativos
   - aria-labels nos botões só com ícone
   - Navegação por teclado funcional em todos os formulários
   - Skip link no topo

2. Estados vazios e erros:
   - "Nenhum paciente ainda" na /app/pacientes com CTA
   - "Sem agendamentos hoje" na /app/hoje
   - "Sem tarefas pendentes" na /app/tarefas
   - 404 personalizado
   - 500 personalizado com mensagem reconfortante

3. Mobile:
   - Validar layout em 375px
   - Menu hamburguer
   - Ficha 360 empilha bem
   - Calendário mobile usa visualização lista compacta

4. Performance:
   - Validar queries lentas no Supabase (especialmente ficha 360 com 8 blocos)
   - Lazy load de componentes pesados (calendário, importador)
   - Imagens otimizadas via next/image

5. Segurança final:
   - Revisar TODAS as Server Actions: validação de input com zod
   - Revisar RLS: rodar checklist da seção 7 do CONTEXTO.md
   - Confirmar que campos sensíveis estão criptografados
   - Confirmar que sessão expira em 30 min
   - Headers de segurança no next.config.js (CSP, HSTS, X-Frame-Options)

6. Meta tags:
   - title: "Atena"
   - description coerente
   - favicon (placeholder)
   - robots: noindex (sistema interno)

7. Deploy:
   - Documentar em README as variáveis necessárias na Vercel
   - Configurar região: gru1 (São Paulo)
   - NÃO faça deploy. Só prepara. Eu rodo.

8. Checklist final do CONTEXTO.md seção 10 — passe item por item e me diga status de cada.

9. Gere um relatório de entrega:
   - O que ficou pronto (com checkmarks)
   - O que ficou pendente (com motivo)
   - Riscos pra entrega em produção
   - Sugestão de roadmap pra Fase 2
```

---

## Prompts utilitários

### Retomar sessão antiga
```
Leia CONTEXTO.md e me dê um resumo de 5 linhas do que já foi implementado neste projeto olhando o código atual. Liste também o que aparece como pendente em comentários TODO e o que ainda está faltando do escopo MVP. Depois aguarde minha próxima instrução.
```

### Investigar bug
```
Leia CONTEXTO.md. Vou descrever um bug — não corrija ainda, apenas:
1. Liste 3 hipóteses do que pode ser
2. Diga qual investigaria primeiro e por quê
3. Verifique se o bug tem implicação de segurança ou LGPD
4. Aguarde minha confirmação antes de mexer no código

Bug: [descrever]
```

### Refatorar
```
Leia CONTEXTO.md. Quero refatorar [parte do código]. Antes de mexer:
1. Me explique o estado atual em 5 linhas
2. Proponha 2 abordagens diferentes com prós e contras
3. Cheque impacto em RLS, auditoria e criptografia
4. Aguarde minha escolha

Não modifique nada ainda.
```

### Adicionar nova funcionalidade (não prevista no CONTEXTO)
```
Leia CONTEXTO.md. Quero adicionar [funcionalidade]. Antes de implementar:
1. Esta funcionalidade está prevista no CONTEXTO.md? Em qual fase?
2. Se NÃO está prevista, qual impacto no escopo do MVP/Fase 2?
3. Tem implicação de LGPD ou auditoria?
4. Tem implicação de UX TDAH (densidade visual, fricção)?
5. Aguarde minha decisão.

Funcionalidade: [descrever]
```

### Revisar antes de produção
```
Leia CONTEXTO.md. Vamos rodar uma revisão pre-produção. Sem mexer no código ainda, gere:
1. Checklist de itens da seção 7 (LGPD) — status de cada
2. Checklist de itens da seção 10 (critérios de aceite) — status de cada
3. Lista de queries que podem ter problema de performance com 30+ pacientes e 1000+ sessões
4. Lista de pontos onde dados sensíveis poderiam vazar (logs, query strings, headers)
5. Recomendação clara: estamos prontos pra produção ou não?
```
