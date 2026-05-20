'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function linkEventToPatient(googleEventId: string, patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase.from('google_event_links').upsert({
    google_event_id: googleEventId,
    patient_id: patientId,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/app/calendario')
  revalidatePath('/app/hoje')
}
