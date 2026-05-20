'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const sessionSchema = z.object({
  scheduled_at: z.string().min(1, 'Data e hora são obrigatórias'),
  status: z.enum(['scheduled', 'occurred', 'no_show', 'cancelled']),
  agenda: z.string().optional(),
  interventions: z.string().optional(),
  homework: z.string().optional(),
  next_focus: z.string().optional(),
  notes: z.string().optional(),
})

export async function createSession(patientId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPsicologa = profile?.role === 'psicologa'

  const rawData = Object.fromEntries(formData.entries())
  const validatedFields = sessionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { 
      error: 'Erro de validação', 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }

  const data = validatedFields.data
  const action = formData.get('action') as string

  // If status is scheduled, we shouldn't have clinical data yet
  // If user is assistente, they can't submit clinical data
  const clinicalData = (data.status === 'scheduled' || !isPsicologa) ? {} : {
    agenda: data.agenda || null,
    interventions: data.interventions || null,
    homework: data.homework || null,
    next_focus: data.next_focus || null,
    notes: data.notes || null,
  }

  let inserted: { id: string } | null = null
  let error: { message: string } | null = null

  if (isPsicologa && data.status !== 'scheduled') {
    const { data: sessionId, error: rpcError } = await supabase.rpc('create_session_encrypted', {
      p_patient_id: patientId,
      p_scheduled_at: new Date(data.scheduled_at).toISOString(),
      p_status: data.status,
      p_occurred_at: data.status === 'occurred' ? new Date().toISOString() : null,
      p_agenda: data.agenda || null,
      p_interventions: data.interventions || null,
      p_homework: data.homework || null,
      p_next_focus: data.next_focus || null,
      p_notes: data.notes || null,
    })
    if (rpcError) error = rpcError
    else if (sessionId) inserted = { id: sessionId as string }
  } else {
    const res = await supabase
      .from('sessions')
      .insert({
        patient_id: patientId,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        occurred_at: data.status === 'occurred' ? new Date().toISOString() : null,
        status: data.status,
        ...clinicalData,
      })
      .select('id')
      .single()
    inserted = res.data
    error = res.error
  }

  if (error) {
    return { error: error.message }
  }
  if (!inserted) {
    return { error: 'Não foi possível criar a sessão' }
  }

  // Update patient's 360 fields if this was an occurred session and we have new data
  if (data.status === 'occurred' && isPsicologa) {
    const updates: any = {}
    if (data.homework) updates.homework = data.homework // Note: in DB this doesn't exist on patient, it's pulled from last session
    if (data.next_focus) updates.current_focus = data.next_focus
    
    if (Object.keys(updates).length > 0) {
      // Only update current_focus on patient
      if (updates.current_focus) {
        await supabase
          .from('patients')
          .update({ current_focus: updates.current_focus })
          .eq('id', patientId)
      }
    }
  }

  if (action === 'save_and_next') {
    redirect(`/app/pacientes/${patientId}/sessoes/nova?from=${inserted.id}`)
  } else {
    redirect(`/app/pacientes/${patientId}`)
  }
}

export async function updateSession(sessionId: string, patientId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPsicologa = profile?.role === 'psicologa'

  const rawData = Object.fromEntries(formData.entries())
  const validatedFields = sessionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { 
      error: 'Erro de validação', 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }

  const data = validatedFields.data

  // Assistente can only update status and date
  const updateData: any = {
    scheduled_at: new Date(data.scheduled_at).toISOString(),
    status: data.status,
    updated_at: new Date().toISOString()
  }

  if (data.status === 'occurred') {
    updateData.occurred_at = new Date().toISOString()
  }

  if (isPsicologa) {
    updateData.agenda = data.agenda || null
    updateData.interventions = data.interventions || null
    updateData.homework = data.homework || null
    updateData.next_focus = data.next_focus || null
    updateData.notes = data.notes || null
  }

  const { error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    return { error: error.message }
  }

  redirect(`/app/pacientes/${patientId}/sessoes`)
}
