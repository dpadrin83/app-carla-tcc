import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'

export default async function PerfilPendentePage() {
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

  if (profile?.role === 'psicologa') redirect('/app/hoje')
  if (profile?.role === 'assistente') redirect('/app/tarefas')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Perfil não configurado</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Sua conta existe no sistema, mas ainda não tem um perfil (psicóloga ou assistente).
        Peça ao administrador para criar o registro em <code className="text-sm">profiles</code>,
        ou rode localmente: <code className="text-sm">npm run seed:dev</code>.
      </p>
      <p className="text-xs text-muted-foreground mb-6">Conta: {user.email}</p>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Sair
        </Button>
      </form>
    </div>
  )
}
