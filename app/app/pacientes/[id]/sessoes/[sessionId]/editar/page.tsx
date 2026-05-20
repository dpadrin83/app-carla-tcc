import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditSessionForm } from '@/components/EditSessionForm'
import { decryptSessionFields } from '@/lib/patients/decrypt'

export default async function EditarSessaoPage({
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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isPsicologa = profile?.role === 'psicologa'

  const { data: sessionRaw } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('patient_id', id)
    .single()

  if (!sessionRaw) redirect(`/app/pacientes/${id}/sessoes`)

  const session = await decryptSessionFields(sessionRaw, isPsicologa)

  return (
    <EditSessionForm
      patientId={id}
      isPsicologa={isPsicologa}
      session={{
        id: session.id,
        scheduled_at: session.scheduled_at,
        status: session.status,
        agenda: (session.agenda as string | null) ?? null,
        interventions: (session.interventions as string | null) ?? null,
        homework: session.homework ?? null,
        next_focus: session.next_focus ?? null,
        notes: (session.notes as string | null) ?? null,
      }}
    />
  )
}
