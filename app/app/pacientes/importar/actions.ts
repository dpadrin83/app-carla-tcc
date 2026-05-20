'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importPatients(
  rows: Record<string, string>[],
  mapping: Record<string, string>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    const full_name = row[mapping.full_name]?.trim()
    if (!full_name) {
      errors++
      continue
    }

    const email = mapping.email ? row[mapping.email]?.trim() : null
    const phone = mapping.phone ? row[mapping.phone]?.trim() : null
    const birth_date = mapping.birth_date ? row[mapping.birth_date]?.trim() : null

    const { data: existing } = email
      ? await supabase.from('patients').select('id').eq('email', email).maybeSingle()
      : await supabase.from('patients').select('id').eq('full_name', full_name).maybeSingle()

    if (existing) {
      await supabase
        .from('patients')
        .update({ phone, birth_date: birth_date || null })
        .eq('id', existing.id)
      updated++
    } else {
      const { error } = await supabase.from('patients').insert({
        full_name,
        email,
        phone,
        birth_date: birth_date || null,
        active: true,
      })
      if (error) errors++
      else created++
    }
  }

  revalidatePath('/app/pacientes')
  return { created, updated, skipped, errors }
}
