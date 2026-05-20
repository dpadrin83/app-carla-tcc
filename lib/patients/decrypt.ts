import { createClient } from '@/lib/supabase/server'

const SENSITIVE_PATIENT = ['medication', 'risks_alerts'] as const
const SENSITIVE_SESSION = ['agenda', 'interventions', 'notes'] as const

/** Descriptografa campos sensíveis via RPC (somente psicóloga). */
export async function decryptPatientFields<T extends Record<string, unknown>>(
  patient: T,
  isPsicologa: boolean
): Promise<T> {
  if (!isPsicologa) return patient
  const supabase = await createClient()
  const out = { ...patient }

  for (const field of SENSITIVE_PATIENT) {
    const raw = out[field]
    if (typeof raw !== 'string' || !raw) continue
    const { data } = await supabase.rpc('decrypt_field', { content: raw })
    if (typeof data === 'string') (out as Record<string, unknown>)[field] = data
  }

  return out
}

export async function decryptSessionFields<T extends Record<string, unknown>>(
  session: T,
  isPsicologa: boolean
): Promise<T> {
  if (!isPsicologa) return session
  const supabase = await createClient()
  const out = { ...session }

  for (const field of SENSITIVE_SESSION) {
    const raw = out[field]
    if (typeof raw !== 'string' || !raw) continue
    const { data } = await supabase.rpc('decrypt_field', { content: raw })
    if (typeof data === 'string') (out as Record<string, unknown>)[field] = data
  }

  return out
}
