'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['nf', 'receita_saude', 'contrato', 'lembrete', 'cadastro', 'outro']).optional(),
  patient_id: z.string().optional(),
  due_date: z.string().optional(),
  description: z.string().optional(),
  assigned_to: z.string().optional(),
})

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const parsed = taskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) throw new Error('Dados inválidos')

  const d = parsed.data
  const { error } = await supabase.from('admin_tasks').insert({
    title: d.title,
    type: d.type ?? 'outro',
    patient_id: d.patient_id || null,
    due_date: d.due_date || null,
    description: d.description || null,
    assigned_to: d.assigned_to || user.id,
    created_by: user.id,
    status: 'pending',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/app/tarefas')
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('admin_tasks')
    .update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/app/tarefas')
}

export async function createQuickTask(type: string, patientId: string | null, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_tasks').insert({
    title,
    type,
    patient_id: patientId,
    created_by: user.id,
    assigned_to: user.id,
    status: 'pending',
  })
  revalidatePath('/app/tarefas')
}
