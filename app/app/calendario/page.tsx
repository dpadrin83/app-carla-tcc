import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeekEvents, getMonthEvents } from '@/lib/google/events'
import { CalendarClient } from './CalendarClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; refresh?: string; link?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const view = params.view === 'month' ? 'month' : 'week'
  const force = params.refresh === '1'

  const events = view === 'month'
    ? await getMonthEvents(user.id, force)
    : await getWeekEvents(user.id, force)

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('active', true)
    .order('full_name')

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Calendário</h1>
        <div className="flex gap-2">
          <Link href={`/app/calendario?view=${view}&refresh=1`}>
            <Button variant="outline" size="sm">Atualizar agora</Button>
          </Link>
          <Link href={`/app/calendario?view=week`}>
            <Button variant={view === 'week' ? 'default' : 'outline'} size="sm">Semana</Button>
          </Link>
          <Link href={`/app/calendario?view=month`}>
            <Button variant={view === 'month' ? 'default' : 'outline'} size="sm">Mês</Button>
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum evento encontrado.
          <Link href="/app/conta/integracoes" className="block mt-2 text-primary hover:underline">
            Conectar Google Agenda
          </Link>
        </p>
      ) : (
        <CalendarClient
          events={events}
          patients={patients ?? []}
          linkEventId={params.link}
        />
      )}
    </div>
  )
}
