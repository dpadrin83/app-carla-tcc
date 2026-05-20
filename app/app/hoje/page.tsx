import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getHojeData, getGreeting } from '@/lib/hoje/queries'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/layout/SectionCard'
import { QuickActions } from '@/components/layout/QuickActions'
import { Calendar, CheckCircle2, AlertTriangle, Clock, ArrowRight, RefreshCw } from 'lucide-react'

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
    <div className="page-shell space-y-10">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        subtitle="O que precisa da sua atenção hoje?"
      >
        <Link href="/app/hoje?refresh=1">
          <Button variant="outline" size="sm" className="rounded-lg gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Atualizar agenda
          </Button>
        </Link>
      </PageHeader>

      {calm && (
        <div className="surface-card flex items-start gap-4 p-5 border-primary/20 bg-primary/[0.04]">
          <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Tudo em dia por aqui.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Você tem {appointmentCount} atendimento{appointmentCount !== 1 ? 's' : ''} hoje.
              Foque na agenda abaixo ou abra uma ficha antes da sessão.
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="section-label mb-3">Acesso rápido</p>
        <QuickActions role="psicologa" />
      </div>

      <SectionCard title="Agenda do dia" icon={Calendar}>
        {agenda.length === 0 ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sem agendamentos hoje. Cadastre sessões na ficha do paciente ou conecte o Google
            Agenda em{' '}
            <Link href="/app/conta/integracoes" className="text-primary font-medium hover:underline">
              Integrações
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {agenda.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="agenda-time">
                    {new Date(ev.start).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{ev.summary}</p>
                    {ev.patientName && (
                      <p className="text-sm text-muted-foreground mt-0.5">{ev.patientName}</p>
                    )}
                  </div>
                </div>
                {ev.patientId ? (
                  <Link
                    href={
                      ev.id.startsWith('db-session-')
                        ? `/app/pacientes/${ev.patientId}`
                        : `/app/pacientes/${ev.patientId}`
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
                  >
                    Abrir ficha 360°
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : (
                  <Link
                    href={`/app/calendario?link=${ev.id}`}
                    className="text-sm text-muted-foreground hover:text-primary shrink-0"
                  >
                    Vincular paciente
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {pendencias.length > 0 && (
        <SectionCard title="Pendências" icon={Clock}>
          <ul className="space-y-2">
            {pendencias.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
                >
                  <span className="text-foreground">{p.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {alertas.length > 0 && (
        <SectionCard title="Alertas" icon={AlertTriangle} variant="alert">
          <ul className="space-y-2">
            {alertas.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="block rounded-lg border border-amber-200/60 bg-card/80 px-4 py-3 text-sm text-amber-950 hover:bg-amber-50/80 transition-colors"
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  )
}
