import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const actionLabels: Record<string, string> = {
  view: 'Visualização',
  edit: 'Edição',
  delete: 'Exclusão',
  export: 'Exportação',
  download: 'Download',
}

const entityLabels: Record<string, string> = {
  patient: 'Paciente',
  session: 'Sessão',
  attachment: 'Anexo',
}

export default async function AuditoriaPage() {
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

  if (profile?.role !== 'psicologa') redirect('/app/tarefas')

  const { data: logs } = await supabase
    .from('audit_log')
    .select('id, action, entity, entity_id, patient_id, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(200)

  const userIds = [...new Set((logs ?? []).map((l) => l.user_id).filter(Boolean))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) ?? [])

  const patientIds = [...new Set((logs ?? []).map((l) => l.patient_id).filter(Boolean))]
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .in('id', patientIds.length ? patientIds : ['00000000-0000-0000-0000-000000000000'])

  const patientMap = new Map(patients?.map((p) => [p.id, p.full_name]) ?? [])

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auditoria de acesso</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registro de visualizações e alterações em prontuários (LGPD). Últimos 200 eventos.
        </p>
      </div>

      {!logs?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center border rounded-xl bg-card">
          Nenhum registro ainda. Acessos às fichas passam a aparecer aqui automaticamente.
        </p>
      ) : (
        <div className="border rounded-xl bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Paciente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {profileMap.get(log.user_id) ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {actionLabels[log.action] ?? log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entityLabels[log.entity] ?? log.entity}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.patient_id ? (
                      <Link
                        href={`/app/pacientes/${log.patient_id}`}
                        className="text-primary hover:underline"
                      >
                        {patientMap.get(log.patient_id) ?? 'Paciente'}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
