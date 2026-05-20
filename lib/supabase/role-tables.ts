/** Tabelas/views conforme perfil — assistente não acessa campos clínicos na base. */
export function patientsTable(role: string | undefined | null) {
  return role === 'assistente' ? 'patients_assistente' : 'patients'
}

export function sessionsTable(role: string | undefined | null) {
  return role === 'assistente' ? 'sessions_assistente' : 'sessions'
}
