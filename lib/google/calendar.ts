import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(state: string) {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

export async function getCalendarClient(refreshToken: string) {
  const client = getOAuth2Client()
  client.setCredentials({ refresh_token: refreshToken })
  return google.calendar({ version: 'v3', auth: client })
}

export type CalendarEvent = {
  id: string
  summary: string
  start: string
  end: string
  htmlLink?: string
}

export async function fetchEvents(
  refreshToken: string,
  timeMin: Date,
  timeMax: Date,
  calendarId = 'primary'
): Promise<CalendarEvent[]> {
  const calendar = await getCalendarClient(refreshToken)
  const res = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  })

  const events: CalendarEvent[] = []

  for (const item of res.data.items ?? []) {
    if (!item.id || !item.summary) continue
    const start = item.start?.dateTime ?? item.start?.date
    const end = item.end?.dateTime ?? item.end?.date
    if (!start || !end) continue

    const startDate = new Date(start)
    const hour = startDate.getHours()
    if (hour < 7 || hour >= 20) continue

    events.push({
      id: item.id,
      summary: item.summary,
      start,
      end,
      htmlLink: item.htmlLink ?? undefined,
    })
  }

  return events
}

export function matchPatientByTitle(
  title: string,
  patients: { id: string; full_name: string }[]
): { id: string; full_name: string } | null {
  const normalized = title.toLowerCase().trim()
  for (const p of patients) {
    const name = p.full_name.toLowerCase()
    if (normalized.includes(name) || name.split(' ')[0] && normalized.includes(name.split(' ')[0])) {
      return p
    }
  }
  return null
}
