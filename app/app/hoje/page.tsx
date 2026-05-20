import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getHojeData, getGreeting } from '@/lib/hoje/queries'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/layout/SectionCard'
import { QuickActions } from '@/components/layout/QuickActions'

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
  const firstName = fullProfile?.full_name?.split(' ')[0] ?? 'você'

  return (
    <div className="page-shell space-y-7">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        subtitle="O que precisa da sua atenção hoje?"
      >
        <Link href="/app/hoje?refresh=1">
          <Button variant="outline" size="sm">
            Atualizar agenda
          </Button>
        </Link>
      </PageHeader>

      {calm && (
        <p className="text-center text-muted-foreground text-[15px] py-1">
          Tudo em dia. Você tem {appointmentCount} atendimento
          {appointmentCount !== 1 ? 's' : ''} hoje.
        </p>
      )}

      <SectionCard title="Agenda do dia" description="Seus atendimentos de hoje">
        {agenda.length === 0 ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sem agendamentos hoje. Cadastre sessões na ficha do paciente ou conecte o Google
            Agenda em{' '}
            <Link href="/app/conta/integracoes" className="text-primary hover:underline">
              Integrações
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2.5">
            {agenda.map((ev) => (
              <li key={ev.id} className="agenda-row">
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className="agenda-time">
                    {new Date(ev.start).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{ev.summary}</p>
                    {ev.patientName && (
                      <p className="text-sm text-muted-foreground">{ev.patientName}</p>
                    )}
                  </div>
                </div>
                {ev.patientId ? (
                  <Link
                    href={`/app/pacientes/${ev.patientId}`}
                    className="text-sm text-primary hover:underline shrink-0 font-medium"
                  >
                    Ficha 360° →
                  </Link>
                ) : (
                  <Link
                    href={`/app/calendario?link=${ev.id}`}
                    className="text-sm text-muted-foreground hover:text-primary shrink-0"
                  >
                    Vincular
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {pendencias.length > 0 && (
        <SectionCard title="Pendências">
          <ul className="space-y-1.5">
            {pendencias.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className="list-row-link">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {alertas.length > 0 && (
        <SectionCard title="Alertas" variant="alert">
          <ul className="space-y-1.5">
            {alertas.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="list-row-link text-amber-950 hover:bg-amber-100/60"
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <QuickActions role="psicologa" />
    </div>
  )
}
