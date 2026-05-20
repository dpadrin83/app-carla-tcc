import { createClient } from '@/lib/supabase/server'
import type { EnrichedEvent } from '@/lib/google/events'
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export async function getSessionsAsEvents(
  view: 'week' | 'month'
): Promise<EnrichedEvent[]> {
  const supabase = await createClient()
  const now = new Date()
  const rangeStart =
    view === 'month'
      ? startOfMonth(now)
      : startOfWeek(now, { weekStartsOn: 1 })
  const rangeEnd =
    view === 'month' ? endOfMonth(now) : endOfWeek(now, { weekStartsOn: 1 })

  const { data: rows } = await supabase
    .from('sessions')
    .select('id, scheduled_at, patient_id, status, patients(full_name)')
    .gte('scheduled_at', rangeStart.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString())
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
