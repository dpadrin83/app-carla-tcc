import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function SessoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  const isPsicologa = profile?.role === 'psicologa'

  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (!patient) return <div>Paciente não encontrado</div>

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('patient_id', id)
    .order('scheduled_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400">Agendada</Badge>
      case 'occurred': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400">Realizada</Badge>
      case 'no_show': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400">Falta</Badge>
      case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400">Cancelada</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href={`/app/pacientes/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para ficha
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sessões</h1>
          <p className="text-muted-foreground">{patient.full_name}</p>
        </div>
        <Link href={`/app/pacientes/${id}/sessoes/nova`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Sessão
          </Button>
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Nenhuma sessão registrada</h3>
            <p className="text-sm text-muted-foreground">
              Registre a primeira sessão deste paciente.
            </p>
          </div>
          <Link href={`/app/pacientes/${id}/sessoes/nova`}>
            <Button variant="outline" className="mt-2">Registrar Sessão</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/app/pacientes/${id}/sessoes/${session.id}`}>
              <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {getStatusBadge(session.status)}
                  </div>
                  {isPsicologa && session.agenda && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {session.agenda}
                    </p>
                  )}
                  {!isPsicologa && (
                    <p className="text-sm text-muted-foreground italic">
                      Conteúdo clínico restrito
                    </p>
                  )}
                </div>
                <div className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalhes →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
