import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getHojeData, getGreeting } from '@/lib/hoje/queries'
import { Button } from '@/components/ui/button'

export default async function HojePage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'assistente') redirect('/app/tarefas')

  const params = await searchParams
  const { profile: fullProfile, agenda, pendencias, alertas, appointmentCount } =
    await getHojeData(user.id, params.refresh === '1')

  const calm = pendencias.length === 0 && alertas.length === 0

  return (
    
    
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {fullProfile?.full_name?.split(' ')[0] ?? 'você'}
          </h1>
          <p className="text-muted-foreground mt-1">O que precisa da sua atenção hoje?</p>
        </div>
        <Link href="/app/hoje?refresh=1">
          <Button variant="outline" size="sm">Atualizar agenda</Button>
        </Link>
      </div>

      {calm && (
        <p className="text-muted-foreground text-center py-2">
          Tudo em dia. Você só tem {appointmentCount} atendimento{appointmentCount !== 1 ? 's' : ''} hoje.
        </p>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Agenda do dia</h2>
        <div className="bg-card border rounded-xl divide-y">
          {agenda.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">
              Sem agendamentos hoje. Cadastre sessões na ficha do paciente ou conecte o Google
              Agenda (opcional) em Integrações.
            </p>
          ) : (
            agenda.map((ev) => (
              
              <div key={ev.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {ev.summary}
                  </p>
                  {ev.patientName && (
                    <p className="text-sm text-muted-foreground">{ev.patientName}</p>
                  )}
                </div>
                {ev.patientId ? (
                  <Link
                    href={
                      ev.id.startsWith('db-session-')
                        ? `/app/pacientes/${ev.patientId}/sessoes`
                        : `/app/pacientes/${ev.patientId}`
                    }
                    className="text-sm text-primary hover:underline shrink-0"
                  >
                    {ev.id.startsWith('db-session-') ? 'Sessões →' : 'Ficha →'}
                  </Link>
                ) : (
                  <Link
                    href={`/app/calendario?link=${ev.id}`}
                    className="text-sm text-muted-foreground hover:underline shrink-0"
                  >
                    Vincular
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {pendencias.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pendências</h2>
          <div className="bg-card border rounded-xl divide-y">
            {pendencias.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="block p-4 hover:bg-muted/30 transition-colors text-sm"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {alertas.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Alertas</h2>
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl divide-y">
            {alertas.slice(0, 5).map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className="block p-4 hover:bg-amber-50 transition-colors text-sm text-amber-900"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
