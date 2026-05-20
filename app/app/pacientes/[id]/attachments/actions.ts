'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MAX_BYTES = 10 * 1024 * 1024
const categorySchema = z.enum(['contrato', 'documento', 'exame', 'outro'])

export async function uploadAttachment(patientId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile) return { error: 'Sem perfil' }

  const file = formData.get('file') as File | null
  const categoryRaw = formData.get('category') as string
  const parsed = categorySchema.safeParse(categoryRaw)
  if (!file?.size || !parsed.success) return { error: 'Arquivo ou categoria inválidos' }

  if (profile.role === 'assistente' && parsed.data === 'exame') {
    return { error: 'Assistente não pode enviar exames' }
  }

  if (file.size > MAX_BYTES) return { error: 'Arquivo maior que 10MB' }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${patientId}/${Date.now()}-${safeName}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage.from('patient-files').upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase.from('attachments').insert({
    patient_id: patientId,
    uploaded_by: user.id,
    file_name: file.name,
    file_path: path,
    file_type: file.type || null,
    category: parsed.data,
  })

  if (dbError) {
    await supabase.storage.from('patient-files').remove([path])
    return { error: dbError.message }
  }

  revalidatePath(`/app/pacientes/${patientId}`)
  return { success: true }
}

export async function deleteAttachment(attachmentId: string, patientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: row } = await supabase
    .from('attachments')
    .select('file_path, category')
    .eq('id', attachmentId)
    .single()

  if (!row) return { error: 'Anexo não encontrado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'assistente' && row.category === 'exame') {
    return { error: 'Sem permissão' }
  }

  await supabase.storage.from('patient-files').remove([row.file_path])
  await supabase.from('attachments').delete().eq('id', attachmentId)

  revalidatePath(`/app/pacientes/${patientId}`)
  return { success: true }
}

export async function getAttachmentDownloadUrl(attachmentId: string, patientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: row } = await supabase
    .from('attachments')
    .select('file_path, category, file_name')
    .eq('id', attachmentId)
    .single()

  if (!row) return { error: 'Anexo não encontrado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'assistente' && row.category === 'exame') {
    return { error: 'Sem permissão' }
  }

  await supabase.from('audit_log').insert({
    user_id: user.id,
    patient_id: patientId,
    action: 'view',
    entity: 'attachment',
    entity_id: attachmentId,
    metadata: { file_name: row.file_name },
  })

  const { data, error } = await supabase.storage.from('patient-files').createSignedUrl(row.file_path, 120)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
