'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { z } from 'zod'

export async function registerSessionPayment(sessionId: string, patientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'psicologa') return { error: 'Sem permissão' }

  const { data: existing } = await supabase
    .from('financial_entries')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing) return { error: 'Pagamento já registrado' }

  const { data: patient } = await supabase
    .from('patients')
    .select('session_value, full_name')
    .eq('id', patientId)
    .single()

  const amount = Number(patient?.session_value ?? 0)
  if (!amount) return { error: 'Valor da sessão não configurado no cadastro do paciente' }

  const { error } = await supabase.from('financial_entries').insert({
    patient_id: patientId,
    session_id: sessionId,
    type: 'entrada',
    amount,
    description: `Sessão — ${patient?.full_name ?? 'paciente'}`,
    occurred_at: format(new Date(), 'yyyy-MM-dd'),
  })

  if (error) return { error: error.message }

  revalidatePath('/app/financeiro')
  revalidatePath(`/app/pacientes/${patientId}/sessoes/${sessionId}`)
  return { success: true }
}

const entrySchema = z.object({
  type: z.enum(['entrada', 'saida']),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  occurred_at: z.string().min(1),
  description: z.string().optional(),
  patient_id: z.string().optional(),
})

export async function createFinancialEntry(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'psicologa') return { error: 'Sem permissão' }

  const parsed = entrySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Dados inválidos' }

  const d = parsed.data
  const { error } = await supabase.from('financial_entries').insert({
    type: d.type,
    amount: d.amount,
    occurred_at: d.occurred_at,
    description: d.description || null,
    patient_id: d.patient_id || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/app/financeiro')
  return { success: true }
}
