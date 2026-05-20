/**
 * Popula o consultório com dados fictícios para demonstração.
 * Uso: npm run seed:demo
 * Limpar antes: npm run seed:demo:clear
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const CLEAR = process.env.SEED_DEMO_CLEAR === '1'

if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_EMAIL_SUFFIX = '@demo.espacocarla.dev'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function todayAt(hour, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d
}

function monthBirthday(day) {
  const d = new Date()
  d.setDate(day)
  d.setFullYear(d.getFullYear() - 32)
  return d.toISOString().slice(0, 10)
}

async function findUserByEmail(email) {
  let page = 1
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase())
    if (u) return u.id
    if (data.users.length < 200) break
    page++
  }
  return null
}

async function ensureUser(email, password, fullName, role) {
  let id = await findUserByEmail(email)
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw error
    id = data.user.id
    console.log(`Usuário criado: ${email}`)
  }
  await supabase.from('profiles').upsert({ id, full_name: fullName, role }, { onConflict: 'id' })
  return id
}

async function clearDemoData() {
  const { data: patients } = await supabase
    .from('patients')
    .select('id')
    .like('email', `%${DEMO_EMAIL_SUFFIX}`)

  const ids = patients?.map((p) => p.id) ?? []
  if (!ids.length) {
    console.log('Nenhum dado demo para remover.')
    return
  }

  await supabase.from('financial_entries').delete().in('patient_id', ids)
  await supabase.from('comments').delete().in('patient_id', ids)
  await supabase.from('admin_tasks').delete().in('patient_id', ids)
  await supabase.from('sessions').delete().in('patient_id', ids)
  await supabase.from('attachments').delete().in('patient_id', ids)
  await supabase.from('audit_log').delete().in('patient_id', ids)
  await supabase.from('patients').delete().in('id', ids)
  console.log(`Removidos ${ids.length} pacientes demo.`)
}

const demoPatients = [
  {
    slug: 'ana-silva',
    full_name: 'Ana Silva',
    birth_date: '1992-03-14',
    phone: '(11) 98765-1001',
    emergency_contact_name: 'João Silva',
    emergency_contact_phone: '(11) 98765-1002',
    emergency_contact_relation: 'Cônjuge',
    payment_method: 'PIX',
    session_value: 280,
    case_summary:
      'Ansiedade generalizada e perfeccionismo no trabalho. Início do tratamento TCC há 4 meses. Boa adesão às tarefas entre sessões.',
    current_focus: 'Exposição gradual a situações de avaliação no emprego.',
    medication: 'Sertralina 50mg — psiquiatra Dr. Martins',
    risks_alerts: 'Sem ideação suicida no momento. Monitorar insônia em semanas de pico de stress.',
    active: true,
  },
  {
    slug: 'bruno-costa',
    full_name: 'Bruno Costa',
    birth_date: '1988-07-22',
    phone: '(11) 98765-2001',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relation: null,
    payment_method: 'Cartão',
    session_value: 300,
    case_summary: 'TOC com checagens e dúvidas relacionadas à segurança em casa.',
    current_focus: 'ERP para redução de rituais de checagem da porta.',
    medication: null,
    risks_alerts: 'Contato de emergência pendente — priorizar cadastro.',
    active: true,
  },
  {
    slug: 'diana-oliveira',
    full_name: 'Diana Oliveira',
    birth_date: '1995-11-08',
    phone: '(11) 98765-3001',
    emergency_contact_name: 'Maria Oliveira',
    emergency_contact_phone: '(11) 98765-3002',
    emergency_contact_relation: 'Mãe',
    payment_method: 'PIX',
    session_value: 260,
    case_summary: 'Humor deprimido pós-término de relacionamento. Uso de ativação comportamental.',
    current_focus: 'Retomada de atividades prazerosas e contato social semanal.',
    medication: null,
    risks_alerts: null,
    active: true,
  },
  {
    slug: 'gabriel-santos',
    full_name: 'Gabriel Santos',
    birth_date: '1990-01-30',
    phone: '(11) 98765-4001',
    emergency_contact_name: 'Paula Santos',
    emergency_contact_phone: '(11) 98765-4002',
    emergency_contact_relation: 'Irmã',
    payment_method: 'Transferência',
    session_value: 290,
    case_summary: 'Procrastinação e TDAH em investigação. Estratégias de organização e chunking de tarefas.',
    current_focus: 'Rotina matinal e blocos de foco de 25 minutos.',
    medication: 'Metilfenidato 10mg — ajuste com psiquiatra em 2 semanas',
    risks_alerts: null,
    active: true,
  },
  {
    slug: 'fernanda-rocha',
    full_name: 'Fernanda Rocha',
    birth_date: monthBirthday(12),
    phone: '(11) 98765-5001',
    emergency_contact_name: 'Carlos Rocha',
    emergency_contact_phone: '(11) 98765-5002',
    emergency_contact_relation: 'Pai',
    payment_method: 'PIX',
    session_value: 270,
    case_summary: 'Fobia social em contextos profissionais. Role-play e reestruturação cognitiva.',
    current_focus: 'Exposição a apresentações curtas no trabalho.',
    medication: null,
    risks_alerts: null,
    active: true,
  },
  {
    slug: 'helena-martins',
    full_name: 'Helena Martins',
    birth_date: '1985-05-19',
    phone: '(11) 98765-6001',
    emergency_contact_name: 'Ricardo Martins',
    emergency_contact_phone: '(11) 98765-6002',
    emergency_contact_relation: 'Cônjuge',
    payment_method: 'PIX',
    session_value: 300,
    case_summary: 'Luto recente (pai). Processamento e reativação de rede de apoio.',
    current_focus: 'Validação emocional e rituais de despedida simbólicos.',
    medication: null,
    risks_alerts: 'Choro intenso na última sessão — acompanhar.',
    active: true,
  },
  {
    slug: 'carlos-pereira',
    full_name: 'Carlos Pereira',
    birth_date: '1979-09-03',
    phone: '(11) 98765-7001',
    emergency_contact_name: 'Ana Pereira',
    emergency_contact_phone: '(11) 98765-7002',
    emergency_contact_relation: 'Cônjuge',
    payment_method: 'PIX',
    session_value: 320,
    case_summary: 'Estresse ocupacional e burnout leve. Psicoeducação sobre limites.',
    current_focus: 'Negociação de carga com liderança.',
    medication: null,
    risks_alerts: null,
    active: true,
    lastSessionDaysAgo: 28,
  },
  {
    slug: 'julia-almeida',
    full_name: 'Júlia Almeida',
    birth_date: '1998-12-01',
    phone: '(11) 98765-8001',
    emergency_contact_name: 'Beatriz Almeida',
    emergency_contact_phone: '(11) 98765-8002',
    emergency_contact_relation: 'Mãe',
    payment_method: 'PIX',
    session_value: 250,
    case_summary: 'Ataque de pânico em transporte público. Interocepção e exposição.',
    current_focus: 'Exposição ao metrô em horários de baixa movimentação.',
    medication: null,
    risks_alerts: null,
    active: false,
  },
]

async function insertPatient(p, email) {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: p.full_name,
      birth_date: p.birth_date,
      email,
      phone: p.phone,
      emergency_contact_name: p.emergency_contact_name,
      emergency_contact_phone: p.emergency_contact_phone,
      emergency_contact_relation: p.emergency_contact_relation,
      payment_method: p.payment_method,
      session_value: p.session_value,
      active: p.active,
      case_summary: p.case_summary,
      current_focus: p.current_focus,
      medication: p.medication,
      risks_alerts: p.risks_alerts,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Paciente ${p.full_name}: ${error.message}`)
  return data.id
}

async function insertSession(patientId, { scheduled_at, status, agenda, homework, next_focus, interventions }) {
  const { error } = await supabase.from('sessions').insert({
    patient_id: patientId,
    scheduled_at: scheduled_at.toISOString(),
    occurred_at: status === 'occurred' ? scheduled_at.toISOString() : null,
    status,
    agenda: agenda ?? null,
    interventions: interventions ?? null,
    homework: homework ?? null,
    next_focus: next_focus ?? null,
  })
  if (error) throw new Error(`Sessão: ${error.message}`)
}

async function main() {
  if (CLEAR) {
    await clearDemoData()
    return
  }

  const carlaId = await ensureUser(
    'carla@espacocarlatcc.com',
    'Carla@2026',
    'Carla',
    'psicologa'
  )
  const assistenteId = await ensureUser(
    'assistente@espacocarlatcc.com',
    'Assistente@2026',
    'Mariana (assistente)',
    'assistente'
  )

  console.log('Limpando dados demo anteriores…')
  await clearDemoData()

  const patientIds = {}

  for (const p of demoPatients) {
    const email = `${p.slug}${DEMO_EMAIL_SUFFIX}`
    const id = await insertPatient(p, email)
    patientIds[p.slug] = id
    console.log(`Paciente: ${p.full_name}`)
  }

  const { ana, bruno, diana, gabriel, fernanda, helena, carlos } = {
    ana: patientIds['ana-silva'],
    bruno: patientIds['bruno-costa'],
    diana: patientIds['diana-oliveira'],
    gabriel: patientIds['gabriel-santos'],
    fernanda: patientIds['fernanda-rocha'],
    helena: patientIds['helena-martins'],
    carlos: patientIds['carlos-pereira'],
  }

  // Sessões de hoje (agenda em Hoje)
  await insertSession(ana, {
    scheduled_at: todayAt(9, 0),
    status: 'scheduled',
    next_focus: 'Revisão da exposição na reunião semanal',
  })
  await insertSession(diana, {
    scheduled_at: todayAt(11, 30),
    status: 'scheduled',
    next_focus: 'Plano de ativação para o fim de semana',
  })
  await insertSession(fernanda, {
    scheduled_at: todayAt(15, 0),
    status: 'scheduled',
    next_focus: 'Role-play: feedback de colega',
  })
  await insertSession(helena, {
    scheduled_at: todayAt(17, 0),
    status: 'scheduled',
  })

  // Últimas sessões realizadas (ficha 360)
  await insertSession(ana, {
    scheduled_at: daysAgo(7),
    status: 'occurred',
    agenda: 'Revisão do registro de pensamentos. Exposição imaginada à reunião.',
    interventions: 'RPD, reestruturação de crença "preciso ser perfeita".',
    homework: 'Registro de pensamentos 3x na semana antes da reunião.',
    next_focus: 'Debriefing pós-reunião na próxima sessão.',
  })
  await insertSession(bruno, {
    scheduled_at: daysAgo(3),
    status: 'occurred',
    agenda: 'ERP — exposição à incerteza de ter deixado o fogão ligado.',
    homework: 'Reduzir checagem para no máximo 2 vezes antes de sair.',
    next_focus: 'Aumentar intervalo entre checagens.',
  })
  await insertSession(diana, {
    scheduled_at: daysAgo(14),
    status: 'occurred',
    agenda: 'Ativação comportamental — caminhada no parque.',
    homework: 'Uma atividade prazerosa por dia, mesmo que pequena.',
    next_focus: 'Agendar café com amiga da faculdade.',
  })
  await insertSession(gabriel, {
    scheduled_at: daysAgo(5),
    status: 'occurred',
    agenda: 'Organização da semana com blocos Pomodoro.',
    homework: 'Usar timer de 25 min para relatório do trabalho.',
    next_focus: 'Revisar rotina matinal.',
  })
  await insertSession(helena, {
    scheduled_at: daysAgo(2),
    status: 'occurred',
    agenda: 'Processamento do luto — memórias positivas com o pai.',
    interventions: 'Carta de despedida (não enviar, só exercício).',
    homework: 'Escrever 3 memórias boas por dia.',
    next_focus: 'Compartilhar carta se sentir segura.',
  })
  await insertSession(carlos, {
    scheduled_at: daysAgo(28),
    status: 'occurred',
    agenda: 'Mapeamento de demandas e limites no trabalho.',
    homework: 'Lista de tarefas delegáveis.',
    next_focus: 'Conversa com gestor (adiada).',
  })

  // Sessão ontem sem evolução (pendência)
  await insertSession(bruno, {
    scheduled_at: daysAgo(1),
    status: 'scheduled',
  })

  // Tarefas administrativas
  const tasks = [
    {
      title: 'Emitir NF — Gabriel Santos',
      type: 'nf',
      patient_id: gabriel,
      assigned_to: assistenteId,
      status: 'pending',
      due_date: new Date().toISOString().slice(0, 10),
    },
    {
      title: 'Receita Saúde — Ana Silva',
      type: 'receita_saude',
      patient_id: ana,
      assigned_to: assistenteId,
      status: 'in_progress',
      due_date: new Date().toISOString().slice(0, 10),
    },
    {
      title: 'Confirmar contrato — Bruno Costa',
      type: 'contrato',
      patient_id: bruno,
      assigned_to: assistenteId,
      status: 'pending',
      due_date: null,
    },
    {
      title: 'Lembrete sessão amanhã — Fernanda Rocha',
      type: 'lembrete',
      patient_id: fernanda,
      assigned_to: assistenteId,
      status: 'pending',
      due_date: null,
    },
    {
      title: 'NF emitida — Diana Oliveira',
      type: 'nf',
      patient_id: diana,
      assigned_to: assistenteId,
      status: 'done',
      due_date: daysAgo(0).toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
    },
    {
      title: 'Atualizar cadastro emergência — Bruno',
      type: 'cadastro',
      patient_id: bruno,
      assigned_to: assistenteId,
      status: 'pending',
      due_date: null,
    },
  ]

  for (const t of tasks) {
    const { error } = await supabase.from('admin_tasks').insert({
      ...t,
      created_by: carlaId,
      description: 'Dado fictício para demonstração.',
    })
    if (error) throw error
  }

  // Comentários (pendência na Hoje se não lidos)
  const comments = [
    {
      author_id: assistenteId,
      patient_id: ana,
      content: 'Carla, a Ana pediu confirmação do valor da sessão por e-mail. Pode revisar?',
    },
    {
      author_id: assistenteId,
      patient_id: bruno,
      content: 'Bruno não retornou sobre o contrato. Sugiro ligar na quinta.',
    },
    {
      author_id: carlaId,
      patient_id: helena,
      content: 'Mariana, obrigada por organizar a NF da Diana.',
    },
  ]

  for (const c of comments) {
    const { error } = await supabase.from('comments').insert(c)
    if (error) throw error
  }

  // Financeiro do mês
  const monthStart = new Date()
  monthStart.setDate(1)
  const financial = [
    { patient_id: ana, type: 'entrada', amount: 280, description: 'Sessão 07/05', occurred_at: daysAgo(7).toISOString().slice(0, 10) },
    { patient_id: bruno, type: 'entrada', amount: 300, description: 'Sessão 11/05', occurred_at: daysAgo(3).toISOString().slice(0, 10) },
    { patient_id: diana, type: 'entrada', amount: 260, description: 'Sessão', occurred_at: daysAgo(14).toISOString().slice(0, 10) },
    { patient_id: gabriel, type: 'entrada', amount: 290, description: 'Sessão', occurred_at: daysAgo(5).toISOString().slice(0, 10) },
    { patient_id: null, type: 'saida', amount: 450, description: 'Aluguel sala', occurred_at: monthStart.toISOString().slice(0, 10) },
    { patient_id: null, type: 'saida', amount: 89.9, description: 'Internet', occurred_at: monthStart.toISOString().slice(0, 10) },
  ]

  for (const f of financial) {
    const { error } = await supabase.from('financial_entries').insert(f)
    if (error) throw error
  }

  console.log('')
  console.log('Demo populado com sucesso.')
  console.log('')
  console.log('Login psicóloga: carla@espacocarlatcc.com / Carla@2026')
  console.log('Login assistente: assistente@espacocarlatcc.com / Assistente@2026')
  console.log('')
  console.log('8 pacientes fictícios, sessões de hoje, tarefas, comentários e financeiro.')
  console.log('Remover: npm run seed:demo:clear')
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
