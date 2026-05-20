import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TarefasClient } from './TarefasClient'

export default async function TarefasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('admin_tasks')
    .select('*, patients(full_name)')
    .order('created_at', { ascending: false })

  const { data: profiles } = await supabase.from('profiles').select('id, full_name')
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('active', true)

  const month = new Date().getMonth()
  const { data: allPatients } = await supabase
    .from('patients')
    .select('id, full_name, birth_date')
    .eq('active', true)

  const birthdays =
    allPatients?.filter((p) => {
      if (!p.birth_date) return false
      return new Date(p.birth_date).getMonth() === month
    }) ?? []

  birthdays.sort(
    (a, b) =>
      new Date(a.birth_date!).getDate() - new Date(b.birth_date!).getDate()
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Painel de Tarefas</h1>
      <TarefasClient
        tasks={tasks ?? []}
        profiles={profiles ?? []}
        patients={patients ?? []}
        currentUserId={user.id}
        birthdays={birthdays.map((p) => ({
          id: p.id,
          full_name: p.full_name,
          day: new Date(p.birth_date!).getDate(),
        }))}
      />
    </div>
  )
}
