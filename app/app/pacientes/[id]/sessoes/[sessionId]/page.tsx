import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sessionsTable } from '@/lib/supabase/role-tables'
import { decryptSessionFields } from '@/lib/patients/decrypt'
import { SessionPaymentBanner } from '@/components/SessionPaymentBanner'

export default async function SessaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id, sessionId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPsicologa = profile?.role === 'psicologa'

  await supabase.from('audit_log').insert({
    user_id: user.id,
    patient_id: id,
    action: 'view',
    entity: 'session',
    entity_id: sessionId,
  })

  const sTable = sessionsTable(profile?.role)
  const { data: sessionRaw } = await supabase
    .from(sTable as 'sessions')
    .select('*, patients(full_name, session_value)')
    .eq('id', sessionId)
    .single()

  if (!sessionRaw) return <div>Sessão não encontrada</div>

  const session = await decryptSessionFields(sessionRaw, isPsicologa)

  let showPayment = false
  let paymentAmount = 0
  if (isPsicologa && session.status === 'occurred') {
    const { data: pay } = await supabase
      .from('financial_entries')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()
    paymentAmount = Number((session.patients as { session_value?: number } | null)?.session_value ?? 0)
    showPayment = !pay && paymentAmount > 0
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Agendada
          </Badge>
        )
      case 'occurred':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Realizada
          </Badge>
        )
      case 'no_show':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Falta
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const date = new Date(session.scheduled_at)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/app/pacientes/${id}/sessoes`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para sessões
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Detalhes da Sessão</h1>
          <p className="text-muted-foreground">{session.patients?.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(session.status)}
          {isPsicologa && (
            <Link href={`/app/pacientes/${id}/sessoes/${sessionId}/editar`}>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {date.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPayment && (
        <SessionPaymentBanner sessionId={sessionId} patientId={id} amount={paymentAmount} />
      )}

      {isPsicologa ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Evolução Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Pauta da Sessão</h3>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border">
                  {session.agenda || (
                    <span className="italic text-muted-foreground">Não preenchido</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Intervenções Realizadas
                </h3>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border">
                  {session.interventions || (
                    <span className="italic text-muted-foreground">Não preenchido</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tarefa Combinada</h3>
                  <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border h-full">
                    {session.homework || (
                      <span className="italic text-muted-foreground">Não preenchido</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Foco da Próxima</h3>
                  <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border h-full">
                    {session.next_focus || (
                      <span className="italic text-muted-foreground">Não preenchido</span>
                    )}
                  </div>
                </div>
              </div>
              {session.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações Livres</h3>
                  <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border">
                    {session.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center text-amber-700 dark:text-amber-500">
            Você não tem permissão para visualizar o conteúdo clínico desta sessão.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
