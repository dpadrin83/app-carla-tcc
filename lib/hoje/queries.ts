import { createClient } from '@/lib/supabase/server'
import { getTodayEvents } from '@/lib/google/events'
import type { EnrichedEvent } from '@/lib/google/events'
import { differenceInDays, endOfDay, startOfDay, subDays } from 'date-fns'

async function getTodaySessionsAgenda(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<EnrichedEvent[]> {
  const now = new Date()
  const { data: rows } = await supabase
    .from('sessions')
    .select('id, scheduled_at, patient_id, status, patients(full_name)')
    .gte('scheduled_at', startOfDay(now).toISOString())
    .lte('scheduled_at', endOfDay(now).toISOString())
    .in('status', ['scheduled', 'occurred'])
    .order('scheduled_at', { ascending: true })

  return (rows ?? []).map((s) => {
    const patient = s.patients as { full_name?: string } | null
    const name = patient?.full_name ?? 'Sessão'
    const start = new Date(s.scheduled_at)
    const end = new Date(start.getTime() + 50 * 60 * 1000)
    return {
      id: `db-session-${s.id}`,
      summary: name,
      start: start.toISOString(),
      end: end.toISOString(),
      patientId: s.patient_id,
      patientName: patient?.full_name,
    }
  })
}

export type Pendencia = {
  id: string
  label: string
  href: string
  urgency: number
}

export type Alerta = {
  id: string
  label: string
  href: string
}

export async function getHojeData(userId: string, forceCalendar = false) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', userId)
    .single()

  let agenda = await getTodayEvents(userId, forceCalendar)
  if (agenda.length === 0) {
    agenda = await getTodaySessionsAgenda(supabase)
  }

  const pendencias: Pendencia[] = []

  const { data: tasks } = await supabase
    .from('admin_tasks')
    .select('id, title, patient_id, due_date, status')
    .eq('assigned_to', userId)
    .in('status', ['pending', 'in_progress'])
    .order('due_date', { ascending: true })
    .limit(5)

  for (const t of tasks ?? []) {
    pendencias.push({
      id: `task-${t.id}`,
      label: t.title,
      href: `/app/tarefas`,
      urgency: t.due_date ? (new Date(t.due_date) < new Date() ? 0 : 1) : 2,
    })
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, patient_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (comments?.length) {
    const { data: reads } = await supabase
      .from('comment_reads')
      .select('comment_id')
      .eq('user_id', userId)

    const readSet = new Set(reads?.map((r) => r.comment_id) ?? [])
    for (const c of comments) {
      if (!readSet.has(c.id)) {
        pendencias.push({
          id: `comment-${c.id}`,
          label: `Comentário da assistente${c.patient_id ? '' : ''}`,
          href: c.patient_id ? `/app/pacientes/${c.patient_id}?tab=comentarios` : `/app/tarefas`,
          urgency: 1,
        })
        if (pendencias.length >= 5) break
      }
    }
  }

  const yesterday = subDays(new Date(), 1)
  const { data: staleSessions } = await supabase
    .from('sessions')
    .select('id, patient_id, scheduled_at, patients(full_name)')
    .eq('status', 'scheduled')
    .lt('scheduled_at', yesterday.toISOString())
    .limit(3)

  for (const s of staleSessions ?? []) {
    const name = (s.patients as { full_name?: string } | null)?.full_name ?? 'Paciente'
    pendencias.push({
      id: `session-${s.id}`,
      label: `Sessão sem evolução — ${name}`,
      href: `/app/pacientes/${s.patient_id}/sessoes/${s.id}`,
      urgency: 0,
    })
  }

  pendencias.sort((a, b) => a.urgency - b.urgency)

  const alertas: Alerta[] = []

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, emergency_contact_name, created_at')
    .eq('active', true)

  for (const p of patients ?? []) {
    if (!p.emergency_contact_name) {
      alertas.push({
        id: `emergency-${p.id}`,
        label: `Contato de emergência pendente — ${p.full_name}`,
        href: `/app/pacientes/${p.id}`,
      })
    }
  }

  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('patient_id, scheduled_at')
    .eq('status', 'occurred')
    .order('scheduled_at', { ascending: false })

  const lastByPatient = new Map<string, string>()
  for (const s of recentSessions ?? []) {
    if (!lastByPatient.has(s.patient_id)) {
      lastByPatient.set(s.patient_id, s.scheduled_at)
    }
  }

  for (const p of patients ?? []) {
    const last = lastByPatient.get(p.id)
    if (!last || differenceInDays(new Date(), new Date(last)) > 21) {
      alertas.push({
        id: `nostalgia-${p.id}`,
        label: `Sem sessão há mais de 3 semanas — ${p.full_name}`,
        href: `/app/pacientes/${p.id}`,
      })
    }
  }

  const { data: nfTasks } = await supabase
    .from('admin_tasks')
    .select('id, title, patient_id, patients(full_name)')
    .eq('type', 'nf')
    .in('status', ['pending', 'in_progress'])

  for (const t of nfTasks ?? []) {
    const name = (t.patients as { full_name?: string } | null)?.full_name
    alertas.push({
      id: `nf-${t.id}`,
      label: `NF pendente${name ? ` — ${name}` : ''}`,
      href: `/app/tarefas`,
    })
  }

  return {
    profile,
    agenda,
    pendencias: pendencias.slice(0, 5),
    alertas,
    appointmentCount: agenda.length,
  }
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
