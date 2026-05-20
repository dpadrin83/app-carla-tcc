import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, MessageSquare, Paperclip, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditableBlock } from './EditableBlock'
import { logPatientView } from '../actions'
import { CommentsThread } from '@/components/CommentsThread'
import { Button } from '@/components/ui/button'
import { patientsTable, sessionsTable } from '@/lib/supabase/role-tables'
import { decryptPatientFields, decryptSessionFields } from '@/lib/patients/decrypt'
import { AttachmentsPanel } from '@/components/AttachmentsPanel'
import { PatientAvatar } from '@/components/layout/PatientAvatar'

export default async function PacienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Log audit
  await logPatientView(id)

  const pTable = patientsTable(profile?.role)
  const sTable = sessionsTable(profile?.role)

  const { data: patientRaw, error } = await supabase
    .from(pTable as 'patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !patientRaw) {
    return <div>Paciente não encontrado</div>
  }

  const patient = await decryptPatientFields(patientRaw, isPsicologa)

  const { data: lastSessionRaw } = await supabase
    .from(sTable as 'sessions')
    .select('*')
    .eq('patient_id', id)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .single()

  const lastSession = lastSessionRaw
    ? await decryptSessionFields(lastSessionRaw, isPsicologa)
    : null

  const { data: attachmentRows } = await supabase
    .from('attachments')
    .select('id, file_name, file_type, category, created_at')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(full_name)')
    .eq('patient_id', id)
    .order('created_at', { ascending: true })

  const { data: patientTasks } = await supabase
    .from('admin_tasks')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="surface-card p-6 md:p-8">
        <Link href="/app/pacientes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para pacientes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <PatientAvatar name={patient.full_name} size="lg" />
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{patient.full_name}</h1>
              <Badge variant={patient.active ? 'default' : 'secondary'} className="rounded-full">
                {patient.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Ficha 360° — visão antes da sessão</p>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {patient.phone && <span>{patient.phone}</span>}
              {patient.email && <span>{patient.email}</span>}
            </div>
          </div>
          {isPsicologa && (
            <div className="sm:ml-auto flex flex-wrap gap-2">
              <Link href={`/app/pacientes/${id}/sessoes/nova`}>
                <Button size="sm" className="rounded-lg">Nova sessão</Button>
              </Link>
              <Link href={`/app/pacientes/${id}/sessoes`}>
                <Button size="sm" variant="outline" className="rounded-lg">Histórico</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="section-label px-1">Blocos da ficha</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        
        {/* Bloco 1: Resumo do caso */}
        <div className="lg:col-span-2 lg:row-span-2">
          <EditableBlock 
            title="1. Resumo do Caso" 
            field="case_summary" 
            initialValue={patient.case_summary} 
            patientId={patient.id}
            isLongText
            readOnly={!isPsicologa}
            placeholder={isPsicologa ? "Clique para adicionar o resumo do caso..." : "Sem informações registradas."}
          />
        </div>

        {/* Bloco 2: Última sessão */}
        <div className="lg:col-span-2">
          <div className="h-full surface-card p-6 flex flex-col min-h-[140px]">
            <h3 className="font-semibold text-sm text-foreground/80 mb-3">2. Última Sessão</h3>
            {lastSession ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(lastSession.scheduled_at).toLocaleDateString('pt-BR')}
                  </span>
                  <Badge variant="outline" className="ml-auto">{lastSession.status}</Badge>
                </div>
                {isPsicologa && lastSession.agenda && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {lastSession.agenda}
                  </p>
                )}
                <Link href={`/app/pacientes/${patient.id}/sessoes/${lastSession.id}`} className="text-sm text-primary hover:underline mt-4">
                  Ver evolução completa →
                </Link>
              </div>
            ) : (
              <div className="flex-1 flex items-center text-sm text-muted-foreground italic">
                Nenhuma sessão registrada.
              </div>
            )}
          </div>
        </div>

        {/* Bloco 3: Medicação */}
        <div className="lg:col-span-1">
          <EditableBlock 
            title="3. Medicação Atual" 
            field="medication" 
            initialValue={patient.medication} 
            patientId={patient.id}
            isLongText
            readOnly={!isPsicologa}
          />
        </div>

        {/* Bloco 4: Tarefa Combinada */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">4. Tarefa Combinada</h3>
            <div className="flex-1 text-sm whitespace-pre-wrap">
              {isPsicologa ? (
                lastSession?.homework || <span className="text-muted-foreground italic">Sem tarefa combinada na última sessão.</span>
              ) : (
                <span className="text-muted-foreground italic">Acesso restrito.</span>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 5: Pauta Próxima */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">5. Pauta Sugerida</h3>
            <div className="flex-1 text-sm whitespace-pre-wrap">
              {isPsicologa ? (
                lastSession?.next_focus || <span className="text-muted-foreground italic">Sem pauta sugerida na última sessão.</span>
              ) : (
                <span className="text-muted-foreground italic">Acesso restrito.</span>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 6: Riscos / Alertas */}
        <div className="lg:col-span-1">
          <EditableBlock 
            title="6. Riscos / Alertas" 
            field="risks_alerts" 
            initialValue={patient.risks_alerts} 
            patientId={patient.id}
            isLongText
            isAlert
            readOnly={!isPsicologa}
          />
        </div>

        {/* Bloco 7: Próximo Foco */}
        <div className="lg:col-span-1">
          <EditableBlock 
            title="7. Próximo Foco Terapêutico" 
            field="current_focus" 
            initialValue={patient.current_focus} 
            patientId={patient.id}
            isLongText
            readOnly={!isPsicologa}
          />
        </div>

        {/* Bloco 8: Dados Administrativos */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
            <h3 className="font-medium text-sm text-muted-foreground mb-4">8. Administrativo</h3>
            <div className="flex-1 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Valor da Sessão</span>
                <span className="font-medium">{patient.session_value ? `R$ ${patient.session_value}` : 'Não definido'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Forma de Pagamento</span>
                <span>{patient.payment_method || 'Não definido'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Contato de Emergência</span>
                {patient.emergency_contact_name ? (
                  <div>
                    <span>{patient.emergency_contact_name}</span>
                    <span className="text-muted-foreground ml-1">({patient.emergency_contact_relation})</span>
                    <br />
                    <span>{patient.emergency_contact_phone}</span>
                  </div>
                ) : (
                  <span className="text-amber-600">Pendente</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="sessoes" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
            <TabsTrigger value="sessoes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
              <FileText className="h-4 w-4 mr-2" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
              <Calendar className="h-4 w-4 mr-2" />
              Tarefas Admin
            </TabsTrigger>
            <TabsTrigger value="anexos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexos
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
              <Wallet className="h-4 w-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="comentarios" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comentários
            </TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            <TabsContent value="sessoes">
              <div className="flex justify-end mb-4 gap-2">
                <Link href={`/app/pacientes/${id}/sessoes`} className="text-sm text-muted-foreground hover:underline self-center">
                  Histórico
                </Link>
                <Link href={`/app/pacientes/${id}/sessoes/nova`}>
                  <Button size="sm">Nova sessão</Button>
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="tarefas">
              <div className="space-y-2">
                {!patientTasks?.length ? (
                  <p className="text-sm text-muted-foreground p-6 text-center border rounded-xl">Sem tarefas para este paciente.</p>
                ) : (
                  patientTasks.map((t) => (
                    <div key={t.id} className="border rounded-lg p-3 text-sm flex justify-between">
                      <span>{t.title}</span>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="anexos">
              <AttachmentsPanel
                patientId={id}
                attachments={attachmentRows ?? []}
                isPsicologa={isPsicologa}
              />
            </TabsContent>
            <TabsContent value="financeiro">
              <Link href="/app/financeiro" className="text-sm text-primary hover:underline">
                Ver financeiro do consultório →
              </Link>
            </TabsContent>
            <TabsContent value="comentarios">
              <CommentsThread
                patientId={id}
                comments={comments ?? []}
                currentUserId={user.id}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
