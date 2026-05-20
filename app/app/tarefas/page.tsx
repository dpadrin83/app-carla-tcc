import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TarefasClient } from './TarefasClient'

export default async function TarefasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('admin_tasks')
    .select('*, patients(full_name)')
    .order('created_at', { ascending: false })

  const { data: profiles } = await supabase.from('profiles').select('id, full_name')
  const { data: patients } = await supabase.from('patients').select('id, full_name').eq('active', true)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Painel de Tarefas</h1>
      <TarefasClient
        tasks={tasks ?? []}
        profiles={profiles ?? []}
        patients={patients ?? []}
        currentUserId={user.id}
      />
    </div>
  )
}
