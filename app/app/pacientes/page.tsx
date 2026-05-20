import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { patientsTable, sessionsTable } from '@/lib/supabase/role-tables'
import { PacientesListClient } from '@/components/PacientesListClient'
import type { PatientListItem } from '@/lib/patients/status'

export default async function PacientesPage() {
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

  const table = patientsTable(profile?.role)
  const isPsicologa = profile?.role === 'psicologa'

  const { data: patientsRaw } = await supabase
    .from(table as 'patients')
    .select('id, full_name, active, phone, email, birth_date, emergency_contact_name')
    .order('full_name')

  const sTable = sessionsTable(profile?.role)
  const { data: sessions } = await supabase
    .from(sTable as 'sessions')
    .select('patient_id, scheduled_at')
    .eq('status', 'occurred')
    .order('scheduled_at', { ascending: false })

  const lastByPatient = new Map<string, string>()
  for (const s of sessions ?? []) {
    if (s.patient_id && !lastByPatient.has(s.patient_id)) {
      lastByPatient.set(s.patient_id, s.scheduled_at)
    }
  }

  const patients: PatientListItem[] = (patientsRaw ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    active: p.active ?? true,
    phone: p.phone,
    email: p.email,
    birth_date: p.birth_date,
    emergency_contact_name: p.emergency_contact_name,
    lastSessionAt: lastByPatient.get(p.id) ?? null,
  }))

  return (
    <div className="page-shell-wide space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
        {isPsicologa && (
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/app/pacientes/importar" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" aria-hidden />
                Importar CSV
              </Button>
            </Link>
            <Link href="/app/pacientes/novo" className="w-full sm:w-auto">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Novo Paciente
              </Button>
            </Link>
          </div>
        )}
      </div>

      <PacientesListClient patients={patients} canCreate={isPsicologa} />
    </div>
  )
}
