import { createClient } from '@/lib/supabase/server'
import { fetchEvents, matchPatientByTitle, type CalendarEvent } from '@/lib/google/calendar'
import { getCached, setCached, clearCache } from '@/lib/google/cache'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export type EnrichedEvent = CalendarEvent & {
  patientId?: string
  patientName?: string
}

async function getRefreshToken(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('google_integrations')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()
  return data?.refresh_token ?? null
}

async function enrichEvents(events: CalendarEvent[]): Promise<EnrichedEvent[]> {
  const supabase = await createClient()
  const { data: patients } = await supabase.from('patients').select('id, full_name').eq('active', true)
  const { data: links } = await supabase.from('google_event_links').select('google_event_id, patient_id')

  const linkMap = new Map(links?.map((l) => [l.google_event_id, l.patient_id]) ?? [])

  return events.map((ev) => {
    const linkedId = linkMap.get(ev.id)
    const patient = linkedId
      ? patients?.find((p) => p.id === linkedId)
      : matchPatientByTitle(ev.summary, patients ?? [])

    return {
      ...ev,
      patientId: patient?.id,
      patientName: patient?.full_name,
    }
  })
}

export async function getTodayEvents(userId: string, force = false): Promise<EnrichedEvent[]> {
  const key = `events:today:${userId}`
  if (!force) {
    const cached = getCached<EnrichedEvent[]>(key)
    if (cached) return cached
  }

  const token = await getRefreshToken(userId)
  if (!token) return []

  const now = new Date()
  const events = await fetchEvents(token, startOfDay(now), endOfDay(now))
  const enriched = await enrichEvents(events)
  setCached(key, enriched)
  return enriched
}

export async function getWeekEvents(userId: string, force = false): Promise<EnrichedEvent[]> {
  const key = `events:week:${userId}`
  if (!force) {
    const cached = getCached<EnrichedEvent[]>(key)
    if (cached) return cached
  }

  const token = await getRefreshToken(userId)
  if (!token) return []

  const now = new Date()
  const events = await fetchEvents(token, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))
  const enriched = await enrichEvents(events)
  setCached(key, enriched)
  return enriched
}

export async function getMonthEvents(userId: string, force = false): Promise<EnrichedEvent[]> {
  const key = `events:month:${userId}`
  if (!force) {
    const cached = getCached<EnrichedEvent[]>(key)
    if (cached) return cached
  }

  const token = await getRefreshToken(userId)
  if (!token) return []

  const now = new Date()
  const events = await fetchEvents(token, startOfMonth(now), endOfMonth(now))
  const enriched = await enrichEvents(events)
  setCached(key, enriched)
  return enriched
}

export function invalidateUserCalendarCache(userId: string) {
  clearCache(`events:`)
}
