'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(data: {
  content: string
  patient_id?: string
  task_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  if (!data.patient_id && !data.task_id) throw new Error('Contexto inválido')

  const { error } = await supabase.from('comments').insert({
    author_id: user.id,
    patient_id: data.patient_id!,
    task_id: data.task_id ?? null,
    content: data.content,
  })

  if (error) throw new Error(error.message)
  if (data.patient_id) revalidatePath(`/app/pacientes/${data.patient_id}`)
  revalidatePath('/app/tarefas')
}

export async function markCommentsRead(patientId: string, userId: string) {
  const supabase = await createClient()
  const { data: comments } = await supabase
    .from('comments')
    .select('id')
    .eq('patient_id', patientId)

  if (!comments?.length) return

  const rows = comments.map((c) => ({
    comment_id: c.id,
    user_id: userId,
  }))

  await supabase.from('comment_reads').upsert(rows)
}
