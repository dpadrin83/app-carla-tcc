import { differenceInDays } from 'date-fns'

export type PatientStatusTag = {
  key: 'em_dia' | 'sem_sessao' | 'emergencia' | 'inativo'
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}

export type PatientListItem = {
  id: string
  full_name: string
  active: boolean
  phone: string | null
  email: string | null
  birth_date: string | null
  emergency_contact_name: string | null
  lastSessionAt: string | null
}

export function getPatientStatusTag(p: PatientListItem): PatientStatusTag {
  if (!p.active) {
    return { key: 'inativo', label: 'Inativo', variant: 'secondary' }
  }
  if (!p.emergency_contact_name?.trim()) {
    return { key: 'emergencia', label: 'Emergência pendente', variant: 'destructive' }
  }
  if (!p.lastSessionAt || differenceInDays(new Date(), new Date(p.lastSessionAt)) > 21) {
    return { key: 'sem_sessao', label: 'Sem sessão há 3+ semanas', variant: 'outline' }
  }
  return { key: 'em_dia', label: 'Em dia', variant: 'secondary' }
}

export function getPatientAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const b = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age >= 0 ? age : null
}
